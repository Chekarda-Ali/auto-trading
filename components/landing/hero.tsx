'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function LandingHero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20" />
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8 flex justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-300 ring-1 ring-white/10 hover:ring-white/20">
                Supporting 12+ major exchanges{' '}
                <Link href="/exchanges" className="font-semibold text-blue-400">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View all <ArrowRight className="inline h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              #1 Professional{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Arbitrage Trading
              </span>{' '}
              Bot on the Market
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Automated triangular arbitrage across multiple cryptocurrency exchanges. 
              Real-time profit optimization with institutional-grade security and risk management.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/sign-up">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Start Trading Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg">
                  View Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
        >
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <TrendingUp className="h-5 w-5 flex-none text-blue-400" />
                Real-time Optimization
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                <p className="flex-auto">
                  Advanced algorithms detect and execute profitable arbitrage opportunities 
                  across multiple exchanges simultaneously.
                </p>
              </dd>
            </div>
            
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <Shield className="h-5 w-5 flex-none text-green-400" />
                Bank-grade Security
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                <p className="flex-auto">
                  Your API keys are encrypted at rest with rotating keys. 
                  Never stored in plain text, only decrypted when needed.
                </p>
              </dd>
            </div>
            
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <Zap className="h-5 w-5 flex-none text-yellow-400" />
                Lightning Fast
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                <p className="flex-auto">
                  Sub-second execution times with WebSocket connections 
                  to capture opportunities before they disappear.
                </p>
              </dd>
            </div>
          </dl>
        </motion.div>
      </div>
    </section>
  );
}