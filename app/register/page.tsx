'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TIERS, SubscriptionTier } from '@/lib/types';
import PasswordField from '../password-field';

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
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label-caps text-ink-soft block mb-2">Your name</label>
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
          <label className="label-caps text-ink-soft block mb-2">Studio name</label>
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
        placeholder="At least 6 characters"
        autoComplete="new-password"
        minLength={6}
      />

      <div>
        <label className="label-caps text-ink-soft block mb-2">Archival capacity</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-ink-line">
          {Object.values(TIERS).map((t, i) => {
            const isSelected = selectedTier === t.id;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`p-4 text-left transition ${
                  i > 0 ? 'border-t sm:border-t-0 sm:border-l border-ink-line' : ''
                } ${isSelected ? 'bg-green text-paper' : 'bg-paper hover:bg-band'}`}
              >
                <span className="label-caps block">{t.name.split(' ')[0]}</span>
                <span className="ledger-md block mt-2">
                  {t.priceMonthlyNGN === 0 ? 'Free' : `₦${(t.priceMonthlyNGN / 1000).toFixed(1)}k`}
                </span>
                <span className={`body-sm block mt-1 ${isSelected ? 'text-paper/70' : 'text-ink-soft'}`}>
                  {t.storageLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="body-md text-clay border border-clay px-3 py-2">{error}</p>}

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      <p className="body-md text-ink-soft pt-2 border-t border-rule">
        Already registered?{' '}
        <Link href="/login" className="text-ink rule-link">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
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
        <div className="w-full max-w-xl border border-ink bg-paper">
          <div className="band px-6 py-5">
            <p className="label-caps text-ink-soft">New studio</p>
            <h1 className="headline-lg mt-2">Create your account</h1>
          </div>

          <Suspense fallback={<p className="p-6 body-md text-ink-soft">Loading…</p>}>
            <RegisterForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
