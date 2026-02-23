import { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProfile } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface AvatarUploadProps {
  currentUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

export function AvatarUpload({ currentUrl, size = "md" }: AvatarUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, profile, updateProfile } = useProfile();
  const { uploadAvatar, isUploading, error, clearError } = useFileUpload(user?.id);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadAvatar(file);
    if ("url" in result) {
      await updateProfile({ avatar_url: result.url });
      toast.success(t("profile.avatarUpdated"));
    } else {
      toast.error(result.error);
      clearError();
    }

    e.target.value = "";
  };

  const getInitials = () => {
    const name = profile?.full_name?.trim();
    if (!name) return "?";
    const parts = name.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="group relative block cursor-pointer rounded-full ring-2 ring-border ring-offset-2 ring-offset-background transition-all hover:ring-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        aria-label={t("profile.changePhoto")}
      >
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={currentUrl ?? undefined} alt="" />
          <AvatarFallback className="bg-muted text-muted-foreground text-lg">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
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
  );
}
