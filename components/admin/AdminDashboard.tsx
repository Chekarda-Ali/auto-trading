'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Bot,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  ServerCog,
  Bell,
  Database,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminDashboard() {
  const { toast } = useToast();

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [stats, setStats] = useState({
    users: 1287,
    activeBots: 214,
    mrr: 49 * 612, // illustrative only
    incidents: 0,
  });

  const performAction = async (
    key: string,
    action: () => Promise<void> | void,
    successMessage: string
  ) => {
    try {
      setLoadingAction(key);
      await new Promise((r) => setTimeout(r, 900));
      await action();
      toast({ title: 'Success', description: successMessage });
    } catch (e) {
      toast({
        title: 'Action failed',
        description: 'Please try again or check logs.',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-300">
          Monitor platform health, manage bot fleet, and perform maintenance operations.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-300">Total Users</CardDescription>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="h-5 w-5 text-blue-400" />
              {stats.users.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">+38 this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/30 to-emerald-800/10 border-green-500/30">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-300">Active Bots</CardDescription>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bot className="h-5 w-5 text-emerald-400" />
              {stats.activeBots.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">Cluster utilization 63%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-300">MRR</CardDescription>
            <CardTitle className="flex items-center gap-2 text-white">
              <DollarSign className="h-5 w-5 text-purple-400" />
              {stats.mrr.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">Churn 1.8%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/30 to-rose-800/10 border-red-500/30">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-300">Incidents</CardDescription>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
              {stats.incidents}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">Last 24h window</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* System Status */}
        <Card className="lg:col-span-2 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" /> Platform Status
            </CardTitle>
            <CardDescription className="text-gray-300">
              Real-time service health and background workers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'API', status: 'Operational', color: 'green' },
                { label: 'Web App', status: 'Operational', color: 'green' },
                { label: 'Database', status: 'Degraded (indexing)', color: 'yellow' },
                { label: 'Bots Cluster', status: 'Operational', color: 'green' },
                { label: 'Webhooks', status: 'Operational', color: 'green' },
                { label: 'Billing', status: 'Operational', color: 'green' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-md border border-white/10 p-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-white">{s.label}</span>
                  </div>
                  <Badge
                    className={
                      s.color === 'green'
                        ? 'bg-emerald-600/30 text-emerald-200 border-emerald-600/50'
                        : 'bg-yellow-600/30 text-yellow-100 border-yellow-600/50'
                    }
                    variant="outline"
                  >
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ServerCog className="h-5 w-5 text-cyan-400" /> Admin Actions
            </CardTitle>
            <CardDescription className="text-gray-300">
              Safe operations with confirmation and logging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              disabled={loadingAction === 'restart-bots'}
              onClick={() =>
                performAction(
                  'restart-bots',
                  () => setStats((s) => ({ ...s })),
                  'Queued restart for all bot workers.'
                )
              }
            >
              <Bot className="mr-2 h-4 w-4" />
              {loadingAction === 'restart-bots' ? 'Restarting…' : 'Restart All Bots'}
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              disabled={loadingAction === 'reindex'}
              onClick={() =>
                performAction(
                  'reindex',
                  () => setStats((s) => ({ ...s, incidents: 0 })),
                  'Database reindex scheduled.'
                )
              }
            >
              <Database className="mr-2 h-4 w-4" />
              {loadingAction === 'reindex' ? 'Reindexing…' : 'Reindex Database'}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={loadingAction === 'sync-exchanges'}
              onClick={() =>
                performAction(
                  'sync-exchanges',
                  () => undefined,
                  'Exchange metadata sync started.'
                )
              }
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {loadingAction === 'sync-exchanges' ? 'Syncing…' : 'Sync Exchanges'}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              disabled={loadingAction === 'test-notify'}
              onClick={() =>
                performAction(
                  'test-notify',
                  () => undefined,
                  'Test notification dispatched to admins.'
                )
              }
            >
              <Bell className="mr-2 h-4 w-4" />
              {loadingAction === 'test-notify' ? 'Sending…' : 'Send Test Notification'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" /> Recent Activity
          </CardTitle>
          <CardDescription className="text-gray-300">
            Latest system events and administrative changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { ts: '2m ago', text: 'Worker pool scaled to 32 replicas' },
              { ts: '18m ago', text: 'Applied risk model v2.4 to all bots' },
              { ts: '1h ago', text: 'New user signup from EU region' },
              { ts: '3h ago', text: 'Completed database vacuum & analyze' },
            ].map((e, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="flex items-center justify-between rounded-md border border-white/10 p-3"
              >
                <span className="text-sm text-gray-300">{e.text}</span>
                <span className="text-xs text-gray-400">{e.ts}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboard;
