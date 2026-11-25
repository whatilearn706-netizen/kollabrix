import { LandingHero } from '@/components/landing/Hero';
import { FloatingProjectRibbon } from '@/components/landing/FloatingProjectRibbon';
import { HangingHackathonPasses } from '@/components/landing/HangingHackathonPasses';
import { LandingFeatures } from '@/components/landing/FeaturesBento';
import { LandingStats } from '@/components/landing/StatsSection';
import { LandingCTA } from '@/components/landing/CTASection';

export default function HomePage() {
  return (
    <div className="dark bg-black text-slate-100 min-h-screen">
      <LandingHero />
      <FloatingProjectRibbon />
      <HangingHackathonPasses />
      <LandingFeatures />
      <LandingStats />
      <LandingCTA />
    </div>
  );
}
