'use client';

import { useState, useEffect } from 'react';
import { formatBytes } from '@/lib/format';
import { TIERS, SubscriptionTier } from '@/lib/types';

export default function BillingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) setUser((await res.json()).user);
    } catch (err) {
      console.error('Failed to load plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSwitchTier = async (tierId: string) => {
    if (tierId === user?.tier) return;
    setUpdating(tierId);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change plan');

      setMessage(data.message);
      await fetchUser();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (loading) {
    return <p className="label">Loading</p>;
  }

  const currentTier = user?.tier || 'free';
  const tierConfig = TIERS[currentTier as SubscriptionTier] || TIERS.free;
  const storageUsed = user?.storage_used || 0;
  const storageQuota = tierConfig.storageBytes;
  const storagePercent = Math.min(100, (storageUsed / storageQuota) * 100);
  const remainingBytes = Math.max(0, storageQuota - storageUsed);

  return (
    <div>
      <p className="label">Studio</p>
      <h1 className="font-display text-3xl sm:text-4xl mt-6">Plan &amp; storage</h1>

      <div className="mt-20 border-t border-line pt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
          <div>
            <p className="label">{tierConfig.name}</p>
            <p className="font-display text-5xl mt-5">
              {formatBytes(storageUsed)}
              <span className="text-2xl text-muted"> of {tierConfig.storageLabel}</span>
            </p>
          </div>
          <p className="text-[13px] text-muted">{formatBytes(remainingBytes)} still free</p>
        </div>

        <div className="mt-10 h-px bg-line relative">
          <div
            className="absolute left-0 top-0 h-px bg-ink"
            style={{ width: `${Math.max(1, storagePercent)}%` }}
          />
        </div>
      </div>

      {message && <p className="mt-12 text-[13px] text-muted">{message}</p>}
      {error && <p className="mt-12 text-[13px] text-ink border-l border-ink pl-4">{error}</p>}

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line">
        {Object.values(TIERS).map((t) => {
          const isCurrent = t.id === currentTier;

          return (
            <div key={t.id} className="bg-white p-10 flex flex-col">
              <h2 className="font-display text-3xl">{t.name}</h2>
              <p className="mt-4 text-[15px] text-muted leading-relaxed min-h-[72px]">
                {t.description}
              </p>
              <p className="font-display text-4xl mt-8">
                {t.priceMonthlyNGN === 0 ? 'Free' : `₦${t.priceMonthlyNGN.toLocaleString()}`}
                {t.priceMonthlyNGN > 0 && <span className="text-base text-muted"> / month</span>}
              </p>
              <p className="label mt-4">{t.storageLabel} storage</p>

              <ul className="mt-10 space-y-3 text-[15px] text-muted flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span className="text-ink">—</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <p className="label mt-12">Current plan</p>
              ) : (
                <button
                  onClick={() => handleSwitchTier(t.id)}
                  disabled={updating !== null}
                  className="btn btn-ghost mt-12 w-full"
                >
                  {updating === t.id ? 'Switching…' : `Switch to ${t.name.split(' ')[0]}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-16 text-[13px] text-muted max-w-lg leading-relaxed">
        Plan changes apply to your storage limit immediately. Subscription billing is not charged
        yet — it will run through Paystack alongside client payments.
      </p>
    </div>
  );
}
