import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '../../../components/dashboard/layout';
import { ExchangeManager } from '../../../components/dashboard/exchange-manager';
import { checkSubscription } from '../../../lib/subscription';

export default async function ExchangesPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const subscription = await checkSubscription(userId);
  
  if (!subscription.isActive) {
    redirect('/pricing');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exchange Connections</h1>
          <p className="text-muted-foreground">
            Securely connect your exchange accounts to enable automated trading.
          </p>
        </div>
        <ExchangeManager />
      </div>
    </DashboardLayout>
  );
}