// src/app/page.tsx

import HeroSection from '@/components/tripo/Hero';
import FeaturesSection from '@/components/tripo/Features';
import ShowcaseSection from '@/components/tripo/Showcase';
import FooterSection from '@/components/tripo/Footer';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ShowcaseSection />
      <FooterSection />
    </>
  );
}
