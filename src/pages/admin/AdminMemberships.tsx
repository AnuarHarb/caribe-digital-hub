import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { IdentificationCard, MagnifyingGlass, Plus, Users } from "@phosphor-icons/react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CREYENTES_MAX } from "@/content/portafolio";
import {
  addMonthsIso,
  dateInputToIso,
  dateInputValue,
  membershipStatus,
  nextCreyenteNumber,
  type MembershipPlan,
  type MembershipStatus,
} from "@/lib/membershipAdmin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Filter = "all" | MembershipStatus;

type Row = {
  id: string;
  user_id: string | null;
  plan: MembershipPlan;
  starts_at: string;
  ends_at: string;
  creyente_number: number | null;
  wall_name: string | null;
  product_key: string | null;
  renew: boolean;
  card_last_four: string | null;
  canceled_at: string | null;
  created_at: string;
  full_name: string | null;
};

type ProfileHit = { id: string; full_name: string | null };

const STATUS_CLASS: Record<MembershipStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  expired: "bg-muted text-muted-foreground",
  canceled: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
};

const emptyGrant = {
  userId: "",
  userName: "",
  plan: "miembro" as MembershipPlan,
  months: 1,
  creyente: true,
  wall: false,
};

export default function AdminMemberships() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [grantOpen, setGrantOpen] = useState(false);
  const [grant, setGrant] = useState(emptyGrant);
  const [userQuery, setUserQuery] = useState("");
  const [edit, setEdit] = useState<Row | null>(null);
  const [editEnds, setEditEnds] = useState("");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-memberships"],
    queryFn: async (): Promise<Row[]> => {
      const [{ data: memberships, error }, { data: profiles }] = await Promise.all([
        supabase
          .from("memberships")
          .select(
            "id, user_id, plan, starts_at, ends_at, creyente_number, wall_name, product_key, renew, card_last_four, canceled_at, created_at"
          )
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name"),
      ]);
      if (error) throw error;
      const names = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
      return (memberships ?? []).map((m) => ({
        ...m,
        full_name: m.user_id ? names.get(m.user_id) ?? null : null,
      }));
    },
  });

  const { data: userHits = [] } = useQuery({
    queryKey: ["admin-memberships-users", userQuery],
    enabled: grantOpen && userQuery.trim().length >= 2,
    queryFn: async (): Promise<ProfileHit[]> => {
      const { data, error } = await supabase.rpc("search_users_by_name", {
        search_term: userQuery.trim(),
      });
      if (error) throw error;
      return data ?? [];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-memberships"] });

  const grantMutation = useMutation({
    mutationFn: async () => {
      if (!grant.userId) throw new Error(t("admin.memberships.userRequired"));
      const starts = new Date();
      const ends = new Date(starts);
      ends.setMonth(ends.getMonth() + grant.months);
      const prior = rows.find((r) => r.user_id === grant.userId && r.creyente_number != null);
      let creyente: number | null = prior?.creyente_number ?? null;
      if (grant.creyente && creyente == null) {
        creyente = nextCreyenteNumber(rows.map((r) => r.creyente_number));
        if (creyente == null) throw new Error(t("admin.memberships.creyenteFull"));
      }
      const { error } = await supabase.from("memberships").insert({
        user_id: grant.userId,
        plan: grant.plan,
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        creyente_number: grant.creyente ? creyente : null,
        wall_name: grant.wall ? grant.userName || null : null,
        product_key: `${grant.plan}_${grant.months === 12 ? "anual" : "mensual"}`,
        renew: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("admin.memberships.created"));
      setGrantOpen(false);
      setGrant(emptyGrant);
      setUserQuery("");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message || t("admin.memberships.saveError")),
  });

  const updateMutation = useMutation({
    mutationFn: async (
      patch: {
        id: string;
        plan?: MembershipPlan;
        ends_at?: string;
        renew?: boolean;
        wall_name?: string | null;
        canceled_at?: string | null;
      }
    ) => {
      const { id, ...rest } = patch;
      const { error } = await supabase.from("memberships").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("admin.memberships.updated"));
      setEdit(null);
      invalidate();
    },
    onError: () => toast.error(t("admin.memberships.saveError")),
  });

  const now = Date.now();
  const withStatus = useMemo(
    () => rows.map((r) => ({ ...r, status: membershipStatus(r.ends_at, r.canceled_at, now) })),
    [rows, now]
  );

  const counts = useMemo(() => {
    const active = withStatus.filter((r) => r.status === "active").length;
    const expired = withStatus.filter((r) => r.status === "expired").length;
    const canceled = withStatus.filter((r) => r.status === "canceled").length;
    return {
      all: rows.length,
      active,
      expired,
      canceled,
      miembro: rows.filter((r) => r.plan === "miembro").length,
      residente: rows.filter((r) => r.plan === "residente").length,
      creyentes: new Set(rows.map((r) => r.creyente_number).filter((n): n is number => n != null)).size,
    };
  }, [rows, withStatus]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return withStatus.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!q) return true;
      return (
        (r.full_name ?? "").toLowerCase().includes(q) ||
        r.plan.includes(q) ||
        String(r.creyente_number ?? "").includes(q)
      );
    });
  }, [withStatus, filter, search]);

  const statCards = [
    { title: t("admin.memberships.statActive"), value: counts.active, sub: `${counts.expired} ${t("admin.memberships.statExpired")}` },
    { title: t("admin.memberships.statMiembros"), value: counts.miembro, sub: null },
    { title: t("admin.memberships.statResidentes"), value: counts.residente, sub: null },
    {
      title: t("admin.memberships.statCreyentes"),
      value: counts.creyentes,
      sub: `${t("admin.memberships.creyentesSub", { max: CREYENTES_MAX })}`,
    },
  ];

  const openEdit = (row: Row) => {
    setEdit(row);
    setEditEnds(dateInputValue(row.ends_at));
  };

  return (
    <article className="min-w-0 space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">
            {t("admin.memberships.title")}
          </h1>
          <p className="text-pretty text-sm text-muted-foreground sm:text-base">
            {t("admin.memberships.subtitle")}
          </p>
        </div>
        <Dialog
          open={grantOpen}
          onOpenChange={(open) => {
            setGrantOpen(open);
            if (!open) {
              setGrant(emptyGrant);
              setUserQuery("");
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus size={16} weight="regular" aria-hidden />
              {t("admin.memberships.grant")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin.memberships.grantTitle")}</DialogTitle>
              <DialogDescription>{t("admin.memberships.grantDescription")}</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                grantMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="member-user">{t("admin.memberships.user")}</Label>
                {grant.userId ? (
                  <p className="flex items-center justify-between rounded-xl border border-line px-3 py-2 text-sm">
                    <span>{grant.userName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setGrant({ ...grant, userId: "", userName: "" })}
                    >
                      {t("admin.memberships.changeUser")}
                    </Button>
                  </p>
                ) : (
                  <>
                    <Input
                      id="member-user"
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder={t("admin.memberships.searchUser")}
                      autoComplete="off"
                    />
                    {userHits.length > 0 && (
                      <ul className="max-h-40 overflow-auto rounded-xl border border-line">
                        {userHits.map((u) => (
                          <li key={u.id}>
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm hover:bg-paper"
                              onClick={() => {
                                setGrant({
                                  ...grant,
                                  userId: u.id,
                                  userName: u.full_name ?? "",
                                });
                              }}
                            >
                              {u.full_name || u.id}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="member-plan">{t("admin.memberships.plan")}</Label>
                  <Select
                    value={grant.plan}
                    onValueChange={(v: MembershipPlan) => setGrant({ ...grant, plan: v })}
                  >
                    <SelectTrigger id="member-plan">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="miembro">{t("portafolio.membership.plans.miembro.name")}</SelectItem>
                      <SelectItem value="residente">{t("portafolio.membership.plans.residente.name")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-period">{t("admin.memberships.period")}</Label>
                  <Select
                    value={String(grant.months)}
                    onValueChange={(v) => setGrant({ ...grant, months: Number(v) })}
                  >
                    <SelectTrigger id="member-period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t("admin.memberships.month")}</SelectItem>
                      <SelectItem value="12">{t("admin.memberships.year")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={grant.creyente}
                  onCheckedChange={(v) => setGrant({ ...grant, creyente: v === true })}
                />
                {t("admin.memberships.creyenteAssign")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={grant.wall}
                  onCheckedChange={(v) => setGrant({ ...grant, wall: v === true })}
                />
                {t("admin.memberships.wall")}
              </label>
              <Button type="submit" className="w-full" disabled={grantMutation.isPending || !grant.userId}>
                {t("admin.memberships.grant")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <section aria-label={t("admin.memberships.statsLabel")}>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="mt-3 h-8 w-16 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  {card.title === t("admin.memberships.statCreyentes") ? (
                    <IdentificationCard className="text-muted-foreground/60" size={20} weight="regular" aria-hidden />
                  ) : (
                    <Users className="text-muted-foreground/60" size={20} weight="regular" aria-hidden />
                  )}
                </CardHeader>
                <CardContent>
                  <p className="font-display text-3xl font-bold">{card.value}</p>
                  {card.sub && <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <TabsList className="w-max">
              <TabsTrigger value="all">{t("admin.memberships.all")} ({counts.all})</TabsTrigger>
              <TabsTrigger value="active">{t("admin.memberships.active")} ({counts.active})</TabsTrigger>
              <TabsTrigger value="expired">{t("admin.memberships.expired")} ({counts.expired})</TabsTrigger>
              <TabsTrigger value="canceled">{t("admin.memberships.canceled")} ({counts.canceled})</TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
        <div className="relative max-w-sm">
          <MagnifyingGlass
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
            weight="regular"
            aria-hidden
          />
          <Input
            placeholder={t("admin.memberships.search")}
            aria-label={t("admin.memberships.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : visible.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              {t("admin.memberships.empty")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.memberships.user")}</TableHead>
                  <TableHead>{t("admin.memberships.plan")}</TableHead>
                  <TableHead>{t("admin.memberships.status")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("admin.memberships.ends")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("admin.memberships.creyente")}</TableHead>
                  <TableHead className="hidden xl:table-cell">{t("admin.memberships.renew")}</TableHead>
                  <TableHead>{t("admin.memberships.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      <span className="line-clamp-2">{row.full_name || "—"}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground md:hidden">
                        {format(new Date(row.ends_at), "dd/MM/yyyy")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {t(`portafolio.membership.plans.${row.plan}.name`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${STATUS_CLASS[row.status]}`}>
                        {t(`admin.memberships.${row.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {format(new Date(row.ends_at), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="hidden font-mono text-sm lg:table-cell">
                      {row.creyente_number != null ? `#${String(row.creyente_number).padStart(3, "0")}` : "—"}
                    </TableCell>
                    <TableCell className="hidden text-sm xl:table-cell">
                      {row.renew ? t("admin.memberships.renewOn") : t("admin.memberships.renewOff")}
                      {row.card_last_four ? ` · ••${row.card_last_four}` : ""}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
                        {t("admin.memberships.edit")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!edit} onOpenChange={(open) => !open && setEdit(null)}>
        <DialogContent>
          {edit && (
            <>
              <DialogHeader>
                <DialogTitle>{t("admin.memberships.editTitle")}</DialogTitle>
                <DialogDescription>{edit.full_name || edit.user_id}</DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  updateMutation.mutate({
                    id: edit.id,
                    plan: edit.plan,
                    ends_at: dateInputToIso(editEnds),
                    renew: edit.renew,
                    wall_name: edit.wall_name,
                  });
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="edit-plan">{t("admin.memberships.plan")}</Label>
                  <Select
                    value={edit.plan}
                    onValueChange={(v: MembershipPlan) => setEdit({ ...edit, plan: v })}
                  >
                    <SelectTrigger id="edit-plan">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="miembro">{t("portafolio.membership.plans.miembro.name")}</SelectItem>
                      <SelectItem value="residente">{t("portafolio.membership.plans.residente.name")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-ends">{t("admin.memberships.ends")}</Label>
                  <Input
                    id="edit-ends"
                    type="date"
                    value={editEnds}
                    onChange={(e) => setEditEnds(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditEnds(dateInputValue(addMonthsIso(dateInputToIso(editEnds), 1)))}
                  >
                    {t("admin.memberships.extendMonth")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditEnds(dateInputValue(addMonthsIso(dateInputToIso(editEnds), 12)))}
                  >
                    {t("admin.memberships.extendYear")}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-wall">{t("admin.memberships.wall")}</Label>
                  <Input
                    id="edit-wall"
                    value={edit.wall_name ?? ""}
                    onChange={(e) => setEdit({ ...edit, wall_name: e.target.value || null })}
                  />
                </div>
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span>{t("admin.memberships.renew")}</span>
                  <Switch
                    checked={edit.renew}
                    onCheckedChange={(v) => setEdit({ ...edit, renew: v })}
                  />
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
                    {t("admin.memberships.save")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        id: edit.id,
                        ends_at: new Date().toISOString(),
                      })
                    }
                  >
                    {t("admin.memberships.expireNow")}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({
                      id: edit.id,
                      canceled_at: edit.canceled_at ? null : new Date().toISOString(),
                      renew: edit.canceled_at ? edit.renew : false,
                    })
                  }
                >
                  {edit.canceled_at ? t("admin.memberships.resume") : t("admin.memberships.cancel")}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </article>
  );
}
