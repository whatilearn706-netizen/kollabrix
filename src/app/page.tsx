import { LandingHero } from '@/components/landing/Hero';
import { LandingFeatures } from '@/components/landing/FeaturesBento';
import { LandingStats } from '@/components/landing/StatsSection';
import { LandingCTA } from '@/components/landing/CTASection';

export default function HomePage() {
  return (
    <>
      <LandingHero />
      <LandingFeatures />
      <LandingStats />
      <LandingCTA />
    </>
  );
}
