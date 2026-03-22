'use client';

import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SignInContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/geometry';
  const error = searchParams.get('error');

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-8 flex flex-col items-center gap-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {/* Logo mark */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="text-5xl font-black"
            style={{ color: 'var(--primary)', letterSpacing: '-2px' }}
          >
            MathViz
          </div>
          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            Real math. Real world. Actually fun.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />

        {/* Error state */}
        {error && (
          <div
            className="w-full rounded-lg px-4 py-3 text-sm text-center"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
          >
            Sign-in failed. Please try again.
          </div>
        )}

        <div className="flex flex-col items-center gap-2 w-full">
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Sign in to track your progress
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-all hover:opacity-80 active:scale-95"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            {/* Google icon */}
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          For students — ask a parent to help set up your Google account if needed.
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
