'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatBytes } from '@/lib/format';

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [project, setProject] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [studioHandle, setStudioHandle] = useState('');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [passcode, setPasscode] = useState('');
  const [priceNgn, setPriceNgn] = useState('0');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) {
        router.push('/dashboard');
        return;
      }
      const data = await res.json();
      setProject(data.project);
      setMedia(data.media || []);
      setStudioHandle(data.studioHandle || '');
      setTitle(data.project.title);
      setSlug(data.project.slug);
      setDescription(data.project.description || '');
      setPasscode(data.project.passcode || '');
      setPriceNgn(data.project.price_ngn.toString());
    } catch (err) {
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const copyLink = () => {
    if (!project) return;
    navigator.clipboard.writeText(`${window.location.origin}/${studioHandle}/gallery/${project.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsError(null);
    setSettingsSuccess(false);

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          passcode: passcode.trim() || null,
          price_ngn: parseInt(priceNgn) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      setProject(data.project);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      setSettingsError(err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch(`/api/projects/${id}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setUploadSuccess(`${data.uploadedCount} frame(s) archived`);
      await fetchProject();
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Delete this frame from the gallery?')) return;
    try {
      const res = await fetch(`/api/projects/${id}/media/${mediaId}`, { method: 'DELETE' });
      if (res.ok) setMedia(media.filter((m) => m.id !== mediaId));
    } catch (err) {
      console.error('Delete media error:', err);
    }
  };

  const handleSetCover = async (mediaId: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/media/${mediaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setCover: true }),
      });
      if (res.ok) setProject({ ...project, cover_media_id: mediaId });
    } catch (err) {
      console.error('Set cover error:', err);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this gallery and every frame in it? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) router.push('/dashboard');
    } catch (err) {
      console.error('Delete project error:', err);
    }
  };

  if (loading || !project) {
    return <p className="label-caps text-ink-soft">Loading</p>;
  }

  const totalBytes = media.reduce((acc, m) => acc + (m.size_bytes || 0), 0);
  const hasPasscode = !!(project.passcode && project.passcode.trim());
  const hasFee = project.price_ngn > 0;

  return (
    <div>
      <Link href="/dashboard" className="label-caps text-ink-soft hover:text-ink">
        ← Galleries
      </Link>

      <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="min-w-0">
          <h1 className="headline-lg truncate">{project.title}</h1>
          <p className="body-sm text-ink-soft mt-2">
            /{studioHandle}/gallery/{project.slug} · {media.length} frames ·{' '}
            {formatBytes(totalBytes)}
          </p>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <button onClick={copyLink} className="label-ui text-ink-soft hover:text-ink">
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <Link href={`/${studioHandle}/gallery/${project.slug}`} target="_blank" className="btn btn-outline">
            Client view
          </Link>
        </div>
      </div>

      <div className="mt-8 border border-ink band px-5 py-4 flex flex-wrap items-center gap-x-8 gap-y-3">
        <span className={`status label-caps ${hasPasscode ? 'status-processing' : 'status-archived'}`}>
          {hasPasscode ? `Passcode ${project.passcode}` : 'No passcode'}
        </span>
        <span className={`status label-caps ${hasFee ? 'status-processing' : 'status-paid'}`}>
          {hasFee ? `₦${project.price_ngn.toLocaleString()} to release` : 'Free download'}
        </span>
        <span className="body-sm text-ink-soft">
          {hasPasscode || hasFee
            ? 'Clients see blurred frames until the gate is cleared.'
            : 'Anyone with the link can view and download.'}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <div>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              uploadFiles(e.dataTransfer.files);
            }}
            className={`border p-10 text-center cursor-pointer transition ${
              dragging ? 'border-green bg-band' : 'border-ink-line hover:border-ink'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => uploadFiles(e.target.files)}
              className="hidden"
            />
            <p className="headline-md">{uploading ? 'Archiving…' : 'Drop frames here'}</p>
            <p className="label-caps text-ink-soft mt-3">JPG · PNG · WEBP · MP4 · MOV</p>
          </div>

          {uploadError && (
            <p className="mt-4 body-md text-clay border border-clay px-3 py-2">{uploadError}</p>
          )}
          {uploadSuccess && <p className="mt-4 body-md text-green">{uploadSuccess}</p>}

          <div className="mt-8 flex items-center justify-between">
            <p className="label-caps text-ink-soft">Contact sheet</p>
            <p className="label-caps text-ink-soft">{media.length} frames</p>
          </div>

          {media.length === 0 ? (
            <p className="mt-4 body-md text-ink-soft">
              Nothing archived yet. Add the shoot and your client sees it straight away.
            </p>
          ) : (
            <div className="mt-4 sheet grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {media.map((item) => {
                const isCover = project.cover_media_id === item.id;
                const isVideo = item.mime_type?.startsWith('video/');

                return (
                  <figure key={item.id}>
                    <div className="aspect-square bg-band flex items-center justify-center overflow-hidden">
                      {isVideo ? (
                        <span className="label-caps text-ink-soft">Video</span>
                      ) : (
                        <img
                          src={`/api/media/${item.filename}`}
                          alt={item.original_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>

                    <figcaption className="band border-t border-rule px-2 py-2">
                      <p className="body-sm truncate">{item.original_name}</p>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className="label-caps text-ink-soft">
                          {formatBytes(item.size_bytes)}
                        </span>
                        <span className="flex items-center gap-3">
                          {isCover ? (
                            <span className="label-caps text-brass">Cover</span>
                          ) : (
                            <button
                              onClick={() => handleSetCover(item.id)}
                              className="label-caps text-ink-soft hover:text-ink"
                            >
                              Cover
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMedia(item.id)}
                            className="label-caps text-ink-soft hover:text-clay"
                          >
                            Delete
                          </button>
                        </span>
                      </div>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          )}
        </div>

        <div className="border border-ink h-fit">
          <div className="band px-5 py-4">
            <p className="label-caps text-ink-soft">Gallery record</p>
          </div>

          <form onSubmit={handleSaveSettings} className="p-5 space-y-5">
            <div>
              <label className="label-caps text-ink-soft block mb-2">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="field"
              />
            </div>

            <div>
              <label className="label-caps text-ink-soft block mb-2">Link</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="field"
              />
            </div>

            <div>
              <label className="label-caps text-ink-soft block mb-2">Passcode</label>
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
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
                value={priceNgn}
                onChange={(e) => setPriceNgn(e.target.value)}
                className="field"
              />
              <p className="body-sm text-ink-soft mt-2">
                Clients browse blurred frames for free and pay this to release the originals. Set 0
                to leave the gallery open.
              </p>
            </div>

            <div>
              <label className="label-caps text-ink-soft block mb-2">Note to client</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="field"
              />
            </div>

            {settingsError && (
              <p className="body-md text-clay border border-clay px-3 py-2">{settingsError}</p>
            )}

            <button type="submit" disabled={savingSettings} className="btn btn-primary w-full">
              {savingSettings ? 'Saving…' : settingsSuccess ? 'Saved' : 'Save record'}
            </button>

            <div className="pt-4 border-t border-rule">
              <button
                type="button"
                onClick={handleDeleteProject}
                className="btn btn-destructive w-full"
              >
                Delete gallery
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
