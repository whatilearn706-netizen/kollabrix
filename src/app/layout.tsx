import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SetupBanner } from '@/components/layout/SetupBanner';
import { AuthModal } from '@/components/auth/AuthModal';

export const metadata: Metadata = {
  title: 'TeamForge — College-Wide Student Project Collaboration Platform',
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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col antialiased selection:bg-brand-500/30 selection:text-brand-200">
        <AuthProvider>
          <SetupBanner />
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
