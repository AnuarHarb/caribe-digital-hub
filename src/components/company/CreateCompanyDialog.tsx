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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateCompany } from "@/hooks/useCompanies";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type ProfileType = Database["public"]["Enums"]["profile_type"];

type CreateCompanyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateCompanyDialog({ open, onOpenChange }: CreateCompanyDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [profileType, setProfileType] = useState<ProfileType>("company");
  const { createCompany, isCreating } = useCreateCompany();
  const { setActiveCompany, refetch } = useActiveCompany();

  const isCommunity = profileType === "community";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(
        isCommunity ? t("company.nameRequired") : t("company.nameRequired")
      );
      return;
    }
    try {
      const company = await createCompany({
        companyName: name.trim(),
        profileType,
      });
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
        profile_type: company.profile_type,
        role: "owner",
      });
      onOpenChange(false);
      setName("");
      setProfileType("company");
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
            <DialogTitle>
              {isCommunity
                ? t("company.createNewCommunity")
                : t("company.createNewCompany")}
            </DialogTitle>
            <DialogDescription>
              {isCommunity
                ? t("company.createDescriptionCommunity")
                : t("company.createDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <fieldset className="space-y-2">
              <Label>{t("auth.accountType")}</Label>
              <RadioGroup
                value={profileType}
                onValueChange={(v) => setProfileType(v as ProfileType)}
                className="flex gap-4"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="company" id="create-type-company" />
                  <span>{t("company.type.company")}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="community" id="create-type-community" />
                  <span>{t("company.type.community")}</span>
                </label>
              </RadioGroup>
            </fieldset>
            <div className="space-y-2">
              <Label htmlFor="create-company-name">
                {isCommunity
                  ? t("company.communityName")
                  : t("company.name")}
              </Label>
              <Input
                id="create-company-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  isCommunity
                    ? t("company.communityNamePlaceholder")
                    : t("company.namePlaceholder")
                }
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
