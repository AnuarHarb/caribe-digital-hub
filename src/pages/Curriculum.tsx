import { useEffect, useRef, useState } from "react";
import { ProfileForm } from "@/components/talent/ProfileForm";
import { SkillsManager } from "@/components/talent/SkillsManager";
import { ExperienceManager } from "@/components/talent/ExperienceManager";
import { EducationManager } from "@/components/talent/EducationManager";
import { AIAssistant } from "@/components/talent/AIAssistant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useAuth";
import { useProfessionalProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import { downloadHarvardCVPDF } from "@/lib/generateHarvardCVPDF";
import {
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Globe,
  GraduationCap,
  Lock,
  Sparkles,
  User,
  Wrench,
} from "lucide-react";

export default function Curriculum() {
  const { t } = useTranslation();
  const { accountType, profile, user } = useProfile();
  const { professionalProfile, upsertProfessionalProfile, isLoading, isUpserting } = useProfessionalProfile();

  useEffect(() => {
    if (accountType === "professional" && !professionalProfile && !isLoading) {
      upsertProfessionalProfile({
        availability: "open_to_offers",
      }).catch(() => {});
    }
  }, [accountType, professionalProfile, isLoading, upsertProfessionalProfile]);

  if (accountType === "company") {
    return (
      <article>
        <Card>
          <CardHeader>
            <CardTitle>{t("curriculum.title")}</CardTitle>
            <CardDescription>{t("curriculum.companyNotApplicable")}</CardDescription>
          </CardHeader>
        </Card>
      </article>
    );
  }

  const professionalId = professionalProfile?.id;
  const curriculumData = {
    profile,
    professionalProfile,
    skills: professionalProfile?.professional_skills ?? [],
    experience: professionalProfile?.professional_experience ?? [],
    education: professionalProfile?.professional_education ?? [],
  };

  const handleDownloadPDF = (lang: "es" | "en") => {
    downloadHarvardCVPDF(curriculumData, user?.email ?? undefined, lang);
  };

  const handleToggleVisibility = async (isPublic: boolean) => {
    try {
      await upsertProfessionalProfile({ is_public: isPublic });
      toast.success(t("common.success"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const assistantPanelRef = useRef<ImperativePanelHandle>(null);
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);

  const curriculumCard = (
    <Card>
      <CardHeader>
        <CardTitle>{t("curriculum.sectionsTitle")}</CardTitle>
        <CardDescription>{t("curriculum.sectionsDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="professional" className="w-full">
          <TabsList className="mb-4 flex h-auto flex-wrap gap-1 bg-transparent p-0">
            <TabsTrigger value="professional" className="gap-2">
              <User className="h-4 w-4" aria-hidden />
              {t("curriculum.tabProfessional")}
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-2">
              <Wrench className="h-4 w-4" aria-hidden />
              {t("curriculum.tabSkills")}
            </TabsTrigger>
            <TabsTrigger value="experience" className="gap-2">
              <Briefcase className="h-4 w-4" aria-hidden />
              {t("curriculum.tabExperience")}
            </TabsTrigger>
            <TabsTrigger value="education" className="gap-2">
              <GraduationCap className="h-4 w-4" aria-hidden />
              {t("curriculum.tabEducation")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="professional" className="mt-6">
            <ProfileForm />
          </TabsContent>
          <TabsContent value="skills" className="mt-6">
            <SkillsManager
              professionalId={professionalId}
              skills={professionalProfile?.professional_skills}
            />
          </TabsContent>
          <TabsContent value="experience" className="mt-6">
            <ExperienceManager
              professionalId={professionalId}
              experiences={professionalProfile?.professional_experience}
            />
          </TabsContent>
          <TabsContent value="education" className="mt-6">
            <EducationManager
              professionalId={professionalId}
              educations={professionalProfile?.professional_education}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  const assistantCard = (
    <Card className="flex h-full min-h-[500px] flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" aria-hidden />
            {t("aiAssistant.title")}
          </CardTitle>
          <CardDescription>{t("aiAssistant.description")}</CardDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 hidden lg:flex"
          onClick={() => (assistantCollapsed ? assistantPanelRef.current?.expand() : assistantPanelRef.current?.collapse())}
          aria-label={t("aiAssistant.togglePanel")}
        >
          {assistantCollapsed ? (
            <ChevronLeft className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col min-h-0 min-w-0 overflow-hidden">
        <AIAssistant curriculum={curriculumData} />
      </CardContent>
    </Card>
  );

  const isPublic = professionalProfile?.is_public ?? true;

  return (
    <article className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{t("curriculum.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("curriculum.description")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label={t("profile.isPublic")}
            className="inline-flex rounded-full border bg-muted/50 p-0.5"
          >
            <button
              type="button"
              onClick={() => handleToggleVisibility(true)}
              disabled={isUpserting}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                isPublic
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={isPublic}
            >
              <Globe className="h-3.5 w-3.5" aria-hidden />
              {t("profile.profilePublic")}
            </button>
            <button
              type="button"
              onClick={() => handleToggleVisibility(false)}
              disabled={isUpserting}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                !isPublic
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={!isPublic}
            >
              <Lock className="h-3.5 w-3.5" aria-hidden />
              {t("profile.profilePrivate")}
            </button>
          </div>
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 shrink-0">
              <Download className="h-4 w-4" aria-hidden />
              {t("curriculum.downloadPDF")}
              <ChevronDown className="h-4 w-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleDownloadPDF("es")}>
              {t("curriculum.downloadSpanish")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownloadPDF("en")}>
              {t("curriculum.downloadEnglish")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </header>

      {/* Mobile: stacked layout */}
      <div className="grid grid-cols-1 gap-6 lg:hidden">
        {curriculumCard}
        <aside>{assistantCard}</aside>
      </div>

      {/* Desktop: resizable panels, assistant expanded by default */}
      <ResizablePanelGroup
        direction="horizontal"
        className="hidden lg:flex min-h-[calc(100vh-8rem)]"
      >
        <ResizablePanel defaultSize={62} minSize={30}>
          <div className="pr-3 h-full overflow-auto">{curriculumCard}</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          ref={assistantPanelRef}
          defaultSize={38}
          collapsible
          collapsedSize={40}
          minSize={15}
          maxSize={70}
          onCollapse={() => setAssistantCollapsed(true)}
          onExpand={() => setAssistantCollapsed(false)}
        >
          <aside className="h-full overflow-hidden pl-3 flex flex-col relative">
            {assistantCard}
            {assistantCollapsed && (
              <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => assistantPanelRef.current?.expand()}
                  aria-label={t("aiAssistant.togglePanel")}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            )}
          </aside>
        </ResizablePanel>
      </ResizablePanelGroup>
    </article>
  );
}
