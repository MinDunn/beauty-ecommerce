import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO = ({ 
  title, 
  description = "Glowzy - Thiên đường mỹ phẩm chính hãng, nơi đánh thức vẻ đẹp tự nhiên của bạn.", 
  keywords = "mỹ phẩm, làm đẹp, skincare, makeup, glowzy", 
  image = "/og-image.jpg", 
  url = window.location.href,
  type = "website"
}: SEOProps) => {
  const siteTitle = "Glowzy Beauty";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />

      {/* Open Graph tags (Facebook, LinkedIn, etc.) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter Card tags */}
      <meta name="twitter:creator" content="Glowzy" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
