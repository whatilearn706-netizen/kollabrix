import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SetupBanner } from '@/components/layout/SetupBanner';
import { AuthModal } from '@/components/auth/AuthModal';

import { SiteThemeProvider } from '@/components/theme/SiteThemeProvider';
import { GlobalLightRays } from '@/components/layout/GlobalLightRays';
import { GlobalBroadcastBanner } from '@/components/layout/GlobalBroadcastBanner';
import { GlobalHotPatchInjector } from '@/components/common/GlobalHotPatchInjector';
import { MaintenanceModeGate } from '@/components/common/MaintenanceModeGate';
import { RestrictedWordsGuard } from '@/components/moderation/RestrictedWordsGuard';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { KollabrixQuickDock } from '@/components/navigation/KollabrixQuickDock';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kollabrix.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Kollabrix — Collegiate Hackathon Teams, Project Collaboration & ICPC Arena',
    template: '%s | Kollabrix',
  },
  description:
    'Kollabrix is the official student innovation network to discover collegiate projects, assemble hackathon dream teams, compete in proctored ICPC arenas, and build game-changing engineering portfolios.',
  keywords: [
    'Kollabrix',
    'kollabrix',
    'Kollabrix platform',
    'kollabrix collegiate network',
    'kollabrix.com',
    'kollabrix.in',
    'kollabrix online',
    'Linkora',
    'student projects',
    'college collaboration',
    'hackathon teams',
    'developer platform',
    'student portfolio',
    'ICPC contest arena',
    'university software development',
  ],
  authors: [{ name: 'Kollabrix Team' }],
  creator: 'Kollabrix',
  publisher: 'Kollabrix',
  applicationName: 'Kollabrix',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/brand/kollabrix-logo.svg', type: 'image/svg+xml' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/brand/kollabrix-logo.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: `${siteUrl}/`,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'Kollabrix — Collegiate Hackathon Teams, Project Collaboration & ICPC Arena',
    description:
      'Kollabrix is the student innovation network to discover collegiate projects, assemble hackathon dream teams, showcase engineering portfolios, and solve campus challenges together.',
    siteName: 'Kollabrix',
    images: [
      {
        url: `${siteUrl}/brand/kollabrix-logo.svg`,
        width: 1024,
        height: 1024,
        alt: 'Kollabrix Brand Logo',
      },
      {
        url: `${siteUrl}/icon-512.png`,
        width: 512,
        height: 512,
        alt: 'Kollabrix Icon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kollabrix — Collegiate Hackathon Teams, Project Collaboration & ICPC Arena',
    description:
      'Kollabrix is the student innovation network to discover collegiate projects, assemble hackathon dream teams, showcase engineering portfolios, and solve campus challenges together.',
    images: [`${siteUrl}/brand/kollabrix-logo.svg`],
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
      'wm68NYFDShG-kXFb2jCPuUuSNRoOvIMk1ufsUt8Ih6s',
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
      '@id': 'https://kollabrix.in/#website',
      url: 'https://kollabrix.in/',
      name: 'Kollabrix',
      alternateName: ['Kollabrix', 'kollabrix.in', 'Kollabrix India', 'Kollabrix Platform', 'kollabrix.online', 'Linkora'],
      description: 'Kollabrix — Collegiate Hackathon Teams, Project Collaboration & ICPC Arena',
      inLanguage: 'en-US',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://kollabrix.in/explore?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
      publisher: {
        '@id': 'https://kollabrix.in/#organization',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://kollabrix.in/#app',
      name: 'Kollabrix',
      alternateName: ['Kollabrix Platform', 'kollabrix.in', 'Kollabrix India'],
      applicationCategory: 'EducationalApplication, DeveloperApplication, CollaborationPlatform',
      operatingSystem: 'All Modern Web Browsers, iOS, Android, macOS, Windows',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      url: 'https://kollabrix.in',
      description:
        'Kollabrix is the official student project collaboration network, real-time workspace huddle, and hackathon closer platform.',
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
      '@id': 'https://kollabrix.in/#sitelinks',
      name: 'Kollabrix Sitelinks',
      itemListElement: [
        {
          '@type': 'SiteNavigationElement',
          position: 1,
          name: 'Explore Projects',
          description: 'Discover active collegiate engineering projects seeking collaborators.',
          url: 'https://kollabrix.in/explore',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 2,
          name: 'Find Teammates',
          description: 'Connect with university designers, coders, and builders.',
          url: 'https://kollabrix.in/teammates',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 3,
          name: 'Hackathon Arena',
          description: 'Join campus hackathons and build in private collaborative workspaces.',
          url: 'https://kollabrix.in/hackathons',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 4,
          name: 'Problem Bank',
          description: 'Solve real-world challenges curated by faculty and industry mentors.',
          url: 'https://kollabrix.in/problems',
        },
      ],
    },
    {
      '@type': 'Organization',
      '@id': 'https://kollabrix.in/#organization',
      name: 'Kollabrix',
      alternateName: ['Kollabrix Platform', 'kollabrix.in', 'Linkora'],
      url: 'https://kollabrix.in/',
      logo: {
        '@type': 'ImageObject',
        '@id': 'https://kollabrix.in/#logo',
        url: 'https://kollabrix.in/brand/kollabrix-logo.png',
        caption: 'Kollabrix Logo',
        inLanguage: 'en-US',
        width: 1024,
        height: 1024,
      },
      image: 'https://kollabrix.in/brand/kollabrix-logo.png',
      sameAs: [
        'https://kollabrix.in',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
        />
        <link rel="preconnect" href="https://bmiwmlfraaridbekuily.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://bmiwmlfraaridbekuily.supabase.co" />
        <meta name="google-site-verification" content="wm68NYFDShG-kXFb2jCPuUuSNRoOvIMk1ufsUt8Ih6s" />
        <meta name="google-site-verification" content="_9e80URLBq4PkCGyKTfFe_xXUFATPCms4P4zxPGcJk4" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="144x144" href="/favicon-144x144.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="application-name" content="Kollabrix" />
        <meta name="apple-mobile-web-app-title" content="Kollabrix" />
        <meta name="site_name" content="Kollabrix" />
        <meta property="og:site_name" content="Kollabrix" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col antialiased selection:bg-amber-500/25 selection:text-amber-950 relative">
        <AuthProvider>
          <SiteThemeProvider>
            <GlobalLightRays />
            <RestrictedWordsGuard>
              <GlobalBroadcastBanner />
              <GlobalHotPatchInjector />
              <MaintenanceModeGate>
                <SetupBanner />
                <Navbar />
                <main className="flex-1 flex flex-col relative z-[1]">{children}</main>
                <Footer />
                <AuthModal />
                <FeedbackModal />
                <KollabrixQuickDock />
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
