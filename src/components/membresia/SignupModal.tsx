import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/tracking";

type PlanType = "community" | "builder" | "company" | "enterprise";

interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedPlan?: PlanType;
}

type SignupFormValues = {
  name: string;
  email: string;
  memberType: "community" | "builder" | "company";
  companyName?: string;
};

async function submitLead(data: SignupFormValues) {
  // TODO: Connect to backend API endpoint
  // Example: await supabase.functions.invoke('submit-membership-lead', { body: data });
  
  // Fallback to localStorage
  try {
    const existingLeads = localStorage.getItem("membership-leads");
    const leads = existingLeads ? JSON.parse(existingLeads) : [];
    leads.push({
      ...data,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("membership-leads", JSON.stringify(leads));
  } catch (error) {
    console.error("Error saving lead to localStorage:", error);
  }
}

export function SignupModal({ open, onOpenChange, preselectedPlan }: SignupModalProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signupSchema = z.object({
    name: z.string().min(2, t("membresia.signup.validation.nameMin")),
    email: z.string().email(t("membresia.signup.validation.emailInvalid")),
    memberType: z.enum(["community", "builder", "company"], {
      required_error: t("membresia.signup.validation.memberTypeRequired"),
    }),
    companyName: z.string().optional(),
  });

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      memberType: preselectedPlan && preselectedPlan !== "enterprise" ? preselectedPlan : undefined,
      companyName: "",
    },
  });

  const selectedMemberType = form.watch("memberType");
  const showCompanyName = selectedMemberType === "company";

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      await submitLead(data);
      track("membership_signup", { plan: data.memberType });
      toast.success(t("membresia.signup.success"));
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(t("membresia.signup.error"));
      console.error("Error submitting lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("membresia.signup.title")}</DialogTitle>
          <DialogDescription>
            {t("membresia.signup.description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("membresia.signup.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("membresia.signup.namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("membresia.signup.email")}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t("membresia.signup.emailPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="memberType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("membresia.signup.memberType")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("membresia.signup.selectPlan")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="community">{t("membresia.plans.community.name")} - {t("membresia.plans.community.price")}{t("membresia.plans.community.period")}</SelectItem>
                      <SelectItem value="builder">{t("membresia.plans.builder.name")} - {t("membresia.plans.builder.price")}{t("membresia.plans.builder.period")}</SelectItem>
                      <SelectItem value="company">{t("membresia.plans.company.name")} - {t("membresia.plans.company.subtitle")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showCompanyName && (
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("membresia.signup.companyName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("membresia.signup.companyPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("membresia.signup.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("membresia.signup.submitting") : t("membresia.signup.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
