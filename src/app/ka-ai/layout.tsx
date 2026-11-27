import type { Metadata } from 'next';
import { headers } from 'next/headers';
import {
  KA_AI_ORIGIN,
  KA_FOLIO_ORIGIN,
  KA_METADATA_ICONS,
  KOLLABRIX_ORIGIN,
  getKaSubdomainFromHost,
} from '@/lib/kaBrandDomains';

function getKaAiRequestOrigin(): { origin: string; isSubdomain: boolean } {
  try {
    const hdrs = headers();
    const rawHost = hdrs.get('x-forwarded-host') || hdrs.get('host') || '';
    const sub = getKaSubdomainFromHost(rawHost);
    if (sub === 'ai') {
      return { origin: KA_AI_ORIGIN, isSubdomain: true };
    }
  } catch {}
  return { origin: KOLLABRIX_ORIGIN, isSubdomain: false };
}

export async function generateMetadata(): Promise<Metadata> {
  const { origin, isSubdomain } = getKaAiRequestOrigin();
  const canonicalUrl = isSubdomain ? `${KA_AI_ORIGIN}/` : `${KOLLABRIX_ORIGIN}/ka-ai`;

  return {
    metadataBase: new URL(origin),
    title: {
      absolute: 'KΛ ΛI (KA AI) — Engineering Copilot & Code Studio | Built by Kollabrix',
      template: '%s | KΛ ΛI',
    },
    description:
      'Build smarter, faster, better with KΛ ΛI (KA AI). Code sandbox, DSA & placement coach, repo audits, and hackathon MVP blueprints—built by Kollabrix.',
    keywords: [
      'KΛ ΛI',
      'KA AI',
      'KA',
      'KA Studio',
      'KA by Kollabrix',
      'AI coding copilot',
      'DSA coach',
      'hackathon MVP architect',
      'Kollabrix',
    ],
    applicationName: 'KΛ ΛI',
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
      siteName: 'KΛ ΛI',
      title: 'KΛ ΛI (KA AI) — Build Smarter, Faster, Better',
      description:
        'Autonomous AI engineering copilot, sandbox code runner, and DSA placement coach by Kollabrix.',
      images: [
        {
          url: `${origin}/ka-icon-512.png`,
          width: 512,
          height: 512,
          alt: 'KΛ ΛI Official Brand Mark',
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: 'KΛ ΛI (KA AI) — Built by Kollabrix',
      description:
        'AI code sandbox, DSA & placement coach, and repo audits by Kollabrix.',
      images: [`${origin}/ka-icon-512.png`],
    },
  };
}

export default function KaAiLayout({ children }: { children: React.ReactNode }) {
  const { origin, isSubdomain } = getKaAiRequestOrigin();
  const pageUrl = isSubdomain ? `${KA_AI_ORIGIN}/` : `${KOLLABRIX_ORIGIN}/ka-ai`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${KA_AI_ORIGIN}/#website`,
        name: 'KΛ ΛI',
        alternateName: ['KA AI', 'KA', 'KΛ Studio'],
        url: pageUrl,
        publisher: {
          '@type': 'Organization',
          name: 'Kollabrix',
          url: KOLLABRIX_ORIGIN,
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${KA_AI_ORIGIN}/#app`,
        name: 'KΛ ΛI',
        alternateName: ['KA AI', 'KA Copilot'],
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web',
        url: pageUrl,
        image: `${origin}/ka-icon-512.png`,
        logo: `${origin}/ka-icon-512.png`,
        description:
          'Build smarter, faster, better with KΛ ΛI (KA AI) — live Python/C++/JS code sandbox, DSA coach, and hackathon blueprints built by Kollabrix.',
        creator: {
          '@type': 'Organization',
          name: 'Kollabrix',
          url: KOLLABRIX_ORIGIN,
        },
        sameAs: [KA_AI_ORIGIN, KA_FOLIO_ORIGIN, KOLLABRIX_ORIGIN],
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
        },
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
