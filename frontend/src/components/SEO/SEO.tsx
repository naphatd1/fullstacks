import Head from 'next/head';
import StructuredData from './StructuredData';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  noindex?: boolean;
  structuredData?: {
    type: 'WebSite' | 'WebApplication' | 'Article' | 'Organization';
    data: any;
  };
}

export default function SEO({
  title,
  description,
  canonical,
  image,
  noindex = false,
  structuredData,
}: SEOProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const defaultImage = `${siteUrl}/og-image.png`;
  
  const pageTitle = title 
    ? `${title} | This House Is The Best`
    : 'This House Is The Best - Premium Property Management';
  
  const pageDescription = description || 
    'This House Is The Best - Your premier destination for exceptional property management, real estate services, and home solutions. Discover the finest properties.';
  
  const pageImage = image || defaultImage;
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;

  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="title" content={pageTitle} />
        <meta name="description" content={pageDescription} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Robots */}
        {noindex ? (
          <meta name="robots" content="noindex, nofollow" />
        ) : (
          <meta name="robots" content="index, follow" />
        )}
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:site_name" content="This House Is The Best" />
        <meta property="og:locale" content="th_TH" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        <meta property="twitter:image" content={pageImage} />
        <meta property="twitter:creator" content="@this_house_best" />
        
        {/* Additional Meta Tags */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      
      {/* Structured Data */}
      {structuredData && (
        <StructuredData 
          type={structuredData.type} 
          data={structuredData.data} 
        />
      )}
    </>
  );
}