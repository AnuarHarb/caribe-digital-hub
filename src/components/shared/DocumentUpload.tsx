import { useRef, useState } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProfile } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

interface DocumentUploadProps {
  currentPath?: string | null;
  onUploadComplete?: (path: string) => void;
}

const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

export function DocumentUpload({ currentPath, onUploadComplete }: DocumentUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useProfile();
  const { uploadDocument, isUploading } = useFileUpload(user?.id);

  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const hasDocument = !!currentPath || !!preview;

  const handleFile = async (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview("pdf");
    }

    const result = await uploadDocument(file);
    if ("path" in result) {
      onUploadComplete?.(result.path);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && ACCEPT.split(",").some((m) => file.type.match(m.replace("*", ".*")))) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors
          ${dragActive ? "border-accent bg-accent/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"}
          ${hasDocument ? "bg-muted/30" : ""}
        `}
        onClick={() => !isUploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleChange}
          className="sr-only"
          aria-hidden
        />

        {isUploading ? (
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" aria-hidden />
        ) : hasDocument ? (
          <div className="flex flex-col items-center gap-2">
            {preview && typeof preview === "string" && preview !== "pdf" ? (
              <img
                src={preview}
                alt=""
                className="max-h-24 rounded object-cover"
                aria-hidden
              />
            ) : (
              <FileText className="h-10 w-10 text-muted-foreground" aria-hidden />
            )}
            <span className="text-sm text-muted-foreground">{t("profile.documentUploaded")}</span>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground" aria-hidden />
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {t("profile.documentUploadHint")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
