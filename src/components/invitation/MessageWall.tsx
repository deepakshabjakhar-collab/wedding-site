import { useState, type FormEvent } from 'react';
import { Loader2, Send } from 'lucide-react';
import type { InvitationData } from '@shared/types';

export interface WallMessage {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}
import { api, ApiError } from '@/lib/api';
import { relativeTime } from '@/lib/format';
import { t, type InvitationLang } from './i18n';

export function MessageWall({
  data,
  slug,
  guest,
  token,
  initialMessages,
  lang,
  mode,
}: {
  data: InvitationData;
  slug: string;
  guest: { name: string } | null;
  token?: string;
  initialMessages: WallMessage[];
  lang: InvitationLang;
  mode: 'live' | 'sample' | 'preview';
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [author, setAuthor] = useState(guest?.name ?? '');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!data.settings.messagesEnabled) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!guest && !author.trim()) {
      setError('Please add your name.');
      return;
    }
    if (!text.trim()) {
      setError('Please write a few words.');
      return;
    }
    if (mode !== 'live') {
      setNotice('This is a design preview — your blessing would appear here, but nothing was sent.');
      setText('');
      return;
    }
    setSending(true);
    try {
      const result = await api.public.message(slug, {
        token,
        author: author.trim(),
        text: text.trim(),
      });
      setMessages((prev) => [
        {
          id: result.message.id,
          author: result.message.author,
          text: result.message.text,
          createdAt: result.message.createdAt,
        },
        ...prev,
      ]);
      setText('');
      setNotice('Your blessing has been added. Thank you.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Your blessing could not be sent.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <form onSubmit={submit} className="inv-card p-5 sm:p-6" noValidate>
        <p className="inv-label">{t(lang, 'leaveMessage')}</p>
        {!guest && (
          <div className="mt-3">
            <label htmlFor="blessing-name" className="inv-field-label">
              {t(lang, 'name')}
            </label>
            <input
              id="blessing-name"
              className="inv-input"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={80}
              autoComplete="name"
            />
          </div>
        )}
        <div className="mt-3">
          <label htmlFor="blessing-text" className="inv-field-label">
            Your words
          </label>
          <textarea
            id="blessing-text"
            className="inv-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={800}
            placeholder={t(lang, 'messagePlaceholder')}
          />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[0.62rem] text-[var(--inv-muted)]">{text.length}/800</span>
            <button type="submit" className="inv-btn inv-btn-outline !min-h-[38px] !px-4 !text-[0.6rem]" disabled={sending}>
              {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={12} />}
              {sending ? 'Sending' : 'Send blessing'}
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-2 text-xs text-[#8f3c2b]" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="mt-2 text-xs text-[var(--inv-muted)]" role="status">
            {notice}
          </p>
        )}
      </form>

      {messages.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {messages.map((message) => (
            <article key={message.id} className="inv-message">
              <p className="relative z-10 pt-3 text-sm leading-relaxed text-[var(--inv-ink)]">
                {message.text}
              </p>
              <footer className="mt-3 flex items-baseline justify-between gap-3">
                <p className="font-[var(--inv-script)] text-[1.15rem] leading-none text-[var(--inv-accent)]">
                  {message.author}
                </p>
                <p className="text-[0.58rem] uppercase tracking-[0.1em] text-[var(--inv-muted)]/70">
                  {relativeTime(message.createdAt)}
                </p>
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-center text-sm italic text-[var(--inv-muted)]">
          The first blessing could be yours.
        </p>
      )}
    </div>
  );
}
