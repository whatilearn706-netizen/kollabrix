import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SetupBanner } from '@/components/layout/SetupBanner';
import { AuthModal } from '@/components/auth/AuthModal';

import { SiteThemeProvider } from '@/components/theme/SiteThemeProvider';

export const metadata: Metadata = {
  title: 'Linkora — College-Wide Student Project Collaboration Platform',
  description:
    'Discover project ideas, meet people who complement your skills, and build meaningful software projects together.',
  keywords: [
    'student projects',
    'college collaboration',
    'hackathon teams',
    'developer platform',
    'student portfolio',
  ],
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
            <SetupBanner />
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
            <AuthModal />
          </SiteThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
