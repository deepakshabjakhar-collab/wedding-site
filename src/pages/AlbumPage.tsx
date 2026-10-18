import { useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, CloudUpload, ImagePlus, Loader2, X } from 'lucide-react';
import type { PhotoRecord } from '@shared/types';
import { api } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { resolveTheme, themeStyle } from '@/templates/registry';
import { Gallery } from '@/components/invitation/Gallery';
import { uploadPhoto, validatePhoto } from '@/lib/upload';
import { buttonClass } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Misc';

interface QueueItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

export function AlbumPage() {
  const { slug = '' } = useParams();
  const [params] = useSearchParams();
  const token = params.get('token') ?? undefined;

  const storedToken = useMemo(() => {
    if (token) return token;
    try {
      return window.localStorage.getItem(`vellum:guest:${slug}`) ?? undefined;
    } catch {
      return undefined;
    }
  }, [slug, token]);

  const { data, loading, error } = useAsync(
    () => api.public.get(slug, storedToken),
    [slug, storedToken],
  );

  const [photos, setPhotos] = useState<PhotoRecord[] | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [author, setAuthor] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allPhotos = photos ?? data?.photos ?? [];
  const guest = data?.personalization?.guest ?? null;

  const theme = data ? resolveTheme(data.invitation.templateId, data.invitation.data.theme) : null;
  const invitation = data?.invitation;

  const handleFiles = async (files: FileList | File[]) => {
    const list = [...files].slice(0, 20);
    if (!list.length) return;
    for (const file of list) {
      const validation = validatePhoto(file);
      const id = `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`;
      if (validation) {
        setQueue((prev) => [...prev, { id, name: file.name, size: file.size, progress: 0, status: 'error', error: validation }]);
        continue;
      }
      setQueue((prev) => [...prev, { id, name: file.name, size: file.size, progress: 0, status: 'uploading' }]);
      const result = await uploadPhoto(slug, file, {
        token: storedToken,
        author: guest?.name ?? author,
        onProgress: (percent) =>
          setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, progress: percent } : item))),
      });
      const uploaded = result.photo;
      if (uploaded) {
        setPhotos((prev) => [uploaded, ...(prev ?? data?.photos ?? [])]);
        setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'done', progress: 100 } : item)));
        window.setTimeout(() => setQueue((prev) => prev.filter((item) => item.id !== id)), 2600);
      } else {
        setQueue((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: 'error', error: result.error } : item)),
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-svh place-items-center bg-[#f6f1e7]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={22} className="animate-spin text-[#a9835b]" />
          <p className="eyebrow">Fetching the album</p>
        </div>
      </div>
    );
  }

  if (error || !data || !theme || !invitation) {
    return (
      <div className="grid min-h-svh place-items-center bg-[#191410] px-5">
        <div className="w-full max-w-md text-center text-[#f3e8d7]">
          <Logo tone="light" />
          <h1 className="mt-8 font-display text-[1.9rem]">This album is not open</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#cfc0ad]">
            {error ?? 'The shared album could not be loaded.'} If you received a personal link, open it
            and try again.
          </p>
          <Link to="/" className={buttonClass('gold', 'md', 'mt-6')}>
            Visit Vellum
          </Link>
        </div>
      </div>
    );
  }

  const albumEnabled = invitation.data.settings.albumEnabled && invitation.data.settings.albumPublic;

  return (
    <div className="invite-shell min-h-svh" style={themeStyle(theme)}>
      <div className="invite-root min-h-svh" data-layout={theme.layout}>
        <header className="border-b border-[var(--inv-line)] px-5 py-6 sm:px-8">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4">
            <Link
              to={`/i/${slug}${storedToken ? `/g/${storedToken}` : ''}`}
              className="inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--inv-muted)] transition hover:text-[var(--inv-accent)]"
            >
              <ArrowLeft size={13} /> Back to the invitation
            </Link>
            <span className="inv-label !text-[0.52rem]">
              {invitation.data.coupleA} &amp; {invitation.data.coupleB}
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="max-w-2xl">
            <p className="inv-eyebrow">Shared album</p>
            <h1 className="inv-display mt-3 text-[clamp(2.1rem,8cqw,3.4rem)] leading-[1.03]">
              Add your photographs
            </h1>
            <p className="inv-body-copy mt-4">
              {guest
                ? `Thank you for being part of ${invitation.data.coupleA} and ${invitation.data.coupleB}'s day, ${guest.name}. Every photograph you add appears here for the couple.`
                : `Every photograph you add appears here for ${invitation.data.coupleA} and ${invitation.data.coupleB}.`}
            </p>
          </div>

          {!albumEnabled ? (
            <div className="inv-card mt-9 p-6">
              <p className="text-sm text-[var(--inv-muted)]">
                The shared album is currently closed. Please speak to the couple if you would like to
                share photographs.
              </p>
            </div>
          ) : (
            <>
              {!guest && (
                <div className="mt-8 max-w-md">
                  <label htmlFor="album-author" className="inv-field-label">
                    Your name (so they know who to thank)
                  </label>
                  <input
                    id="album-author"
                    className="inv-input"
                    value={author}
                    onChange={(event) => setAuthor(event.target.value)}
                    placeholder="Optional"
                    maxLength={80}
                  />
                </div>
              )}

              <div
                className={`mt-7 rounded-[3px] border-2 border-dashed p-8 text-center transition sm:p-12 ${
                  dragging
                    ? 'border-[var(--inv-accent)] bg-[var(--inv-accent)]/8'
                    : 'border-[var(--inv-line)] bg-[var(--inv-surface)]/60'
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  void handleFiles(event.dataTransfer.files);
                }}
              >
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[var(--inv-accent)]/35 text-[var(--inv-accent)]">
                  <CloudUpload size={22} />
                </span>
                <p className="inv-display mt-4 text-[1.4rem]">Drop your photographs here</p>
                <p className="mt-1.5 text-[0.8rem] text-[var(--inv-muted)]">
                  JPEG, PNG or WebP · up to 15 MB each · up to 20 at a time
                </p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inv-btn mt-5"
                >
                  <ImagePlus size={13} /> Choose photographs
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    if (event.target.files) void handleFiles(event.target.files);
                    event.target.value = '';
                  }}
                />
                <p className="mt-4 text-[0.68rem] text-[var(--inv-muted)]">
                  On a phone, you can take a photograph as you add it.
                </p>
              </div>

              <AnimatePresence>
                {queue.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-5 space-y-2"
                  >
                    {queue.map((item) => (
                      <li key={item.id} className="inv-card flex items-center gap-3 px-3.5 py-2.5">
                        <span className="grid h-8 w-8 flex-none place-items-center rounded-full border border-[var(--inv-line)] text-[var(--inv-accent)]">
                          {item.status === 'done' ? (
                            <Check size={14} />
                          ) : item.status === 'error' ? (
                            <X size={14} />
                          ) : (
                            <Loader2 size={14} className="animate-spin" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.78rem] text-[var(--inv-ink)]">{item.name}</span>
                          {item.status === 'uploading' ? (
                            <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-[var(--inv-line)]/60">
                              <span
                                className="block h-full rounded-full bg-[var(--inv-accent)] transition-[width] duration-300"
                                style={{ width: `${item.progress}%` }}
                              />
                            </span>
                          ) : (
                            <span className="block text-[0.68rem] text-[var(--inv-muted)]">
                              {item.status === 'done' ? 'Added to the album' : item.error}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>

              <section className="mt-14">
                <div className="flex items-end justify-between gap-4">
                  <h2 className="inv-display text-[1.7rem]">
                    {allPhotos.length > 0
                      ? `${allPhotos.length} ${allPhotos.length === 1 ? 'photograph' : 'photographs'} so far`
                      : 'No photographs yet'}
                  </h2>
                  {guest && (
                    <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--inv-muted)]">
                      Adding as {guest.name}
                    </p>
                  )}
                </div>
                {allPhotos.length > 0 ? (
                  <div className="mt-6">
                    <Gallery
                      items={allPhotos.map((photo) => ({
                        id: photo.id,
                        src: photo.url,
                        alt: `Photograph by ${photo.uploadedBy}`,
                        caption: photo.uploadedBy ? `Added by ${photo.uploadedBy}` : undefined,
                      }))}
                      layout={theme.layout}
                    />
                  </div>
                ) : (
                  <p className="mt-4 text-sm italic text-[var(--inv-muted)]">
                    Yours could be the first. Be quick — before the couple starts scrolling.
                  </p>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
