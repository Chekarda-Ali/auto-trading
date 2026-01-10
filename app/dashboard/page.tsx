import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { checkSubscription } from '../../lib/subscription';
import { DashboardLayout } from '../../components/dashboard/layout';
import { DashboardOverview } from '../../components/dashboard/overview';

export default async function DashboardPage() {
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
      <DashboardOverview />
    </DashboardLayout>
  );
}