'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    q: 'How does the arbitrage bot work?',
    a: 'The bot continuously scans supported exchanges for triangular price discrepancies and executes sequences of trades when expected profit exceeds your configured threshold after fees and slippage.',
  },
  {
    q: 'Which exchanges are supported?',
    a: 'We currently support 12+ major exchanges including Binance, KuCoin, Coinbase Advanced, and more. You can manage your connections from the dashboard.',
  },
  {
    q: 'Is my API key safe?',
    a: 'Yes. API secrets are encrypted at rest with rotating keys. We recommend creating API keys with trading permissions only and no withdrawal permissions.',
  },
  {
    q: 'Can I run in paper trading mode?',
    a: 'Yes. A sandbox mode is available for supported exchanges so you can test strategies without risking capital.',
  },
  {
    q: 'What are the fees?',
    a: 'Simple $49/month subscription. There are no profit sharing or extra platform fees. You still pay your exchange trading fees.',
  },
];

export function LandingFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-400">FAQ</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Frequently asked questions
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-white/10 rounded-lg border border-white/10">
          {faqs.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="">
                <button
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5"
                  onClick={() => setOpen(isOpen ? null : idx)}
                >
                  <span className="text-white font-medium">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-gray-300">{item.a}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default LandingFAQ;
