import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";
import { useProfessionalProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AvailabilityStatus = Database["public"]["Enums"]["availability_status"];
type SkillLevel = Database["public"]["Enums"]["skill_level"];

const profileSchema = z.object({
  title: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  years_experience: z.coerce.number().min(0).optional(),
  availability: z.enum(["available", "open_to_offers", "not_looking"]).optional(),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  github_url: z.string().url().optional().or(z.literal("")),
  portfolio_url: z.string().url().optional().or(z.literal("")),
  is_public: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  onSuccess?: () => void;
}

export function ProfileForm({ onSuccess }: ProfileFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { professionalProfile, upsertProfessionalProfile, isUpserting } = useProfessionalProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      title: professionalProfile?.title ?? "",
      bio: professionalProfile?.bio ?? "",
      location: professionalProfile?.location ?? "",
      years_experience: professionalProfile?.years_experience ?? undefined,
      availability: professionalProfile?.availability ?? "open_to_offers",
      linkedin_url: professionalProfile?.linkedin_url ?? "",
      github_url: professionalProfile?.github_url ?? "",
      portfolio_url: professionalProfile?.portfolio_url ?? "",
      is_public: professionalProfile?.is_public ?? true,
    },
    values: professionalProfile
      ? {
          title: professionalProfile.title ?? "",
          bio: professionalProfile.bio ?? "",
          location: professionalProfile.location ?? "",
          years_experience: professionalProfile.years_experience ?? undefined,
          availability: professionalProfile.availability,
          linkedin_url: professionalProfile.linkedin_url ?? "",
          github_url: professionalProfile.github_url ?? "",
          portfolio_url: professionalProfile.portfolio_url ?? "",
          is_public: professionalProfile.is_public ?? true,
        }
      : undefined,
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user?.id) return;
    try {
      await upsertProfessionalProfile({
        title: data.title || null,
        bio: data.bio || null,
        location: data.location || null,
        years_experience: data.years_experience ?? null,
        availability: (data.availability as AvailabilityStatus) ?? "open_to_offers",
        linkedin_url: data.linkedin_url || null,
        github_url: data.github_url || null,
        portfolio_url: data.portfolio_url || null,
        is_public: data.is_public ?? true,
      });
      toast.success(t("common.success"));
      onSuccess?.();
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.title")}</FormLabel>
              <FormControl>
                <Input placeholder={t("profile.titlePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.bio")}</FormLabel>
              <FormControl>
                <Textarea placeholder={t("profile.bioPlaceholder")} rows={4} {...field} />
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
          name="years_experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.yearsExperience")}</FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.availability")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("profile.selectAvailability")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="available">{t("common.availability.available")}</SelectItem>
                  <SelectItem value="open_to_offers">{t("common.availability.open_to_offers")}</SelectItem>
                  <SelectItem value="not_looking">{t("common.availability.not_looking")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="linkedin_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://linkedin.com/in/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="github_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://github.com/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="portfolio_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.portfolio")}</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>{t("profile.isPublic")}</FormLabel>
                <p className="text-sm text-muted-foreground">
                  {t("profile.isPublicDescription")}
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
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
