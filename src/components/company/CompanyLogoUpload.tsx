import { useRef } from "react";
import { Camera, Loader2, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCompanyLogoUpload } from "@/hooks/useCompanyLogoUpload";
import { useCompanyProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

interface CompanyLogoUploadProps {
  companyId: string | undefined;
  currentUrl?: string | null;
  companyName?: string | null;
}

export function CompanyLogoUpload({
  companyId,
  currentUrl,
}: CompanyLogoUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadLogo, isUploading, error, clearError } = useCompanyLogoUpload(companyId);
  const { upsertCompanyProfile } = useCompanyProfile(companyId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadLogo(file);
    if ("url" in result) {
      try {
        await upsertCompanyProfile({ logo_url: result.url });
        toast.success(t("company.logoUpdated"));
      } catch {
        toast.error(t("common.error"));
      }
    } else {
      toast.error(result.error);
      clearError();
    }

    e.target.value = "";
  };

  if (!companyId) return null;

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="group relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-border bg-muted ring-2 ring-border ring-offset-2 ring-offset-background transition-all hover:border-accent/50 hover:ring-accent/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          aria-label={t("company.changeLogo")}
        >
          {currentUrl ? (
            <img
              src={currentUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              <Building2 className="h-10 w-10" aria-hidden />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-white" aria-hidden />
            ) : (
              <Camera className="h-8 w-8 text-white" aria-hidden />
            )}
          </div>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="sr-only"
          aria-hidden
        />
      </div>
      <p className="text-sm text-muted-foreground">{t("company.logoHint")}</p>
    </div>
  );
}
