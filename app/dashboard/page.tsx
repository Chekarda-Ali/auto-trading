import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { checkSubscription } from '@/lib/subscription';
import { DashboardLayout } from '@/components/dashboard/layout';
import { DashboardOverview } from '@/components/dashboard/overview';

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const subscription = await checkSubscription(userId);
  
  // Show subscription status message if not active
  if (!subscription.isActive) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-2">Subscription Required</h2>
            <p className="text-gray-300 mb-4">
              Your subscription is not active. To continue using ArbitrageBot Pro features,
              please subscribe to one of our plans.
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Plans & Upgrade
            </a>
          </div>
          <DashboardOverview />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
}