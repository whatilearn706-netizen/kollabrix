import { LandingHero } from '@/components/landing/Hero';
import { LandingFeatures } from '@/components/landing/FeaturesBento';
import { LandingStats } from '@/components/landing/StatsSection';
import { LandingCTA } from '@/components/landing/CTASection';

export default function HomePage() {
  return (
    <div className="dark bg-[#090B10] text-slate-100 min-h-screen">
      <LandingHero />
      <LandingFeatures />
      <LandingStats />
      <LandingCTA />
    </div>
  );
}
