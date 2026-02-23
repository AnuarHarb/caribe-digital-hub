import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, ChevronDown, Plus } from "lucide-react";
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between gap-2 px-3 py-2 h-auto font-normal"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate text-left">
                {activeCompany?.company_name ?? t("company.selectCompany")}
              </span>
              <span className="shrink-0 rounded bg-accent/50 px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                {activeCompany?.role ?? "—"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
          {companies.map((c) => (
            <DropdownMenuItem
              key={c.id}
              onClick={() => setActiveCompany(c)}
              className="flex items-center justify-between gap-2"
            >
              <span className="truncate">{c.company_name}</span>
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase">
                {c.role}
              </span>
            </DropdownMenuItem>
          ))}
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
