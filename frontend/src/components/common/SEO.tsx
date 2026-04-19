import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  schema?: any; // For JSON-LD
}

export const SEO = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  schema 
}: SEOProps) => {
  const siteName = 'Glowzy.';
  const defaultDescription = 'Glowzy. - Thiên đường mỹ phẩm cao cấp. Chăm sóc sắc đẹp toàn diện với các sản phẩm chính hãng, ưu đãi độc quyền và dịch vụ tận tâm.';
  const defaultImage = '/logo-share.png'; // Make sure to use an actual image in the future
  const currentUrl = url || window.location.href;
  
  const seoTitle = title ? `${title} | ${siteName}` : `${siteName} - Mỹ phẩm cao cấp chính hãng`;
  const seoDescription = description || defaultDescription;
  
  // Resolve image URL to absolute if possible
  const getFullImageUrl = (img?: string) => {
    if (!img) return `${window.location.origin}${defaultImage}`;
    if (img.startsWith('http')) return img;
    return `${window.location.origin}${img.startsWith('/') ? img : `/${img}`}`;
  };

  const seoImage = getFullImageUrl(image);

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook / Zalo */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
