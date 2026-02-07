import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface FloatingCTAProps {
  onJoinClick: () => void;
}

export function FloatingCTA({ onJoinClick }: FloatingCTAProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = 400; // Approximate hero section height
      setIsVisible(window.scrollY > heroHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur p-4 md:hidden">
      <Button onClick={onJoinClick} className="w-full" size="lg">
        {t("membresia.floatingCta.text")}
      </Button>
    </div>
  );
}
