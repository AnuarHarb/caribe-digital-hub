import { useState } from "react";
import { Link } from "react-router-dom";
import { useCompanyJobs } from "@/hooks/useJobs";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Briefcase, Plus, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function ManageJobs() {
  const { t } = useTranslation();
  const { activeCompany } = useActiveCompany();
  const { jobs, isLoading, deleteJob, isDeleting } = useCompanyJobs();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const canManage = activeCompany?.role === "owner" || activeCompany?.role === "admin";

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteJob(deleteTarget.id);
      toast.success(t("common.success"));
      setDeleteTarget(null);
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <article className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-primary">
          {t("dashboard.jobs")}
        </h1>
        <Link to="/dashboard/empleos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            {t("dashboard.newJob")}
          </Button>
        </Link>
      </header>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {job.status === "draft" ? t("jobs.statusDraft") : job.status === "active" ? t("jobs.statusActive") : t("jobs.statusClosed")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/dashboard/candidatos?job=${job.id}`}>
                    <Button variant="outline" size="sm">
                      {t("dashboard.candidates")}
                    </Button>
                  </Link>
                  {canManage && (
                    <Link to={`/dashboard/empleos/${job.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        {t("common.edit")}
                      </Button>
                    </Link>
                  )}
                  <Link to={`/empleos/${job.slug}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm">
                      {t("landing.featuredJobs.viewJob")}
                    </Button>
                  </Link>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget({ id: job.id, title: job.title })}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      {t("common.delete")}
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
          {jobs.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden />
                <p className="mt-4 text-muted-foreground">{t("landing.featuredJobs.empty")}</p>
                <Link to="/dashboard/empleos/nuevo">
                  <Button className="mt-4">{t("dashboard.newJob")}</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("jobs.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? (
                <>
                  <span className="font-medium text-foreground">&quot;{deleteTarget.title}&quot;</span>
                  {" — "}
                  {t("jobs.deleteConfirmDescription")}
                </>
              ) : (
                t("jobs.deleteConfirmDescription")
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("common.cancel")}</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {isDeleting ? t("common.loading") : t("common.delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
