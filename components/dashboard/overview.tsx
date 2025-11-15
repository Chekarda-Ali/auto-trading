'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Square, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Settings,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface BotStats {
  isRunning: boolean;
  totalTrades: number;
  successfulTrades: number;
  totalProfit: number;
  todayProfit: number;
  connectedExchanges: number;
  lastTradeTime: string | null;
}

import { ReactNode } from 'react';

interface DashboardOverviewProps {
  children?: ReactNode;
}

export function DashboardOverview({ children }: DashboardOverviewProps) {
  const [botStats, setBotStats] = useState<BotStats>({
    isRunning: false,
    totalTrades: 0,
    successfulTrades: 0,
    totalProfit: 0,
    todayProfit: 0,
    connectedExchanges: 0,
    lastTradeTime: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleToggleBot = async () => {
    setIsLoading(true);
    try {
      const endpoint = botStats.isRunning ? '/api/bot/stop' : '/api/bot/start';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchangeIds: ['binance', 'kucoin'], // Example
          settings: {
            minProfitPercentage: 0.5,
            maxTradeAmount: 100,
            autoTradingMode: true,
            selectedExchanges: ['binance', 'kucoin'],
            riskManagement: {
              maxDailyLoss: 500,
              maxConcurrentTrades: 3,
              stopLossPercentage: 2.0,
            },
          },
        }),
      });

      if (response.ok) {
        setBotStats(prev => ({ ...prev, isRunning: !prev.isRunning }));
      }
    } catch (error) {
      console.error('Error toggling bot:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const successRate = botStats.totalTrades > 0 
    ? (botStats.successfulTrades / botStats.totalTrades) * 100 
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your arbitrage bot performance and manage trading operations.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge 
            variant={botStats.isRunning ? "default" : "secondary"}
            className={cn(
              "px-3 py-1",
              botStats.isRunning ? "bg-green-600" : "bg-gray-600"
            )}
          >
            {botStats.isRunning ? (
              <>
                <Activity className="w-3 h-3 mr-1" />
                Running
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 mr-1" />
                Stopped
              </>
            )}
          </Badge>
          
          <Button
            onClick={handleToggleBot}
            disabled={isLoading}
            className={cn(
              "min-w-[120px]",
              botStats.isRunning 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-green-600 hover:bg-green-700"
            )}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : botStats.isRunning ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop Bot
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Bot
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Profit
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${botStats.totalProfit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                +{botStats.todayProfit.toFixed(2)} today
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Success Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {successRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {botStats.successfulTrades}/{botStats.totalTrades} trades
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Connected Exchanges
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {botStats.connectedExchanges}
              </div>
              <p className="text-xs text-muted-foreground">
                Active connections
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Last Trade
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {botStats.lastTradeTime ? (
                  new Date(botStats.lastTradeTime).toLocaleTimeString()
                ) : (
                  'Never'
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Most recent execution
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <Card className="glass-effect border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription>
            Manage your bot and exchange connections
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link href="/dashboard/exchanges">
            <Button variant="outline">
              <Globe className="w-4 h-4 mr-2" />
              Manage Exchanges
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Bot Settings
            </Button>
          </Link>
          <Link href="/dashboard/analytics">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}