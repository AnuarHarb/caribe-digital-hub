import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Buildings,
  Briefcase,
  Newspaper,
  Eye,
  IdentificationCard,
} from "@phosphor-icons/react";
import { membershipStatus } from "@/lib/membershipAdmin";

interface Stats {
  totalUsers: number;
  publicProfiles: number;
  privateProfiles: number;
  companies: number;
  communities: number;
  activeJobs: number;
  totalJobs: number;
  publishedPosts: number;
  draftPosts: number;
  totalMemberships: number;
  activeMemberships: number;
}

export default function AdminDashboard() {
  const { t } = useTranslation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async (): Promise<Stats> => {
      const [profiles, professionals, orgs, jobs, posts, memberships] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("professional_profiles").select("id, is_public"),
        supabase.from("company_profiles").select("id, profile_type"),
        supabase.from("job_postings").select("id, status"),
        supabase.from("blog_posts").select("id, status"),
        supabase.from("memberships").select("ends_at, canceled_at"),
      ]);

      const profData = professionals.data ?? [];
      const orgData = orgs.data ?? [];
      const jobData = jobs.data ?? [];
      const postData = posts.data ?? [];
      const memberData = memberships.data ?? [];
      const now = Date.now();

      return {
        totalUsers: profiles.count ?? 0,
        publicProfiles: profData.filter((p) => p.is_public).length,
        privateProfiles: profData.filter((p) => !p.is_public).length,
        companies: orgData.filter((o) => o.profile_type === "company").length,
        communities: orgData.filter((o) => o.profile_type === "community").length,
        activeJobs: jobData.filter((j) => j.status === "active").length,
        totalJobs: jobData.length,
        publishedPosts: postData.filter((p) => p.status === "published").length,
        draftPosts: postData.filter((p) => p.status === "draft").length,
        totalMemberships: memberData.length,
        activeMemberships: memberData.filter(
          (m) => membershipStatus(m.ends_at, m.canceled_at, now) === "active"
        ).length,
      };
    },
    staleTime: 60_000,
  });

  const cards = stats
    ? [
        {
          title: t("admin.dashboard.totalUsers"),
          value: stats.totalUsers,
          icon: Users,
          sub: null,
        },
        {
          title: t("admin.dashboard.profiles"),
          value: stats.publicProfiles + stats.privateProfiles,
          icon: Eye,
          sub: `${stats.publicProfiles} ${t("admin.dashboard.public")} / ${stats.privateProfiles} ${t("admin.dashboard.private")}`,
        },
        {
          title: t("admin.dashboard.organizations"),
          value: stats.companies + stats.communities,
          icon: Buildings,
          sub: `${stats.companies} ${t("admin.dashboard.companies")} / ${stats.communities} ${t("admin.dashboard.communities")}`,
        },
        {
          title: t("admin.dashboard.jobOffers"),
          value: stats.totalJobs,
          icon: Briefcase,
          sub: `${stats.activeJobs} ${t("admin.dashboard.active")}`,
        },
        {
          title: t("admin.dashboard.news"),
          value: stats.publishedPosts + stats.draftPosts,
          icon: Newspaper,
          sub: `${stats.publishedPosts} ${t("admin.dashboard.published")} / ${stats.draftPosts} ${t("admin.dashboard.drafts")}`,
        },
        {
          title: t("admin.dashboard.memberships"),
          value: stats.totalMemberships,
          icon: IdentificationCard,
          sub: `${stats.activeMemberships} ${t("admin.dashboard.membershipsActive")}`,
          to: "/admin/membresias",
        },
      ]
    : [];

  return (
    <article className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-primary">
          {t("admin.dashboard.title")}
        </h1>
        <p className="text-muted-foreground">{t("admin.dashboard.subtitle")}</p>
      </header>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="mt-3 h-8 w-16 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const inner = (
              <>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <card.icon className="text-muted-foreground/60" size={20} weight="regular" aria-hidden />
                </CardHeader>
                <CardContent>
                  <p className="font-display text-3xl font-bold">{card.value}</p>
                  {card.sub && (
                    <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
                  )}
                </CardContent>
              </>
            );
            return "to" in card && card.to ? (
              <Card key={card.title}>
                <Link to={card.to} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {inner}
                </Link>
              </Card>
            ) : (
              <Card key={card.title}>{inner}</Card>
            );
          })}
        </div>
      )}
    </article>
  );
}
