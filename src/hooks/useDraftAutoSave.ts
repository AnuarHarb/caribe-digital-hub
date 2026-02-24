import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_PREFIX = "blog-draft";
const DEBOUNCE_MS = 3000;

export interface BlogDraftData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  status: "draft" | "published";
  tags: string[];
  savedAt: string;
}

function getStorageKey(userId: string, postId: string | null): string {
  return `${STORAGE_PREFIX}:${userId}:${postId ?? "new"}`;
}

export function useDraftAutoSave(
  userId: string | undefined,
  postId: string | null,
  formData: Omit<BlogDraftData, "savedAt">,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? true;
  const [storedDraft, setStoredDraft] = useState<BlogDraftData | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevFormDataRef = useRef<string>("");

  const key = userId ? getStorageKey(userId, postId) : null;

  const clearDraft = useCallback(() => {
    if (!key) return;
    try {
      localStorage.removeItem(key);
      setStoredDraft(null);
      setLastSavedAt(null);
    } catch {
      // ignore
    }
  }, [key]);

  const saveDraft = useCallback(() => {
    if (!key || !userId || !enabled) return;
    const data: BlogDraftData = {
      ...formData,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(key, JSON.stringify(data));
      setLastSavedAt(new Date());
    } catch {
      // ignore quota exceeded etc
    }
  }, [key, userId, formData, enabled]);

  const loadDraft = useCallback((): BlogDraftData | null => {
    if (!key) return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as BlogDraftData;
      if (parsed && typeof parsed.savedAt === "string") return parsed;
      return null;
    } catch {
      return null;
    }
  }, [key]);

  useEffect(() => {
    if (!key || !userId) return;
    const draft = loadDraft();
    setStoredDraft(draft);
  }, [key, userId, loadDraft]);

  useEffect(() => {
    if (!enabled || !key || !userId) return;

    const serialized = JSON.stringify({
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      cover_image_url: formData.cover_image_url,
      status: formData.status,
      tags: formData.tags,
    });

    if (serialized === prevFormDataRef.current) return;
    prevFormDataRef.current = serialized;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveDraft();
      saveTimeoutRef.current = null;
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [formData, key, userId, enabled, saveDraft]);

  const restoreDraft = useCallback((): BlogDraftData | null => {
    const draft = loadDraft();
    if (draft) {
      clearDraft();
      setStoredDraft(null);
      return draft;
    }
    return null;
  }, [loadDraft, clearDraft]);

  const discardDraft = useCallback(() => {
    clearDraft();
    setStoredDraft(null);
  }, [clearDraft]);

  return {
    storedDraft,
    lastSavedAt,
    clearDraft,
    restoreDraft,
    discardDraft,
    loadDraft,
  };
}
