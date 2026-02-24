import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useSkills } from "@/hooks/useProfile";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type SkillLevel = Database["public"]["Enums"]["skill_level"];

const skillSchema = z.object({
  skill_name: z.string().min(1, "Requerido"),
  skill_level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
});

type SkillFormValues = z.infer<typeof skillSchema>;

interface SkillsManagerProps {
  professionalId: string | undefined;
  skills: Array<{ id: string; skill_name: string; skill_level: SkillLevel }> | null | undefined;
}

const SKILL_LEVELS: SkillLevel[] = ["beginner", "intermediate", "advanced", "expert"];

export function SkillsManager({ professionalId, skills }: SkillsManagerProps) {
  const { t } = useTranslation();
  const { addSkill, deleteSkill, isAdding, isDeleting } = useSkills(professionalId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      skill_name: "",
      skill_level: "intermediate",
    },
  });

  const onSubmit = async (data: SkillFormValues) => {
    if (!professionalId) return;
    setIsSubmitting(true);
    try {
      await addSkill({ skill_name: data.skill_name, skill_level: data.skill_level });
      toast.success(t("skills.added"));
      form.reset({ skill_name: "", skill_level: "intermediate" });
    } catch {
      toast.error(t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSkill(id);
      toast.success(t("skills.removed"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const skillList = skills ?? [];

  return (
    <section className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <Form {...form}>
          <div className="flex flex-1 flex-col gap-4 sm:flex-row">
            <FormField
              control={form.control}
              name="skill_name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t("skills.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("skills.namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="skill_level"
              render={({ field }) => (
                <FormItem className="w-full sm:w-40">
                  <FormLabel>{t("skills.level")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("skills.selectLevel")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SKILL_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {t(`skills.levels.${level}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
        <Button type="submit" disabled={isAdding || isSubmitting} className="gap-2 sm:shrink-0">
          <Plus className="h-4 w-4" aria-hidden />
          {t("skills.add")}
        </Button>
      </form>

      {skillList.length > 0 ? (
        <ul className="flex flex-wrap gap-2" role="list">
          {skillList.map((skill) => (
            <li key={skill.id}>
              <Badge variant="secondary" className="gap-1.5 py-1.5 pl-3 pr-1">
                <span>{skill.skill_name}</span>
                <span className="text-muted-foreground text-xs">({t(`skills.levels.${skill.skill_level}`)})</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 shrink-0 rounded-full hover:bg-destructive/20 hover:text-destructive"
                  onClick={() => handleDelete(skill.id)}
                  disabled={isDeleting}
                  aria-label={t("skills.remove")}
                >
                  <Trash2 className="h-3 w-3" aria-hidden />
                </Button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">{t("skills.empty")}</p>
      )}
    </section>
  );
}
