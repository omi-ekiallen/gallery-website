'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sign in');

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-20 flex items-center">
          <Link href="/" className="font-display text-2xl">
            PayGallery
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-24 sm:py-32">
        <div className="w-full max-w-sm">
          <p className="label">Studio</p>
          <h1 className="font-display text-4xl mt-6">Sign in</h1>

          <form onSubmit={handleSubmit} className="mt-14 space-y-10">
            <div>
              <label className="label block mb-3">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="field"
              />
            </div>

            <div>
              <label className="label block mb-3">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="field"
              />
            </div>

            {error && <p className="text-[13px] text-ink border-l border-ink pl-4">{error}</p>}

            <button type="submit" disabled={loading} className="btn btn-solid w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-16 text-[13px] text-muted">
            No account yet?{' '}
            <Link href="/register" className="link-underline text-ink">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
