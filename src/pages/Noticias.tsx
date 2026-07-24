import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { NewsLanding } from "@/components/noticias/NewsLanding";
import { MAREA } from "@/content/taxonomies";
import { useNoticias } from "@/hooks/useNoticias";
import { Skeleton } from "@/components/ui/skeleton";

const SITE_URL = "https://costadigital.org";

export default function Noticias() {
  const { data: notes = [], isLoading } = useNoticias();

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${MAREA.nombre} — Costa Digital`,
    description: MAREA.descriptor,
    url: `${SITE_URL}/noticias`,
    about: { "@type": "Thing", name: "Ecosistema tech del Caribe" },
    isPartOf: {
      "@type": "WebSite",
      name: "Costa Digital",
      alternateName: "Caribe Tech",
      url: SITE_URL,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${MAREA.nombre} — ${MAREA.descriptor}`}
        description="La crónica del ecosistema tech del Caribe: El Pulso (newsletter semanal), A Fondo, Voces e Historias de la Costa."
        canonical="/noticias"
        keywords={["noticias tech Caribe", "ecosistema tech Caribe", "TechCaribe", "Costa Digital"]}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(collectionPageJsonLd)}
        </script>
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="space-y-12">
            <div className="space-y-3 text-center">
              <Skeleton className="mx-auto h-12 w-48" />
              <Skeleton className="mx-auto h-5 w-80" />
            </div>
            <Skeleton className="h-72 w-full rounded-2xl" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <NewsLanding notes={notes} />
        )}
      </main>
    </div>
  );
}
