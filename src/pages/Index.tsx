import { useState } from "react";
import { useTranslation } from "react-i18next";
import logoImage from "@/assets/costa-digital-logo.png";
import { ChevronDown } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const Index = () => {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0, 1, 2]));

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const manifestoSections = [
    {
      title: t("manifesto.preamble.title"),
      content: t("manifesto.preamble.content", { returnObjects: true }) as string[]
    },
    {
      title: t("manifesto.principles.title"),
      items: t("manifesto.principles.items", { returnObjects: true }) as string[]
    },
    {
      title: t("manifesto.mission.title"),
      content: t("manifesto.mission.content", { returnObjects: true }) as string[],
      items: t("manifesto.mission.items", { returnObjects: true }) as string[]
    },
    {
      title: t("manifesto.practice.title"),
      items: t("manifesto.practice.items", { returnObjects: true }) as string[]
    },
    {
      title: t("manifesto.mastery.title"),
      items: t("manifesto.mastery.items", { returnObjects: true }) as string[]
    },
    {
      title: t("manifesto.leadership.title"),
      items: t("manifesto.leadership.items", { returnObjects: true }) as string[]
    },
    {
      title: t("manifesto.rules.title"),
      items: t("manifesto.rules.items", { returnObjects: true }) as string[]
    },
    {
      title: t("manifesto.prohibited.title"),
      items: t("manifesto.prohibited.items", { returnObjects: true }) as string[]
    },
    {
      title: t("manifesto.pact.title"),
      content: t("manifesto.pact.content", { returnObjects: true }) as string[]
    },
    {
      title: t("manifesto.oath.title"),
      content: t("manifesto.oath.content", { returnObjects: true }) as string[]
    },
    {
      title: t("manifesto.callAndResponse.title"),
      subtitle: t("manifesto.callAndResponse.subtitle"),
      content: t("manifesto.callAndResponse.content", { returnObjects: true }) as string[]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-5"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <img 
              src={logoImage} 
              alt="Costa Digital Logo" 
              className="w-48 h-48 md:w-64 md:h-64 mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
            <h1 className="font-display text-5xl md:text-7xl font-bold text-primary tracking-tight">
              {t("home.title")}
            </h1>
            <p className="text-xl md:text-2xl text-secondary font-medium dark:text-primary">
               Hola desde la clase
            </p>
            <div className="inline-block px-6 py-3 bg-accent/10 border-2 border-accent rounded-full">
              <p className="text-accent font-semibold tracking-wide">
                {t("home.values")}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"></div>
      </header>

      {/* Manifesto Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">
              {t("home.manifestoTitle")}
            </h2>
            <p className="text-muted-foreground text-lg italic">
              {t("home.manifestoSubtitle")}
            </p>
          </div>

          <div className="space-y-6">
            {manifestoSections.map((section, index) => (
              <div
                key={index}
                className="group bg-card border-2 border-border rounded-xl overflow-hidden hover:border-accent/50 hover:shadow-lg transition-all duration-300"
              >
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full px-6 md:px-8 py-6 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent hover:from-accent/10 transition-colors duration-300"
                >
                  <h3 className="font-display text-xl md:text-2xl font-bold text-primary text-left">
                    {section.title}
                  </h3>
                  <ChevronDown
                    className={`w-6 h-6 text-accent transition-transform duration-300 flex-shrink-0 ml-4 ${
                      expandedSections.has(index) ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    expandedSections.has(index) ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 md:px-8 py-6 space-y-4">
                    {section.subtitle && (
                      <p className="text-muted-foreground italic text-sm">{section.subtitle}</p>
                    )}
                    
                    {section.content && (
                      <div className="space-y-2">
                        {section.content.map((line, i) => (
                          <p key={i} className="text-foreground leading-relaxed font-medium">
                            {line}
                          </p>
                        ))}
                      </div>
                    )}

                    {section.items && (
                      <ul className="space-y-3 mt-4">
                        {section.items.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-foreground leading-relaxed group/item"
                          >
                            <span className="text-accent font-bold text-lg flex-shrink-0 group-hover/item:scale-125 transition-transform duration-300">
                              {item.startsWith("✗") ? "✗" : "•"}
                            </span>
                            <span className={item.startsWith("✗") ? "text-destructive font-medium" : ""}>
                              {item.replace("✗ ", "")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Final Message */}
          <div className="mt-16 p-8 md:p-12 bg-gradient-to-br from-primary to-secondary rounded-2xl text-center space-y-6 shadow-2xl border-4 border-accent/30">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
              {t("home.finalMessage.title")}
            </h3>
            <p className="text-primary-foreground/90 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              {t("home.finalMessage.content")}
            </p>
            <p className="text-primary-foreground font-bold text-xl md:text-2xl">
              {t("home.finalMessage.closing")}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-sm">
              {t("home.footer.copyright")}
            </p>
            <p className="text-accent font-semibold text-sm">
              {t("home.footer.cities")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
