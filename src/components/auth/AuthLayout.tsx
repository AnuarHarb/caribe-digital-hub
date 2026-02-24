import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoImage from "@/assets/costa-digital-logo.png";

interface AuthLayoutProps {
  /** Optional tagline shown over the image panel */
  tagline?: string;
}

export function AuthLayout({ tagline }: AuthLayoutProps) {
  const { t } = useTranslation();
  const displayTagline = tagline ?? t("auth.tagline");
  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel: image with logo overlay */}
      <aside className="relative hidden lg:flex lg:w-1/2 lg:min-h-screen flex-col items-center justify-center">
        <img
          src="/events/1.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0 bg-primary/70"
          aria-hidden
        />
        <div className="relative z-10 flex flex-col items-center gap-6 px-10">
          <img
            src={logoImage}
            alt="Costa Digital"
            className="h-44 w-44 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          />
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">
            COSTA DIGITAL
          </h2>
          {displayTagline && (
            <p className="text-white/80 text-lg font-display text-center max-w-xs">
              {displayTagline}
            </p>
          )}
        </div>
      </aside>

      {/* Right panel: form area */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="flex justify-center lg:hidden mb-8">
            <img
              src={logoImage}
              alt="Costa Digital"
              className="h-16 w-16 object-contain"
            />
          </div>
          <Outlet />
        </div>
      </section>
    </main>
  );
}
