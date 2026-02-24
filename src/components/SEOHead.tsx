import { Helmet } from "react-helmet-async";

const SITE_URL = "https://costadigital.org";

export interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
  noindex?: boolean;
}

export function SEOHead({
  title,
  description,
  canonical,
  image,
  imageAlt,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  keywords,
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = title.includes("Costa Digital") ? title : `${title} | Costa Digital`;
  const canonicalUrl = canonical ? (canonical.startsWith("http") ? canonical : `${SITE_URL}${canonical}`) : undefined;
  const imageUrl = image ? (image.startsWith("http") ? image : `${SITE_URL}${image}`) : `${SITE_URL}/og-image.png`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {imageAlt && <meta name="twitter:image:alt" content={imageAlt} />}
    </Helmet>
  );
}
