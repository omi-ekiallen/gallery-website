'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatBytes } from '@/lib/format';

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [projRes, orderRes] = await Promise.all([fetch('/api/projects'), fetch('/api/orders')]);
      if (projRes.ok) setProjects((await projRes.json()).projects || []);
      if (orderRes.ok) setOrders((await orderRes.json()).orders || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/gallery/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          custom_slug: newSlug,
          passcode: newPasscode,
          price_ngn: parseInt(newPrice) || 0,
          description: newDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create gallery');

      setShowModal(false);
      setNewTitle('');
      setNewSlug('');
      setNewPasscode('');
      setNewPrice('');
      setNewDescription('');
      fetchData();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const paidOrders = orders.filter((o) => o.status === 'success');
  const totalRevenue = paidOrders.reduce((acc, o) => acc + (o.amount_ngn || 0), 0);
  const totalMedia = projects.reduce((acc, p) => acc + (p.media_count || 0), 0);

  if (loading) {
    return <p className="label">Loading</p>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
        <div>
          <p className="label">Studio</p>
          <h1 className="font-display text-3xl sm:text-4xl mt-6">Galleries</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-solid self-start">
          New gallery
        </button>
      </div>

      <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8 border-t border-line pt-12">
        {[
          { label: 'Galleries', value: projects.length },
          { label: 'Files stored', value: totalMedia },
          { label: 'Paid orders', value: paidOrders.length },
          { label: 'Collected', value: `₦${totalRevenue.toLocaleString()}` },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="label">{stat.label}</p>
            <p className="font-display text-4xl mt-4">{stat.value}</p>
          </div>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="mt-24 border-t border-line pt-24 text-center">
          <h2 className="font-display text-3xl">No galleries yet</h2>
          <p className="mt-5 text-[15px] text-muted max-w-sm mx-auto leading-relaxed">
            Create a gallery, upload the shoot, then send your client the private link.
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-ghost mt-12">
            Create your first gallery
          </button>
        </div>
      ) : (
        <div className="mt-24 space-y-px bg-line border-y border-line">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white py-10 flex flex-col md:flex-row md:items-center gap-8"
            >
              <Link
                href={`/dashboard/projects/${proj.id}`}
                className="w-full md:w-40 h-40 md:h-28 bg-soft shrink-0 overflow-hidden"
              >
                {proj.cover_filename ? (
                  <img
                    src={`/api/media/${proj.cover_filename}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center label">
                    No media
                  </span>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/dashboard/projects/${proj.id}`}>
                  <h2 className="font-display text-3xl truncate">{proj.title}</h2>
                </Link>
                <p className="mt-2 text-[13px] text-muted truncate">/gallery/{proj.slug}</p>
                <p className="mt-4 text-[13px] text-muted">
                  {proj.media_count || 0} files · {formatBytes(proj.total_size || 0)} ·{' '}
                  {proj.passcode ? 'Passcode set' : 'Open link'} ·{' '}
                  {proj.price_ngn > 0 ? `₦${proj.price_ngn.toLocaleString()}` : 'Free download'}
                </p>
              </div>

              <div className="flex items-center gap-8 text-[13px] shrink-0">
                <button
                  onClick={() => copyLink(proj.slug)}
                  className="text-muted hover:text-ink transition"
                >
                  {copiedSlug === proj.slug ? 'Copied' : 'Copy link'}
                </button>
                <Link
                  href={`/gallery/${proj.slug}`}
                  target="_blank"
                  className="text-muted hover:text-ink transition"
                >
                  Preview
                </Link>
                <Link href={`/dashboard/projects/${proj.id}`} className="link-underline">
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="max-w-xl mx-auto px-6 py-20">
            <div className="flex items-start justify-between gap-8">
              <div>
                <p className="label">New</p>
                <h2 className="font-display text-4xl mt-5">Create a gallery</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[13px] text-muted hover:text-ink transition mt-2"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-14 space-y-10">
              <div>
                <label className="label block mb-3">Gallery title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Client name or shoot"
                  className="field"
                />
              </div>

              <div>
                <label className="label block mb-3">Link (optional)</label>
                <div className="flex items-baseline gap-2">
                  <span className="text-[13px] text-muted">/gallery/</span>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="auto-generated from the title"
                    className="field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div>
                  <label className="label block mb-3">Passcode (optional)</label>
                  <input
                    type="text"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Blank for an open link"
                    className="field"
                  />
                </div>
                <div>
                  <label className="label block mb-3">Download price (₦)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="0 for a free download"
                    className="field"
                  />
                </div>
              </div>

              <div>
                <label className="label block mb-3">Note to your client (optional)</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="A short message shown above the photos"
                  className="field"
                />
              </div>

              {createError && (
                <p className="text-[13px] text-ink border-l border-ink pl-4">{createError}</p>
              )}

              <div className="flex items-center gap-6 pt-4">
                <button type="submit" disabled={creating} className="btn btn-solid">
                  {creating ? 'Creating…' : 'Create gallery'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-[13px] text-muted hover:text-ink transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
