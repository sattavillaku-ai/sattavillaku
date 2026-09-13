import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sattavilakku.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/articles',
          '/articles/*',
          '/magazine',
          '/magazine/*',
          '/news',
          '/news/*',
          '/about',
          '/contact',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api',
          '/api/*',
          '/auth',
          '/auth/*',
          '/search', // Internal search variations disallowed to prevent duplicate crawl budget waste
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/articles',
          '/articles/*',
          '/magazine',
          '/magazine/*',
          '/news',
          '/news/*',
          '/about',
          '/contact',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api',
          '/api/*',
          '/auth',
          '/auth/*',
          '/search',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
