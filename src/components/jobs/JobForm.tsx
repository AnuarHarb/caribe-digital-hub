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
import type { Database } from "@/integrations/supabase/types";

type WorkMode = Database["public"]["Enums"]["work_mode"];
type EmploymentType = Database["public"]["Enums"]["employment_type"];
type JobStatus = Database["public"]["Enums"]["job_status"];

const jobSchema = z.object({
  title: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().min(10, "Mínimo 10 caracteres"),
  location: z.string().optional(),
  work_mode: z.enum(["remote", "hybrid", "onsite"]).optional(),
  employment_type: z.enum(["full_time", "part_time", "contract", "freelance"]).optional(),
  salary_min: z.coerce.number().min(0).optional(),
  salary_max: z.coerce.number().min(0).optional(),
  salary_currency: z.string().optional(),
  status: z.enum(["draft", "active", "closed"]),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface JobFormProps {
  companyId: string;
  defaultValues?: Partial<JobFormValues>;
  onSubmit: (data: JobFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function JobForm({
  companyId,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: JobFormProps) {
  const { t } = useTranslation();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      work_mode: undefined,
      employment_type: undefined,
      salary_min: undefined,
      salary_max: undefined,
      salary_currency: "USD",
      status: "draft",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("jobs.title")}</FormLabel>
              <FormControl>
                <Input placeholder={t("jobs.titlePlaceholder")} {...field} />
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
              <FormLabel>{t("jobs.description")}</FormLabel>
              <FormControl>
                <Textarea placeholder={t("jobs.descriptionPlaceholder")} rows={6} {...field} />
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
              <FormLabel>{t("jobs.location")}</FormLabel>
              <FormControl>
                <Input placeholder={t("profile.locationPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="work_mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("jobs.workMode")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("talent.all")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="remote">{t("common.workMode.remote")}</SelectItem>
                    <SelectItem value="hybrid">{t("common.workMode.hybrid")}</SelectItem>
                    <SelectItem value="onsite">{t("common.workMode.onsite")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="employment_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("jobs.employmentType")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("talent.all")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="full_time">{t("common.employmentType.full_time")}</SelectItem>
                    <SelectItem value="part_time">{t("common.employmentType.part_time")}</SelectItem>
                    <SelectItem value="contract">{t("common.employmentType.contract")}</SelectItem>
                    <SelectItem value="freelance">{t("common.employmentType.freelance")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="salary_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("jobs.salaryMin")}</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salary_max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("jobs.salaryMax")}</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salary_currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("jobs.currency")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("jobs.status")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">{t("jobs.statusDraft")}</SelectItem>
                  <SelectItem value="active">{t("jobs.statusActive")}</SelectItem>
                  <SelectItem value="closed">{t("jobs.statusClosed")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("common.loading") : t("common.save")}
        </Button>
      </form>
    </Form>
  );
}
