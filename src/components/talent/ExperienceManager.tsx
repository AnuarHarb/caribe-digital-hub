import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
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
  display_order: number;
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

function SortableExperienceItem({
  entry,
  onEdit,
  onDelete,
  isUpdating,
  isDeleting,
}: {
  entry: ExperienceEntry;
  onEdit: (entry: ExperienceEntry) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`relative rounded-lg border border-border p-4 pl-10 ${
        isDragging ? "z-10 shadow-lg ring-2 ring-accent/50 opacity-90" : ""
      }`}
    >
      <button
        type="button"
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab touch-none rounded p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label={t("experience.reorderHandle")}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" aria-hidden />
      </button>

      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold">{entry.position}</h4>
          <p className="text-muted-foreground text-sm">{entry.company_name}</p>
          <p className="text-muted-foreground text-xs">
            {formatDate(entry.start_date)} –{" "}
            {entry.end_date
              ? formatDate(entry.end_date)
              : t("experience.current")}
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
            onClick={() => onEdit(entry)}
            disabled={isUpdating}
            aria-label={t("common.edit")}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(entry.id)}
            disabled={isDeleting}
            aria-label={t("common.delete")}
            className="hover:bg-destructive/20 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </li>
  );
}

export function ExperienceManager({
  professionalId,
  experiences,
}: ExperienceManagerProps) {
  const { t } = useTranslation();
  const {
    addExperience,
    updateExperience,
    deleteExperience,
    reorderExperience,
    isAdding,
    isUpdating,
    isDeleting,
  } = useExperience(professionalId);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localOrder, setLocalOrder] = useState<ExperienceEntry[] | null>(null);

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

  const experienceList = localOrder ?? experiences ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      setLocalOrder(null);
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
      setLocalOrder(null);
      toast.success(t("experience.removed"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const items = [...experienceList];
    const oldIndex = items.findIndex((e) => e.id === active.id);
    const newIndex = items.findIndex((e) => e.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    setLocalOrder(reordered);

    try {
      await reorderExperience(reordered.map((e) => e.id));
      setLocalOrder(null);
    } catch {
      setLocalOrder(null);
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
            <DialogTitle>
              {editingId ? t("experience.edit") : t("experience.add")}
            </DialogTitle>
            <DialogDescription>
              {t("experience.addDescription")}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("experience.company")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("experience.companyPlaceholder")}
                        {...field}
                      />
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
                      <Input
                        placeholder={t("experience.positionPlaceholder")}
                        {...field}
                      />
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
                      <Textarea
                        rows={3}
                        placeholder={t("experience.descriptionPlaceholder")}
                        {...field}
                      />
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
                        <Input
                          type="month"
                          placeholder={t("experience.current")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={experienceList.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <ol className="space-y-4" role="list">
              {experienceList.map((entry) => (
                <SortableExperienceItem
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isUpdating={isUpdating}
                  isDeleting={isDeleting}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="text-muted-foreground text-sm">
          {t("experience.empty")}
        </p>
      )}
    </section>
  );
}
