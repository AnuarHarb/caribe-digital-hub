import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyProfile } from "@/hooks/useProfile";
import { CompanyLogoUpload } from "@/components/company/CompanyLogoUpload";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CompanySize = Database["public"]["Enums"]["company_size"];

const companySchema = z.object({
  company_name: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().optional(),
  company_size: z.enum(["startup", "small", "medium", "large", "enterprise"]).optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

type CompanyProfileFormProps = {
  companyId?: string;
};

export function CompanyProfileForm({ companyId }: CompanyProfileFormProps) {
  const { t } = useTranslation();
  const { companyProfile, upsertCompanyProfile, isUpserting } = useCompanyProfile(companyId);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_name: companyProfile?.company_name ?? "",
      description: companyProfile?.description ?? "",
      industry: companyProfile?.industry ?? "",
      website: companyProfile?.website ?? "",
      location: companyProfile?.location ?? "",
      company_size: companyProfile?.company_size ?? undefined,
    },
    values: companyProfile
      ? {
          company_name: companyProfile.company_name,
          description: companyProfile.description ?? "",
          industry: companyProfile.industry ?? "",
          website: companyProfile.website ?? "",
          location: companyProfile.location ?? "",
          company_size: companyProfile.company_size ?? undefined,
        }
      : undefined,
  });

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      await upsertCompanyProfile({
        company_name: data.company_name,
        description: data.description || null,
        industry: data.industry || null,
        website: data.website || null,
        location: data.location || null,
        company_size: (data.company_size as CompanySize) ?? null,
      });
      toast.success(t("common.success"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("company.logo")}</label>
          <CompanyLogoUpload
            companyId={companyId}
            currentUrl={companyProfile?.logo_url}
            companyName={companyProfile?.company_name}
          />
        </div>
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("company.name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("company.namePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.bio")}</FormLabel>
              <FormControl>
                <Textarea placeholder={t("company.descriptionPlaceholder")} rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("company.industry")}</FormLabel>
              <FormControl>
                <Input placeholder={t("company.industryPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("company.website")}</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.location")}</FormLabel>
              <FormControl>
                <Input placeholder={t("profile.locationPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("company.size")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("company.selectSize")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="small">{t("company.small")}</SelectItem>
                  <SelectItem value="medium">{t("company.medium")}</SelectItem>
                  <SelectItem value="large">{t("company.large")}</SelectItem>
                  <SelectItem value="enterprise">{t("company.enterprise")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isUpserting}>
          {isUpserting ? t("common.loading") : t("common.save")}
        </Button>
      </form>
    </Form>
  );
}
