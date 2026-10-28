import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kollabrix.in';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/control-center',
        '/admin',
        '/api/',
        '/settings/',
        '/my-projects',
        '/my-applications',
        '/notifications',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
