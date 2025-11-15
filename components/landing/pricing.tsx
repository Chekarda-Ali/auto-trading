'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  'Multi-exchange arbitrage trading',
  'Real-time opportunity detection',
  'Advanced risk management',
  'Secure API key encryption',
  'Live trading dashboard',
  '24/7 bot monitoring',
  'Detailed trade analytics',
  'Email notifications',
  'Priority support',
  'No profit sharing fees',
];

export function LandingPricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-400">
            Pricing
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Simple, transparent pricing
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            One plan, all features. No hidden fees or profit sharing.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Card className="relative overflow-hidden border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
              <CardHeader className="relative text-center pb-8">
                <CardTitle className="text-3xl font-bold text-white">
                  ArbitrageBot Pro
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Professional arbitrage trading platform
                </CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-white">$49</span>
                  <span className="text-lg text-gray-300">/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="relative">
                <ul className="space-y-4 mb-8">
                  {features.map((feature, index) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3"
                    >
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <div className="space-y-4">
                  <Link href="/sign-up" className="block">
                    <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                      Start 7-Day Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <p className="text-center text-sm text-gray-400">
                    No credit card required • Cancel anytime
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}