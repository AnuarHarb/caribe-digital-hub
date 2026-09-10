#!/usr/bin/env node
/**
 * MCP de La Marea — mismo backend que costadigital.org (/noticias, /admin).
 *
 * Remoto: https://costadigital.org/mcp
 * Local:  node mcp/marea.mjs (stdio)
 *
 * Auth remoto (headers):
 *   Authorization: Bearer <jwt de un usuario del sitio>
 *   o X-Costa-Email + X-Costa-Password
 * Escribir = ese usuario es admin.
 */

import { AsyncLocalStorage } from "node:async_hooks";
import { chmodSync, existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SESSION_PATH = join(ROOT, "mcp/.session.json");
const FAMILIAS = ["pulso", "profundidad", "voces", "pruebas"];
const PILARES = ["comunidad", "educacion", "startups", "ciudad"];
const FORMATOS = [
  "news-semanal",
  "anuncio",
  "columna",
  "datos",
  "resena",
  "podcast",
  "entrevista",
  "historia",
  "cronica",
];
const LIST_COLS =
  "id,slug,title,excerpt,status,familia,pilar,formato,destacado,published_at,created_at,updated_at,tags,cover_image_url,author_id";
const GET_COLS = `${LIST_COLS},content,video_url,cta_texto,cta_url`;
const SUB_COLS = "id,email,name,status,source,created_at,unsubscribed_at";
const CAMP_LIST_COLS =
  "id,subject,status,recipient_count,sent_count,failed_count,sent_at,created_at,error_message,send_mode,daily_limit,validation_filter,next_batch_at";
const CAMP_GET_COLS = `${CAMP_LIST_COLS},html_body,created_by`;
const SEND_COLS = "id,email,status,resend_id,error_message,sent_at,created_at";
const SEND_MODES = ["immediate", "staggered"];
const VALIDATION_FILTERS = [
  "all_active",
  "strict_email",
  "has_name",
  "exclude_recent_30d",
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    if (process.env[key]) continue;
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

export function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function toHtml(content) {
  const t = (content ?? "").trim();
  if (!t) return "<p></p>";
  if (t.startsWith("<")) return t;
  return t
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function assertTaxonomy({ familia, pilar, formato }) {
  if (familia != null && !FAMILIAS.includes(familia)) {
    throw new Error(`familia inválida: ${familia}. Usa: ${FAMILIAS.join(", ")}`);
  }
  if (pilar != null && !PILARES.includes(pilar)) {
    throw new Error(`pilar inválido: ${pilar}. Usa: ${PILARES.join(", ")}`);
  }
  if (formato != null && !FORMATOS.includes(formato)) {
    throw new Error(`formato inválido: ${formato}. Usa: ${FORMATOS.join(", ")}`);
  }
}

function compact(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  );
}

export function buildWritePayload(input, { creating }) {
  assertTaxonomy(input);
  const payload = compact({
    title: input.title,
    slug: input.slug != null ? slugify(input.slug) : undefined,
    excerpt: input.excerpt === "" ? null : input.excerpt,
    content: input.content != null ? toHtml(input.content) : undefined,
    cover_image_url: emptyToNull(input.cover_image_url),
    tags: input.tags,
    familia: input.familia,
    pilar: input.pilar,
    formato: input.formato,
    destacado: input.destacado,
    video_url: emptyToNull(input.video_url),
    cta_texto: emptyToNull(input.cta_texto),
    cta_url: emptyToNull(input.cta_url),
  });
  if (creating) {
    if (!payload.title) throw new Error("title es obligatorio");
    if (!payload.content) throw new Error("content es obligatorio");
    payload.slug = payload.slug || slugify(payload.title);
    payload.familia ??= "pulso";
    payload.pilar ??= "comunidad";
    payload.formato ??= "news-semanal";
    payload.tags ??= [];
    payload.destacado ??= false;
    payload.cta_texto ??= null;
    payload.cta_url ??= null;
  }
  return payload;
}

function emptyToNull(v) {
  if (v === undefined) return undefined;
  return v === "" ? null : v;
}

function supabaseUrl() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!url) throw new Error("Falta VITE_SUPABASE_URL en .env");
  return url.replace(/\/$/, "");
}

function anonKey() {
  const key =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!key) throw new Error("Falta VITE_SUPABASE_PUBLISHABLE_KEY en .env");
  return key;
}

/** @typedef {{ access_token: string, refresh_token: string | null, expires_at: number, user: { id: string, email: string | null }, isAdmin: boolean }} MareaSession */

const authAls = new AsyncLocalStorage();
/** @type {MareaSession | null} */
let stdioSession = null;

function getSession() {
  const store = authAls.getStore();
  return store ? store.session : stdioSession;
}

function setSession(next) {
  const store = authAls.getStore();
  if (store) store.session = next;
  else stdioSession = next;
}

function canPersistSession() {
  return !process.env.VERCEL;
}

export function sessionExpired(s, now = Date.now()) {
  if (!s?.expires_at) return true;
  return s.expires_at * 1000 <= now + 60_000;
}

export function publicSession(s) {
  if (!s) return { loggedIn: false, canWrite: false };
  return {
    loggedIn: true,
    email: s.user?.email ?? null,
    user_id: s.user?.id ?? null,
    isAdmin: !!s.isAdmin,
    canWrite: !!s.isAdmin,
  };
}

function loadSessionFile() {
  if (!existsSync(SESSION_PATH)) return null;
  try {
    return JSON.parse(readFileSync(SESSION_PATH, "utf8"));
  } catch {
    return null;
  }
}

function saveSession() {
  if (!canPersistSession()) return;
  const current = getSession();
  if (!current) return;
  writeFileSync(SESSION_PATH, JSON.stringify(current), { mode: 0o600 });
  try {
    chmodSync(SESSION_PATH, 0o600);
  } catch {
    /* windows */
  }
}

function clearSession() {
  setSession(null);
  if (canPersistSession() && existsSync(SESSION_PATH)) unlinkSync(SESSION_PATH);
}

function canWrite() {
  return getSession()?.isAdmin === true;
}

function requireWrite() {
  const current = getSession();
  if (!current) {
    throw new Error(
      "No hay sesión. En remoto manda Authorization: Bearer <jwt> o X-Costa-Email + X-Costa-Password. O llama login.",
    );
  }
  if (!current.isAdmin) {
    throw new Error(
      `Sesión de ${current.user?.email ?? "este usuario"}, pero no es admin. Solo lectura.`,
    );
  }
}

async function authToken(grantType, body) {
  const res = await fetch(
    `${supabaseUrl()}/auth/v1/token?grant_type=${grantType}`,
    {
      method: "POST",
      headers: {
        apikey: anonKey(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.msg || "Credenciales inválidas");
  }
  return data;
}

async function fetchIsAdmin(accessToken, userId) {
  const res = await fetch(
    `${supabaseUrl()}/rest/v1/user_roles?user_id=eq.${userId}&role=eq.admin&select=role`,
    {
      headers: {
        apikey: anonKey(),
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const rows = await res.json().catch(() => []);
  return Array.isArray(rows) && rows.length > 0;
}

async function hydrateSession(data) {
  const user = data.user;
  if (!user?.id) throw new Error("Respuesta de auth sin usuario");
  const isAdmin = await fetchIsAdmin(data.access_token, user.id);
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at:
      data.expires_at ??
      Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
    user: { id: user.id, email: user.email ?? null },
    isAdmin,
  };
}

async function login({ email, password }) {
  const data = await authToken("password", {
    email: normalizeEmail(email),
    password,
  });
  const next = await hydrateSession(data);
  setSession(next);
  saveSession();
  return { ...publicSession(next), access_token: next.access_token };
}

async function refreshSession() {
  const current = getSession();
  if (!current?.refresh_token) {
    clearSession();
    throw new Error("Sesión expirada. Llama login.");
  }
  try {
    const data = await authToken("refresh_token", {
      refresh_token: current.refresh_token,
    });
    setSession(
      await hydrateSession({
        ...data,
        user: data.user ?? current.user,
      }),
    );
    saveSession();
  } catch {
    clearSession();
    throw new Error("Sesión expirada. Llama login.");
  }
}

async function ensureSession() {
  const current = getSession();
  if (!current) return;
  if (!sessionExpired(current)) return;
  if (!current.refresh_token) return;
  await refreshSession();
}

function logout() {
  const prev = publicSession(getSession());
  clearSession();
  return { ...prev, loggedIn: false, canWrite: false };
}

async function restoreSession() {
  const stored = loadSessionFile();
  if (!stored?.refresh_token) return;
  setSession(stored);
  if (sessionExpired(stored)) {
    try {
      await refreshSession();
    } catch {
      setSession(null);
    }
  }
}

export function headerValue(headers, name) {
  if (!headers) return "";
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lower) {
      return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
    }
  }
  return "";
}

export async function sessionFromAccessToken(accessToken) {
  const res = await fetch(`${supabaseUrl()}/auth/v1/user`, {
    headers: {
      apikey: anonKey(),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const user = await res.json();
  if (!res.ok || !user?.id) {
    throw new Error(user.msg || user.message || "Token inválido");
  }
  return {
    access_token: accessToken,
    refresh_token: null,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: user.id, email: user.email ?? null },
    isAdmin: await fetchIsAdmin(accessToken, user.id),
  };
}

export async function resolveAuth(headers) {
  const raw = headerValue(headers, "authorization");
  if (raw.toLowerCase().startsWith("bearer ")) {
    const token = raw.slice(7).trim();
    if (token && token !== anonKey()) return sessionFromAccessToken(token);
  }
  const email = headerValue(headers, "x-costa-email");
  const password = headerValue(headers, "x-costa-password");
  if (email && password) {
    const data = await authToken("password", {
      email: normalizeEmail(email),
      password,
    });
    return hydrateSession(data);
  }
  return null;
}

export function runWithAuth(session, fn) {
  return authAls.run({ session }, fn);
}

async function rest(method, pathAndQuery, body, opts = {}) {
  await ensureSession();
  const current = getSession();
  const res = await fetch(`${supabaseUrl()}/rest/v1/${pathAndQuery}`, {
    method,
    headers: {
      apikey: anonKey(),
      Authorization: `Bearer ${current?.access_token || anonKey()}`,
      "Content-Type": "application/json",
      Prefer: opts.count
        ? "return=representation,count=exact"
        : "return=representation",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text}`);
  const data = text ? JSON.parse(text) : null;
  if (opts.count) {
    const range = res.headers.get("content-range");
    return { rows: data ?? [], total: Number(range?.split("/")[1] || 0) };
  }
  return data;
}

async function invoke(name, body) {
  requireWrite();
  await ensureSession();
  const current = getSession();
  const res = await fetch(`${supabaseUrl()}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      apikey: anonKey(),
      Authorization: `Bearer ${current.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${res.status}`);
  if (data?.error) throw new Error(data.error);
  return data;
}

async function listArticles({ status, familia, pilar, search, limit } = {}) {
  const params = new URLSearchParams();
  params.set("select", LIST_COLS);
  params.set("order", "published_at.desc.nullslast,created_at.desc");
  params.set("limit", String(Math.min(limit ?? 30, 100)));
  if (status && status !== "all") params.set("status", `eq.${status}`);
  if (familia) params.set("familia", `eq.${familia}`);
  if (pilar) params.set("pilar", `eq.${pilar}`);
  if (search?.trim()) {
    const q = `*${search.trim()}*`;
    params.set("or", `(title.ilike.${q},excerpt.ilike.${q})`);
  }
  return rest("GET", `blog_posts?${params}`);
}

async function getArticle({ id, slug }) {
  if (!id && !slug) throw new Error("Pasa id o slug");
  const params = new URLSearchParams();
  params.set("select", GET_COLS);
  if (id) params.set("id", `eq.${id}`);
  else params.set("slug", `eq.${slug}`);
  const rows = await rest("GET", `blog_posts?${params}`);
  if (!rows?.[0]) throw new Error("Nota no encontrada");
  return rows[0];
}

async function authorId() {
  const current = getSession();
  if (current?.user?.id) return current.user.id;
  throw new Error("Inicia sesión para atribuir la nota a tu usuario.");
}

async function clearOtherFeatured(keepId) {
  await rest(
    "PATCH",
    `blog_posts?id=neq.${keepId}&destacado=eq.true`,
    { destacado: false },
  );
}

async function createArticle(input) {
  requireWrite();
  const payload = buildWritePayload(input, { creating: true });
  payload.author_id = await authorId();
  payload.status = "draft";
  payload.published_at = null;
  const rows = await rest("POST", "blog_posts", payload);
  const created = rows?.[0];
  if (payload.destacado && created?.id) await clearOtherFeatured(created.id);
  return created;
}

async function updateArticle(input) {
  requireWrite();
  const { id, ...fields } = input;
  if (!id) throw new Error("id es obligatorio");
  const payload = buildWritePayload(fields, { creating: false });
  if (Object.keys(payload).length === 0) throw new Error("Nada que actualizar");
  const rows = await rest("PATCH", `blog_posts?id=eq.${id}`, payload);
  if (!rows?.[0]) throw new Error("Nota no encontrada");
  if (payload.destacado) await clearOtherFeatured(id);
  return rows[0];
}

async function publishArticle({ id }) {
  requireWrite();
  const current = await getArticle({ id });
  const payload = { status: "published" };
  if (!current.published_at) payload.published_at = new Date().toISOString();
  const rows = await rest("PATCH", `blog_posts?id=eq.${id}`, payload);
  if (!rows?.[0]) throw new Error("Nota no encontrada");
  return rows[0];
}

async function unpublishArticle({ id }) {
  requireWrite();
  const rows = await rest("PATCH", `blog_posts?id=eq.${id}`, { status: "draft" });
  if (!rows?.[0]) throw new Error("Nota no encontrada");
  return rows[0];
}

async function setFeatured({ id }) {
  requireWrite();
  const current = await getArticle({ id });
  if (current.status !== "published") {
    throw new Error("Solo una nota published puede ser portada");
  }
  const rows = await rest("PATCH", `blog_posts?id=eq.${id}`, { destacado: true });
  await clearOtherFeatured(id);
  return rows?.[0];
}

async function deleteArticle({ id }) {
  requireWrite();
  const rows = await rest("DELETE", `blog_posts?id=eq.${id}`);
  if (!rows?.[0]) throw new Error("Nota no encontrada");
  return { deleted: id, slug: rows[0].slug };
}

export function normalizeEmail(email) {
  return (email ?? "").trim().toLowerCase();
}

export function isEmail(email) {
  return EMAIL_RE.test(normalizeEmail(email));
}

export function parseSubscriberCsv(text) {
  const lines = (text ?? "")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return { rows: [], totalValid: 0, duplicatesInFile: 0, invalid: 0 };
  }
  const split = (line) => {
    const cells = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else current += ch;
    }
    cells.push(current.trim());
    return cells;
  };
  const first = split(lines[0]).map((c) => c.toLowerCase());
  const hasHeader = first.some((c) => c === "email" || c === "correo" || c === "e-mail");
  const emailIdx = hasHeader
    ? first.findIndex((c) => c === "email" || c === "correo" || c === "e-mail")
    : 0;
  const nameIdx = hasHeader
    ? first.findIndex((c) => c === "name" || c === "nombre" || c === "full_name")
    : first.length > 1
      ? 1
      : -1;
  const out = [];
  const seen = new Set();
  let duplicatesInFile = 0;
  let invalid = 0;
  let totalValid = 0;
  for (const line of hasHeader ? lines.slice(1) : lines) {
    const cells = split(line);
    const email = (cells[emailIdx] ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      invalid += 1;
      continue;
    }
    totalValid += 1;
    if (seen.has(email)) {
      duplicatesInFile += 1;
      continue;
    }
    seen.add(email);
    const name = nameIdx >= 0 ? (cells[nameIdx] ?? "").trim() : "";
    out.push(name ? { email, name } : { email });
  }
  return { rows: out, totalValid, duplicatesInFile, invalid };
}

async function listSubscribers({ status, search, limit } = {}) {
  requireWrite();
  const params = new URLSearchParams();
  params.set("select", SUB_COLS);
  params.set("order", "created_at.desc");
  params.set("limit", String(Math.min(limit ?? 50, 200)));
  if (status && status !== "all") params.set("status", `eq.${status}`);
  if (search?.trim()) {
    const q = `*${search.trim()}*`;
    params.set("or", `(email.ilike.${q},name.ilike.${q})`);
  }
  return rest("GET", `newsletter_subscribers?${params}`, undefined, { count: true });
}

async function addSubscriber({ email, name, source }) {
  requireWrite();
  const normalized = normalizeEmail(email);
  if (!isEmail(normalized)) throw new Error("Correo inválido");
  const existing = await rest(
    "GET",
    `newsletter_subscribers?select=id&email=eq.${encodeURIComponent(normalized)}`,
  );
  if (existing?.[0]) throw new Error("Ese correo ya está en la lista");
  const rows = await rest("POST", "newsletter_subscribers", {
    email: normalized,
    name: name?.trim() || null,
    source: source?.trim() || "admin",
    status: "active",
    unsubscribed_at: null,
  });
  return rows?.[0];
}

async function setSubscriberStatus({ id, status }) {
  requireWrite();
  if (status !== "active" && status !== "unsubscribed") {
    throw new Error("status debe ser active o unsubscribed");
  }
  const rows = await rest("PATCH", `newsletter_subscribers?id=eq.${id}`, {
    status,
    unsubscribed_at: status === "unsubscribed" ? new Date().toISOString() : null,
  });
  if (!rows?.[0]) throw new Error("Suscriptor no encontrado");
  return rows[0];
}

async function importSubscribers({ csv }) {
  requireWrite();
  const parsed = parseSubscriberCsv(csv);
  if (parsed.rows.length === 0) {
    return { added: 0, duplicates: 0, ...parsed };
  }
  const existing = new Set();
  for (let from = 0; ; from += 1000) {
    const page = await rest(
      "GET",
      `newsletter_subscribers?select=email&offset=${from}&limit=1000`,
    );
    for (const row of page ?? []) existing.add(row.email.toLowerCase());
    if ((page ?? []).length < 1000) break;
  }
  const toInsert = [];
  let duplicates = 0;
  for (const row of parsed.rows) {
    if (existing.has(row.email)) {
      duplicates += 1;
      continue;
    }
    existing.add(row.email);
    toInsert.push({
      email: row.email,
      name: row.name?.trim() || null,
      source: "import",
      status: "active",
      unsubscribed_at: null,
    });
  }
  for (let i = 0; i < toInsert.length; i += 200) {
    await rest("POST", "newsletter_subscribers", toInsert.slice(i, i + 200));
  }
  return {
    added: toInsert.length,
    duplicates,
    duplicatesInFile: parsed.duplicatesInFile,
    invalid: parsed.invalid,
  };
}

async function listCampaigns({ status, limit } = {}) {
  requireWrite();
  const params = new URLSearchParams();
  params.set("select", CAMP_LIST_COLS);
  params.set("order", "created_at.desc");
  params.set("limit", String(Math.min(limit ?? 30, 100)));
  if (status && status !== "all") params.set("status", `eq.${status}`);
  return rest("GET", `newsletter_campaigns?${params}`, undefined, { count: true });
}

async function getCampaign({ id }) {
  requireWrite();
  const rows = await rest(
    "GET",
    `newsletter_campaigns?select=${CAMP_GET_COLS}&id=eq.${id}`,
  );
  if (!rows?.[0]) throw new Error("Campaña no encontrada");
  return rows[0];
}

export function canEditCampaign(status) {
  return status === "draft" || status === "failed";
}

async function createNewsletter(input) {
  requireWrite();
  if (!input.subject?.trim() || !input.html_body?.trim()) {
    throw new Error("subject y html_body son obligatorios");
  }
  const rows = await rest("POST", "newsletter_campaigns", {
    subject: input.subject.trim(),
    html_body: toHtml(input.html_body),
    status: "draft",
    created_by: getSession()?.user?.id ?? null,
    send_mode: input.send_mode ?? "immediate",
    daily_limit: input.daily_limit ?? null,
    validation_filter: input.validation_filter ?? "all_active",
  });
  return rows?.[0];
}

async function updateNewsletter(input) {
  requireWrite();
  if (!input.id) throw new Error("id es obligatorio");
  const current = await getCampaign({ id: input.id });
  if (!canEditCampaign(current.status)) {
    throw new Error("Solo se editan borradores o fallidos. Los enviados son historial.");
  }
  const payload = compact({
    subject: input.subject != null ? input.subject.trim() : undefined,
    html_body: input.html_body != null ? toHtml(input.html_body) : undefined,
    send_mode: input.send_mode,
    daily_limit: input.daily_limit,
    validation_filter: input.validation_filter,
  });
  if (Object.keys(payload).length === 0) throw new Error("Nada que actualizar");
  const rows = await rest("PATCH", `newsletter_campaigns?id=eq.${input.id}`, payload);
  if (!rows?.[0]) throw new Error("Campaña no encontrada");
  return rows[0];
}

async function sendNewsletter(input) {
  if (!input.campaign_id && (!input.subject?.trim() || !input.html_body?.trim()) && !input.test_email) {
    throw new Error("Pasa campaign_id de un borrador, o subject + html_body");
  }
  return invoke("newsletter-send", {
    campaignId: input.campaign_id,
    subject: input.subject,
    htmlBody: input.html_body,
    testEmail: input.test_email,
    sendMode: input.send_mode,
    dailyLimit: input.daily_limit,
    validationFilter: input.validation_filter,
  });
}

async function processNewsletterBatch({ campaign_id, force } = {}) {
  return invoke("newsletter-process-batch", {
    campaignId: campaign_id,
    force: force === true,
  });
}

async function cancelCampaign({ id }) {
  requireWrite();
  await rest(
    "PATCH",
    `newsletter_sends?campaign_id=eq.${id}&status=eq.pending`,
    { status: "cancelled", error_message: "Cancelado por administrador" },
  );
  const rows = await rest(
    "PATCH",
    `newsletter_campaigns?id=eq.${id}&status=eq.sending`,
    {
      status: "cancelled",
      next_batch_at: null,
      error_message: "Campaña cancelada: envíos pendientes detenidos",
    },
  );
  if (!rows?.[0]) throw new Error("Campaña no encontrada o no está sending");
  return rows[0];
}

async function scheduleCampaign({ id, next_batch_at }) {
  requireWrite();
  if (!next_batch_at) throw new Error("next_batch_at es obligatorio (ISO)");
  const rows = await rest(
    "PATCH",
    `newsletter_campaigns?id=eq.${id}&status=eq.sending`,
    { next_batch_at },
  );
  if (!rows?.[0]) throw new Error("Campaña no encontrada o no está sending");
  return rows[0];
}

async function listCampaignSends({ campaign_id, status, page, page_size } = {}) {
  requireWrite();
  if (!campaign_id) throw new Error("campaign_id es obligatorio");
  const size = Math.min(page_size ?? 50, 100);
  const offset = (page ?? 0) * size;
  const params = new URLSearchParams();
  params.set("select", SEND_COLS);
  params.set("campaign_id", `eq.${campaign_id}`);
  params.set("order", "sent_at.desc.nullslast,created_at.desc");
  params.set("limit", String(size));
  params.set("offset", String(offset));
  if (status && status !== "all") params.set("status", `eq.${status}`);
  return rest("GET", `newsletter_sends?${params}`, undefined, { count: true });
}

function ok(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function fail(err) {
  return {
    content: [{ type: "text", text: String(err?.message ?? err) }],
    isError: true,
  };
}

export function runCheck() {
  const cases = [
    ["slugify", slugify("¡Hola, Mundo!") === "hola-mundo"],
    ["slugify empty punct", slugify("  ---  ") === ""],
    ["toHtml passthrough", toHtml("<h1>x</h1>") === "<h1>x</h1>"],
    ["toHtml paragraphs", toHtml("a\n\nb") === "<p>a</p><p>b</p>"],
    ["toHtml escape", toHtml("a < b") === "<p>a &lt; b</p>"],
  ];
  try {
    assertTaxonomy({ familia: "nope" });
    cases.push(["assertTaxonomy", false]);
  } catch {
    cases.push(["assertTaxonomy", true]);
  }
  const created = buildWritePayload(
    { title: "Nota de prueba", content: "Párrafo uno.\n\nPárrafo dos." },
    { creating: true },
  );
  cases.push(["create slug", created.slug === "nota-de-prueba"]);
  cases.push(["create html", created.content === "<p>Párrafo uno.</p><p>Párrafo dos.</p>"]);
  cases.push(["create defaults", created.familia === "pulso" && created.formato === "news-semanal"]);
  cases.push(["email ok", isEmail("  Hola@Costa.digital  ")]);
  cases.push(["email bad", !isEmail("hola")]);
  cases.push(["session expired", sessionExpired({ expires_at: 1 })]);
  cases.push(["session fresh", !sessionExpired({ expires_at: Date.now() / 1000 + 3600 })]);
  const pub = publicSession({
    access_token: "secret",
    user: { id: "u1", email: "a@b.com" },
    isAdmin: true,
  });
  cases.push(["whoami no token", pub.canWrite === true && !("access_token" in pub)]);
  cases.push(["whoami logged out", publicSession(null).loggedIn === false]);
  cases.push([
    "auth header",
    headerValue({ Authorization: "Bearer abc" }, "authorization") === "Bearer abc",
  ]);
  cases.push(["edit draft", canEditCampaign("draft") && !canEditCampaign("sent")]);
  const csv = parseSubscriberCsv("email,nombre\na@b.com,Ana\na@b.com,Dup\nnope\nb@c.com");
  cases.push(["csv rows", csv.rows.length === 2 && csv.duplicatesInFile === 1 && csv.invalid === 1]);
  const failed = cases.filter(([, pass]) => !pass).map(([name]) => name);
  if (failed.length) {
    console.error(`FAIL ${failed.join(", ")}`);
    process.exitCode = 1;
    return;
  }
  console.error(`ok ${cases.length} checks`);
}

export async function createMareaServer() {
  const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");
  const { z } = await import("zod");

  const idArg = { id: z.string().uuid() };
  const articleFields = {
    title: z.string().optional(),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
    content: z
      .string()
      .optional()
      .describe("HTML (TipTap) o texto plano; el texto plano se envuelve en <p>"),
    cover_image_url: z.string().optional(),
    tags: z.array(z.string()).optional(),
    familia: z.enum(FAMILIAS).optional(),
    pilar: z.enum(PILARES).optional(),
    formato: z.enum(FORMATOS).optional(),
    destacado: z.boolean().optional(),
    video_url: z.string().optional(),
    cta_texto: z.string().optional(),
    cta_url: z.string().optional(),
  };

  const server = new McpServer({ name: "la-marea", version: "1.1.0" });

  server.tool(
    "login",
    "Inicia sesión con email y contraseña del sitio. Si el usuario es admin, desbloquea escritura y envíos.",
    { email: z.string(), password: z.string() },
    async (args) => {
      try {
        return ok(await login(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool("logout", "Cierra la sesión guardada.", {}, async () => ok(logout()));

  server.tool("whoami", "Quién está logueado y si puede escribir.", {}, async () => {
    try {
      await ensureSession();
      return ok(publicSession(getSession()));
    } catch (err) {
      return fail(err);
    }
  });

  server.resource(
    "taxonomias",
    "marea://taxonomias",
    { mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "marea://taxonomias",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              familias: FAMILIAS,
              pilares: PILARES,
              formatos: FORMATOS,
              urls: { public: "/noticias/:slug", admin: "/admin/noticias" },
            },
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.tool(
    "list_articles",
    "Lista notas de La Marea (sin el cuerpo HTML).",
    {
      status: z.enum(["draft", "published", "all"]).optional(),
      familia: z.enum(FAMILIAS).optional(),
      pilar: z.enum(PILARES).optional(),
      search: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async (args) => {
      try {
        return ok(await listArticles(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "get_article",
    "Lee una nota completa por id o slug, con HTML.",
    {
      id: z.string().uuid().optional(),
      slug: z.string().optional(),
    },
    async (args) => {
      try {
        return ok(await getArticle(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "create_article",
    "Crea un borrador. No publica. content: HTML o texto plano.",
    {
      title: z.string(),
      content: z.string(),
      ...Object.fromEntries(
        Object.entries(articleFields).filter(([k]) => k !== "title" && k !== "content"),
      ),
    },
    async (args) => {
      try {
        return ok(await createArticle(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "update_article",
    "Edita campos de una nota. No cambia el status; usa publish_article / unpublish_article.",
    { ...idArg, ...articleFields },
    async (args) => {
      try {
        return ok(await updateArticle(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "publish_article",
    "Pasa la nota a published y fija published_at si no tenía.",
    idArg,
    async (args) => {
      try {
        return ok(await publishArticle(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "unpublish_article",
    "Devuelve la nota a draft. Sigue existiendo; sale de /noticias.",
    idArg,
    async (args) => {
      try {
        return ok(await unpublishArticle(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "set_featured",
    "Marca la nota como portada del hero. Solo published. Quita el destacado de las demás.",
    idArg,
    async (args) => {
      try {
        return ok(await setFeatured(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "delete_article",
    "Borra la nota. Irreversible.",
    idArg,
    async (args) => {
      try {
        return ok(await deleteArticle(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.resource(
    "newsletter",
    "marea://newsletter",
    { mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "marea://newsletter",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              send_modes: SEND_MODES,
              validation_filters: VALIDATION_FILTERS,
              urls: { admin: "/admin/newsletter", baja: "/newsletter/baja" },
            },
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.tool(
    "list_subscribers",
    "Lista suscriptores de La Marea. Requiere sesión admin.",
    {
      status: z.enum(["active", "unsubscribed", "all"]).optional(),
      search: z.string().optional(),
      limit: z.number().int().min(1).max(200).optional(),
    },
    async (args) => {
      try {
        return ok(await listSubscribers(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "add_subscriber",
    "Alta manual, como el admin. No manda el mail de bienvenida.",
    {
      email: z.string(),
      name: z.string().optional(),
      source: z.string().optional(),
    },
    async (args) => {
      try {
        return ok(await addSubscriber(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "import_subscribers",
    "Importa CSV (columnas email/correo y name/nombre). No actualiza existentes.",
    { csv: z.string() },
    async (args) => {
      try {
        return ok(await importSubscribers(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "set_subscriber_status",
    "Activa o da de baja un suscriptor.",
    {
      id: z.string().uuid(),
      status: z.enum(["active", "unsubscribed"]),
    },
    async (args) => {
      try {
        return ok(await setSubscriberStatus(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "list_campaigns",
    "Historial y borradores de El Pulso. status=draft | sent | all.",
    {
      status: z
        .enum(["draft", "sending", "sent", "failed", "cancelled", "all"])
        .optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async (args) => {
      try {
        return ok(await listCampaigns(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "get_campaign",
    "Lee un newsletter guardado (asunto + HTML + estado de envío).",
    idArg,
    async (args) => {
      try {
        return ok(await getCampaign(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "create_newsletter",
    "Guarda un newsletter en borrador. No lo envía.",
    {
      subject: z.string(),
      html_body: z.string(),
      send_mode: z.enum(SEND_MODES).optional(),
      daily_limit: z.number().int().min(1).max(5000).optional(),
      validation_filter: z.enum(VALIDATION_FILTERS).optional(),
    },
    async (args) => {
      try {
        return ok(await createNewsletter(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "update_newsletter",
    "Edita un borrador (o uno fallido). Los enviados no se pisan.",
    {
      id: z.string().uuid(),
      subject: z.string().optional(),
      html_body: z.string().optional(),
      send_mode: z.enum(SEND_MODES).optional(),
      daily_limit: z.number().int().min(1).max(5000).optional(),
      validation_filter: z.enum(VALIDATION_FILTERS).optional(),
    },
    async (args) => {
      try {
        return ok(await updateNewsletter(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "send_newsletter",
    "Manda un borrador (campaign_id) o crea y manda al vuelo (subject + html_body). test_email = prueba, no toca la lista.",
    {
      campaign_id: z.string().uuid().optional(),
      subject: z.string().optional(),
      html_body: z.string().optional(),
      test_email: z.string().optional(),
      send_mode: z.enum(SEND_MODES).optional(),
      daily_limit: z.number().int().min(1).max(5000).optional(),
      validation_filter: z.enum(VALIDATION_FILTERS).optional(),
    },
    async (args) => {
      try {
        return ok(await sendNewsletter(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "process_newsletter_batch",
    "Procesa el siguiente lote de una campaña staggered (o todas las que toquen).",
    {
      campaign_id: z.string().uuid().optional(),
      force: z.boolean().optional(),
    },
    async (args) => {
      try {
        return ok(await processNewsletterBatch(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "cancel_campaign",
    "Cancela una campaña sending: pendientes a cancelled.",
    idArg,
    async (args) => {
      try {
        return ok(await cancelCampaign(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "schedule_campaign",
    "Mueve next_batch_at de una campaña sending (ISO).",
    {
      id: z.string().uuid(),
      next_batch_at: z.string(),
    },
    async (args) => {
      try {
        return ok(await scheduleCampaign(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "list_campaign_sends",
    "Página de envíos de una campaña.",
    {
      campaign_id: z.string().uuid(),
      status: z.enum(["pending", "sent", "failed", "cancelled", "all"]).optional(),
      page: z.number().int().min(0).optional(),
      page_size: z.number().int().min(1).max(100).optional(),
    },
    async (args) => {
      try {
        return ok(await listCampaignSends(args));
      } catch (err) {
        return fail(err);
      }
    },
  );

  return server;
}

function isMainModule() {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return fileURLToPath(import.meta.url) === entry;
  } catch {
    return entry.endsWith("mcp/marea.mjs");
  }
}

if (process.argv.includes("--check")) {
  runCheck();
} else if (process.argv.includes("--live")) {
  loadEnv(join(ROOT, ".env"));
  const rows = await listArticles({ status: "published", limit: 5 });
  console.error(
    JSON.stringify(
      rows.map((r) => ({ slug: r.slug, title: r.title, status: r.status })),
      null,
      2,
    ),
  );
} else if (isMainModule()) {
  loadEnv(join(ROOT, ".env"));
  await restoreSession();
  if (!getSession() && process.env.MAREA_EMAIL && process.env.MAREA_PASSWORD) {
    try {
      await login({
        email: process.env.MAREA_EMAIL,
        password: process.env.MAREA_PASSWORD,
      });
    } catch (err) {
      console.error("login automático falló:", err.message);
    }
  }
  const { StdioServerTransport } = await import(
    "@modelcontextprotocol/sdk/server/stdio.js"
  );
  const server = await createMareaServer();
  await server.connect(new StdioServerTransport());
}
