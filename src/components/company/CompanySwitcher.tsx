import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Check, ChevronDown, Plus, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import { CreateCompanyDialog } from "./CreateCompanyDialog";

export function CompanySwitcher() {
  const { t } = useTranslation();
  const { activeCompany, companies, setActiveCompany, isLoading } = useActiveCompany();
  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading || companies.length === 0) return null;

  const ActiveIcon = activeCompany?.profile_type === "community" ? Users : Building2;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between gap-1 px-2 py-1.5 h-auto font-normal text-xs"
          >
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <ActiveIcon className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
              <span className="truncate text-left text-sidebar-foreground/70 dark:text-foreground/85">
                {t(`company.type.${activeCompany?.profile_type ?? "company"}`)}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 shrink-0 opacity-40" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {companies.map((c) => {
            const Icon = c.profile_type === "community" ? Users : Building2;
            const isActive = activeCompany?.id === c.id;
            return (
              <DropdownMenuItem
                key={c.id}
                onClick={() => setActiveCompany(c)}
                className="flex items-start gap-2.5 py-2"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.company_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`company.type.${c.profile_type}`)} · {t(`company.role.${c.role}`)}
                  </p>
                </div>
                {isActive && (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                )}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            {t("company.createNew")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateCompanyDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
