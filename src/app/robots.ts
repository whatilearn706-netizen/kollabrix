import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://linkora-link.online';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/control-center-7x9',
          '/api/',
          '/settings/',
          '/my-projects',
          '/my-applications',
          '/notifications',
        ],
      },
      {
        userAgent: ['Googlebot', 'Googlebot-Image'],
        allow: [
          '/',
          '/favicon.ico',
          '/favicon-*.png',
          '/icon-*.png',
          '/apple-touch-icon.png',
          '/brand/*',
          '/manifest.json',
          '/manifest.webmanifest',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
