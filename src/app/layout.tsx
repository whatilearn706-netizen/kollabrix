import type { Metadata, Viewport } from 'next';
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
import { MandatoryOnboardingModal } from '@/components/profile/MandatoryOnboardingModal';
import { KollabrixQuickDock } from '@/components/navigation/KollabrixQuickDock';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
// Lazy‑load Vercel analytics and SpeedInsights to avoid blocking first paint
import dynamic from 'next/dynamic';
const Analytics = dynamic(() => import('@vercel/analytics/next').then(mod => mod.Analytics), { ssr: false });
const SpeedInsights = dynamic(() => import('@vercel/speed-insights/next').then(mod => mod.SpeedInsights), { ssr: false });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kollabrix.in';

export const viewport: Viewport = {
  themeColor: '#FF7A00',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Kollabrix — Collegiate Hackathon Teams, Project Collaboration & Competitive Practice',
    template: '%s | Kollabrix',
  },
  description:
    'Kollabrix is the official student innovation network to discover collegiate projects, assemble hackathon dream teams, compete in proctored competitive practice arenas, and build game-changing engineering portfolios.',
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
  authors: [{ name: 'Mayank Goyal', url: 'https://github.com/goyalmayank142-pixel' }, { name: 'Kollabrix' }],
  creator: 'Mayank Goyal',
  publisher: 'Kollabrix Technologies',
  applicationName: 'Kollabrix',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: `${siteUrl}/`,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'Kollabrix — Collegiate Hackathon Teams, Project Collaboration & Competitive Practice',
    description:
      'Kollabrix is the student innovation network to discover collegiate projects, assemble hackathon dream teams, showcase engineering portfolios, and solve campus challenges together.',
    siteName: 'Kollabrix',
    images: [
      {
        url: `${siteUrl}/icon-512.png`,
        width: 512,
        height: 512,
        alt: 'Kollabrix Official Emblem',
      },
      {
        url: `${siteUrl}/brand/kollabrix-logo.min.svg`,
        width: 380,
        height: 380,
        alt: 'Kollabrix Brand Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kollabrix — Collegiate Hackathon Teams, Project Collaboration & Competitive Practice',
    description:
      'Kollabrix is the student innovation network to discover collegiate projects, assemble hackathon dream teams, showcase engineering portfolios, and solve campus challenges together.',
    images: [`${siteUrl}/icon-512.png`],
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
      '@id': `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: 'Kollabrix',
      alternateName: ['KOLLABRIX', 'kollabrix.in', 'www.kollabrix.in', 'KOLLΛBRIX'],
      description: 'Kollabrix — Collegiate Hackathon Teams, Project Collaboration & Competitive Practice',
      inLanguage: 'en-US',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/explore?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
    },
    {
      '@type': 'WebApplication',
      '@id': `${siteUrl}/#app`,
      name: 'Kollabrix',
      alternateName: ['KOLLABRIX', 'KOLLΛBRIX'],
      applicationCategory: 'EducationalApplication, DeveloperApplication, CollaborationPlatform',
      operatingSystem: 'All Modern Web Browsers, iOS, Android, macOS, Windows',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      url: siteUrl,
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
      '@id': `${siteUrl}/#sitelinks`,
      name: 'Kollabrix Sitelinks',
      itemListElement: [
        {
          '@type': 'SiteNavigationElement',
          position: 1,
          name: 'Explore Projects',
          description: 'Discover active collegiate engineering projects seeking collaborators.',
          url: `${siteUrl}/explore`,
        },
        {
          '@type': 'SiteNavigationElement',
          position: 2,
          name: 'Find Teammates',
          description: 'Connect with university designers, coders, and builders.',
          url: `${siteUrl}/teammates`,
        },
        {
          '@type': 'SiteNavigationElement',
          position: 3,
          name: 'Hackathon Arena',
          description: 'Join campus hackathons and build in private collaborative workspaces.',
          url: `${siteUrl}/hackathons`,
        },
        {
          '@type': 'SiteNavigationElement',
          position: 4,
          name: 'Problem Bank',
          description: 'Solve real-world challenges curated by faculty and industry mentors.',
          url: `${siteUrl}/problems`,
        },
      ],
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Kollabrix',
      legalName: 'Kollabrix Technologies',
      alternateName: ['KOLLABRIX', 'KOLLΛBRIX', 'Kollabrix India', 'kollabrix.in'],
      url: `${siteUrl}/`,
      foundingDate: '2024',
      founder: {
        '@type': 'Person',
        name: 'Mayank Goyal',
        url: 'https://github.com/goyalmayank142-pixel',
      },
      disambiguatingDescription:
        'Kollabrix (kollabrix.in) is an Indian collegiate developer collaboration network and real-time coding arena founded by Mayank Goyal, independent of any European educational software.',
      description:
        'Kollabrix is the premier collegiate hackathon network, ICPC competitive arena, and student engineering collaboration platform founded by Mayank Goyal.',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
      },
      knowsAbout: [
        'Collegiate Hackathons',
        'ICPC Competitive Programming',
        'Developer Collaboration',
        'Student Engineering Portfolios',
        'Peer Coding Battles',
      ],
      logo: {
        '@type': 'ImageObject',
        '@id': `${siteUrl}/#logo`,
        url: `${siteUrl}/icon-512.png`,
        caption: 'Kollabrix Official Dual Ascent Aerospace Emblem',
        inLanguage: 'en-US',
        width: 512,
        height: 512,
      },
      image: `${siteUrl}/icon-512.png`,
      sameAs: [
        siteUrl,
        'https://kollabrix.in',
        'https://github.com/goyalmayank142-pixel/kollabrix',
      ],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteUrl}/#application`,
      name: 'Kollabrix',
      alternateName: ['KOLLABRIX', 'KOLLΛBRIX'],
      operatingSystem: 'All Modern Web Browsers',
      applicationCategory: 'DeveloperApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      headline: 'Collegiate Hackathon Teams, 1v1 Battle Arena & Project Collaboration Platform',
      description:
        'Kollabrix (kollabrix.in) is the official Indian collegiate developer collaboration network, real-time 1v1/2v2 Battle Arena, and campus hackathon builder founded by Mayank Goyal. It is independent of and distinct from historical European educational course syllabus software.',
      featureList: [
        'Collegiate Hackathon Team Builder & Private Workspace',
        'Real-time 1v1 & 2v2 Battle Arena Code Duels with Zero-Latency WebSockets',
        'ICPC Contest Proctoring with WebRTC Live Camera & Screen Feeds',
        'Student Engineering Project Workspaces & Task Kanban',
        'Faculty Challenge Problem Statements & Student Solutions',
      ],
      author: {
        '@id': `${siteUrl}/#organization`,
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Kollabrix?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Kollabrix (kollabrix.in) is an Indian collegiate developer network and real-time coding platform founded by Mayank Goyal. It connects university students to build hackathon teams, collaborate in real-time project workspaces, compete in 1v1 Battle Arena code duels, and participate in proctored ICPC contests.',
          },
        },
        {
          '@type': 'Question',
          name: 'Who founded Kollabrix?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Kollabrix was founded in India by Mayank Goyal as a dedicated student innovation network and collegiate coding battle arena.',
          },
        },
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
    <html lang="en" className="dark" style={{ colorScheme: 'dark', backgroundColor: '#090B10' }}>
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="Kollabrix" />
        <meta name="apple-mobile-web-app-title" content="Kollabrix" />
        <meta name="site_name" content="Kollabrix" />
        <meta property="og:site_name" content="Kollabrix" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#090B10] text-slate-100 flex flex-col antialiased selection:bg-amber-500/25 selection:text-amber-950 relative overflow-x-hidden">
        <AuthProvider>
          <AnalyticsProvider>
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
                  <MandatoryOnboardingModal />
                  <KollabrixQuickDock />
                </MaintenanceModeGate>
              </RestrictedWordsGuard>
            </SiteThemeProvider>
          </AnalyticsProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
