import type { Metadata } from 'next';
import { KA_METADATA_ICONS, KOLLABRIX_ORIGIN } from '@/lib/kaBrandDomains';

export const metadata: Metadata = {
  title: {
    absolute: 'KΛ FOLIO Library & Guided Tracks',
  },
  description:
    'Interactive KΛ FOLIO (KA Folio) learning studio: Java, C++, Python, Next.js & DSA step tracks, 12 coding classics, and live sandbox.',
  applicationName: 'KΛ FOLIO',
  icons: KA_METADATA_ICONS,
  authors: [{ name: 'Kollabrix', url: KOLLABRIX_ORIGIN }],
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
