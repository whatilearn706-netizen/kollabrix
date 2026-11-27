import type { Metadata } from 'next';
import { headers } from 'next/headers';
import {
  KA_AI_ORIGIN,
  KA_FOLIO_ORIGIN,
  KA_METADATA_ICONS,
  KOLLABRIX_ORIGIN,
  getKaSubdomainFromHost,
} from '@/lib/kaBrandDomains';

function getKaFolioRequestOrigin(): { origin: string; isSubdomain: boolean } {
  try {
    const hdrs = headers();
    const rawHost = hdrs.get('x-forwarded-host') || hdrs.get('host') || '';
    const sub = getKaSubdomainFromHost(rawHost);
    if (sub === 'folio') {
      return { origin: KA_FOLIO_ORIGIN, isSubdomain: true };
    }
  } catch {}
  return { origin: KOLLABRIX_ORIGIN, isSubdomain: false };
}

export async function generateMetadata(): Promise<Metadata> {
  const { origin, isSubdomain } = getKaFolioRequestOrigin();
  const canonicalUrl = isSubdomain ? `${KA_FOLIO_ORIGIN}/` : `${KOLLABRIX_ORIGIN}/ka-codex`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: 'KΛ FOLIO (KA Folio) — 12 Coding Classics & Guided Tracks | Built by Kollabrix',
      template: '%s | KΛ FOLIO',
    },
    description:
      'Dark-luxury computer science library featuring 12 iconic engineering volumes, language video tracks, and interactive coding sandboxes—built by Kollabrix.',
    keywords: [
      'KΛ FOLIO',
      'KA Folio',
      'KA',
      'KA Codex',
      'KA Library',
      'programming books',
      'systems design classics',
      'DSA playbooks',
      'Kollabrix',
    ],
    applicationName: 'KΛ FOLIO',
    authors: [{ name: 'Kollabrix Technologies', url: KOLLABRIX_ORIGIN }],
    creator: 'Kollabrix',
    publisher: 'Kollabrix Technologies',
    icons: KA_METADATA_ICONS,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      siteName: 'KΛ FOLIO',
      title: 'KΛ FOLIO (KA Folio) — Twelve Iconic Coding Volumes & Tracks',
      description:
        'Explore 12 foundational computer science volumes and interactive language mastery tracks, built by Kollabrix.',
      images: [
        {
          url: `${origin}/ka-icon-512.png`,
          width: 512,
          height: 512,
          alt: 'KΛ FOLIO Official Brand Mark',
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: 'KΛ FOLIO (KA Folio) — Built by Kollabrix',
      description:
        '12 foundational software engineering volumes and guided step workspaces by Kollabrix.',
      images: [`${origin}/ka-icon-512.png`],
    },
  };
}

export default function KaFolioLayout({ children }: { children: React.ReactNode }) {
  const { origin, isSubdomain } = getKaFolioRequestOrigin();
  const pageUrl = isSubdomain ? `${KA_FOLIO_ORIGIN}/` : `${KOLLABRIX_ORIGIN}/ka-codex`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${KA_FOLIO_ORIGIN}/#website`,
        name: 'KΛ FOLIO',
        alternateName: ['KA Folio', 'KA', 'KA Codex'],
        url: pageUrl,
        publisher: {
          '@type': 'Organization',
          name: 'Kollabrix',
          url: KOLLABRIX_ORIGIN,
        },
      },
      {
        '@type': 'CollectionPage',
        '@id': `${KA_FOLIO_ORIGIN}/#collection`,
        name: 'KΛ FOLIO',
        alternateName: ['KA Folio', 'KA Coding Library'],
        url: pageUrl,
        image: `${origin}/ka-icon-512.png`,
        description:
          'Twelve curated computer science classics, interactive video tracks, and runnable sandboxes—built by Kollabrix.',
        creator: {
          '@type': 'Organization',
          name: 'Kollabrix',
          url: KOLLABRIX_ORIGIN,
        },
        sameAs: [KA_FOLIO_ORIGIN, KA_AI_ORIGIN, KOLLABRIX_ORIGIN],
      },
    ],
  };

  return (
    <>
      <style>{`header[data-kollabrix-nav], footer[data-kollabrix-footer] { display: none !important; }`}</style>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
