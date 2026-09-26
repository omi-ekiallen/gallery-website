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
    navigator.clipboard.writeText(`${window.location.origin}/gallery/${project.slug}`);
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

      setUploadSuccess(`${data.uploadedCount} file(s) uploaded`);
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
    if (!confirm('Delete this file from the gallery?')) return;
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
    if (!confirm('Delete this gallery and every file in it? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) router.push('/dashboard');
    } catch (err) {
      console.error('Delete project error:', err);
    }
  };

  if (loading || !project) {
    return <p className="label">Loading</p>;
  }

  const totalBytes = media.reduce((acc, m) => acc + (m.size_bytes || 0), 0);

  return (
    <div>
      <Link href="/dashboard" className="label hover:text-ink transition">
        ← Galleries
      </Link>

      <div className="mt-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <h1 className="font-display text-3xl sm:text-4xl truncate">{project.title}</h1>
          <p className="mt-4 text-[13px] text-muted">
            /gallery/{project.slug} · {media.length} files · {formatBytes(totalBytes)}
          </p>
        </div>

        <div className="flex items-center gap-8 text-[13px] shrink-0">
          <button onClick={copyLink} className="text-muted hover:text-ink transition">
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <Link href={`/gallery/${project.slug}`} target="_blank" className="link-underline">
            Open client view
          </Link>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-20">
        <div>
          <p className="label">Media</p>

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
            className={`mt-8 border border-dashed py-20 text-center cursor-pointer transition ${
              dragging ? 'border-ink bg-soft' : 'border-line hover:border-ink'
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
            <p className="font-display text-2xl">
              {uploading ? 'Uploading…' : 'Drop files here'}
            </p>
            <p className="label mt-4">JPG · PNG · WEBP · MP4 · MOV</p>
          </div>

          {uploadError && (
            <p className="mt-6 text-[13px] text-ink border-l border-ink pl-4">{uploadError}</p>
          )}
          {uploadSuccess && <p className="mt-6 text-[13px] text-muted">{uploadSuccess}</p>}

          {media.length === 0 ? (
            <p className="mt-16 text-[15px] text-muted">
              Nothing uploaded yet. Add the shoot and your client will see it straight away.
            </p>
          ) : (
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {media.map((item) => {
                const isCover = project.cover_media_id === item.id;
                const isVideo = item.mime_type?.startsWith('video/');

                return (
                  <div key={item.id}>
                    <div className="aspect-square bg-soft overflow-hidden flex items-center justify-center">
                      {isVideo ? (
                        <span className="label">Video</span>
                      ) : (
                        <img
                          src={`/api/media/${item.filename}`}
                          alt={item.original_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <p className="mt-3 text-[12px] text-muted truncate">{item.original_name}</p>
                    <div className="mt-2 flex items-center gap-5 text-[12px]">
                      {isCover ? (
                        <span className="label">Cover</span>
                      ) : (
                        <button
                          onClick={() => handleSetCover(item.id)}
                          className="text-muted hover:text-ink transition"
                        >
                          Set cover
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMedia(item.id)}
                        className="text-muted hover:text-ink transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <p className="label">Settings</p>

          <form onSubmit={handleSaveSettings} className="mt-8 space-y-10">
            <div>
              <label className="label block mb-3">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="field"
              />
            </div>

            <div>
              <label className="label block mb-3">Link</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="field"
              />
            </div>

            <div>
              <label className="label block mb-3">Passcode</label>
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
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
                value={priceNgn}
                onChange={(e) => setPriceNgn(e.target.value)}
                className="field"
              />
              <p className="mt-3 text-[12px] text-muted leading-relaxed">
                Clients can browse the previews for free. They pay this to download the originals.
                Set 0 to leave the gallery open.
              </p>
            </div>

            <div>
              <label className="label block mb-3">Note to client</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="field"
              />
            </div>

            {settingsError && (
              <p className="text-[13px] text-ink border-l border-ink pl-4">{settingsError}</p>
            )}

            <button type="submit" disabled={savingSettings} className="btn btn-solid w-full">
              {savingSettings ? 'Saving…' : settingsSuccess ? 'Saved' : 'Save settings'}
            </button>
          </form>

          <button
            onClick={handleDeleteProject}
            className="mt-16 text-[13px] text-muted hover:text-ink transition"
          >
            Delete this gallery
          </button>
        </div>
      </div>
    </div>
  );
}
