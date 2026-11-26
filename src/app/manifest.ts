import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kollabrix — Collegiate Hackathon Teams, Project Collaboration & Competitive Practice',
    short_name: 'Kollabrix',
    description:
      'Discover student projects, assemble hackathon dream teams, showcase engineering portfolios, and solve collegiate challenges together.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/kollabrix-icon-48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/kollabrix-icon-96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/kollabrix-icon-144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/kollabrix-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/kollabrix-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
