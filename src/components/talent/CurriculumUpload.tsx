import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Loader2, Upload, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessCurriculum, type ExtractedCurriculumData } from "@/hooks/useProcessCurriculum";
import { useProfessionalProfile } from "@/hooks/useProfile";
import { useProfile } from "@/hooks/useAuth";
import { toast } from "sonner";

const ACCEPT = "application/pdf";

interface CurriculumUploadProps {
  onComplete?: () => void;
}

function ExtractionPreview({ data }: { data: ExtractedCurriculumData }) {
  const { t } = useTranslation();
  const { personal, professional, skills, experience, education } = data;

  return (
    <div className="max-h-[60vh] space-y-4 overflow-y-auto text-sm">
      {(personal.full_name || personal.phone || personal.city) && (
        <section>
          <h4 className="mb-1 font-semibold">{t("cvUpload.previewPersonal")}</h4>
          <ul className="space-y-0.5 text-muted-foreground">
            {personal.full_name && <li>{personal.full_name}</li>}
            {personal.phone && <li>{personal.phone}</li>}
            {personal.city && <li>{personal.city}</li>}
          </ul>
        </section>
      )}

      {(professional.title || professional.bio) && (
        <section>
          <h4 className="mb-1 font-semibold">{t("cvUpload.previewProfessional")}</h4>
          <ul className="space-y-0.5 text-muted-foreground">
            {professional.title && <li><strong>{t("profile.title")}:</strong> {professional.title}</li>}
            {professional.bio && <li className="line-clamp-3">{professional.bio}</li>}
            {professional.location && <li>{professional.location}</li>}
            {professional.years_experience != null && (
              <li>{professional.years_experience} {t("cvUpload.yearsExp")}</li>
            )}
          </ul>
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <h4 className="mb-1 font-semibold">
            {t("curriculum.tabSkills")} ({skills.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s, i) => (
              <span
                key={i}
                className="rounded-full border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {s.skill_name}
              </span>
            ))}
          </div>
        </section>
      )}

      {experience.length > 0 && (
        <section>
          <h4 className="mb-1 font-semibold">
            {t("curriculum.tabExperience")} ({experience.length})
          </h4>
          <ul className="space-y-1 text-muted-foreground">
            {experience.map((e, i) => (
              <li key={i}>
                <strong>{e.position}</strong> — {e.company_name}
                {e.start_date && (
                  <span className="ml-1 text-xs opacity-70">
                    ({e.start_date}{e.end_date ? ` – ${e.end_date}` : ""})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {education.length > 0 && (
        <section>
          <h4 className="mb-1 font-semibold">
            {t("curriculum.tabEducation")} ({education.length})
          </h4>
          <ul className="space-y-1 text-muted-foreground">
            {education.map((e, i) => (
              <li key={i}>
                <strong>{e.degree || e.field_of_study || t("cvUpload.studies")}</strong> — {e.institution}
                {e.start_date && (
                  <span className="ml-1 text-xs opacity-70">
                    ({e.start_date}{e.end_date ? ` – ${e.end_date}` : ""})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export function CurriculumUpload({ onComplete }: CurriculumUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useProfile();
  const { uploadCurriculum, isUploading } = useFileUpload(user?.id);
  const { professionalProfile, upsertProfessionalProfile } = useProfessionalProfile();
  const { processCurriculum, applyExtractedData, extractedData, isProcessing, clearExtractedData } =
    useProcessCurriculum();

  const [dragActive, setDragActive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const isBusy = isUploading || isProcessing;
  const hasExistingCV = !!professionalProfile?.resume_url;

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error(t("cvUpload.errorPdfOnly"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("cvUpload.errorTooLarge"));
      return;
    }

    setFileName(file.name);

    const uploadResult = await uploadCurriculum(file);
    if ("error" in uploadResult) {
      toast.error(uploadResult.error);
      return;
    }

    await upsertProfessionalProfile({ resume_url: uploadResult.path }).catch(() => {});
    toast.success(t("cvUpload.uploaded"));

    try {
      await processCurriculum(file);
      setDialogOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("cvUpload.errorProcessing"));
    }
  };

  const handleApply = async () => {
    if (!extractedData) return;
    setIsApplying(true);
    try {
      await applyExtractedData(extractedData);
      toast.success(t("cvUpload.applied"));
      setDialogOpen(false);
      clearExtractedData();
      onComplete?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("cvUpload.errorApplying");
      toast.error(msg);
    } finally {
      setIsApplying(false);
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
    if (file) handleFile(file);
  };

  const busyOverlay = isProcessing ? (
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
      <p className="text-sm font-medium text-muted-foreground">{t("cvUpload.processing")}</p>
      {fileName && <p className="text-xs text-muted-foreground/70">({fileName})</p>}
    </div>
  ) : isUploading ? (
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">{t("cvUpload.uploading")}</p>
    </div>
  ) : null;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleChange}
        className="sr-only"
        aria-hidden
      />

      {hasExistingCV ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          className={`
            flex items-center gap-3 rounded-lg border p-3 transition-colors
            ${dragActive ? "border-accent bg-accent/5" : "border-border"}
            ${isBusy ? "pointer-events-none opacity-60" : ""}
          `}
        >
          <figure className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10">
            <FileText className="h-5 w-5 text-accent" aria-hidden />
          </figure>
          <div className="min-w-0 flex-1">
            {busyOverlay ?? (
              <>
                <p className="truncate text-sm font-medium">{t("cvUpload.existingLabel")}</p>
                <p className="text-xs text-muted-foreground">{t("cvUpload.existingHint")}</p>
              </>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1.5 text-xs"
            onClick={() => inputRef.current?.click()}
            disabled={isBusy}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            {t("cvUpload.replace")}
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          className={`
            relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 transition-colors
            ${dragActive ? "border-accent bg-accent/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"}
            ${isBusy ? "pointer-events-none opacity-60" : ""}
          `}
          onClick={() => !isBusy && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
          aria-label={t("cvUpload.dropzone")}
        >
          {busyOverlay ? (
            <div className="flex flex-col items-center gap-2">{busyOverlay}</div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" aria-hidden />
              <p className="text-center text-sm font-medium text-muted-foreground">
                {t("cvUpload.dropzone")}
              </p>
              <p className="text-center text-xs text-muted-foreground/70">
                {t("cvUpload.hint")}
              </p>
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!isApplying) setDialogOpen(open); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" aria-hidden />
              {t("cvUpload.dialogTitle")}
            </DialogTitle>
            <DialogDescription>{t("cvUpload.dialogDescription")}</DialogDescription>
          </DialogHeader>

          {extractedData ? (
            <ExtractionPreview data={extractedData} />
          ) : (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              {t("cvUpload.noData")}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => { setDialogOpen(false); clearExtractedData(); }}
              disabled={isApplying}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleApply}
              disabled={isApplying || !extractedData}
              className="gap-2"
            >
              {isApplying ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Check className="h-4 w-4" aria-hidden />
              )}
              {t("cvUpload.apply")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
