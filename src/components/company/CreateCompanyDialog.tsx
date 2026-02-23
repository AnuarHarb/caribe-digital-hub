import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCompany } from "@/hooks/useCompanies";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import { toast } from "sonner";

type CreateCompanyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateCompanyDialog({ open, onOpenChange }: CreateCompanyDialogProps) {
  const { t } = useTranslation();
  const [newCompanyName, setNewCompanyName] = useState("");
  const { createCompany, isCreating } = useCreateCompany();
  const { setActiveCompany, refetch } = useActiveCompany();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      toast.error(t("company.nameRequired"));
      return;
    }
    try {
      const company = await createCompany(newCompanyName.trim());
      await refetch();
      setActiveCompany({
        id: company.id,
        company_name: company.company_name,
        description: company.description ?? null,
        industry: company.industry ?? null,
        website: company.website ?? null,
        logo_url: company.logo_url ?? null,
        location: company.location ?? null,
        company_size: company.company_size ?? null,
        role: "owner",
      });
      onOpenChange(false);
      setNewCompanyName("");
      toast.success(t("company.created"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("common.error");
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("company.createNew")}</DialogTitle>
            <DialogDescription>{t("company.createDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-company-name">{t("company.name")}</Label>
              <Input
                id="create-company-name"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder={t("company.namePlaceholder")}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? t("common.loading") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
