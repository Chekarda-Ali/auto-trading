import { LandingHero } from '@/components/landing/hero';
import { LandingFeatures } from '@/components/landing/features';
import { LandingPricing } from '@/components/landing/pricing';
import LandingTestimonials from '@/components/landing/testimonials';
import { LandingFAQ } from '@/components/landing/faq';
import { LandingFooter } from '@/components/landing/footer';
import { LandingNavbar } from '@/components/landing/navbar';
import { auth } from '@clerk/nextjs/server';
import { checkSubscription } from '@/lib/subscription';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const { userId } = await auth();
  
  // If user is logged in, check their subscription status
  if (userId) {
    const subscription = await checkSubscription(userId);
    
    // Only redirect to dashboard if they have active subscription
    // OR if they're admin (admins don't need subscription)
    if (subscription.isActive) {
      redirect('/dashboard');
    }
    // If they don't have active subscription, let them stay on landing page
    // to see pricing and upgrade options
  }

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