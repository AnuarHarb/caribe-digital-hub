import { Helmet } from "react-helmet-async";

const SITE_URL = "https://costadigital.org";

export interface ArticleJsonLdProps {
  title: string;
  description: string;
  slug: string;
  coverImageUrl?: string | null;
  publishedAt: string;
  modifiedAt?: string;
  authorName: string;
}

export function ArticleJsonLd({
  title,
  description,
  slug,
  coverImageUrl,
  publishedAt,
  modifiedAt,
  authorName,
}: ArticleJsonLdProps) {
  const url = `${SITE_URL}/blog/${slug}`;
  const imageUrl = coverImageUrl?.startsWith("http")
    ? coverImageUrl
    : coverImageUrl
      ? `${SITE_URL}${coverImageUrl}`
      : `${SITE_URL}/og-image.png`;

  const newsArticle = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    url,
    image: imageUrl,
    datePublished: publishedAt,
    dateModified: modifiedAt ?? publishedAt,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Costa Digital",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/og-image.png`,
      },
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Costa Digital News",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: url,
      },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(newsArticle)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
    </Helmet>
  );
}
