'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for debugging
    console.error('Captured client error in Kollabrix:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl bg-charcoal-900 border border-charcoal-750 p-8 text-center space-y-5 shadow-elevated">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Something went wrong
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {error?.message ||
              'A client-side issue occurred while rendering this page.'}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => reset()}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Try Again
          </Button>

          <Link href="/">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Home className="w-3.5 h-3.5" />}
            >
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
