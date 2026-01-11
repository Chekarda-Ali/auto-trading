'use client';

import { DashboardLayout } from '@/components/dashboard/layout';

export default function BillingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information.
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <p className="text-gray-400">Coming soon</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
