'use client';

import { SignUp, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [isSignedIn, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Get Started</h1>
          <p className="text-gray-400">Create your ArbitrageBot Pro account</p>
          <div className="mt-4 text-sm text-yellow-400 bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
            <p className="font-semibold mb-1">Important:</p>
            <p>Free trial available. Subscription required for full access.</p>
            <p className="mt-2 text-xs text-gray-300">
              Admins (alichekarda21@gmail.com) have full access without subscription.
            </p>
          </div>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-slate-800/50 backdrop-blur-sm border border-slate-700",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
              footerActionLink: "text-blue-400 hover:text-blue-300",
            },
          }}
          afterSignUpUrl="/pricing"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}