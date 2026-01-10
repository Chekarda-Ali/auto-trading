import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ArbitrageBot Pro - Multi-Exchange Crypto Arbitrage Trading',
  description: 'Professional arbitrage trading bot supporting 12+ exchanges. Automated triangular arbitrage with real-time profit optimization.',
  keywords: 'crypto arbitrage, trading bot, binance, kucoin, automated trading, cryptocurrency, profit optimization',
  authors: [{ name: 'ArbitrageBot Pro' }],
  openGraph: {
    title: 'ArbitrageBot Pro - Multi-Exchange Crypto Arbitrage Trading',
    description: 'Professional arbitrage trading bot supporting 12+ exchanges. Automated triangular arbitrage with real-time profit optimization.',
    url: 'https://arbitragebot.pro',
    siteName: 'ArbitrageBot Pro',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'ArbitrageBot Pro - Crypto Trading Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArbitrageBot Pro - Multi-Exchange Crypto Arbitrage Trading',
    description: 'Professional arbitrage trading bot supporting 12+ exchanges. Automated triangular arbitrage with real-time profit optimization.',
    images: ['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=630&fit=crop'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <link rel="canonical" href="https://arbitragebot.pro" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body className={inter.className}>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}