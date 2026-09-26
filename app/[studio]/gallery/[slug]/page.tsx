'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { formatBytes } from '@/lib/format';
import PasswordField from '../../../password-field';

type AccessLevel = 'passcode' | 'unpaid' | 'open';

export default function ClientGalleryPage({
  params,
}: {
  params: Promise<{ studio: string; slug: string }>;
}) {
  const { studio, slug } = use(params);
  const galleryPath = `/${studio}/gallery/${slug}`;
  const apiBase = `/api/studios/${studio}/gallery/${slug}`;

  const [gallery, setGallery] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('passcode');
  const [paystackConfigured, setPaystackConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [verifyingPasscode, setVerifyingPasscode] = useState(false);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [showCheckout, setShowCheckout] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [justUnlocked, setJustUnlocked] = useState(false);

  const isUnlocked = accessLevel === 'open';

  const fetchGallery = useCallback(async () => {
    try {
      const res = await fetch(apiBase);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'This gallery could not be loaded');
        return;
      }

      setGallery(data.project);
      setMedia(data.media || []);
      setAccessLevel(data.accessLevel);
      setPaystackConfigured(data.paystackConfigured !== false);
      if (data.clientEmail) setClientEmail(data.clientEmail);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  // Paystack returns the client here with ?reference=…&trxref=… — confirm, then tidy the URL.
  useEffect(() => {
    const url = new URL(window.location.href);
    const reference = url.searchParams.get('reference') || url.searchParams.get('trxref');
    if (!reference) return;

    (async () => {
      try {
        const res = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'We could not confirm that payment');
        setJustUnlocked(true);
        await fetchGallery();
      } catch (err: any) {
        setPayError(err.message);
      } finally {
        window.history.replaceState({}, '', galleryPath);
      }
    })();
  }, [galleryPath, fetchGallery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowLeft') setActiveIndex((p) => (p! > 0 ? p! - 1 : media.length - 1));
      if (e.key === 'ArrowRight') setActiveIndex((p) => (p! < media.length - 1 ? p! + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, media.length]);

  const handleVerifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingPasscode(true);
    setPasscodeError(null);

    try {
      const res = await fetch(`${apiBase}/verify-passcode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'That passcode is not correct');

      await fetchGallery();
    } catch (err: any) {
      setPasscodeError(err.message);
    } finally {
      setVerifyingPasscode(false);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setPayError(null);

    try {
      const initRes = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: gallery.id,
          clientEmail,
          clientName: clientName || clientEmail.split('@')[0],
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.error || 'Payment could not be started');

      if (initData.authorizationUrl) {
        window.location.href = initData.authorizationUrl;
        return;
      }

      // Test mode: no Paystack key configured, so settle the order locally.
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: initData.reference, projectId: gallery.id }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment could not be confirmed');

      setShowCheckout(false);
      setJustUnlocked(true);
      await fetchGallery();
    } catch (err: any) {
      setPayError(err.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="label-caps text-ink-soft">Loading</p>
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="headline-lg">Gallery unavailable</h1>
        <p className="body-md mt-4 text-ink-soft max-w-sm">
          {error || 'This link does not point to a gallery.'}
        </p>
        <Link href="/" className="btn btn-outline mt-8">
          Go to PayGallery
        </Link>
      </div>
    );
  }

  /** Frames served at a locked access level are blurred by the server. */
  const Frame = ({ item, className = '' }: { item: any; className?: string }) => {
    const isVideo = item.mimeType?.startsWith('video/');

    if (isVideo) {
      return (
        <div className={`flex items-center justify-center bg-band ${className}`}>
          <span className="label-caps text-ink-soft">
            {isUnlocked ? `Video · ${item.originalName}` : 'Video · locked'}
          </span>
        </div>
      );
    }

    return (
      <img
        src={item.previewUrl}
        alt={isUnlocked ? item.originalName : 'Locked frame'}
        draggable={false}
        className={`w-full h-full object-cover select-none ${className}`}
        loading="lazy"
      />
    );
  };

  // ── Passcode gate: the contact sheet sits behind it, blurred ──────────────
  if (accessLevel === 'passcode') {
    return (
      <div className="min-h-screen relative">
        {/* Blurred contact sheet behind the gate: the gallery is visibly real,
            but nothing in it can be read until the passcode clears. */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="sheet grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 h-full"
            style={{ gridAutoRows: '1fr' }}
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const item = media.length > 0 ? media[i % media.length] : null;
              return (
                <div key={i} className="bg-band overflow-hidden">
                  {item && <Frame item={item} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative min-h-screen flex items-center justify-center px-4 py-16 scrim">
          <div className="w-full max-w-md bg-paper border border-ink">
            <div className="band px-6 py-5">
              <p className="label-caps text-ink-soft">{gallery.photographerName}</p>
              <h1 className="headline-lg mt-2">{gallery.title}</h1>
            </div>

            <form onSubmit={handleVerifyPasscode} className="p-6 space-y-5">
              <p className="body-md text-ink-soft">
                This gallery is private. Enter the passcode from your photographer to bring the
                frames into focus.
              </p>

              <PasswordField
                label="Passcode"
                value={passcode}
                onChange={setPasscode}
                placeholder="••••"
                className="tracking-[0.3em]"
              />

              {passcodeError && (
                <p className="body-md text-clay border border-clay px-3 py-2">{passcodeError}</p>
              )}

              <button type="submit" disabled={verifyingPasscode} className="btn btn-primary w-full">
                {verifyingPasscode ? 'Checking…' : 'View gallery'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const current = activeIndex !== null ? media[activeIndex] : null;
  const showPaywallBar = media.length > 0 && (accessLevel === 'unpaid' || justUnlocked || isUnlocked);

  return (
    <div className="min-h-screen flex flex-col pb-28">
      <header className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between gap-6">
          <span className="headline-sm truncate">{gallery.photographerName}</span>
          <span
            className={`status label-caps shrink-0 ${
              isUnlocked ? 'status-paid' : 'status-processing'
            }`}
          >
            {isUnlocked ? 'Released' : `₦${gallery.priceNgn.toLocaleString()} to release`}
          </span>
        </div>
      </header>

      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
          <p className="label-caps text-ink-soft">Client delivery</p>
          <h1 className="display-hero mt-4 max-w-3xl break-words">{gallery.title}</h1>
          {gallery.description && (
            <p className="body-lg mt-6 max-w-xl text-ink-soft">{gallery.description}</p>
          )}
          <p className="label-caps text-ink-soft mt-8">
            {media.length} frames ·{' '}
            {isUnlocked ? 'Select any frame to view it full size' : 'Frames stay blurred until payment clears'}
          </p>
        </div>
      </section>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 w-full py-10 md:py-12 flex-1">
        {media.length === 0 ? (
          <p className="body-md text-ink-soft">
            Your photographer has not archived any frames in this gallery yet.
          </p>
        ) : (
          <div className="sheet grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((item, idx) => (
              <figure key={item.id}>
                <button
                  onClick={() => setActiveIndex(idx)}
                  className="block w-full aspect-square bg-band overflow-hidden"
                >
                  <Frame item={item} />
                </button>

                <figcaption className="band border-t border-rule px-2 py-2 flex items-center justify-between gap-2">
                  <span className="label-caps text-ink-soft">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {isUnlocked ? (
                    <a
                      href={`${apiBase}/download?mediaId=${item.id}`}
                      className="label-caps rule-link"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="label-caps text-ink-soft">Locked</span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </main>

      {showPaywallBar && (
        <div className="fixed bottom-0 inset-x-0 band border-t border-ink border-b-0">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="label-caps text-ink-soft">
                {isUnlocked ? (justUnlocked ? 'Payment cleared' : 'Account settled') : 'Balance due'}
              </p>
              <p className="ledger-md mt-1">
                {isUnlocked
                  ? `${media.length} frames, full resolution`
                  : `₦${gallery.priceNgn.toLocaleString()}`}
              </p>
            </div>

            {isUnlocked ? (
              <a href={`${apiBase}/download?all=true`} className="btn btn-primary">
                Download everything (ZIP)
              </a>
            ) : (
              <button onClick={() => setShowCheckout(true)} className="btn btn-primary">
                Pay ₦{gallery.priceNgn.toLocaleString()} to release
              </button>
            )}
          </div>
        </div>
      )}

      {activeIndex !== null && current && (
        <div className="fixed inset-0 z-50 bg-paper flex flex-col">
          <div className="border-b border-ink px-4 md:px-8 h-16 flex items-center justify-between gap-6">
            <span className="label-caps text-ink-soft">
              Frame {activeIndex + 1} / {media.length}
            </span>
            <div className="flex items-center gap-5">
              {isUnlocked ? (
                <a
                  href={`${apiBase}/download?mediaId=${current.id}`}
                  className="label-ui rule-link"
                >
                  Download original
                </a>
              ) : (
                <button
                  onClick={() => {
                    setActiveIndex(null);
                    setShowCheckout(true);
                  }}
                  className="btn btn-primary"
                >
                  Pay to release
                </button>
              )}
              <button
                onClick={() => setActiveIndex(null)}
                className="label-ui text-ink-soft hover:text-ink"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center p-4 md:p-10 bg-frame">
            {current.mimeType?.startsWith('video/') ? (
              <div className="text-center">
                <p className="headline-md">
                  {isUnlocked ? current.originalName : 'Video locked'}
                </p>
                <p className="label-caps text-ink-soft mt-3">
                  {isUnlocked ? formatBytes(current.sizeBytes) : 'Pay to release this file'}
                </p>
              </div>
            ) : (
              <img
                src={current.previewUrl}
                alt={isUnlocked ? current.originalName : 'Locked frame'}
                draggable={false}
                className="max-h-full max-w-full object-contain select-none"
              />
            )}
          </div>

          <div className="border-t border-ink px-4 md:px-8 h-16 flex items-center justify-between gap-4">
            <button
              onClick={() => setActiveIndex((p) => (p! > 0 ? p! - 1 : media.length - 1))}
              className="label-ui text-ink-soft hover:text-ink"
            >
              ← Previous
            </button>
            <span className="label-caps text-ink-soft truncate px-4">
              {isUnlocked ? current.originalName : 'Blurred until payment clears'}
            </span>
            <button
              onClick={() => setActiveIndex((p) => (p! < media.length - 1 ? p! + 1 : 0))}
              className="label-ui text-ink-soft hover:text-ink"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 z-50 scrim overflow-y-auto p-4 md:p-10">
          <div className="max-w-md mx-auto bg-paper border border-ink">
            <div className="band px-6 py-5 flex items-start justify-between gap-6">
              <div>
                <p className="label-caps text-ink-soft">Settlement</p>
                <h2 className="headline-lg mt-2">Release your files</h2>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="label-ui text-ink-soft hover:text-ink"
              >
                Close
              </button>
            </div>

            <div className="px-6 py-5 border-b border-rule flex items-baseline justify-between gap-6">
              <div className="min-w-0">
                <p className="body-md truncate">{gallery.title}</p>
                <p className="label-caps text-ink-soft mt-1">{media.length} frames</p>
              </div>
              <p className="ledger-lg shrink-0">₦{gallery.priceNgn.toLocaleString()}</p>
            </div>

            <form onSubmit={handlePay} className="p-6 space-y-5">
              <div>
                <label className="label-caps text-ink-soft block mb-2">Your name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Optional"
                  className="field"
                />
              </div>

              <div>
                <label className="label-caps text-ink-soft block mb-2">Your email</label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="field"
                />
                <p className="body-sm text-ink-soft mt-2">
                  Your receipt and your access to this gallery are tied to this address.
                </p>
              </div>

              {payError && (
                <p className="body-md text-clay border border-clay px-3 py-2">{payError}</p>
              )}

              <button type="submit" disabled={paying} className="btn btn-primary w-full">
                {paying
                  ? 'Working…'
                  : paystackConfigured
                    ? `Pay ₦${gallery.priceNgn.toLocaleString()} with Paystack`
                    : 'Complete test payment'}
              </button>

              {!paystackConfigured && (
                <p className="body-sm text-ink-soft">
                  Test mode: no Paystack keys are configured, so no card is charged and the frames
                  release immediately.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
