import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un analista de carreras tecnológicas especializado en el mercado laboral de Barranquilla, Colombia y el Caribe colombiano. Tu rol es ayudar a profesionales a mejorar su currículum y perfil profesional.

Responde siempre en el mismo idioma que use el usuario (español o inglés).

IMPORTANTE: Debes devolver SIEMPRE un JSON con exactamente estas 4 secciones (en este orden), cada una con su título y al menos 2 ítems con subtitle, description y action:

1. "Optimización del Currículum" (o "Resume Optimization" en inglés): recomendaciones para mejorar el CV (historial profesional, métricas de impacto, educación, etc.). Cada ítem debe tener subtitle, description y action que empiece con "Acción:".

2. "Roadmap Tecnológico Sugerido" (o "Suggested Technology Roadmap" en inglés): tecnologías y habilidades a aprender (frameworks de agentes, bases de datos vectoriales, cloud AI, etc.). Cada ítem con subtitle, description y action.

3. "Consejos para el Mercado" (o "Market Tips" en inglés): cómo destacar en Barranquilla y el Caribe (mercado local, exportación de servicios, networking, inglés). Cada ítem con subtitle, description y action.

4. "Impacto Técnico y de Negocio" (o "Technical and Business Impact" en inglés): un ejemplo práctico con "before" (texto actual de su experiencia) y "after" (versión mejorada y cuantificada). Usa el campo "example" con label, before y after.

Además incluye: "greeting" (saludo personalizado + resumen de su perfil) y "summary" (resumen de impacto final motivador).

Sé directo, constructivo y accionable. Prioriza recomendaciones por impacto.`;

const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  required: ["greeting", "sections", "example", "summary"],
  properties: {
    greeting: { type: "string", description: "Saludo personalizado al usuario con resumen de su perfil" },
    sections: {
      type: "array",
      description: "Exactamente 4 secciones: Optimización del Currículum, Roadmap Tecnológico, Consejos para el Mercado, Impacto Técnico",
      items: {
        type: "object",
        required: ["title", "items"],
        properties: {
          title: { type: "string", description: "Título de la sección" },
          items: {
            type: "array",
            description: "Al menos 2 ítems por sección",
            items: {
              type: "object",
              properties: {
                subtitle: { type: "string", description: "Subtítulo o etiqueta del ítem" },
                description: { type: "string", description: "Descripción o contexto" },
                action: { type: "string", description: "Acción recomendada" },
                category: { type: "string", description: "Categoría (ej: Orquestadores)" },
                content: { type: "string", description: "Contenido del ítem" },
              },
            },
          },
        },
      },
    },
    example: {
      type: "object",
      description: "Ejemplo práctico Antes/Después de mejora en descripción de experiencia",
      required: ["label", "before", "after"],
      properties: {
        label: { type: "string", description: "Título del ejemplo (ej: Impacto Técnico y de Negocio)" },
        before: { type: "string", description: "Texto actual de su experiencia" },
        after: { type: "string", description: "Texto mejorado y cuantificado" },
      },
    },
    summary: { type: "string", description: "Resumen de impacto final motivador" },
  },
};

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
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error("ai-curriculum-assistant auth failed:", userError?.message ?? "no user");
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { curriculum, message, isAnalyze } = body as {
      curriculum?: unknown;
      message?: string;
      isAnalyze?: boolean;
    };

    const userMessage = message || "Analiza mi currículum y dame recomendaciones para mejorarlo.";
    const curriculumContext = curriculum
      ? `\n\nDatos del currículum del usuario:\n${JSON.stringify(curriculum, null, 2)}`
      : "";

    const prompt = `${userMessage}${curriculumContext}`;

    if (isAnalyze) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`;
      const geminiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: ANALYSIS_JSON_SCHEMA,
          },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      });

      if (!geminiResponse.ok) {
        const errBody = await geminiResponse.text();
        console.error("Gemini API error:", geminiResponse.status, errBody);
        let userMsg = "Error al comunicarse con el asistente de IA";
        if (geminiResponse.status === 403) userMsg = "API key de Gemini inválida o sin permisos";
        else if (geminiResponse.status === 404) userMsg = "Modelo de Gemini no disponible";
        else if (geminiResponse.status === 429) userMsg = "Límite de uso excedido. Intenta más tarde.";
        return new Response(
          JSON.stringify({ error: userMsg }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
        );
      }

      const geminiData = await geminiResponse.json();
      const text =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        const finishReason = geminiData?.candidates?.[0]?.finishReason;
        const userMsg =
          finishReason === "SAFETY" || finishReason === "RECITATION"
            ? "La respuesta fue bloqueada por filtros de seguridad. Intenta reformular tu currículum."
            : "No se pudo generar una respuesta. Intenta de nuevo.";
        return new Response(
          JSON.stringify({ error: userMsg }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
        );
      }
      return new Response(
        JSON.stringify({ json: text }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:streamGenerateContent?alt=sse&key=${geminiApiKey}`;
    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    });

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errBody);
      let userMsg = "Error al comunicarse con el asistente de IA";
      if (geminiResponse.status === 403) userMsg = "API key de Gemini inválida o sin permisos";
      else if (geminiResponse.status === 404) userMsg = "Modelo de Gemini no disponible";
      else if (geminiResponse.status === 429) userMsg = "Límite de uso excedido. Intenta más tarde.";
      return new Response(
        JSON.stringify({ error: userMsg }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
      );
    }

    return new Response(geminiResponse.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("ai-curriculum-assistant error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
