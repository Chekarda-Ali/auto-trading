'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

const testimonials = [
  {
    name: 'Sophia R.',
    role: 'Quant Trader',
    quote:
      'The execution speed and stability are unmatched. It captured opportunities I used to miss and cut manual work drastically.',
  },
  {
    name: 'Liam C.',
    role: 'Crypto Fund Ops',
    quote:
      'Security is world-class. Multi-sig and detailed audit trails finally made our compliance team happy.',
  },
  {
    name: 'Emily K.',
    role: 'Independent Trader',
    quote:
      'Setup took minutes. The dashboard feels alive — I see positions evolve in real time without touching a thing.',
  },
  {
    name: 'Noah T.',
    role: 'Algo Researcher',
    quote:
      'The data visualization is so clear. I can backtest, optimize, and deploy all from one clean interface.',
  },
  {
    name: 'Olivia B.',
    role: 'Portfolio Manager',
    quote:
      'It fits seamlessly into our stack and runs nonstop. ArbitrageBot Pro feels like a second team member.',
  },
  {
    name: 'Karl A.',
    role: 'Trading Manager',
    quote:
      'Integration was smooth. It runs 24/7 and adapts to our risk model seamlessly — worth every penny.',
  },
];

// Duplicate list for continuous loop
const doubledTestimonials = [...testimonials, ...testimonials];

export default function LandingTestimonials() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationId: number;
    let start = 0;
    const speed = 0.8; // Faster scroll

    const animate = () => {
      start -= speed;
      if (start <= -container.scrollWidth / 2) start = 0;
      container.style.transform = `translateX(${start}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section className="py-28 sm:py-36 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-base font-semibold leading-7 text-blue-400"
        >
          Trusted by professionals worldwide
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent"
        >
          What our users say
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 text-lg leading-8 text-gray-400 max-w-2xl mx-auto"
        >
          Discover why traders and funds trust ArbitrageBot Pro to automate and elevate their strategies.
        </motion.p>
      </div>

      {/* 3D moving film */}
      <div className="relative mt-20 perspective-[1600px]">
        <div
          ref={containerRef}
          className="flex gap-8 w-max"
          style={{
            transform: 'translateX(0)',
            willChange: 'transform',
          }}
        >
          {doubledTestimonials.map((t, i) => (
            <motion.div
              key={i}
              whileHover={{
                scale: 1.1,
                rotateY: 8,
                rotateX: -4,
                z: 60,
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="flex-shrink-0"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <Card className="w-[340px] h-full border border-white/10 bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-2xl shadow-[0_0_30px_-10px_rgba(0,0,0,0.6)] hover:shadow-[0_0_40px_-10px_rgba(0,180,255,0.5)] transition-all duration-300 rounded-2xl">
                <CardContent className="p-8 text-left">
                  <p className="text-gray-300 text-sm leading-relaxed italic">“{t.quote}”</p>
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Gradient edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-slate-950 via-slate-950/70 to-transparent" />
      </div>
    </section>
  );
}
