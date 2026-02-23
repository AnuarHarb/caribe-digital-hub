import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const AVATAR_BUCKET = "avatars";
const DOCUMENTS_BUCKET = "documents";
const AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DOCUMENT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DOCUMENT_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function getFileExtension(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  if (ext === "jpeg") return "jpg";
  return ext;
}

export function useFileUpload(userId: string | undefined) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = useCallback(
    async (file: File): Promise<{ url: string } | { error: string }> => {
      if (!userId) return { error: "Usuario no autenticado" };
      if (file.size > AVATAR_MAX_SIZE) return { error: "La imagen no debe superar 5MB" };
      if (!AVATAR_MIME_TYPES.includes(file.type)) return { error: "Formato no válido. Usa JPG, PNG o WebP" };

      setIsUploading(true);
      setError(null);

      try {
        const ext = getFileExtension(file);
        const path = `${userId}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(AVATAR_BUCKET)
          .upload(path, file, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
        return { url: publicUrl };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al subir la imagen";
        setError(message);
        return { error: message };
      } finally {
        setIsUploading(false);
      }
    },
    [userId]
  );

  const uploadDocument = useCallback(
    async (file: File): Promise<{ path: string } | { error: string }> => {
      if (!userId) return { error: "Usuario no autenticado" };
      if (file.size > DOCUMENT_MAX_SIZE) return { error: "El archivo no debe superar 10MB" };
      if (!DOCUMENT_MIME_TYPES.includes(file.type)) return { error: "Formato no válido. Usa JPG, PNG, WebP o PDF" };

      setIsUploading(true);
      setError(null);

      try {
        const ext = getFileExtension(file);
        const path = `${userId}/document.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(DOCUMENTS_BUCKET)
          .upload(path, file, { upsert: true });

        if (uploadError) throw uploadError;

        return { path };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al subir el documento";
        setError(message);
        return { error: message };
      } finally {
        setIsUploading(false);
      }
    },
    [userId]
  );

  const getDocumentSignedUrl = useCallback(
    async (path: string, expiresIn = 3600): Promise<string | null> => {
      if (!path) return null;
      try {
        const { data, error } = await supabase.storage
          .from(DOCUMENTS_BUCKET)
          .createSignedUrl(path, expiresIn);
        if (error) throw error;
        return data.signedUrl;
      } catch {
        return null;
      }
    },
    []
  );

  return {
    uploadAvatar,
    uploadDocument,
    getDocumentSignedUrl,
    isUploading,
    error,
    clearError: () => setError(null),
  };
}
