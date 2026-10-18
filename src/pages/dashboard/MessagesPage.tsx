import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Eye, EyeOff, Heart, MessageSquareHeart, Search, Trash2 } from 'lucide-react';
import type { GuestMessage } from '@shared/types';
import { api, ApiError } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { EmptyState, Skeleton } from '@/components/ui/Misc';
import { InvitationHeading, InvitationTabs } from '@/components/dashboard/InvitationTabs';
import { relativeTime } from '@/lib/format';

export default function MessagesPage() {
  const { id = '' } = useParams();
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'visible' | 'hidden'>('visible');
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, loading, reload } = useAsync(async () => {
    const [inv, notes] = await Promise.all([api.invitations.get(id), api.messages.list(id)]);
    return { invitation: inv.invitation, messages: notes.messages };
  }, [id]);

  const messages = data?.messages ?? [];
  const visible = messages.filter((message) => !message.hidden);
  const hidden = messages.filter((message) => message.hidden);

  const filtered = useMemo(() => {
    const rows = tab === 'visible' ? visible : hidden;
    const needle = query.trim().toLowerCase();
    return [...rows]
      .filter(
        (message) =>
          !needle ||
          message.text.toLowerCase().includes(needle) ||
          message.author.toLowerCase().includes(needle),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [tab, visible, hidden, query]);

  const toggle = async (message: GuestMessage) => {
    setBusyId(message.id);
    try {
      await api.messages.setHidden(id, message.id, !message.hidden);
      push(message.hidden ? 'The blessing is visible again.' : 'The blessing is hidden from guests.');
      reload();
    } catch (error) {
      push(error instanceof ApiError ? error.message : 'That did not work.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (message: GuestMessage) => {
    if (!window.confirm(`Delete the blessing from ${message.author}? This cannot be undone.`)) return;
    setBusyId(message.id);
    try {
      await api.messages.remove(id, message.id);
      push('Blessing deleted.');
      reload();
    } catch (error) {
      push(error instanceof ApiError ? error.message : 'Could not delete that blessing.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const copyAll = async () => {
    const text = visible
      .map((message) => `“${message.text}” — ${message.author}`)
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      push('All blessings copied — ready for the album.');
    } catch {
      push('Your browser blocked clipboard access.', 'error');
    }
  };

  return (
    <div className="px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
      {data ? (
        <InvitationHeading
          coupleA={data.invitation.data.coupleA}
          coupleB={data.invitation.data.coupleB}
          status={data.invitation.status}
        />
      ) : (
        <Skeleton className="h-9 w-60" />
      )}
      <div className="mt-6">
        <InvitationTabs invitationId={id} />
      </div>

      <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Blessings</p>
          <h2 className="display mt-1.5 text-[1.85rem] text-ink">Notes from the people you love</h2>
          <p className="mt-1 text-[0.8rem] text-muted">
            {visible.length} {visible.length === 1 ? 'message' : 'messages'} on the wall
            {hidden.length > 0 ? ` · ${hidden.length} hidden` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void copyAll()} disabled={visible.length === 0}>
            <Copy size={12} /> Copy all
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-full border border-line p-0.5">
          {(['visible', 'hidden'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-full px-3.5 py-1 text-[0.68rem] font-semibold capitalize transition ${
                tab === key ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
              }`}
            >
              {key}
              <span className="ml-1.5 opacity-60">{key === 'visible' ? visible.length : hidden.length}</span>
            </button>
          ))}
        </div>
        <label className="flex min-w-[12rem] flex-1 items-center gap-2 rounded-lg border border-line bg-ivory px-3 py-1.5 sm:max-w-xs">
          <Search size={13} className="text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes or names"
            aria-label="Search blessings"
            className="w-full bg-transparent text-[0.78rem] text-ink outline-none placeholder:text-muted/70"
          />
        </label>
      </div>

      {loading ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel mt-4">
          <EmptyState
            icon={tab === 'visible' ? <MessageSquareHeart size={20} /> : <EyeOff size={20} />}
            title={tab === 'visible' ? 'No blessings yet' : 'Nothing hidden'}
            description={
              tab === 'visible'
                ? 'Guests can leave a note at the end of the invitation. As they write, each one appears here — and on the wall your guests see.'
                : 'Messages you hide are kept here privately, in case you change your mind.'
            }
          />
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((message) => (
            <li
              key={message.id}
              className={`panel flex flex-col p-4 ${message.hidden ? 'opacity-70' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-script text-[1.45rem] leading-none text-gold">{message.author}</span>
                <span className="text-[0.62rem] text-muted">{relativeTime(message.createdAt)}</span>
              </div>
              <p className="mt-2.5 flex-1 text-[0.84rem] leading-relaxed text-ink-soft">“{message.text}”</p>
              <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2.5">
                <span className="flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.1em] text-muted">
                  <Heart size={10} className="text-gold" />
                  {message.hidden ? 'Hidden' : 'On the wall'}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => void toggle(message)}
                    disabled={busyId === message.id}
                    className="icon-btn"
                    title={message.hidden ? 'Show this blessing' : 'Hide from guests'}
                    aria-label={message.hidden ? 'Show blessing' : 'Hide blessing'}
                  >
                    {message.hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(message)}
                    disabled={busyId === message.id}
                    className="icon-btn text-[#a05b4c]"
                    title="Delete blessing"
                    aria-label="Delete blessing"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
