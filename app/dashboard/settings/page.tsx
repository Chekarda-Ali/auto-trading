import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { checkSubscription } from '../../../lib/subscription';
import { DashboardLayout } from '../../../components/dashboard/layout';
import SettingsForm from '../../../components/dashboard/settings-form';

export default async function SettingsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Bot Settings</h1>
          <p className="text-muted-foreground">
            Configure your arbitrage bot parameters and risk management settings.
          </p>
        </div>
        <SettingsForm />
      </div>
    </DashboardLayout>
  );
}