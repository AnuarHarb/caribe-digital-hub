import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GEMINI_MODEL = "gemini-3.1-pro-preview";

const SYSTEM_PROMPT = `You are a CV/resume data extractor. Given a PDF curriculum, extract ALL information into a structured JSON object.

Rules:
- Extract every field you can find. Leave fields as null/empty string if not present in the CV.
- For dates, use "YYYY-MM" format (e.g. "2020-01"). If only a year is available, use "YYYY-01".
- For skill_level, infer from context: "beginner", "intermediate", "advanced", or "expert".
- For years_experience, calculate from the earliest work start date to today. Return as integer.
- For bio, write a concise professional summary (2-3 sentences) based on the CV content.
- For title, extract the professional headline or current job title.
- Return all text in the same language as the CV.`;

const EXTRACTION_SCHEMA = {
  type: "object" as const,
  required: ["personal", "professional", "skills", "experience", "education"],
  properties: {
    personal: {
      type: "object" as const,
      properties: {
        full_name: { type: "string" as const, description: "Full name" },
        phone: { type: "string" as const, description: "Phone number" },
        city: { type: "string" as const, description: "City of residence" },
      },
    },
    professional: {
      type: "object" as const,
      properties: {
        title: {
          type: "string" as const,
          description: "Professional title / headline",
        },
        bio: {
          type: "string" as const,
          description: "Professional summary (2-3 sentences)",
        },
        location: {
          type: "string" as const,
          description: "Work location (city, country)",
        },
        years_experience: {
          type: "integer" as const,
          description: "Total years of experience",
        },
        linkedin_url: { type: "string" as const, description: "LinkedIn URL" },
        github_url: { type: "string" as const, description: "GitHub URL" },
        portfolio_url: {
          type: "string" as const,
          description: "Portfolio/website URL",
        },
      },
    },
    skills: {
      type: "array" as const,
      items: {
        type: "object" as const,
        required: ["skill_name", "skill_level"],
        properties: {
          skill_name: { type: "string" as const },
          skill_level: {
            type: "string" as const,
            enum: ["beginner", "intermediate", "advanced", "expert"],
          },
        },
      },
    },
    experience: {
      type: "array" as const,
      items: {
        type: "object" as const,
        required: ["company_name", "position", "start_date"],
        properties: {
          company_name: { type: "string" as const },
          position: { type: "string" as const },
          description: { type: "string" as const },
          start_date: {
            type: "string" as const,
            description: "YYYY-MM format",
          },
          end_date: {
            type: "string" as const,
            description: "YYYY-MM format or empty if current",
          },
        },
      },
    },
    education: {
      type: "array" as const,
      items: {
        type: "object" as const,
        required: ["institution", "start_date"],
        properties: {
          institution: { type: "string" as const },
          degree: { type: "string" as const },
          field_of_study: { type: "string" as const },
          start_date: {
            type: "string" as const,
            description: "YYYY-MM format",
          },
          end_date: {
            type: "string" as const,
            description: "YYYY-MM format or empty if current",
          },
        },
      },
    },
  },
};

function geminiErrorMessage(status: number): string {
  if (status === 403) return "API key de Gemini inválida o sin permisos";
  if (status === 404) return "Modelo de Gemini no disponible";
  if (status === 429) return "Límite de uso excedido. Intenta más tarde.";
  return "Error al comunicarse con el asistente de IA";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY no configurado" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error(
        "process-curriculum auth failed:",
        userError?.message ?? "no user"
      );
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { fileBase64, mimeType } = body as {
      fileBase64?: string;
      mimeType?: string;
    };

    if (!fileBase64 || !mimeType) {
      return new Response(
        JSON.stringify({ error: "fileBase64 y mimeType son requeridos" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: EXTRACTION_SCHEMA,
        },
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType, data: fileBase64 } },
              {
                text: "Extract all structured data from this CV/resume document.",
              },
            ],
          },
        ],
      }),
    });

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errBody);
      return new Response(
        JSON.stringify({ error: geminiErrorMessage(geminiResponse.status) }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 502,
        }
      );
    }

    const geminiData = await geminiResponse.json();
    const text =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      const finishReason = geminiData?.candidates?.[0]?.finishReason;
      const userMsg =
        finishReason === "SAFETY" || finishReason === "RECITATION"
          ? "La respuesta fue bloqueada por filtros de seguridad."
          : "No se pudo extraer datos del documento.";
      return new Response(
        JSON.stringify({ error: userMsg }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 502,
        }
      );
    }

    return new Response(
      JSON.stringify({ data: JSON.parse(text) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("process-curriculum error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
