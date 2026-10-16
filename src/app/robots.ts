import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://teamforge-pink.vercel.app';

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
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
