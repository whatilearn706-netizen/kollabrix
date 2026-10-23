import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Linkora — College-Wide Student Project Collaboration Platform',
    short_name: 'Linkora',
    description:
      'Discover student projects, assemble hackathon dream teams, showcase engineering portfolios, and solve collegiate challenges together.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#C2410C',
    icons: [
      {
        src: '/favicon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
