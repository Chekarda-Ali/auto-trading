import { auth } from '@clerk/nextjs/server';
import { checkSubscription } from '@/lib/subscription';
import { redirect } from 'next/navigation';
import { LandingPricing } from '@/components/landing/pricing';
import { LandingNavbar } from '@/components/landing/navbar';
import { LandingFooter } from '@/components/landing/footer';

export default async function PricingPage() {
  const { userId } = await auth();
  
  if (userId) {
    const subscription = await checkSubscription(userId);
    
    // If user has active subscription, redirect to dashboard
    if (subscription.isActive) {
      redirect('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <LandingNavbar />
      <div className="pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Start with a free trial, then upgrade to unlock all features.
              Cancel anytime.
            </p>
          </div>
          <LandingPricing />
          <div className="mt-12 max-w-3xl mx-auto bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Need Help?</h2>
            <p className="text-gray-400 mb-4">
              If you're an admin (alichekarda21@gmail.com), you have full access to all features without subscription.
            </p>
            <p className="text-gray-400">
              For other users, you'll need an active subscription to access the dashboard features.
              Contact support if you have any questions.
            </p>
          </div>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
}