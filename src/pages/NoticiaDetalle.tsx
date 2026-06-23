import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { ArticleDetail } from "@/components/noticias/ArticleDetail";
import { RelatedNotes } from "@/components/noticias/RelatedNotes";
import { LikeButton } from "@/components/blog/LikeButton";
import { CommentSection } from "@/components/blog/CommentSection";
import { useNoticia, useNoticias } from "@/hooks/useNoticias";
import { pickRelatedNotes } from "@/content/noticias";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { FAMILIAS, FORMATOS, PILARES } from "@/content/taxonomies";

const SITE_URL = "https://costadigital.org";

export default function NoticiaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const { data: note, isLoading } = useNoticia(slug);
  const { data: allNotes = [] } = useNoticias();
  const { isAdmin } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-[400px] items-center justify-center px-4 py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!note) {
    return <Navigate to="/noticias" replace />;
  }

  const related = pickRelatedNotes(allNotes, note);
  const publishedIso = note.fecha || undefined;
  const imageUrl = note.portada?.startsWith("http")
    ? note.portada
    : note.portada
      ? `${SITE_URL}${note.portada}`
      : `${SITE_URL}/og-image.png`;

  const newsArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: note.title,
    description: note.resumen || note.title,
    url: `${SITE_URL}/noticias/${note.slug}`,
    image: imageUrl,
    datePublished: publishedIso,
    dateModified: publishedIso,
    articleSection: FAMILIAS[note.familia].label,
    author: { "@type": "Person", name: note.autor || "Costa Digital" },
    publisher: {
      "@type": "Organization",
      name: "Costa Digital",
      alternateName: "Caribe Tech",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.png` },
    },
    ...(note.tags.length > 0 ? { keywords: note.tags } : {}),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={note.title}
        description={note.resumen || note.title}
        canonical={`/noticias/${note.slug}`}
        image={note.portada || undefined}
        imageAlt={note.title}
        type="article"
        publishedTime={publishedIso}
        author={note.autor || undefined}
        keywords={
          note.tags.length > 0
            ? [...note.tags, "Caribe Tech", "tech del Caribe"]
            : ["Caribe Tech", "tech del Caribe"]
        }
        tags={[
          ...note.tags,
          FAMILIAS[note.familia].label,
          PILARES[note.pilar].label,
          FORMATOS[note.formato].label,
        ]}
        section={FAMILIAS[note.familia].label}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(newsArticleJsonLd)}
        </script>
      </Helmet>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <ArticleDetail note={note} />

        <div className="mt-8 flex items-center gap-4 border-t pt-6">
          <LikeButton postId={note.id} />
          {isAdmin && (
            <Link to={`/admin/noticias?edit=${note.id}`} className="ml-auto">
              <Button variant="outline" size="sm" className="gap-2">
                <Pencil className="h-4 w-4" aria-hidden />
                Editar
              </Button>
            </Link>
          )}
        </div>

        <CommentSection postId={note.id} />

        <RelatedNotes notes={related} />
      </main>
    </div>
  );
}
