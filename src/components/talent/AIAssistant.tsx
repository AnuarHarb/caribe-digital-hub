import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

export interface AnalysisSectionItem {
  subtitle?: string;
  description?: string;
  action?: string;
  category?: string;
  content?: string;
}

export interface AnalysisSection {
  title: string;
  items: AnalysisSectionItem[];
}

export interface AnalysisExample {
  label?: string;
  before?: string;
  after?: string;
}

export interface AnalysisResponse {
  greeting?: string;
  sections?: AnalysisSection[];
  example?: AnalysisExample;
  summary?: string;
}

interface CurriculumData {
  profile?: unknown;
  professionalProfile?: unknown;
  skills?: unknown[];
  experience?: unknown[];
  education?: unknown[];
}

interface AIAssistantProps {
  curriculum: CurriculumData;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function StructuredAnalysis({
  data,
  beforeLabel,
  afterLabel,
  actionLabel,
}: {
  data: AnalysisResponse;
  beforeLabel: string;
  afterLabel: string;
  actionLabel: string;
}) {
  return (
    <div className="space-y-4 text-sm min-w-0 break-words">
      {data.greeting && (
        <p className="text-muted-foreground leading-relaxed px-1">{data.greeting}</p>
      )}
      {data.sections?.map((section, si) => (
        <article
          key={si}
          className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-sm"
        >
          <h4 className="font-semibold text-card-foreground text-sm">{section.title}</h4>
          <ul className="space-y-3">
            {section.items?.map((item, ii) => (
              <li key={ii} className="space-y-1">
                {(item.subtitle || item.category) && (
                  <p className="font-medium text-card-foreground/90 text-sm">
                    {item.subtitle ?? item.category}
                  </p>
                )}
                {(item.description || item.content) && (
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {item.description ?? item.content}
                  </p>
                )}
                {item.action && (
                  <p className="text-xs rounded bg-muted/50 px-2 py-1 mt-1">
                    <strong className="text-card-foreground/80">{actionLabel}:</strong>{" "}
                    <span className="text-muted-foreground">{item.action}</span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </article>
      ))}
      {data.example && (data.example.before || data.example.after) && (
        <article className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-sm">
          {data.example.label && (
            <h4 className="font-semibold text-card-foreground text-sm">{data.example.label}</h4>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {data.example.before && (
              <div className="rounded-md p-3 bg-muted/40 border border-border/40">
                <p className="text-xs font-medium text-muted-foreground mb-1">{beforeLabel}</p>
                <p className="text-muted-foreground text-xs line-through">{data.example.before}</p>
              </div>
            )}
            {data.example.after && (
              <div className="rounded-md p-3 bg-muted/40 border border-border/40">
                <p className="text-xs font-medium text-muted-foreground mb-1">{afterLabel}</p>
                <p className="text-card-foreground/90 text-xs">{data.example.after}</p>
              </div>
            )}
          </div>
        </article>
      )}
      {data.summary && (
        <p className="rounded-lg border border-border bg-card px-4 py-3 text-card-foreground/90 leading-relaxed text-sm shadow-sm">
          {data.summary}
        </p>
      )}
    </div>
  );
}

export function AIAssistant({ curriculum }: AIAssistantProps) {
  const { t } = useTranslation();
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeaders = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    };
    if (sessionData?.session?.access_token) {
      headers.Authorization = `Bearer ${sessionData.session.access_token}`;
    }
    return headers;
  };

  const analyzeCurriculum = async (message: string): Promise<AnalysisResponse> => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-curriculum-assistant`, {
      method: "POST",
      headers,
      body: JSON.stringify({ curriculum, message, isAnalyze: true }),
    });
    if (!res.ok) {
      let msg = "Error al comunicarse con el asistente de IA";
      try {
        const body = (await res.json()) as { error?: string };
        if (body?.error) msg = body.error;
      } catch {
        /* ignore */
      }
      toast.error(msg);
      throw new Error(msg);
    }
    const data = (await res.json()) as { json?: string };
    const jsonStr = data?.json;
    if (!jsonStr) throw new Error(t("aiAssistant.noResponse"));
    try {
      return JSON.parse(jsonStr) as AnalysisResponse;
    } catch {
      const cleaned = jsonStr.replace(/^```json\s*|\s*```$/g, "").trim();
      try {
        return JSON.parse(cleaned) as AnalysisResponse;
      } catch {
        throw new Error("Respuesta inválida del asistente");
      }
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const analyzeMessage = t("aiAssistant.analyzePrompt");
      const result = await analyzeCurriculum(analyzeMessage);
      setAnalysis(result);
    } catch {
      /* toast already shown in analyzeCurriculum */
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      className="flex flex-1 flex-col min-h-0 min-w-0"
      role="region"
      aria-label={t("aiAssistant.title")}
    >
      <div className="flex-1 flex flex-col gap-4 min-h-0 min-w-0 overflow-hidden">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-2 shrink-0"
          onClick={handleAnalyze}
          disabled={isLoading}
        >
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
          {t("aiAssistant.analyze")}
        </Button>

        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[120px] px-4 py-8 text-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
            <p className="text-muted-foreground text-sm">{t("aiAssistant.analyzing")}</p>
          </div>
        )}
        {analysis && !isLoading && (
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <StructuredAnalysis
              data={analysis}
              beforeLabel={t("aiAssistant.exampleBefore")}
              afterLabel={t("aiAssistant.exampleAfter")}
              actionLabel={t("aiAssistant.action")}
            />
          </div>
        )}
      </div>
    </section>
  );
}
