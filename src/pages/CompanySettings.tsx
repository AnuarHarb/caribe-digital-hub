import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Building2, UserPlus, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CompanyProfileForm } from "@/components/jobs/CompanyProfileForm";
import { PendingInvitations } from "@/components/company/PendingInvitations";
import { CreateCompanyDialog } from "@/components/company/CreateCompanyDialog";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import {
  useCompanyMembers,
  useInviteMember,
  useRemoveMember,
  type CompanyMember,
} from "@/hooks/useCompanies";
import { toast } from "sonner";

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function CompanySettings() {
  const { t } = useTranslation();
  const detailSectionRef = useRef<HTMLDivElement>(null);
  const {
    activeCompany,
    companies,
    setActiveCompany,
    isLoading: companiesLoading,
    refetch,
  } = useActiveCompany();
  const { members, isLoading } = useCompanyMembers(activeCompany?.id);
  const { inviteMember, isInviting } = useInviteMember();
  const { removeMember, isRemoving } = useRemoveMember();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [memberToRemove, setMemberToRemove] = useState<CompanyMember | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const canManage = activeCompany?.role === "owner" || activeCompany?.role === "admin";

  const handleSelectCompany = (company: (typeof companies)[0]) => {
    setActiveCompany(company);
    detailSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany?.id || !inviteEmail.trim()) return;
    try {
      await inviteMember({
        companyId: activeCompany.id,
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      toast.success(t("company.inviteSuccess"));
      setInviteEmail("");
    } catch {
      toast.error(t("company.inviteError"));
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await removeMember({ memberId: memberToRemove.id });
      toast.success(t("common.success"));
      setMemberToRemove(null);
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <article className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          {t("company.settingsTitle")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("company.myCompaniesDescription")}
        </p>
      </header>

      <PendingInvitations />

      {/* Section 1: My Companies */}
      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
          {t("company.myCompanies")}
        </h2>

        {companiesLoading ? (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : companies.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Building2 className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-medium text-foreground">
                {t("company.noCompanies")}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {t("company.noCompaniesDescription")}
              </p>
              <Button
                className="mt-6 gap-2"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("company.createNew")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => {
              const isActive = activeCompany?.id === c.id;
              return (
                <Card
                  key={c.id}
                  className={`cursor-pointer transition-all hover:border-accent/50 ${
                    isActive ? "border-accent ring-2 ring-accent/20" : ""
                  }`}
                  onClick={() => handleSelectCompany(c)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {c.company_name}
                        </p>
                        {(c.industry || c.location) && (
                          <p className="mt-0.5 truncate text-sm text-muted-foreground">
                            {[c.industry, c.location].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium uppercase ${
                          isActive ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {t(`company.role.${c.role}`)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Card
              className="cursor-pointer border-dashed transition-colors hover:border-accent/50 hover:bg-muted/30"
              onClick={() => setCreateOpen(true)}
            >
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  {t("company.createNew")}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Section 2: Active Company Detail */}
      {activeCompany && (
        <section ref={detailSectionRef} className="space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {t("company.companyDetails")} — {activeCompany.company_name}
          </h2>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" aria-hidden />
                <CardTitle>{t("company.profile")}</CardTitle>
              </div>
              <CardDescription>{t("company.editDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyProfileForm companyId={activeCompany.id} />
            </CardContent>
          </Card>

          {canManage && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" aria-hidden />
                  <CardTitle>{t("company.inviteMember")}</CardTitle>
                </div>
                <CardDescription>{t("company.inviteDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleInvite}
                  className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label htmlFor="invite-email">{t("auth.email")}</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder={t("company.inviteEmailPlaceholder")}
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-full space-y-2 sm:w-36">
                    <Label htmlFor="invite-role">{t("company.roleLabel")}</Label>
                    <Select
                      value={inviteRole}
                      onValueChange={(v) => setInviteRole(v as "admin" | "member")}
                    >
                      <SelectTrigger id="invite-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">{t("company.role.member")}</SelectItem>
                        <SelectItem value="admin">{t("company.role.admin")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    disabled={isInviting}
                    className="shrink-0 w-full sm:w-auto"
                  >
                    {isInviting ? t("common.loading") : t("company.inviteMember")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t("company.members")}</CardTitle>
              <CardDescription>{t("company.membersDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
              ) : (
                <ul className="space-y-3">
                  {members.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-4 rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={m.profiles?.avatar_url ?? undefined} alt="" />
                          <AvatarFallback className="text-sm">
                            {getInitials(m.profiles?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {m.profiles?.full_name ?? t("common.unknown")}
                          </p>
                          <p className="text-xs text-muted-foreground uppercase">
                            {t(`company.role.${m.role}`)}
                          </p>
                        </div>
                      </div>
                      {activeCompany?.role === "owner" && m.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={isRemoving}
                          onClick={() => setMemberToRemove(m)}
                        >
                          {t("company.removeMember")}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      <CreateCompanyDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) refetch();
        }}
      />

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("company.removeMemberConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove?.profiles?.full_name
                ? t("company.removeMemberDescription", {
                    name: memberToRemove.profiles.full_name,
                  })
                : t("company.removeMemberDescriptionGeneric")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("company.removeMember")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
