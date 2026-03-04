import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import logoImage from "@/assets/costa-digital-logo.png";
import { useIsMobile } from "@/hooks/use-mobile";

interface CredentialCardProps {
  name: string;
  avatarUrl?: string | null;
  userId: string;
  memberSince?: string;
  compact?: boolean;
}

export function CredentialCard({ name, avatarUrl, userId, memberSince, compact }: CredentialCardProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const formattedDate = memberSince
    ? new Date(memberSince).toLocaleDateString("es-CO", { year: "numeric", month: "long" })
    : null;

  const initials = name
    ? name
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  if (compact) {
    return (
      <article className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-white shadow-lg">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full border-2 border-white/20 object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-sm font-bold">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="text-xs text-white/60">{t("credential.member")}</p>
          </div>
          <img src={logoImage} alt="Costa Digital" className="h-7 w-7 shrink-0 rounded" />
        </div>
      </article>
    );
  }

  return (
    <article
      className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl md:aspect-[85.6/54]"
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="absolute left-0 top-0 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-2xl" />
      <div className="absolute bottom-0 right-0 h-24 w-24 translate-x-1/3 translate-y-1/3 rounded-full bg-accent/10 blur-2xl" />

      <div className="relative flex h-full flex-col justify-between p-6 md:p-5">
        <header className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="Costa Digital" className="h-8 w-8 rounded" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
              Costa Digital
            </span>
          </div>
          <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
            Miembro
          </span>
        </header>

        <section className="flex items-center gap-4 pb-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-14 w-14 rounded-full border-2 border-white/30 object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-lg font-bold shadow-lg">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold leading-tight">{name}</p>
            <p className="text-xs text-white/60">{t("credential.member")}</p>
          </div>
        </section>

        <footer
          className={
            isMobile
              ? "flex flex-col items-center gap-3"
              : "flex items-end justify-between"
          }
        >
          <div
            className={
              isMobile
                ? "inline-flex overflow-hidden rounded-md bg-white p-2 shadow-xl"
                : "inline-flex overflow-hidden rounded-md bg-white p-2 shadow-lg"
            }
          >
            <QRCodeSVG value={userId} size={isMobile ? 200 : 56} level="M" />
          </div>
          {formattedDate && (
            <p className="text-[10px] text-white/50">
              {t("credential.memberSince")} {formattedDate}
            </p>
          )}
        </footer>
      </div>
    </article>
  );
}
