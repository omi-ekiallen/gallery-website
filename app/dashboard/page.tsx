'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatBytes } from '@/lib/format';

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [studioHandle, setStudioHandle] = useState('');

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
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData.projects || []);
        setStudioHandle(projData.studioHandle || '');
      }
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
    navigator.clipboard.writeText(`${window.location.origin}/${studioHandle}/gallery/${slug}`);
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
    return <p className="label-caps text-ink-soft">Loading</p>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="label-caps text-ink-soft">Client work</p>
          <h1 className="headline-lg mt-2">Galleries</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary self-start">
          New gallery
        </button>
      </div>

      <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 border border-ink">
        {[
          { label: 'Open galleries', value: projects.length },
          { label: 'Frames archived', value: totalMedia },
          { label: 'Cleared orders', value: paidOrders.length },
          { label: 'Collected', value: `₦${totalRevenue.toLocaleString()}` },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`p-5 ${i % 2 === 1 ? 'border-l border-rule' : ''} ${
              i > 1 ? 'border-t border-rule lg:border-t-0' : ''
            } ${i === 2 ? 'lg:border-l' : ''}`}
          >
            <p className="label-caps text-ink-soft">{stat.label}</p>
            <p className="ledger-lg mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="mt-10 border border-ink p-10 md:p-16 text-center">
          <h2 className="headline-md">No galleries on file</h2>
          <p className="body-md mt-3 text-ink-soft max-w-sm mx-auto">
            Create a gallery, upload the shoot, then send your client the private link.
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-outline mt-8">
            Create your first gallery
          </button>
        </div>
      ) : (
        <div className="mt-10 border border-ink">
          {projects.map((proj, i) => (
            <div
              key={proj.id}
              className={`flex flex-col md:flex-row md:items-stretch ${
                i > 0 ? 'border-t border-ink' : ''
              }`}
            >
              <Link
                href={`/dashboard/projects/${proj.id}`}
                className="w-full md:w-44 h-44 md:h-auto shrink-0 bg-band border-b md:border-b-0 md:border-r border-rule overflow-hidden"
              >
                {proj.cover_filename ? (
                  <img
                    src={`/api/media/${proj.cover_filename}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center label-caps text-ink-soft">
                    No frames
                  </span>
                )}
              </Link>

              <div className="flex-1 min-w-0 p-5 flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/projects/${proj.id}`}>
                    <h2 className="headline-md truncate">{proj.title}</h2>
                  </Link>
                  <p className="body-sm text-ink-soft mt-1 truncate">
                    /{studioHandle}/gallery/{proj.slug}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <span
                      className={`status label-caps ${
                        proj.price_ngn > 0 ? 'status-processing' : 'status-paid'
                      }`}
                    >
                      {proj.price_ngn > 0 ? `₦${proj.price_ngn.toLocaleString()}` : 'Free download'}
                    </span>
                    <span className="label-caps text-ink-soft">
                      {proj.passcode ? 'Passcode set' : 'Open link'}
                    </span>
                    <span className="label-caps text-ink-soft">
                      {proj.media_count || 0} frames · {formatBytes(proj.total_size || 0)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-5 shrink-0">
                  <button
                    onClick={() => copyLink(proj.slug)}
                    className="label-ui text-ink-soft hover:text-ink"
                  >
                    {copiedSlug === proj.slug ? 'Copied' : 'Copy link'}
                  </button>
                  <Link
                    href={`/${studioHandle}/gallery/${proj.slug}`}
                    target="_blank"
                    className="label-ui text-ink-soft hover:text-ink"
                  >
                    Client view
                  </Link>
                  <Link href={`/dashboard/projects/${proj.id}`} className="btn btn-outline">
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 scrim overflow-y-auto p-4 md:p-10">
          <div className="max-w-xl mx-auto bg-paper border border-ink">
            <div className="band px-6 py-5 flex items-start justify-between gap-6">
              <div>
                <p className="label-caps text-ink-soft">New entry</p>
                <h2 className="headline-lg mt-2">Create a gallery</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="label-ui text-ink-soft hover:text-ink"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-5">
              <div>
                <label className="label-caps text-ink-soft block mb-2">Gallery title</label>
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
                <label className="label-caps text-ink-soft block mb-2">Link</label>
                <div className="flex items-stretch">
                  <span className="label-ui text-ink-soft border border-r-0 border-ink-line px-3 flex items-center bg-band whitespace-nowrap">
                    /{studioHandle || 'studio'}/gallery/
                  </span>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="auto-generated from the title"
                    className="field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-caps text-ink-soft block mb-2">Passcode</label>
                  <input
                    type="text"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Blank for an open link"
                    className="field"
                  />
                </div>
                <div>
                  <label className="label-caps text-ink-soft block mb-2">Download fee (₦)</label>
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
                <label className="label-caps text-ink-soft block mb-2">Note to client</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="A short message shown above the frames"
                  className="field"
                />
              </div>

              <p className="body-sm text-ink-soft border-t border-rule pt-4">
                While a gallery is locked by passcode or awaiting payment, clients only ever see
                blurred frames — the readable files stay on your server.
              </p>

              {createError && (
                <p className="body-md text-clay border border-clay px-3 py-2">{createError}</p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button type="submit" disabled={creating} className="btn btn-primary">
                  {creating ? 'Creating…' : 'Create gallery'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
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
