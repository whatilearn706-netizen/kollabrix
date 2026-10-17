import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SetupBanner } from '@/components/layout/SetupBanner';
import { AuthModal } from '@/components/auth/AuthModal';

import { SiteThemeProvider } from '@/components/theme/SiteThemeProvider';
import { GlobalBroadcastBanner } from '@/components/layout/GlobalBroadcastBanner';
import { MaintenanceModeGate } from '@/components/common/MaintenanceModeGate';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://linkora-edu.online';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Linkora — College-Wide Student Project Collaboration Platform',
    template: '%s | Linkora',
  },
  description:
    'Discover student projects, assemble hackathon dream teams, showcase engineering portfolios, and solve collegiate challenges together.',
  keywords: [
    'Linkora',
    'student projects',
    'college collaboration',
    'hackathon teams',
    'developer platform',
    'student portfolio',
    'university software development',
  ],
  authors: [{ name: 'Linkora Team' }],
  creator: 'Linkora',
  publisher: 'Linkora',
  icons: {
    icon: '/brand/linkora-logo.png',
    shortcut: '/brand/linkora-logo.png',
    apple: '/brand/linkora-logo.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'Linkora — College-Wide Student Project Collaboration Platform',
    description:
      'Discover student projects, assemble hackathon dream teams, showcase engineering portfolios, and solve collegiate challenges together.',
    siteName: 'Linkora',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linkora — College-Wide Student Project Collaboration Platform',
    description:
      'Discover student projects, assemble hackathon dream teams, showcase engineering portfolios, and solve collegiate challenges together.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: [
      '9xu7ptCM7RZND-4JzerULVadJwY6Byl2-IJYvnmtJRQ',
      'h7QRxMIPeARrCxq-9QyCR-EFofiKAIAyjxwE_xWnF7c',
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col antialiased selection:bg-pink-500 selection:text-white">
        <AuthProvider>
          <SiteThemeProvider>
            <GlobalBroadcastBanner />
            <MaintenanceModeGate>
              <SetupBanner />
              <Navbar />
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
              <AuthModal />
            </MaintenanceModeGate>
          </SiteThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
