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
  applicationName: 'Linkora',
  icons: {
    icon: [
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/brand/linkora-logo.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon-48x48.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Linkora',
  alternateName: ['Linkora Edu', 'Linkora Platform', 'LinkOra'],
  url: 'https://linkora-edu.online/',
  publisher: {
    '@type': 'Organization',
    name: 'Linkora',
    url: 'https://linkora-edu.online',
    logo: {
      '@type': 'ImageObject',
      url: 'https://linkora-edu.online/brand/linkora-logo.png',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="application-name" content="Linkora" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
