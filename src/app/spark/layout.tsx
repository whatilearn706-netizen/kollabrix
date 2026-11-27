import type { Metadata } from 'next';
import { KA_METADATA_ICONS, KOLLABRIX_ORIGIN } from '@/lib/kaBrandDomains';

export const metadata: Metadata = {
  title: {
    absolute: 'KΛ ΛI Workspace — AI Engineering Studio',
  },
  description:
    'Interactive KΛ ΛI (KA AI) copilot workspace: run Python/C++/JS in sandbox, architect MVPs, and prep DSA rounds.',
  applicationName: 'KΛ ΛI',
  icons: KA_METADATA_ICONS,
  authors: [{ name: 'Kollabrix', url: KOLLABRIX_ORIGIN }],
};

export default function SparkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
