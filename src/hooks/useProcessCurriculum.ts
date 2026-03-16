import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Database } from "@/integrations/supabase/types";

type SkillLevel = Database["public"]["Enums"]["skill_level"];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface ExtractedPersonal {
  full_name?: string;
  phone?: string;
  city?: string;
}

export interface ExtractedProfessional {
  title?: string;
  bio?: string;
  location?: string;
  years_experience?: number;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

export interface ExtractedSkill {
  skill_name: string;
  skill_level: SkillLevel;
}

export interface ExtractedExperience {
  company_name: string;
  position: string;
  description?: string;
  start_date: string;
  end_date?: string;
}

export interface ExtractedEducation {
  institution: string;
  degree?: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
}

export interface ExtractedCurriculumData {
  personal: ExtractedPersonal;
  professional: ExtractedProfessional;
  skills: ExtractedSkill[];
  experience: ExtractedExperience[];
  education: ExtractedEducation[];
}

const VALID_SKILL_LEVELS: SkillLevel[] = ["beginner", "intermediate", "advanced", "expert"];

function normalizeSkillLevel(level: string | undefined): SkillLevel {
  if (level && VALID_SKILL_LEVELS.includes(level as SkillLevel)) {
    return level as SkillLevel;
  }
  return "intermediate";
}

function toDateStr(v: string | undefined | null): string | null {
  if (!v) return null;
  if (/^\d{4}-\d{2}$/.test(v)) return `${v}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return null;
}

export function useProcessCurriculum() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedCurriculumData | null>(null);

  const extractFromFile = useCallback(
    async (file: File): Promise<ExtractedCurriculumData> => {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data: sessionData } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      };
      if (sessionData?.session?.access_token) {
        headers.Authorization = `Bearer ${sessionData.session.access_token}`;
      }

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/process-curriculum`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ fileBase64: base64, mimeType: file.type }),
        }
      );

      if (!res.ok) {
        let msg = "Error al procesar el currículum";
        let errBody = "";
        try {
          errBody = await res.text();
          const parsed = JSON.parse(errBody) as { error?: string };
          if (parsed?.error) msg = parsed.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }

      const json = await res.json();
      const data = (json as { data?: ExtractedCurriculumData }).data;
      if (!data) throw new Error("No se recibió respuesta del asistente");
      return data;
    },
    []
  );

  const applyExtractedData = useCallback(
    async (data: ExtractedCurriculumData) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { personal, professional, skills, experience, education } = data;

      // Use update-or-insert to avoid slug trigger: upsert with user_id in payload triggers
      // set_professional_slug on UPDATE OF user_id, which can cause duplicate slug conflict.
      const updatePayload: Record<string, unknown> = {};
      if (professional.title) updatePayload.title = professional.title;
      if (professional.bio) updatePayload.bio = professional.bio;
      if (professional.location) updatePayload.location = professional.location;
      if (professional.years_experience != null)
        updatePayload.years_experience = professional.years_experience;
      if (professional.linkedin_url) updatePayload.linkedin_url = professional.linkedin_url;
      if (professional.github_url) updatePayload.github_url = professional.github_url;
      if (professional.portfolio_url) updatePayload.portfolio_url = professional.portfolio_url;

      const { data: existingProfile } = await supabase
        .from("professional_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      let professionalId: string | undefined;

      if (existingProfile?.id) {
        const { error: updateErr } = await supabase
          .from("professional_profiles")
          .update(updatePayload)
          .eq("id", existingProfile.id);
        if (updateErr) {
          throw new Error(updateErr.message);
        }
        professionalId = existingProfile.id;
      } else {
        const { data: insertedProfile, error: insertErr } = await supabase
          .from("professional_profiles")
          .insert({ user_id: user.id, ...updatePayload })
          .select("id")
          .single();
        if (insertErr) {
          throw new Error(insertErr.message);
        }
        professionalId = insertedProfile?.id;
      }

      if (!professionalId) throw new Error("No se pudo crear el perfil profesional");

      if (skills.length > 0) {
        const { data: existingSkills } = await supabase
          .from("professional_skills")
          .select("skill_name")
          .eq("professional_id", professionalId);
        const existingNames = new Set((existingSkills ?? []).map((s) => s.skill_name.toLowerCase()));
        const skillRows = skills
          .filter((s) => !existingNames.has(s.skill_name.toLowerCase()))
          .map((s) => ({
            professional_id: professionalId,
            skill_name: s.skill_name,
            skill_level: normalizeSkillLevel(s.skill_level),
          }));
        if (skillRows.length > 0) {
          const { error: skillsErr } = await supabase.from("professional_skills").insert(skillRows);
          if (skillsErr) {
            throw new Error(skillsErr.message);
          }
        }
      }

      if (experience.length > 0) {
        const expRows = experience
          .filter((e) => e.company_name && e.position && e.start_date)
          .map((e) => ({
            professional_id: professionalId,
            company_name: e.company_name,
            position: e.position,
            description: e.description || null,
            start_date: toDateStr(e.start_date) ?? e.start_date,
            end_date: toDateStr(e.end_date),
          }));
        if (expRows.length > 0) {
          const { error: expErr } = await supabase.from("professional_experience").insert(expRows);
          if (expErr) {
            throw new Error(expErr.message);
          }
        }
      }

      if (education.length > 0) {
        const eduRows = education
          .filter((e) => e.institution && e.start_date)
          .map((e) => ({
            professional_id: professionalId,
            institution: e.institution,
            degree: e.degree || null,
            field_of_study: e.field_of_study || null,
            start_date: toDateStr(e.start_date) ?? e.start_date,
            end_date: toDateStr(e.end_date),
          }));
        if (eduRows.length > 0) {
          const { error: eduErr } = await supabase.from("professional_education").insert(eduRows);
          if (eduErr) {
            throw new Error(eduErr.message);
          }
        }
      }

      if (personal.full_name || personal.phone || personal.city) {
        const updates: Record<string, string> = {};
        if (personal.full_name) updates.full_name = personal.full_name;
        if (personal.phone) updates.phone = personal.phone;
        if (personal.city) updates.city = personal.city;
        const { error: profErr } = await supabase.from("profiles").update(updates).eq("id", user.id);
        if (profErr) {
          throw new Error(profErr.message);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["professional-profile", user.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    },
    [user?.id, queryClient]
  );

  const processCurriculum = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setExtractedData(null);
      try {
        const data = await extractFromFile(file);
        setExtractedData(data);
        return data;
      } catch (err) {
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [extractFromFile]
  );

  return {
    processCurriculum,
    applyExtractedData,
    extractedData,
    isProcessing,
    clearExtractedData: () => setExtractedData(null),
  };
}
