'use client';

import Link from 'next/link';
import { Github, Twitter, Mail } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-white font-semibold">ArbitrageBot Pro</h3>
            <p className="mt-3 text-sm text-gray-300">
              Automated triangular arbitrage with professional tooling and security.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium">Product</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="#features" className="text-gray-300 hover:text-white">Features</Link></li>
              <li><Link href="#pricing" className="text-gray-300 hover:text-white">Pricing</Link></li>
              <li><Link href="/exchanges" className="text-gray-300 hover:text-white">Exchanges</Link></li>
              <li><Link href="/docs" className="text-gray-300 hover:text-white">Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium">Company</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
              <li><Link href="/status" className="text-gray-300 hover:text-white">Status</Link></li>
              <li><Link href="/legal/privacy" className="text-gray-300 hover:text-white">Privacy</Link></li>
              <li><Link href="/legal/terms" className="text-gray-300 hover:text-white">Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium">Connect</h4>
            <div className="mt-3 flex items-center gap-3">
              <Link href="https://github.com/" aria-label="GitHub" className="text-gray-300 hover:text-white">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com/" aria-label="Twitter" className="text-gray-300 hover:text-white">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="mailto:support@arbitragebot.pro" aria-label="Email" className="text-gray-300 hover:text-white">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} ArbitrageBot Pro. All rights reserved.</p>
          <div className="text-xs text-gray-400">
            Built with security-first principles. Never share your API secrets.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
