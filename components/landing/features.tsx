'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  TrendingUp, 
  Globe, 
  Lock, 
  BarChart3,
  Clock,
  AlertTriangle,
  DollarSign
} from 'lucide-react';

const features = [
  {
    name: 'Multi-Exchange Support',
    description: 'Connect to 12+ major exchanges including Binance, KuCoin, Coinbase Pro, and more.',
    icon: Globe,
  },
  {
    name: 'Real-time Arbitrage',
    description: 'Lightning-fast detection and execution of triangular arbitrage opportunities.',
    icon: Zap,
  },
  {
    name: 'Advanced Security',
    description: 'Bank-grade encryption for API keys with rotating master keys and secure storage.',
    icon: Shield,
  },
  {
    name: 'Profit Optimization',
    description: 'Smart algorithms prioritize zero-fee pairs and fee token discounts.',
    icon: TrendingUp,
  },
  {
    name: 'Risk Management',
    description: 'Comprehensive risk controls with stop-loss, position limits, and slippage protection.',
    icon: AlertTriangle,
  },
  {
    name: 'Real-time Analytics',
    description: 'Live dashboard with detailed trade history, P&L tracking, and performance metrics.',
    icon: BarChart3,
  },
  {
    name: '24/7 Monitoring',
    description: 'Continuous operation with automatic reconnection and health monitoring.',
    icon: Clock,
  },
  {
    name: 'Transparent Pricing',
    description: 'Simple $49/month subscription with no hidden fees or profit sharing.',
    icon: DollarSign,
  },
  {
    name: 'Secure API Management',
    description: 'Easy-to-use interface for managing exchange connections with permission validation.',
    icon: Lock,
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-400">
            Everything you need
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Professional arbitrage trading platform
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Built for serious traders who demand reliability, security, and performance.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <feature.icon className="h-5 w-5 flex-none text-blue-400" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}