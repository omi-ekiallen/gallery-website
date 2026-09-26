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

  const [handle, setHandle] = useState('');
  const [savingHandle, setSavingHandle] = useState(false);
  const [handleMessage, setHandleMessage] = useState<string | null>(null);
  const [handleError, setHandleError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setHandle(data.user?.handle || '');
      }
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

  const handleSaveHandle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHandle(true);
    setHandleError(null);
    setHandleMessage(null);

    try {
      const res = await fetch('/api/auth/handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update the address');

      setHandle(data.handle);
      setHandleMessage(data.message);
      await fetchUser();
    } catch (err: any) {
      setHandleError(err.message);
    } finally {
      setSavingHandle(false);
    }
  };

  if (loading) {
    return <p className="label-caps text-ink-soft">Loading</p>;
  }

  const appOrigin =
    typeof window === 'undefined' ? 'your-site.com' : window.location.host;
  const currentTier = user?.tier || 'free';
  const tierConfig = TIERS[currentTier as SubscriptionTier] || TIERS.free;
  const storageUsed = user?.storage_used || 0;
  const storageQuota = tierConfig.storageBytes;
  const storagePercent = Math.min(100, (storageUsed / storageQuota) * 100);
  const remainingBytes = Math.max(0, storageQuota - storageUsed);
  const nearlyFull = storagePercent > 85;

  return (
    <div>
      <p className="label-caps text-ink-soft">Subscription</p>
      <h1 className="headline-lg mt-2">Capacity</h1>

      <div className="mt-10 border border-ink">
        <div className="band px-5 py-4">
          <p className="label-caps text-ink-soft">Studio address</p>
        </div>

        <form onSubmit={handleSaveHandle} className="px-5 py-5">
          <p className="body-md text-ink-soft max-w-xl">
            This is the first part of every gallery link you share with a client.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-stretch gap-3">
            <div className="flex items-stretch flex-1 min-w-0">
              <span className="label-ui text-ink-soft border border-r-0 border-ink-line px-3 flex items-center bg-band whitespace-nowrap">
                {appOrigin}/
              </span>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="ade-visuals"
                className="field"
              />
              <span className="label-ui text-ink-soft border border-l-0 border-ink-line px-3 flex items-center bg-band whitespace-nowrap">
                /gallery/…
              </span>
            </div>
            <button type="submit" disabled={savingHandle} className="btn btn-outline">
              {savingHandle ? 'Saving…' : 'Update address'}
            </button>
          </div>

          {handleMessage && <p className="mt-3 body-sm text-green">{handleMessage}</p>}
          {handleError && <p className="mt-3 body-sm text-clay">{handleError}</p>}
        </form>
      </div>

      <div className="mt-6 border border-ink">
        <div className="band px-5 py-5 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="label-caps text-ink-soft">In use</p>
            <p className="ledger-lg mt-2">
              {formatBytes(storageUsed)}
              <span className="body-lg text-ink-soft"> of {tierConfig.storageLabel}</span>
            </p>
          </div>
          <span className={`status label-caps ${nearlyFull ? 'status-overdue' : 'status-paid'}`}>
            {nearlyFull ? 'Capacity low' : tierConfig.name}
          </span>
        </div>

        <div className="px-5 py-5">
          <div className="meter">
            <span style={{ width: `${Math.max(1, storagePercent)}%` }} />
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="label-ui text-ink-soft">{Math.round(storagePercent)}% committed</span>
            <span className="label-ui text-ink-soft">{formatBytes(remainingBytes)} free</span>
          </div>
        </div>
      </div>

      {message && (
        <p className="mt-6 body-md text-green border border-green px-3 py-2">{message}</p>
      )}
      {error && <p className="mt-6 body-md text-clay border border-clay px-3 py-2">{error}</p>}

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 border border-ink">
        {Object.values(TIERS).map((t, i) => {
          const isCurrent = t.id === currentTier;

          return (
            <div
              key={t.id}
              className={`p-6 flex flex-col ${
                i > 0 ? 'border-t md:border-t-0 md:border-l border-rule' : ''
              } ${isCurrent ? 'bg-band' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="headline-md">{t.name}</h2>
                {isCurrent && <span className="badge label-caps">Active</span>}
              </div>

              <p className="body-md mt-4 text-ink-soft min-h-[60px]">{t.description}</p>

              <p className="ledger-lg mt-6">
                {t.priceMonthlyNGN === 0 ? 'Free' : `₦${t.priceMonthlyNGN.toLocaleString()}`}
              </p>
              <p className="label-caps text-ink-soft mt-2">
                {t.priceMonthlyNGN === 0 ? `${t.storageLabel} included` : `Per month · ${t.storageLabel}`}
              </p>

              <ul className="mt-8 space-y-2 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="body-md text-ink-soft flex gap-3">
                    <span className="text-green">—</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <p className="label-caps text-ink-soft mt-8">Current plan</p>
              ) : (
                <button
                  onClick={() => handleSwitchTier(t.id)}
                  disabled={updating !== null}
                  className="btn btn-outline mt-8 w-full"
                >
                  {updating === t.id ? 'Switching…' : `Switch to ${t.name.split(' ')[0]}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-8 body-sm text-ink-soft max-w-lg">
        A plan change adjusts your storage limit immediately. Subscription billing is not charged
        yet — it will settle through Paystack alongside client payments.
      </p>
    </div>
  );
}
