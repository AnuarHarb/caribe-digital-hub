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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEducation } from "@/hooks/useProfile";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";

const educationSchema = z.object({
  institution: z.string().min(1, "Requerido"),
  degree: z.string().optional(),
  field_of_study: z.string().optional(),
  start_date: z.string().min(1, "Requerido"),
  end_date: z.string().optional(),
});

type EducationFormValues = z.infer<typeof educationSchema>;

interface EducationEntry {
  id: string;
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string;
  end_date: string | null;
}

interface EducationManagerProps {
  professionalId: string | undefined;
  educations: EducationEntry[] | null | undefined;
}

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "MMM yyyy");
  } catch {
    return dateStr;
  }
}

export function EducationManager({ professionalId, educations }: EducationManagerProps) {
  const { t } = useTranslation();
  const { addEducation, updateEducation, deleteEducation, isAdding, isUpdating, isDeleting } =
    useEducation(professionalId);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
    },
  });

  const educationList = educations ?? [];

  const resetForm = () => {
    form.reset({
      institution: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
    });
    setEditingId(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    setOpen(next);
  };

  const onSubmit = async (data: EducationFormValues) => {
    if (!professionalId) return;
    try {
      if (editingId) {
        await updateEducation({
          id: editingId,
          institution: data.institution,
          degree: data.degree || null,
          field_of_study: data.field_of_study || null,
          start_date: data.start_date,
          end_date: data.end_date || null,
        });
        toast.success(t("education.updated"));
      } else {
        await addEducation({
          institution: data.institution,
          degree: data.degree || null,
          field_of_study: data.field_of_study || null,
          start_date: data.start_date,
          end_date: data.end_date || null,
        });
        toast.success(t("education.added"));
      }
      handleOpenChange(false);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleEdit = (entry: EducationEntry) => {
    setEditingId(entry.id);
    form.reset({
      institution: entry.institution,
      degree: entry.degree ?? "",
      field_of_study: entry.field_of_study ?? "",
      start_date: entry.start_date,
      end_date: entry.end_date ?? "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEducation(id);
      toast.success(t("education.removed"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <section className="space-y-6">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            {t("education.add")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? t("education.edit") : t("education.add")}</DialogTitle>
            <DialogDescription>{t("education.addDescription")}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("education.institution")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("education.institutionPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("education.degree")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("education.degreePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="field_of_study"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("education.fieldOfStudy")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("education.fieldOfStudyPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("education.startDate")}</FormLabel>
                      <FormControl>
                        <Input type="month" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("education.endDate")}</FormLabel>
                      <FormControl>
                        <Input type="month" placeholder={t("experience.current")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isAdding || isUpdating}>
                  {editingId ? t("common.save") : t("education.add")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {educationList.length > 0 ? (
        <ol className="space-y-4" role="list">
          {educationList.map((entry) => (
            <li
              key={entry.id}
              className="relative rounded-lg border border-border p-4 pl-6 before:absolute before:left-2 before:top-6 before:h-2 before:w-2 before:rounded-full before:bg-accent"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold">{entry.institution}</h4>
                  {(entry.degree || entry.field_of_study) && (
                    <p className="text-muted-foreground text-sm">
                      {[entry.degree, entry.field_of_study].filter(Boolean).join(" • ")}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    {formatDate(entry.start_date)} – {entry.end_date ? formatDate(entry.end_date) : t("experience.current")}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(entry)}
                    disabled={isUpdating}
                    aria-label={t("common.edit")}
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
                    disabled={isDeleting}
                    aria-label={t("common.delete")}
                    className="hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-muted-foreground text-sm">{t("education.empty")}</p>
      )}
    </section>
  );
}
