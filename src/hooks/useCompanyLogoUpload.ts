import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const COMPANY_LOGOS_BUCKET = "company-logos";
const LOGO_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const LOGO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getFileExtension(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  if (ext === "jpeg") return "jpg";
  return ext;
}

export function useCompanyLogoUpload(companyId: string | undefined) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadLogo = useCallback(
    async (file: File): Promise<{ url: string } | { error: string }> => {
      if (!companyId) return { error: "No company selected" };
      if (file.size > LOGO_MAX_SIZE) return { error: "La imagen no debe superar 5MB" };
      if (!LOGO_MIME_TYPES.includes(file.type)) return { error: "Formato no válido. Usa JPG, PNG o WebP" };

      setIsUploading(true);
      setError(null);

      try {
        const ext = getFileExtension(file);
        const path = `${companyId}/logo.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(COMPANY_LOGOS_BUCKET)
          .upload(path, file, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from(COMPANY_LOGOS_BUCKET).getPublicUrl(path);
        return { url: publicUrl };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al subir el logo";
        setError(message);
        return { error: message };
      } finally {
        setIsUploading(false);
      }
    },
    [companyId]
  );

  return {
    uploadLogo,
    isUploading,
    error,
    clearError: () => setError(null),
  };
}
