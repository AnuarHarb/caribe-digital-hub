import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useExperience } from "@/hooks/useProfile";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";

const experienceSchema = z.object({
  company_name: z.string().min(1, "Requerido"),
  position: z.string().min(1, "Requerido"),
  description: z.string().optional(),
  start_date: z.string().min(1, "Requerido"),
  end_date: z.string().optional(),
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

interface ExperienceEntry {
  id: string;
  company_name: string;
  position: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
}

interface ExperienceManagerProps {
  professionalId: string | undefined;
  experiences: ExperienceEntry[] | null | undefined;
}

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "MMM yyyy");
  } catch {
    return dateStr;
  }
}

export function ExperienceManager({ professionalId, experiences }: ExperienceManagerProps) {
  const { t } = useTranslation();
  const { addExperience, updateExperience, deleteExperience, isAdding, isUpdating, isDeleting } =
    useExperience(professionalId);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company_name: "",
      position: "",
      description: "",
      start_date: "",
      end_date: "",
    },
  });

  const experienceList = experiences ?? [];

  const resetForm = () => {
    form.reset({
      company_name: "",
      position: "",
      description: "",
      start_date: "",
      end_date: "",
    });
    setEditingId(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    setOpen(next);
  };

  const onSubmit = async (data: ExperienceFormValues) => {
    if (!professionalId) return;
    try {
      if (editingId) {
        await updateExperience({
          id: editingId,
          company_name: data.company_name,
          position: data.position,
          description: data.description || null,
          start_date: data.start_date,
          end_date: data.end_date || null,
        });
        toast.success(t("experience.updated"));
      } else {
        await addExperience({
          company_name: data.company_name,
          position: data.position,
          description: data.description || null,
          start_date: data.start_date,
          end_date: data.end_date || null,
        });
        toast.success(t("experience.added"));
      }
      handleOpenChange(false);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleEdit = (entry: ExperienceEntry) => {
    setEditingId(entry.id);
    form.reset({
      company_name: entry.company_name,
      position: entry.position,
      description: entry.description ?? "",
      start_date: entry.start_date,
      end_date: entry.end_date ?? "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExperience(id);
      toast.success(t("experience.removed"));
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
            {t("experience.add")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? t("experience.edit") : t("experience.add")}</DialogTitle>
            <DialogDescription>{t("experience.addDescription")}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("experience.company")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("experience.companyPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("experience.position")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("experience.positionPlaceholder")} {...field} />
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
                    <FormLabel>{t("experience.description")}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder={t("experience.descriptionPlaceholder")} {...field} />
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
                      <FormLabel>{t("experience.startDate")}</FormLabel>
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
                      <FormLabel>{t("experience.endDate")}</FormLabel>
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
                  {editingId ? t("common.save") : t("experience.add")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {experienceList.length > 0 ? (
        <ol className="space-y-4" role="list">
          {experienceList.map((entry) => (
            <li
              key={entry.id}
              className="relative rounded-lg border border-border p-4 pl-6 before:absolute before:left-2 before:top-6 before:h-2 before:w-2 before:rounded-full before:bg-accent"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold">{entry.position}</h4>
                  <p className="text-muted-foreground text-sm">{entry.company_name}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(entry.start_date)} – {entry.end_date ? formatDate(entry.end_date) : t("experience.current")}
                  </p>
                  {entry.description && (
                    <p className="mt-2 text-sm">{entry.description}</p>
                  )}
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
        <p className="text-muted-foreground text-sm">{t("experience.empty")}</p>
      )}
    </section>
  );
}
