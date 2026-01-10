import { LandingHero } from '@/components/landing/hero';
import { LandingFeatures } from '@/components/landing/features';
import { LandingPricing } from '@/components/landing/pricing';
import LandingTestimonials from '@/components/landing/testimonials';
import { LandingFAQ } from '@/components/landing/faq';
import { LandingFooter } from '@/components/landing/footer';
import { LandingNavbar } from '@/components/landing/navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingPricing />
      <LandingTestimonials />
      <LandingFAQ />
      <LandingFooter />
    </div>
  );
}