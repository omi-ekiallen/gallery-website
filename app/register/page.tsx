'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TIERS, SubscriptionTier } from '@/lib/types';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTier = (searchParams.get('tier') as SubscriptionTier) || 'free';

  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(
    TIERS[initialTier] ? initialTier : 'free'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          business_name: businessName,
          email,
          password,
          tier: selectedTier,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-14 space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        <div>
          <label className="label block mb-3">Your name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="field"
          />
        </div>
        <div>
          <label className="label block mb-3">Studio name</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Optional"
            className="field"
          />
        </div>
      </div>

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
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          className="field"
        />
      </div>

      <div>
        <label className="label block mb-5">Storage plan</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line border border-line">
          {Object.values(TIERS).map((t) => {
            const isSelected = selectedTier === t.id;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`p-6 text-left transition ${
                  isSelected ? 'bg-ink text-white' : 'bg-white hover:bg-soft'
                }`}
              >
                <span className="font-display text-xl block">{t.name.split(' ')[0]}</span>
                <span className={`text-[13px] block mt-2 ${isSelected ? 'text-white/70' : 'text-muted'}`}>
                  {t.storageLabel}
                </span>
                <span className={`text-[13px] block mt-1 ${isSelected ? 'text-white/70' : 'text-muted'}`}>
                  {t.priceMonthlyNGN === 0
                    ? 'Free'
                    : `₦${t.priceMonthlyNGN.toLocaleString()} / month`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-[13px] text-ink border-l border-ink pl-4">{error}</p>}

      <button type="submit" disabled={loading} className="btn btn-solid w-full">
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-20 flex items-center">
          <Link href="/" className="font-display text-2xl">
            PayGallery
          </Link>
        </div>
      </header>

      <main className="flex-1 flex justify-center px-6 py-24 sm:py-32">
        <div className="w-full max-w-xl">
          <p className="label">Studio</p>
          <h1 className="font-display text-4xl mt-6">Create your account</h1>

          <Suspense fallback={<p className="mt-14 text-[13px] text-muted">Loading…</p>}>
            <RegisterForm />
          </Suspense>

          <p className="mt-16 text-[13px] text-muted">
            Already have an account?{' '}
            <Link href="/login" className="link-underline text-ink">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
