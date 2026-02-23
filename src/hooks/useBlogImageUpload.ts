import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const BLOG_IMAGES_BUCKET = "blog-images";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

function getFileExtension(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  if (ext === "jpeg") return "jpg";
  return ext;
}

export function useBlogImageUpload(userId: string | undefined) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(
    async (file: File): Promise<{ url: string } | { error: string }> => {
      if (!userId) return { error: "Usuario no autenticado" };
      if (file.size > MAX_SIZE) return { error: "La imagen no debe superar 5MB" };
      if (!ALLOWED_MIME.includes(file.type)) return { error: "Formato no válido. Usa JPG, PNG o WebP" };

      setIsUploading(true);
      setError(null);

      try {
        const ext = getFileExtension(file);
        const filename = `${crypto.randomUUID()}.${ext}`;
        const path = `${userId}/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from(BLOG_IMAGES_BUCKET)
          .upload(path, file, { upsert: false });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from(BLOG_IMAGES_BUCKET).getPublicUrl(path);
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

  return {
    uploadImage,
    isUploading,
    error,
    clearError: () => setError(null),
  };
}
