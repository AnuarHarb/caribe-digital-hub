import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

type JobStatus = "all" | "active" | "draft" | "closed";

const STATUS_CLASSES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  draft: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  closed: "bg-muted text-muted-foreground",
};

export default function AdminJobs() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<JobStatus>("all");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_postings")
        .select("id, title, status, work_mode, location, created_at, company_profiles(company_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  const counts = {
    all: jobs.length,
    active: jobs.filter((j) => j.status === "active").length,
    draft: jobs.filter((j) => j.status === "draft").length,
    closed: jobs.filter((j) => j.status === "closed").length,
  };

  return (
    <article className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-primary">
          {t("admin.jobs.title")}
        </h1>
        <p className="text-muted-foreground">{t("admin.jobs.subtitle")}</p>
      </header>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as JobStatus)}>
        <TabsList>
          <TabsTrigger value="all">
            {t("admin.jobs.all")} ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="active">
            {t("admin.jobs.active")} ({counts.active})
          </TabsTrigger>
          <TabsTrigger value="draft">
            {t("admin.jobs.draft")} ({counts.draft})
          </TabsTrigger>
          <TabsTrigger value="closed">
            {t("admin.jobs.closed")} ({counts.closed})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.jobs.jobTitle")}</TableHead>
                  <TableHead>{t("admin.jobs.company")}</TableHead>
                  <TableHead>{t("admin.jobs.status")}</TableHead>
                  <TableHead>{t("admin.jobs.workMode")}</TableHead>
                  <TableHead>{t("admin.jobs.location")}</TableHead>
                  <TableHead>{t("admin.jobs.createdAt")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((job) => {
                  const company = job.company_profiles as { company_name?: string } | null;
                  return (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell className="text-sm">
                        {company?.company_name ?? "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${STATUS_CLASSES[job.status] ?? ""}`}
                        >
                          {t(`admin.jobs.status_${job.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {job.work_mode
                          ? t(`common.workMode.${job.work_mode}`)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm">{job.location ?? "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {job.created_at
                          ? format(new Date(job.created_at), "dd/MM/yyyy")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      {t("admin.jobs.empty")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </article>
  );
}
