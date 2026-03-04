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
import { Building2, Users, ExternalLink } from "lucide-react";
import { format } from "date-fns";

type ProfileType = "company" | "community";

export default function AdminOrganizations() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<"all" | ProfileType>("all");

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_profiles")
        .select("id, company_name, profile_type, industry, location, website, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = filter === "all" ? orgs : orgs.filter((o) => o.profile_type === filter);

  return (
    <article className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-primary">
          {t("admin.organizations.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("admin.organizations.subtitle")}
        </p>
      </header>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">
            {t("admin.organizations.all")} ({orgs.length})
          </TabsTrigger>
          <TabsTrigger value="company">
            {t("admin.organizations.companies")} ({orgs.filter((o) => o.profile_type === "company").length})
          </TabsTrigger>
          <TabsTrigger value="community">
            {t("admin.organizations.communities")} ({orgs.filter((o) => o.profile_type === "community").length})
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
                  <TableHead>{t("admin.organizations.name")}</TableHead>
                  <TableHead>{t("admin.organizations.type")}</TableHead>
                  <TableHead>{t("admin.organizations.industry")}</TableHead>
                  <TableHead>{t("admin.organizations.location")}</TableHead>
                  <TableHead>{t("admin.organizations.website")}</TableHead>
                  <TableHead>{t("admin.organizations.createdAt")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.company_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1 text-xs">
                        {org.profile_type === "community" ? (
                          <Users className="h-3 w-3" aria-hidden />
                        ) : (
                          <Building2 className="h-3 w-3" aria-hidden />
                        )}
                        {org.profile_type === "community"
                          ? t("company.type.community")
                          : t("company.type.company")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{org.industry ?? "-"}</TableCell>
                    <TableCell className="text-sm">{org.location ?? "-"}</TableCell>
                    <TableCell>
                      {org.website ? (
                        <a
                          href={org.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" aria-hidden />
                          {t("admin.organizations.visit")}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {org.created_at
                        ? format(new Date(org.created_at), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      {t("admin.organizations.empty")}
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
