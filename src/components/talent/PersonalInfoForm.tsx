import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { AvatarUpload } from "@/components/shared/AvatarUpload";
import { DocumentUpload } from "@/components/shared/DocumentUpload";
import { useProfile } from "@/hooks/useAuth";
import { toast } from "sonner";

const personalSchema = z.object({
  full_name: z.string().min(2, "Mínimo 2 caracteres").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  date_of_birth: z.string().optional(),
  document_type: z.string().optional(),
  document_number: z.string().optional(),
});

type PersonalFormValues = z.infer<typeof personalSchema>;

const DOCUMENT_TYPES = ["CC", "CE", "Pasaporte", "PEP"] as const;

export function PersonalInfoForm() {
  const { t } = useTranslation();
  const { user, profile, updateProfile } = useProfile();

  const form = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      address: profile?.address ?? "",
      city: profile?.city ?? "",
      date_of_birth: profile?.date_of_birth ?? "",
      document_type: profile?.document_type ?? "",
      document_number: profile?.document_number ?? "",
    },
    values: profile
      ? {
          full_name: profile.full_name ?? "",
          phone: profile.phone ?? "",
          address: profile.address ?? "",
          city: profile.city ?? "",
          date_of_birth: profile.date_of_birth ?? "",
          document_type: profile.document_type ?? "",
          document_number: profile.document_number ?? "",
        }
      : undefined,
  });

  const onSubmit = async (data: PersonalFormValues) => {
    try {
      await updateProfile({
        full_name: data.full_name || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        date_of_birth: data.date_of_birth || undefined,
        document_type: data.document_type || undefined,
        document_number: data.document_number || undefined,
      });
      toast.success(t("common.success"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleDocumentUpload = async (path: string) => {
    try {
      await updateProfile({ document_url: path });
      toast.success(t("profile.documentUploaded"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert className="border-accent/30 bg-accent/5">
          <Info className="h-4 w-4" />
          <AlertDescription>{t("profile.personalDisclaimer")}</AlertDescription>
        </Alert>

        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <AvatarUpload currentUrl={profile?.avatar_url} size="lg" />
          <div className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("profile.fullName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("profile.fullNamePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {user?.email && (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {t("profile.email")}
                </label>
                <p className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.phone")}</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+57 300 123 4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.city")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("profile.cityPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.address")}</FormLabel>
              <FormControl>
                <Input placeholder={t("profile.addressPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_of_birth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.dateOfBirth")}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 rounded-lg border border-border p-4">
          <h3 className="font-medium">{t("profile.documentSection")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="document_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("profile.documentType")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("profile.selectDocumentType")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="document_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("profile.documentNumber")}</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DocumentUpload
            currentPath={profile?.document_url}
            onUploadComplete={handleDocumentUpload}
          />
        </div>

        <Button type="submit">{t("common.save")}</Button>
      </form>
    </Form>
  );
}
