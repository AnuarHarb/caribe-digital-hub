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
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { parseSubscriberCsv, sendNewsletter } from "@/lib/newsletter";
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
  status: "draft" | "sending" | "sent" | "failed";
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  sent_at: string | null;
  created_at: string;
  error_message: string | null;
};

type SendRow = {
  id: string;
  email: string;
  status: "pending" | "sent" | "failed";
  resend_id: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
};

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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unsubscribed">("all");

  const [addOpen, setAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<Array<{ email: string; name?: string }>>([]);

  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState(
    `<h1>Costa Digital News</h1>\n<p>Hola,</p>\n<p>Este es El Pulso de esta semana.</p>\n<p>— Equipo Costa Digital</p>`
  );
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [sends, setSends] = useState<SendRow[]>([]);
  const [loadingSends, setLoadingSends] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: subs, error: subErr }, { data: camps, error: campErr }] =
        await Promise.all([
          supabase
            .from("newsletter_subscribers")
            .select("id, email, name, status, source, created_at, unsubscribed_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("newsletter_campaigns")
            .select(
              "id, subject, html_body, status, recipient_count, sent_count, failed_count, sent_at, created_at, error_message"
            )
            .order("created_at", { ascending: false })
            .limit(50),
        ]);

      if (subErr) throw subErr;
      if (campErr) throw campErr;

      setSubscribers((subs ?? []) as Subscriber[]);
      setCampaigns((camps ?? []) as Campaign[]);
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

  const activeCount = useMemo(
    () => subscribers.filter((s) => s.status === "active").length,
    [subscribers]
  );

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
      const { error } = await supabase.from("newsletter_subscribers").upsert(
        {
          email,
          name: newName.trim() || null,
          source: "admin",
          status: "active",
          unsubscribed_at: null,
        },
        { onConflict: "email" }
      );
      if (error) throw error;
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
    const rows = parseSubscriberCsv(text);
    if (rows.length === 0) {
      toast.error(t("admin.newsletter.importEmpty"));
      setImportPreview([]);
      return;
    }
    setImportPreview(rows);
    toast.message(t("admin.newsletter.importPreview", { count: rows.length }));
  };

  const confirmImport = async () => {
    if (importPreview.length === 0) return;
    setImporting(true);
    try {
      const chunkSize = 200;
      for (let i = 0; i < importPreview.length; i += chunkSize) {
        const chunk = importPreview.slice(i, i + chunkSize).map((row) => ({
          email: row.email,
          name: row.name ?? null,
          source: "import",
          status: "active" as const,
          unsubscribed_at: null,
        }));
        const { error } = await supabase
          .from("newsletter_subscribers")
          .upsert(chunk, { onConflict: "email" });
        if (error) throw error;
      }
      toast.success(t("admin.newsletter.importSuccess", { count: importPreview.length }));
      setImportPreview([]);
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
    if (!asTest && activeCount === 0) {
      toast.error(t("admin.newsletter.noActiveSubscribers"));
      return;
    }

    setSending(true);
    try {
      const result = await sendNewsletter({
        subject: subject.trim(),
        htmlBody,
        testEmail: asTest ? testEmail.trim() : undefined,
      });
      if (result.test) {
        toast.success(t("admin.newsletter.testSent"));
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

  const loadSends = async (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setLoadingSends(true);
    try {
      const { data, error } = await supabase
        .from("newsletter_sends")
        .select("id, email, status, resend_id, error_message, sent_at, created_at")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setSends((data ?? []) as SendRow[]);
    } catch (err) {
      console.error(err);
      toast.error(t("admin.newsletter.sendsLoadError"));
    } finally {
      setLoadingSends(false);
    }
  };

  const statusBadge = (status: string) => {
    const variant =
      status === "active" || status === "sent"
        ? "default"
        : status === "failed" || status === "unsubscribed"
          ? "destructive"
          : "secondary";
    return <Badge variant={variant}>{t(`admin.newsletter.status.${status}`)}</Badge>;
  };

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
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
            <History className="h-3.5 w-3.5" aria-hidden />
            {t("admin.newsletter.campaignCount", { count: campaigns.length })}
          </span>
        </div>
      </header>

      <Tabs defaultValue="subscribers">
        <TabsList>
          <TabsTrigger value="subscribers">{t("admin.newsletter.tabs.subscribers")}</TabsTrigger>
          <TabsTrigger value="import">{t("admin.newsletter.tabs.import")}</TabsTrigger>
          <TabsTrigger value="send">{t("admin.newsletter.tabs.send")}</TabsTrigger>
          <TabsTrigger value="history">{t("admin.newsletter.tabs.history")}</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative max-w-sm flex-1">
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
                <SelectTrigger className="w-[180px]">
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
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={exportSubscribers}>
                <Download className="mr-2 h-4 w-4" aria-hidden />
                {t("admin.newsletter.export")}
              </Button>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button type="button">
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

          <Card>
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
                      <TableHead>{t("admin.newsletter.name")}</TableHead>
                      <TableHead>{t("admin.newsletter.statusLabel")}</TableHead>
                      <TableHead>{t("admin.newsletter.source")}</TableHead>
                      <TableHead>{t("admin.newsletter.date")}</TableHead>
                      <TableHead className="text-right">{t("admin.newsletter.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.email}</TableCell>
                        <TableCell>{sub.name ?? "—"}</TableCell>
                        <TableCell>{statusBadge(sub.status)}</TableCell>
                        <TableCell>{sub.source}</TableCell>
                        <TableCell>
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
                    ))}
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="max-w-sm flex-1 space-y-1.5">
                  <Label htmlFor="nl-test">{t("admin.newsletter.testEmail")}</Label>
                  <Input
                    id="nl-test"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="tu@correo.com"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={sending}
                  onClick={() => handleSend(true)}
                >
                  <Mail className="mr-2 h-4 w-4" aria-hidden />
                  {t("admin.newsletter.sendTest")}
                </Button>
                <Button type="button" disabled={sending} onClick={() => handleSend(false)}>
                  {sending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Send className="mr-2 h-4 w-4" aria-hidden />
                  )}
                  {t("admin.newsletter.sendAll", { count: activeCount })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
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
                      <TableHead>{t("admin.newsletter.recipients")}</TableHead>
                      <TableHead>{t("admin.newsletter.sent")}</TableHead>
                      <TableHead>{t("admin.newsletter.failed")}</TableHead>
                      <TableHead>{t("admin.newsletter.date")}</TableHead>
                      <TableHead className="text-right">{t("admin.newsletter.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.subject}</TableCell>
                        <TableCell>{statusBadge(c.status)}</TableCell>
                        <TableCell>{c.recipient_count}</TableCell>
                        <TableCell>{c.sent_count}</TableCell>
                        <TableCell>{c.failed_count}</TableCell>
                        <TableCell>
                          {format(new Date(c.sent_at ?? c.created_at), "dd MMM yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
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
                              onClick={() => loadSends(c.id)}
                            >
                              {t("admin.newsletter.viewSends")}
                            </Button>
                          </div>
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
            <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-4 overflow-hidden">
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
                    className="h-[60vh] w-full border-0 bg-white"
                  />
                ) : (
                  <p className="p-6 text-sm text-muted-foreground">
                    {t("admin.newsletter.previewEmpty")}
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {selectedCampaignId && (
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.newsletter.sendsTitle")}</CardTitle>
                <CardDescription>
                  {t("admin.newsletter.sendsDescription")} · Resend IDs
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loadingSends ? (
                  <p className="p-6 text-sm text-muted-foreground">
                    {t("admin.newsletter.loading")}
                  </p>
                ) : sends.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground">
                    {t("admin.newsletter.noSends")}
                  </p>
                ) : (
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
                          <TableCell>{s.email}</TableCell>
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
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
