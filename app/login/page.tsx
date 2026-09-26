'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PasswordField from '../password-field';

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
      <header className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 h-16 flex items-center">
          <Link href="/" className="headline-sm">
            PayGallery
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-16 md:py-24">
        <div className="w-full max-w-md border border-ink bg-paper">
          <div className="band px-6 py-5">
            <p className="label-caps text-ink-soft">Studio access</p>
            <h1 className="headline-lg mt-2">Sign in</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="label-caps text-ink-soft block mb-2">Email</label>
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

            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            {error && (
              <p className="body-md text-clay border border-clay px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="body-md text-ink-soft pt-2 border-t border-rule">
              No account yet?{' '}
              <Link href="/register" className="text-ink rule-link">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
