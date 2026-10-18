import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Music4, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

export function ImageUploader({
  invitationId,
  label,
  hint,
  value,
  onChange,
  aspect = 'aspect-[4/5]',
}: {
  invitationId: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const upload = async (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please choose a JPEG, PNG or WebP image.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('That image is larger than 15 MB.');
      return;
    }
    setBusy(true);
    try {
      const result = await api.invitations.uploadImage(invitationId, file);
      onChange(result.url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'The image could not be uploaded.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="label">
        <span>{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[0.62rem] font-semibold tracking-[0.1em] text-muted uppercase transition hover:text-[#a84632]"
          >
            Remove
          </button>
        )}
      </p>
      <div
        className={`upload-drop ${dragging ? 'border-gold bg-gold/10' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) void upload(file);
        }}
      >
        {value ? (
          <div className="flex items-center gap-3 text-left">
            <img
              src={value}
              alt=""
              className={`${aspect} h-20 w-20 flex-none rounded-lg object-cover`}
            />
            <div className="min-w-0">
              <p className="truncate text-[0.75rem] text-ink-soft">Uploaded</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gold"
              >
                Replace
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 py-2"
            disabled={busy}
          >
            <span className="grid h-10 w-10 place-items-center rounded-full border border-line bg-paper text-gold">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
            </span>
            <span className="text-[0.78rem] font-medium text-ink">
              {busy ? 'Uploading…' : 'Choose an image'}
            </span>
            {hint && <span className="text-[0.68rem] text-muted">{hint}</span>}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = '';
          }}
        />
      </div>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function AudioUploader({
  invitationId,
  value,
  onChange,
  onMeta,
}: {
  invitationId: string;
  value: string | null;
  onChange: (url: string | null, name?: string) => void;
  onMeta?: (title: string, artist: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);
    if (!file.type.startsWith('audio/')) {
      setError('Please choose an MP3, M4A, WAV or OGG file.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('That audio file is larger than 15 MB.');
      return;
    }
    setBusy(true);
    try {
      const result = await api.invitations.uploadAudio(invitationId, file);
      const clean = file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ');
      onChange(result.url, clean);
      onMeta?.(clean, '');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'The audio file could not be uploaded.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="label">
        <span>Your own recording</span>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              onMeta?.('', '');
            }}
            className="inline-flex items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-muted transition hover:text-[#a84632]"
          >
            <Trash2 size={11} /> Remove
          </button>
        )}
      </p>
      <div className="upload-drop">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center gap-3 text-left"
          disabled={busy}
        >
          <span className="grid h-10 w-10 flex-none place-items-center rounded-full border border-line bg-paper text-gold">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Music4 size={16} />}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[0.78rem] font-medium text-ink">
              {value ? value.split('/').pop() : busy ? 'Uploading…' : 'Choose an audio file'}
            </span>
            <span className="block text-[0.68rem] text-muted">MP3, M4A, WAV or OGG · up to 15 MB</span>
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = '';
          }}
        />
      </div>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
