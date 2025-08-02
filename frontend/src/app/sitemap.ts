import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  // Static routes for This House Is The Best
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/houses`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  // Dynamic routes (properties, houses, posts, etc.)
  // In a real app, you would fetch this data from your API
  const dynamicRoutes = [
    // Example: fetch properties from API and generate URLs
    // const properties = await fetchProperties();
    // return properties.map(property => ({
    //   url: `${baseUrl}/properties/${property.id}`,
    //   lastModified: new Date(property.updatedAt),
    //   changeFrequency: 'weekly' as const,
    //   priority: 0.8,
    // }));
    
    // Example: fetch houses from API and generate URLs  
    // const houses = await fetchHouses();
    // return houses.map(house => ({
    //   url: `${baseUrl}/houses/${house.id}`,
    //   lastModified: new Date(house.updatedAt),
    //   changeFrequency: 'weekly' as const,
    //   priority: 0.8,
    // }));
  ];

  return [...staticRoutes, ...dynamicRoutes];
}