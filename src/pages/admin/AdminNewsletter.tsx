import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  Download,
  Mail,
  Search,
  Upload,
  UserPlus,
  Send,
  Users,
  History,
  Loader2,
  Eye,
  Check,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  cancelStaggeredCampaign,
  estimateFilteredRecipients,
  fetchAllNewsletterSubscribers,
  fetchCampaignSendCounts,
  fetchCampaignSendsPage,
  fetchExistingSubscriberEmails,
  fetchNewsletterUserLinks,
  importNewsletterSubscribers,
  parseSubscriberCsvDetailed,
  processNewsletterBatch,
  sendNewsletter,
  updateCampaignSchedule,
  type CampaignSendCounts,
  type CampaignSendStatus,
  type NewsletterSendMode,
  type NewsletterUserLink,
  type NewsletterValidationFilter,
} from "@/lib/newsletter";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  status: "active" | "unsubscribed";
  source: string;
  created_at: string;
  unsubscribed_at: string | null;
};

type Campaign = {
  id: string;
  subject: string;
  html_body: string;
  status: "draft" | "sending" | "sent" | "failed" | "cancelled";
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  sent_at: string | null;
  created_at: string;
  error_message: string | null;
  send_mode: NewsletterSendMode | string;
  daily_limit: number | null;
  validation_filter: NewsletterValidationFilter | string;
  next_batch_at: string | null;
};

type SendRow = {
  id: string;
  email: string;
  status: CampaignSendStatus;
  resend_id: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
};

const SENDS_PAGE_SIZE = 50;

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(local: string): string {
  return new Date(local).toISOString();
}

function getScheduleState(campaign: Campaign): "scheduled" | "ready" | "cancelled" | "done" | "none" {
  if (campaign.send_mode !== "staggered") return "none";
  if (campaign.status === "cancelled") return "cancelled";
  if (campaign.status === "sent" || campaign.status === "failed") return "done";
  if (campaign.status !== "sending") return "none";
  if (!campaign.next_batch_at) return "ready";
  return new Date(campaign.next_batch_at).getTime() <= Date.now() ? "ready" : "scheduled";
}

function escapeCsvValue(value: string | null | undefined): string {
  const str = value ?? "";
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function AdminNewsletter() {
  const { t } = useTranslation();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [userLinks, setUserLinks] = useState<NewsletterUserLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unsubscribed">("all");

  const [addOpen, setAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<Array<{ email: string; name?: string }>>([]);
  const [importMeta, setImportMeta] = useState({
    duplicatesInFile: 0,
    invalid: 0,
  });

  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState(
    `<h1>La Marea</h1>\n<p>Hola,</p>\n<p>Este es El Pulso de esta semana.</p>\n<p>— Equipo Costa Digital</p>`
  );
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendMode, setSendMode] = useState<NewsletterSendMode>("immediate");
  const [dailyLimit, setDailyLimit] = useState("100");
  const [validationFilter, setValidationFilter] =
    useState<NewsletterValidationFilter>("all_active");
  const [processingBatchId, setProcessingBatchId] = useState<string | null>(null);

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [sends, setSends] = useState<SendRow[]>([]);
  const [sendCounts, setSendCounts] = useState<CampaignSendCounts | null>(null);
  const [sendsFilter, setSendsFilter] = useState<CampaignSendStatus | "all">("sent");
  const [sendsPage, setSendsPage] = useState(0);
  const [sendsTotal, setSendsTotal] = useState(0);
  const [loadingSends, setLoadingSends] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);
  const [scheduleDraft, setScheduleDraft] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, { data: camps, error: campErr }, links] = await Promise.all([
        fetchAllNewsletterSubscribers(),
        supabase
          .from("newsletter_campaigns")
          .select(
            "id, subject, html_body, status, recipient_count, sent_count, failed_count, sent_at, created_at, error_message, send_mode, daily_limit, validation_filter, next_batch_at"
          )
          .order("created_at", { ascending: false })
          .limit(50),
        fetchNewsletterUserLinks().catch((err) => {
          console.error(err);
          return [] as NewsletterUserLink[];
        }),
      ]);

      if (campErr) throw campErr;

      setSubscribers(subs as Subscriber[]);
      setCampaigns((camps ?? []) as Campaign[]);
      setUserLinks(links);
    } catch (err) {
      console.error(err);
      toast.error(t("admin.newsletter.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!selectedCampaignId) return;
    const campaign = campaigns.find((c) => c.id === selectedCampaignId);
    if (campaign) {
      setScheduleDraft(toDatetimeLocalValue(campaign.next_batch_at));
    }
  }, [campaigns, selectedCampaignId]);

  const activeCount = useMemo(
    () => subscribers.filter((s) => s.status === "active").length,
    [subscribers]
  );

  const userLinkBySubscriberId = useMemo(() => {
    const map = new Map<string, NewsletterUserLink>();
    for (const link of userLinks) {
      map.set(link.subscriber_id, link);
    }
    return map;
  }, [userLinks]);

  const registeredSubscriberCount = userLinks.length;

  const subscriberStats = useMemo(() => {
    const total = subscribers.length;
    const active = subscribers.filter((s) => s.status === "active").length;
    const unsubscribed = subscribers.filter((s) => s.status === "unsubscribed").length;
    const withAccount = userLinks.length;
    const withoutAccount = Math.max(total - withAccount, 0);
    return { total, active, unsubscribed, withAccount, withoutAccount };
  }, [subscribers, userLinks]);

  const filteredRecipientCount = useMemo(
    () => estimateFilteredRecipients(subscribers, validationFilter),
    [subscribers, validationFilter]
  );

  const estimatedDays = useMemo(() => {
    if (sendMode !== "staggered") return 1;
    const limit = Number(dailyLimit);
    if (!Number.isFinite(limit) || limit < 1) return null;
    return Math.ceil(filteredRecipientCount / limit);
  }, [sendMode, dailyLimit, filteredRecipientCount]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscribers.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (!q) return true;
      return (
        s.email.toLowerCase().includes(q) ||
        (s.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [subscribers, search, statusFilter]);

  const addSubscriber = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    setSaving(true);
    try {
      const { data: existing, error: existingError } = await supabase
        .from("newsletter_subscribers")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing) {
        toast.error(t("admin.newsletter.subscriberDuplicate"));
        return;
      }

      const { error } = await supabase.from("newsletter_subscribers").insert({
        email,
        name: newName.trim() || null,
        source: "admin",
        status: "active",
        unsubscribed_at: null,
      });
      if (error) {
        if (error.code === "23505") {
          toast.error(t("admin.newsletter.subscriberDuplicate"));
          return;
        }
        throw error;
      }
      toast.success(t("admin.newsletter.subscriberAdded"));
      setAddOpen(false);
      setNewEmail("");
      setNewName("");
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error(t("admin.newsletter.subscriberAddError"));
    } finally {
      setSaving(false);
    }
  };

  const toggleSubscriberStatus = async (sub: Subscriber) => {
    const nextStatus = sub.status === "active" ? "unsubscribed" : "active";
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({
          status: nextStatus,
          unsubscribed_at: nextStatus === "unsubscribed" ? new Date().toISOString() : null,
        })
        .eq("id", sub.id);
      if (error) throw error;
      toast.success(
        nextStatus === "active"
          ? t("admin.newsletter.reactivated")
          : t("admin.newsletter.unsubscribed")
      );
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error(t("admin.newsletter.updateError"));
    }
  };

  const onCsvSelected = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    const parsed = parseSubscriberCsvDetailed(text);
    if (parsed.rows.length === 0) {
      toast.error(t("admin.newsletter.importEmpty"));
      setImportPreview([]);
      setImportMeta({ duplicatesInFile: 0, invalid: 0 });
      return;
    }
    setImportPreview(parsed.rows);
    setImportMeta({
      duplicatesInFile: parsed.duplicatesInFile,
      invalid: parsed.invalid,
    });

    try {
      const existing = await fetchExistingSubscriberEmails();
      const alreadyInDb = parsed.rows.filter((r) => existing.has(r.email)).length;
      const newCount = parsed.rows.length - alreadyInDb;
      toast.message(
        t("admin.newsletter.importPreviewDetailed", {
          unique: parsed.rows.length,
          newCount,
          duplicates: alreadyInDb,
          duplicatesInFile: parsed.duplicatesInFile,
        })
      );
    } catch {
      toast.message(t("admin.newsletter.importPreview", { count: parsed.rows.length }));
    }
  };

  const confirmImport = async () => {
    if (importPreview.length === 0) return;
    setImporting(true);
    try {
      const result = await importNewsletterSubscribers(importPreview, {
        duplicatesInFile: importMeta.duplicatesInFile,
        invalid: importMeta.invalid,
      });
      toast.success(
        t("admin.newsletter.importResult", {
          added: result.added,
          duplicates: result.duplicates,
          duplicatesInFile: result.duplicatesInFile,
        })
      );
      setImportPreview([]);
      setImportMeta({ duplicatesInFile: 0, invalid: 0 });
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error(t("admin.newsletter.importError"));
    } finally {
      setImporting(false);
    }
  };

  const exportSubscribers = () => {
    const headers = ["email", "name", "status", "source", "created_at"];
    const rows = filtered.map((s) => [
      s.email,
      s.name ?? "",
      s.status,
      s.source,
      s.created_at,
    ]);
    const bom = "\uFEFF";
    const csv = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((r) => r.map(escapeCsvValue).join(",")),
    ].join("\n");
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newsletter-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = async (asTest: boolean) => {
    if (!subject.trim() || !htmlBody.trim()) {
      toast.error(t("admin.newsletter.sendValidation"));
      return;
    }
    if (asTest && !testEmail.trim()) {
      toast.error(t("admin.newsletter.testEmailRequired"));
      return;
    }
    if (!asTest && filteredRecipientCount === 0) {
      toast.error(t("admin.newsletter.noFilteredSubscribers"));
      return;
    }

    let parsedDailyLimit: number | undefined;
    if (!asTest && sendMode === "staggered") {
      parsedDailyLimit = Number(dailyLimit);
      if (!Number.isFinite(parsedDailyLimit) || parsedDailyLimit < 1) {
        toast.error(t("admin.newsletter.dailyLimitRequired"));
        return;
      }
    }

    setSending(true);
    try {
      const result = await sendNewsletter({
        subject: subject.trim(),
        htmlBody,
        testEmail: asTest ? testEmail.trim() : undefined,
        sendMode: asTest ? undefined : sendMode,
        dailyLimit: asTest ? undefined : parsedDailyLimit,
        validationFilter: asTest ? undefined : validationFilter,
      });
      if (result.test) {
        toast.success(t("admin.newsletter.testSent"));
      } else if (result.sendMode === "staggered") {
        toast.success(
          t("admin.newsletter.campaignStaggered", {
            sent: result.sentCount ?? 0,
            pending: result.pendingCount ?? 0,
            daily: result.dailyLimit ?? parsedDailyLimit ?? 0,
          })
        );
        setSubject("");
        await loadData();
      } else {
        toast.success(
          t("admin.newsletter.campaignSent", {
            sent: result.sentCount ?? 0,
            failed: result.failedCount ?? 0,
          })
        );
        setSubject("");
        await loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : t("admin.newsletter.sendError"));
    } finally {
      setSending(false);
    }
  };

  const handleProcessBatch = async (campaignId: string) => {
    setProcessingBatchId(campaignId);
    try {
      const result = await processNewsletterBatch({ campaignId, force: true });
      const batch = result.results?.[0];
      if (!batch) {
        toast.message(result.message ?? t("admin.newsletter.noPendingBatch"));
      } else if (batch.done) {
        toast.success(t("admin.newsletter.batchDone"));
      } else {
        toast.success(
          t("admin.newsletter.batchProcessed", {
            sent: batch.sentCount,
            pending: batch.pendingCount,
          })
        );
      }
      await loadData();
      if (selectedCampaignId === campaignId) {
        await loadSends(campaignId, { resetPage: true });
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : t("admin.newsletter.batchError"));
    } finally {
      setProcessingBatchId(null);
    }
  };

  const loadSends = async (
    campaignId: string,
    options?: {
      resetPage?: boolean;
      filter?: CampaignSendStatus | "all";
      page?: number;
    }
  ) => {
    const nextFilter = options?.filter ?? sendsFilter;
    const nextPage = options?.resetPage ? 0 : (options?.page ?? sendsPage);

    setSelectedCampaignId(campaignId);
    setSendsFilter(nextFilter);
    setSendsPage(nextPage);
    setLoadingSends(true);

    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      setScheduleDraft(toDatetimeLocalValue(campaign.next_batch_at));
    }

    try {
      const [pageResult, counts] = await Promise.all([
        fetchCampaignSendsPage(campaignId, {
          status: nextFilter,
          page: nextPage,
          pageSize: SENDS_PAGE_SIZE,
        }),
        fetchCampaignSendCounts(campaignId),
      ]);
      setSends(pageResult.rows as SendRow[]);
      setSendsTotal(pageResult.total);
      setSendCounts(counts);
    } catch (err) {
      console.error(err);
      toast.error(t("admin.newsletter.sendsLoadError"));
    } finally {
      setLoadingSends(false);
    }
  };

  const handleSaveSchedule = async (campaignId: string) => {
    if (!scheduleDraft) {
      toast.error(t("admin.newsletter.scheduleRequired"));
      return;
    }
    setSavingSchedule(true);
    try {
      await updateCampaignSchedule(campaignId, fromDatetimeLocalValue(scheduleDraft));
      toast.success(t("admin.newsletter.scheduleUpdated"));
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error(t("admin.newsletter.scheduleUpdateError"));
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleCancelCampaign = async (campaignId: string) => {
    const confirmed = window.confirm(t("admin.newsletter.cancelConfirm"));
    if (!confirmed) return;
    setCancellingId(campaignId);
    try {
      await cancelStaggeredCampaign(campaignId);
      toast.success(t("admin.newsletter.cancelSuccess"));
      await loadData();
      if (selectedCampaignId === campaignId) {
        await loadSends(campaignId, { resetPage: true, filter: "cancelled" });
      }
    } catch (err) {
      console.error(err);
      toast.error(t("admin.newsletter.cancelError"));
    } finally {
      setCancellingId(null);
    }
  };

  const selectedCampaign = useMemo(
    () => campaigns.find((c) => c.id === selectedCampaignId) ?? null,
    [campaigns, selectedCampaignId]
  );

  const statusBadge = (status: string) => {
    const variant =
      status === "active" || status === "sent"
        ? "default"
        : status === "failed" || status === "unsubscribed" || status === "cancelled"
          ? "destructive"
          : "secondary";
    return <Badge variant={variant}>{t(`admin.newsletter.status.${status}`)}</Badge>;
  };

  const scheduleBadge = (campaign: Campaign) => {
    const state = getScheduleState(campaign);
    if (state === "none") return null;
    const label = t(`admin.newsletter.scheduleState.${state}`);
    const variant =
      state === "ready"
        ? "default"
        : state === "cancelled"
          ? "destructive"
          : "secondary";
    return <Badge variant={variant}>{label}</Badge>;
  };

  const sendsPageCount = Math.max(1, Math.ceil(sendsTotal / SENDS_PAGE_SIZE));

  return (
    <main className="min-w-0 space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {t("admin.newsletter.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("admin.newsletter.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {t("admin.newsletter.activeCount", { count: activeCount })}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {t("admin.newsletter.registeredCount", {
              count: registeredSubscriberCount,
            })}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1">
            <History className="h-3.5 w-3.5" aria-hidden />
            {t("admin.newsletter.campaignCount", { count: campaigns.length })}
          </span>
        </div>
      </header>

      <Tabs defaultValue="subscribers">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <TabsList className="w-max">
            <TabsTrigger value="subscribers">{t("admin.newsletter.tabs.subscribers")}</TabsTrigger>
            <TabsTrigger value="import">{t("admin.newsletter.tabs.import")}</TabsTrigger>
            <TabsTrigger value="send">{t("admin.newsletter.tabs.send")}</TabsTrigger>
            <TabsTrigger value="history">{t("admin.newsletter.tabs.history")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="subscribers" className="space-y-4">
          <section
            aria-label={t("admin.newsletter.subscriberStatsLabel")}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-3 w-20 rounded bg-muted" />
                    <div className="mt-2 h-7 w-12 rounded bg-muted" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("admin.newsletter.statTotal")}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground/60" aria-hidden />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{subscriberStats.total}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("admin.newsletter.statActive")}
                    </CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground/60" aria-hidden />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{subscriberStats.active}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {subscriberStats.unsubscribed}{" "}
                      {t("admin.newsletter.status.unsubscribed").toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("admin.newsletter.statWithAccount")}
                    </CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground/60" aria-hidden />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{subscriberStats.withAccount}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {subscriberStats.total
                        ? Math.round(
                            (subscriberStats.withAccount / subscriberStats.total) * 100
                          )
                        : 0}
                      %
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t("admin.newsletter.statWithoutAccount")}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground/60" aria-hidden />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{subscriberStats.withoutAccount}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </section>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full flex-1 sm:max-w-sm">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("admin.newsletter.searchPlaceholder")}
                  className="pl-8"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.newsletter.filterAll")}</SelectItem>
                  <SelectItem value="active">{t("admin.newsletter.status.active")}</SelectItem>
                  <SelectItem value="unsubscribed">
                    {t("admin.newsletter.status.unsubscribed")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={exportSubscribers}>
                <Download className="mr-2 h-4 w-4" aria-hidden />
                {t("admin.newsletter.export")}
              </Button>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button type="button" className="w-full sm:w-auto">
                    <UserPlus className="mr-2 h-4 w-4" aria-hidden />
                    {t("admin.newsletter.add")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("admin.newsletter.addTitle")}</DialogTitle>
                    <DialogDescription>{t("admin.newsletter.addDescription")}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="sub-email">{t("admin.newsletter.email")}</Label>
                      <Input
                        id="sub-email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="sub-name">{t("admin.newsletter.name")}</Label>
                      <Input
                        id="sub-name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                    </div>
                    <Button type="button" onClick={addSubscriber} disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                      {t("admin.newsletter.save")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="min-w-0 overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <p className="p-6 text-sm text-muted-foreground">{t("admin.newsletter.loading")}</p>
              ) : filtered.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">{t("admin.newsletter.empty")}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.newsletter.email")}</TableHead>
                      <TableHead className="hidden sm:table-cell">{t("admin.newsletter.name")}</TableHead>
                      <TableHead>{t("admin.newsletter.statusLabel")}</TableHead>
                      <TableHead className="hidden md:table-cell">
                        {t("admin.newsletter.registeredUser")}
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">{t("admin.newsletter.source")}</TableHead>
                      <TableHead className="hidden xl:table-cell">{t("admin.newsletter.date")}</TableHead>
                      <TableHead className="text-right">{t("admin.newsletter.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((sub) => {
                      const linkedUser = userLinkBySubscriberId.get(sub.id);
                      const displayName =
                        linkedUser?.full_name?.trim() ||
                        sub.name?.trim() ||
                        t("admin.newsletter.registeredYes");
                      return (
                        <TableRow key={sub.id}>
                          <TableCell className="max-w-[11rem] font-medium sm:max-w-none">
                            <span className="break-all">{sub.email}</span>
                            <span className="mt-1 block sm:hidden">
                              {linkedUser ? (
                                <Button
                                  asChild
                                  variant="link"
                                  size="sm"
                                  className="h-auto px-0 py-0 text-xs"
                                >
                                  <Link to="/admin/usuarios">{displayName}</Link>
                                </Button>
                              ) : sub.name ? (
                                <span className="text-xs text-muted-foreground">{sub.name}</span>
                              ) : null}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {linkedUser ? (
                              <Button
                                asChild
                                variant="link"
                                size="sm"
                                className="h-auto max-w-full truncate px-0 py-0"
                              >
                                <Link to="/admin/usuarios" title={linkedUser.email}>
                                  {displayName}
                                </Link>
                              </Button>
                            ) : (
                              (sub.name ?? "—")
                            )}
                          </TableCell>
                          <TableCell>{statusBadge(sub.status)}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {linkedUser ? (
                              <Check
                                className="h-4 w-4 text-emerald-600"
                                aria-label={t("admin.newsletter.registeredYes")}
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground" aria-hidden>
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">{sub.source}</TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {format(new Date(sub.created_at), "dd MMM yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSubscriberStatus(sub)}
                            >
                              {sub.status === "active"
                                ? t("admin.newsletter.unsubscribe")
                                : t("admin.newsletter.reactivate")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.newsletter.importTitle")}</CardTitle>
              <CardDescription>{t("admin.newsletter.importDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="csv-file">{t("admin.newsletter.csvFile")}</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => onCsvSelected(e.target.files?.[0] ?? null)}
                />
              </div>
              {importPreview.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {t("admin.newsletter.importPreview", { count: importPreview.length })}
                    {importMeta.duplicatesInFile > 0
                      ? ` · ${t("admin.newsletter.importFileDuplicates", {
                          count: importMeta.duplicatesInFile,
                        })}`
                      : ""}
                  </p>
                  <div className="max-h-48 overflow-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("admin.newsletter.email")}</TableHead>
                          <TableHead>{t("admin.newsletter.name")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importPreview.slice(0, 20).map((row) => (
                          <TableRow key={row.email}>
                            <TableCell>{row.email}</TableCell>
                            <TableCell>{row.name ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button type="button" onClick={confirmImport} disabled={importing}>
                    {importing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" aria-hidden />
                    )}
                    {t("admin.newsletter.confirmImport")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.newsletter.sendTitle")}</CardTitle>
              <CardDescription>{t("admin.newsletter.sendDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nl-subject">{t("admin.newsletter.subject")}</Label>
                <Input
                  id="nl-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="El Pulso — semana del…"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nl-body">{t("admin.newsletter.htmlBody")}</Label>
                <Textarea
                  id="nl-body"
                  value={htmlBody}
                  onChange={(e) => setHtmlBody(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <fieldset className="space-y-3 rounded-md border p-4">
                <legend className="px-1 text-sm font-medium">
                  {t("admin.newsletter.deliveryOptions")}
                </legend>

                <div className="space-y-2">
                  <Label htmlFor="nl-filter">{t("admin.newsletter.validationFilter")}</Label>
                  <Select
                    value={validationFilter}
                    onValueChange={(v) =>
                      setValidationFilter(v as NewsletterValidationFilter)
                    }
                  >
                    <SelectTrigger id="nl-filter" className="w-full sm:max-w-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_active">
                        {t("admin.newsletter.filters.all_active")}
                      </SelectItem>
                      <SelectItem value="strict_email">
                        {t("admin.newsletter.filters.strict_email")}
                      </SelectItem>
                      <SelectItem value="has_name">
                        {t("admin.newsletter.filters.has_name")}
                      </SelectItem>
                      <SelectItem value="exclude_recent_30d">
                        {t("admin.newsletter.filters.exclude_recent_30d")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t(`admin.newsletter.filterHelp.${validationFilter}`)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.newsletter.sendMode")}</Label>
                  <RadioGroup
                    value={sendMode}
                    onValueChange={(v) => setSendMode(v as NewsletterSendMode)}
                    className="gap-3"
                  >
                    <div className="flex items-start gap-2">
                      <RadioGroupItem value="immediate" id="mode-immediate" className="mt-0.5" />
                      <div>
                        <Label htmlFor="mode-immediate" className="font-normal">
                          {t("admin.newsletter.modeImmediate")}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t("admin.newsletter.modeImmediateHelp")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <RadioGroupItem value="staggered" id="mode-staggered" className="mt-0.5" />
                      <div>
                        <Label htmlFor="mode-staggered" className="font-normal">
                          {t("admin.newsletter.modeStaggered")}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t("admin.newsletter.modeStaggeredHelp")}
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {sendMode === "staggered" && (
                  <div className="w-full space-y-1.5 sm:max-w-xs">
                    <Label htmlFor="nl-daily-limit">{t("admin.newsletter.dailyLimit")}</Label>
                    <Input
                      id="nl-daily-limit"
                      type="number"
                      min={1}
                      max={5000}
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(e.target.value)}
                    />
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  {sendMode === "staggered" && estimatedDays
                    ? t("admin.newsletter.recipientEstimateStaggered", {
                        count: filteredRecipientCount,
                        daily: Number(dailyLimit) || 0,
                        days: estimatedDays,
                      })
                    : t("admin.newsletter.recipientEstimate", {
                        count: filteredRecipientCount,
                        total: activeCount,
                      })}
                </p>
              </fieldset>

              <div className="flex flex-col gap-3">
                <div className="w-full space-y-1.5 sm:max-w-sm">
                  <Label htmlFor="nl-test">{t("admin.newsletter.testEmail")}</Label>
                  <Input
                    id="nl-test"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="tu@correo.com"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={sending}
                    onClick={() => handleSend(true)}
                  >
                    <Mail className="mr-2 h-4 w-4" aria-hidden />
                    {t("admin.newsletter.sendTest")}
                  </Button>
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    disabled={sending}
                    onClick={() => handleSend(false)}
                  >
                    {sending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Send className="mr-2 h-4 w-4" aria-hidden />
                    )}
                    {sendMode === "staggered"
                      ? t("admin.newsletter.startStaggered", {
                          count: filteredRecipientCount,
                        })
                      : t("admin.newsletter.sendAll", {
                          count: filteredRecipientCount,
                        })}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle>{t("admin.newsletter.historyTitle")}</CardTitle>
              <CardDescription>{t("admin.newsletter.historyDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {campaigns.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  {t("admin.newsletter.noCampaigns")}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.newsletter.subject")}</TableHead>
                      <TableHead>{t("admin.newsletter.statusLabel")}</TableHead>
                      <TableHead className="hidden sm:table-cell">{t("admin.newsletter.recipients")}</TableHead>
                      <TableHead>{t("admin.newsletter.sent")}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("admin.newsletter.failed")}</TableHead>
                      <TableHead className="hidden lg:table-cell">{t("admin.newsletter.date")}</TableHead>
                      <TableHead className="text-right">{t("admin.newsletter.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="max-w-[10rem] font-medium sm:max-w-xs">
                          <span className="line-clamp-2">{c.subject}</span>
                          <span className="mt-1 block text-xs text-muted-foreground lg:hidden">
                            {format(new Date(c.sent_at ?? c.created_at), "dd MMM yyyy HH:mm")}
                          </span>
                        </TableCell>
                        <TableCell>{statusBadge(c.status)}</TableCell>
                        <TableCell className="hidden sm:table-cell">{c.recipient_count}</TableCell>
                        <TableCell>{c.sent_count}</TableCell>
                        <TableCell className="hidden md:table-cell">{c.failed_count}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {format(new Date(c.sent_at ?? c.created_at), "dd MMM yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-stretch justify-end gap-1 sm:flex-row sm:flex-wrap sm:items-center">
                            {c.send_mode === "staggered" && scheduleBadge(c)}
                            {c.status === "sending" && c.send_mode === "staggered" && (
                              <>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={processingBatchId === c.id}
                                  onClick={() => handleProcessBatch(c.id)}
                                >
                                  {processingBatchId === c.id ? (
                                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" aria-hidden />
                                  ) : null}
                                  {t("admin.newsletter.sendNow")}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  disabled={cancellingId === c.id}
                                  onClick={() => handleCancelCampaign(c.id)}
                                >
                                  {cancellingId === c.id ? (
                                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" aria-hidden />
                                  ) : null}
                                  {t("admin.newsletter.cancelCampaign")}
                                </Button>
                              </>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={() => setPreviewCampaign(c)}
                            >
                              <Eye className="h-3.5 w-3.5" aria-hidden />
                              {t("admin.newsletter.previewEmail")}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                loadSends(c.id, {
                                  resetPage: true,
                                  filter: c.status === "sending" ? "pending" : "sent",
                                })
                              }
                            >
                              {t("admin.newsletter.viewSends")}
                            </Button>
                          </div>
                          {c.send_mode === "staggered" && (
                            <p className="mt-1 text-left text-xs text-muted-foreground sm:text-right">
                              {c.status === "sending"
                                ? t("admin.newsletter.staggeredProgress", {
                                    sent: c.sent_count,
                                    total: c.recipient_count,
                                    daily: c.daily_limit ?? "—",
                                    next: c.next_batch_at
                                      ? format(new Date(c.next_batch_at), "dd MMM HH:mm")
                                      : "—",
                                  })
                                : c.status === "cancelled"
                                  ? t("admin.newsletter.staggeredCancelled", {
                                      sent: c.sent_count,
                                      total: c.recipient_count,
                                    })
                                  : t("admin.newsletter.staggeredDone", {
                                      daily: c.daily_limit ?? "—",
                                    })}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Dialog
            open={!!previewCampaign}
            onOpenChange={(open) => {
              if (!open) setPreviewCampaign(null);
            }}
          >
            <DialogContent className="flex max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-4 overflow-hidden sm:w-full">
              <DialogHeader>
                <DialogTitle>{t("admin.newsletter.previewTitle")}</DialogTitle>
                <DialogDescription>
                  {previewCampaign?.subject}
                  {previewCampaign?.sent_at
                    ? ` · ${format(new Date(previewCampaign.sent_at), "dd MMM yyyy HH:mm")}`
                    : ""}
                </DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-hidden rounded-md border bg-background">
                {previewCampaign?.html_body ? (
                  <iframe
                    title={t("admin.newsletter.previewTitle")}
                    sandbox=""
                    srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8" /><base target="_blank" /><style>body{margin:16px;font-family:system-ui,sans-serif;color:#111;line-height:1.5;}img{max-width:100%;height:auto;}</style></head><body>${previewCampaign.html_body}</body></html>`}
                    className="h-[50dvh] w-full border-0 bg-white sm:h-[60vh]"
                  />
                ) : (
                  <p className="p-6 text-sm text-muted-foreground">
                    {t("admin.newsletter.previewEmpty")}
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {selectedCampaign && (
            <section className="space-y-4">
              {selectedCampaign.send_mode === "staggered" &&
                selectedCampaign.status === "sending" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("admin.newsletter.scheduleTitle")}</CardTitle>
                      <CardDescription>
                        {t("admin.newsletter.scheduleDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {scheduleBadge(selectedCampaign)}
                        <span className="text-sm text-muted-foreground">
                          {t("admin.newsletter.scheduleDaily", {
                            daily: selectedCampaign.daily_limit ?? "—",
                          })}
                        </span>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="w-full space-y-1.5 sm:max-w-xs">
                          <Label htmlFor="next-batch-at">
                            {t("admin.newsletter.nextBatchAt")}
                          </Label>
                          <Input
                            id="next-batch-at"
                            type="datetime-local"
                            value={scheduleDraft}
                            onChange={(e) => setScheduleDraft(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={savingSchedule}
                            onClick={() => handleSaveSchedule(selectedCampaign.id)}
                          >
                            {savingSchedule ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                            ) : null}
                            {t("admin.newsletter.saveSchedule")}
                          </Button>
                          <Button
                            type="button"
                            disabled={processingBatchId === selectedCampaign.id}
                            onClick={() => handleProcessBatch(selectedCampaign.id)}
                          >
                            {processingBatchId === selectedCampaign.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                            ) : null}
                            {t("admin.newsletter.sendNow")}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            disabled={cancellingId === selectedCampaign.id}
                            onClick={() => handleCancelCampaign(selectedCampaign.id)}
                          >
                            {cancellingId === selectedCampaign.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                            ) : null}
                            {t("admin.newsletter.cancelCampaign")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

              <Card className="min-w-0 overflow-hidden">
                <CardHeader>
                  <CardTitle>{t("admin.newsletter.sendsTitle")}</CardTitle>
                  <CardDescription>
                    {selectedCampaign.subject} · {t("admin.newsletter.sendsDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sendCounts && (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-md border px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                          {t("admin.newsletter.status.sent")}
                        </p>
                        <p className="text-lg font-semibold">{sendCounts.sent}</p>
                      </div>
                      <div className="rounded-md border px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                          {t("admin.newsletter.status.pending")}
                        </p>
                        <p className="text-lg font-semibold">{sendCounts.pending}</p>
                      </div>
                      <div className="rounded-md border px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                          {t("admin.newsletter.status.failed")}
                        </p>
                        <p className="text-lg font-semibold">{sendCounts.failed}</p>
                      </div>
                      <div className="rounded-md border px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                          {t("admin.newsletter.status.cancelled")}
                        </p>
                        <p className="text-lg font-semibold">{sendCounts.cancelled}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Select
                      value={sendsFilter}
                      onValueChange={(v) =>
                        loadSends(selectedCampaign.id, {
                          resetPage: true,
                          filter: v as CampaignSendStatus | "all",
                        })
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("admin.newsletter.filterAll")}</SelectItem>
                        <SelectItem value="sent">{t("admin.newsletter.status.sent")}</SelectItem>
                        <SelectItem value="pending">
                          {t("admin.newsletter.status.pending")}
                        </SelectItem>
                        <SelectItem value="failed">
                          {t("admin.newsletter.status.failed")}
                        </SelectItem>
                        <SelectItem value="cancelled">
                          {t("admin.newsletter.status.cancelled")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.newsletter.sendsPageInfo", {
                        page: sendsPage + 1,
                        pages: sendsPageCount,
                        total: sendsTotal,
                      })}
                    </p>
                  </div>

                  {sendsFilter === "pending" && (
                    <p className="text-xs text-muted-foreground">
                      {t("admin.newsletter.pendingHint")}
                    </p>
                  )}

                  {loadingSends ? (
                    <p className="text-sm text-muted-foreground">{t("admin.newsletter.loading")}</p>
                  ) : sends.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("admin.newsletter.noSends")}</p>
                  ) : (
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("admin.newsletter.email")}</TableHead>
                            <TableHead>{t("admin.newsletter.statusLabel")}</TableHead>
                            <TableHead>Resend ID</TableHead>
                            <TableHead>{t("admin.newsletter.date")}</TableHead>
                            <TableHead>{t("admin.newsletter.error")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sends.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell className="max-w-[14rem] break-all">{s.email}</TableCell>
                              <TableCell>{statusBadge(s.status)}</TableCell>
                              <TableCell className="font-mono text-xs">
                                {s.resend_id ?? "—"}
                              </TableCell>
                              <TableCell>
                                {s.sent_at
                                  ? format(new Date(s.sent_at), "dd MMM yyyy HH:mm")
                                  : "—"}
                              </TableCell>
                              <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                                {s.error_message ?? "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {sendsTotal > SENDS_PAGE_SIZE && (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={loadingSends || sendsPage === 0}
                        onClick={() =>
                          loadSends(selectedCampaign.id, { page: sendsPage - 1 })
                        }
                      >
                        {t("admin.newsletter.prevPage")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={loadingSends || sendsPage + 1 >= sendsPageCount}
                        onClick={() =>
                          loadSends(selectedCampaign.id, { page: sendsPage + 1 })
                        }
                      >
                        {t("admin.newsletter.nextPage")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
