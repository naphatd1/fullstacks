interface StructuredDataProps {
  type: 'WebSite' | 'WebApplication' | 'Article' | 'Organization';
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type,
    };

    switch (type) {
      case 'WebSite':
        return {
          ...baseData,
          name: data.name || 'This House Is The Best',
          url: data.url || process.env.NEXT_PUBLIC_SITE_URL,
          description: data.description || 'Premium property management platform',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${data.url || process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        };

      case 'WebApplication':
        return {
          ...baseData,
          name: data.name || 'This House Is The Best',
          url: data.url || process.env.NEXT_PUBLIC_SITE_URL,
          description: data.description || 'Premium property management and real estate platform',
          applicationCategory: 'WebApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          screenshot: `${data.url || process.env.NEXT_PUBLIC_SITE_URL}/screenshot.png`,
        };

      case 'Article':
        return {
          ...baseData,
          headline: data.title,
          description: data.description,
          image: data.image,
          datePublished: data.publishedAt,
          dateModified: data.updatedAt || data.publishedAt,
          author: {
            '@type': 'Person',
            name: data.author || 'This House Is The Best Team',
          },
          publisher: {
            '@type': 'Organization',
            name: 'This House Is The Best',
            logo: {
              '@type': 'ImageObject',
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
            },
          },
        };

      case 'Organization':
        return {
          ...baseData,
          name: data.name || 'This House Is The Best',
          url: data.url || process.env.NEXT_PUBLIC_SITE_URL,
          logo: `${data.url || process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
          description: data.description || 'Premium property management and real estate platform',
          sameAs: data.socialLinks || [],
        };

      default:
        return baseData;
    }
  };

  const structuredData = getStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}