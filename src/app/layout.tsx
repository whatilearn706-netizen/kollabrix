import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SetupBanner } from '@/components/layout/SetupBanner';
import { AuthModal } from '@/components/auth/AuthModal';

import { SiteThemeProvider } from '@/components/theme/SiteThemeProvider';
import { GlobalBroadcastBanner } from '@/components/layout/GlobalBroadcastBanner';
import { GlobalHotPatchInjector } from '@/components/common/GlobalHotPatchInjector';
import { MaintenanceModeGate } from '@/components/common/MaintenanceModeGate';
import { RestrictedWordsGuard } from '@/components/moderation/RestrictedWordsGuard';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://linkora-link.online';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Linkora — Student Project Collaboration & Hackathon Platform',
    template: '%s | Linkora',
  },
  description:
    'Linkora is the student collaboration network to discover collegiate projects, assemble hackathon dream teams, showcase engineering portfolios, and solve campus challenges together.',
  keywords: [
    'Linkora',
    'linkora',
    'LinkOra',
    'linkora online',
    'linkora platform',
    'linkora project collaboration',
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
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/brand/linkora-logo.png', sizes: '1024x1024', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'Linkora — Student Project Collaboration & Hackathon Platform',
    description:
      'Linkora is the student collaboration network to discover collegiate projects, assemble hackathon dream teams, showcase engineering portfolios, and solve campus challenges together.',
    siteName: 'Linkora',
    images: [
      {
        url: `${siteUrl}/brand/linkora-logo.png`,
        width: 1024,
        height: 1024,
        alt: 'Linkora Brand Logo',
      },
      {
        url: `${siteUrl}/icon-512.png`,
        width: 512,
        height: 512,
        alt: 'Linkora Icon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linkora — Student Project Collaboration & Hackathon Platform',
    description:
      'Linkora is the student collaboration network to discover collegiate projects, assemble hackathon dream teams, showcase engineering portfolios, and solve campus challenges together.',
    images: [`${siteUrl}/brand/linkora-logo.png`],
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
      '_9e80URLBq4PkCGyKTfFe_xXUFATPCms4P4zxPGcJk4',
      '9xu7ptCM7RZND-4JzerULVadJwY6Byl2-IJYvnmtJRQ',
      'h7QRxMIPeARrCxq-9QyCR-EFofiKAIAyjxwE_xWnF7c',
    ],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://linkora-link.online/#website',
      url: 'https://linkora-link.online/',
      name: 'Linkora',
      alternateName: ['LinkOra'],
      description: 'College-Wide Student Project Collaboration & Hackathon Platform',
      inLanguage: 'en-US',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://linkora-link.online/explore?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
      publisher: {
        '@id': 'https://linkora-link.online/#organization',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://linkora-link.online/#app',
      name: 'Linkora',
      alternateName: ['LinkOra', 'Linkora Platform'],
      applicationCategory: 'EducationalApplication, DeveloperApplication, CollaborationPlatform',
      operatingSystem: 'All Modern Web Browsers, iOS, Android, macOS, Windows',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      url: 'https://linkora-link.online',
      description:
        'Linkora is the official student project collaboration network, real-time workspace huddle, and hackathon closer platform.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Universal Prototyping Canvas for Figma and Canva',
        'In-Browser Team Voice Huddle',
        'AI GitHub README and Pitch Deck Generator',
        'Daily Build Streak Gamification',
        'Cryptographically Verified Proof-of-Work Certificates',
      ],
    },
    {
      '@type': 'ItemList',
      '@id': 'https://linkora-link.online/#sitelinks',
      name: 'Linkora Sitelinks',
      itemListElement: [
        {
          '@type': 'SiteNavigationElement',
          position: 1,
          name: 'Explore Projects',
          description: 'Discover active collegiate engineering projects seeking collaborators.',
          url: 'https://linkora-link.online/explore',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 2,
          name: 'Find Teammates',
          description: 'Connect with university designers, coders, and builders.',
          url: 'https://linkora-link.online/teammates',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 3,
          name: 'Hackathon Arena',
          description: 'Join campus hackathons and build in private collaborative workspaces.',
          url: 'https://linkora-link.online/hackathons',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 4,
          name: 'Problem Bank',
          description: 'Solve real-world challenges curated by faculty and industry mentors.',
          url: 'https://linkora-link.online/problems',
        },
      ],
    },
    {
      '@type': 'Organization',
      '@id': 'https://linkora-link.online/#organization',
      name: 'Linkora',
      alternateName: ['LinkOra'],
      url: 'https://linkora-link.online/',
      logo: {
        '@type': 'ImageObject',
        '@id': 'https://linkora-link.online/#logo',
        url: 'https://linkora-link.online/brand/linkora-logo.png',
        caption: 'Linkora Logo',
        inLanguage: 'en-US',
        width: 1024,
        height: 1024,
      },
      image: 'https://linkora-link.online/brand/linkora-logo.png',
      sameAs: [
        'https://linkora-link.online',
        'https://linkora.in',
        'https://github.com/goyalmayank142-pixel/LinkOra',
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://bmiwmlfraaridbekuily.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://bmiwmlfraaridbekuily.supabase.co" />
        <meta name="google-site-verification" content="_9e80URLBq4PkCGyKTfFe_xXUFATPCms4P4zxPGcJk4" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="144x144" href="/favicon-144x144.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="application-name" content="Linkora" />
        <meta name="apple-mobile-web-app-title" content="Linkora" />
        <meta name="site_name" content="Linkora" />
        <meta property="og:site_name" content="Linkora" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col antialiased selection:bg-pink-500 selection:text-white">
        <AuthProvider>
          <SiteThemeProvider>
            <RestrictedWordsGuard>
              <GlobalBroadcastBanner />
              <GlobalHotPatchInjector />
              <MaintenanceModeGate>
                <SetupBanner />
                <Navbar />
                <main className="flex-1 flex flex-col">{children}</main>
                <Footer />
                <AuthModal />
              </MaintenanceModeGate>
            </RestrictedWordsGuard>
          </SiteThemeProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
