import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  CalendarDays,
  Check,
  Copy,
  ExternalLink,
  Images,
  MessageSquareHeart,
  Send,
  Users,
} from 'lucide-react';
import { api, ApiError, albumUrl, shareUrl, whatsappUrl } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { useToast } from '@/components/ui/Toast';
import { Button, buttonClass } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Misc';
import { InvitationHeading, InvitationTabs } from '@/components/dashboard/InvitationTabs';
import { formatDate, formatDateShort, relativeTime } from '@/lib/format';

export default function InvitationOverview() {
  const { id = '' } = useParams();
  const { push } = useToast();
  const [publishing, setPublishing] = useState(false);

  const { data, loading, reload } = useAsync(async () => {
    const [inv, replies, notes, photos, guests] = await Promise.all([
      api.invitations.get(id),
      api.rsvps.list(id),
      api.messages.list(id),
      api.photos.list(id),
      api.guests.list(id),
    ]);
    return {
      invitation: inv.invitation,
      summary: replies.summary,
      messages: notes.messages,
      photos: photos.photos,
      guests: guests.guests,
    };
  }, [id]);

  if (loading || !data) {
    return (
      <div className="px-4 py-8 sm:px-7 lg:px-9">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-4 w-80" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const invitation = data.invitation;
  const summary = data.summary;
  const messages = data.messages;
  const photos = data.photos;
  const guests = data.guests;
  const events = [...invitation.data.events].sort((a, b) => a.date.localeCompare(b.date));

  const togglePublish = async () => {
    setPublishing(true);
    try {
      const next = invitation.status === 'published' ? 'draft' : 'published';
      await api.invitations.setStatus(id, next);
      push(next === 'published' ? 'Your invitation is live.' : 'The invitation is now a draft.');
      reload();
    } catch (error) {
      push(error instanceof ApiError ? error.message : 'That did not work.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      push(label);
    } catch {
      push(value, 'info');
    }
  };

  const total = Math.max(1, summary.total);
  const segments = [
    { label: 'Attending', value: summary.attending, color: '#7f8d78' },
    { label: 'Awaiting reply', value: summary.pending, color: '#b58a43' },
    { label: 'Declined', value: summary.declined, color: '#ded2c0' },
  ];
  let offset = 0;

  return (
    <div className="px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
      <InvitationHeading
        coupleA={invitation.data.coupleA}
        coupleB={invitation.data.coupleB}
        status={invitation.status}
        subtitle={`${formatDate(invitation.data.weddingDate)}${
          invitation.data.location ? ` · ${invitation.data.location}` : ''
        }`}
      />

      <div className="mt-6">
        <InvitationTabs invitationId={id} />
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Attending',
            value: summary.attending,
            hint: `${summary.headcount} seats in total`,
            icon: <Check size={13} />,
          },
          {
            label: 'Awaiting reply',
            value: summary.pending,
            hint: 'Nudge them if needed',
            icon: <Send size={13} />,
          },
          {
            label: 'Households',
            value: guests.length,
            hint: 'Personal links issued',
            icon: <Users size={13} />,
          },
          {
            label: 'Blessings & photos',
            value: messages.length + photos.length,
            hint: `${messages.length} notes · ${photos.length} photographs`,
            icon: <MessageSquareHeart size={13} />,
          },
        ].map((card) => (
          <div key={card.label} className="panel p-4">
            <div className="flex items-center justify-between">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted">
                {card.label}
              </p>
              <span className="grid h-7 w-7 place-items-center rounded-full border border-line text-gold">
                {card.icon}
              </span>
            </div>
            <p className="mt-3 font-display text-[2.1rem] leading-none text-ink">{card.value}</p>
            <p className="mt-1.5 text-[0.72rem] text-muted">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Sharing</p>
              <h2 className="display mt-1.5 text-[1.55rem] text-ink">
                {invitation.status === 'published' ? 'The invitation is live' : 'Not published yet'}
              </h2>
            </div>
            <Button
              variant={invitation.status === 'published' ? 'outline' : 'primary'}
              size="sm"
              loading={publishing}
              onClick={() => void togglePublish()}
            >
              {invitation.status === 'published' ? 'Unpublish' : 'Publish'}
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="flex min-w-0 flex-1 items-center rounded-lg border border-line bg-ivory px-3 py-2">
              <span className="truncate text-[0.76rem] text-ink-soft">{shareUrl(invitation.slug)}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void copy(shareUrl(invitation.slug), 'Invitation link copied.')}
            >
              <Copy size={12} /> Copy
            </Button>
            <a href={`/preview/${id}`} target="_blank" rel="noreferrer" className={buttonClass('outline', 'sm')}>
              <ExternalLink size={12} /> Preview
            </a>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="rounded-xl border border-line bg-[#fbf7ef] p-4">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted">
                RSVP progress
              </p>
              <div className="mt-3 flex items-center gap-5">
                <div className="relative h-[6.4rem] w-[6.4rem] flex-none">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#ece2d1" strokeWidth="10" />
                    {segments.map((segment) => {
                      const length = (segment.value / total) * 264;
                      offset += length;
                      return (
                        <circle
                          key={segment.label}
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke={segment.color}
                          strokeWidth="10"
                          strokeDasharray={`${length} 264`}
                          strokeDashoffset={-offset}
                        />
                      );
                    })}
                  </svg>
                  <span className="absolute inset-0 grid place-items-center text-center">
                    <span>
                      <span className="block font-display text-[1.35rem] leading-none text-ink">
                        {summary.total}
                      </span>
                      <span className="text-[0.48rem] uppercase tracking-[0.12em] text-muted">
                        households
                      </span>
                    </span>
                  </span>
                </div>
                <ul className="space-y-2 text-[0.76rem]">
                  {segments.map((segment) => (
                    <li key={segment.label} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: segment.color }} />
                      <span className="text-ink-soft">{segment.label}</span>
                      <span className="font-semibold text-ink">{segment.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to={`/dashboard/i/${id}/rsvps`}
                className="mt-3 inline-flex text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-gold"
              >
                Open all replies
              </Link>
            </div>

            <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-[#fbf7ef] p-4">
              <QRCodeSVG
                value={shareUrl(invitation.slug)}
                size={96}
                bgColor="#fbf7ef"
                fgColor="#211b16"
                level="M"
              />
              <p className="text-[0.55rem] uppercase tracking-[0.12em] text-muted">Scan to open</p>
              <button
                type="button"
                className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-gold"
                onClick={() => void copy(albumUrl(invitation.slug), 'Album link copied.')}
              >
                Copy album link
              </button>
            </div>
          </div>

          <a
            href={whatsappUrl(
              shareUrl(invitation.slug),
              `${invitation.data.coupleA} & ${invitation.data.coupleB} would love you to see this:`,
            )}
            target="_blank"
            rel="noreferrer"
            className={buttonClass('ghost', 'sm', 'mt-4')}
          >
            <Send size={12} /> Share on WhatsApp
          </a>
        </section>

        <section className="panel p-5">
          <p className="eyebrow">The schedule</p>
          <h2 className="display mt-1.5 text-[1.55rem] text-ink">
            {events.length} {events.length === 1 ? 'celebration' : 'celebrations'}
          </h2>
          <ul className="mt-4 space-y-3">
            {events.map((event) => (
              <li key={event.id} className="flex gap-3 border-b border-line/60 pb-3 last:border-0">
                <span className="grid h-11 w-11 flex-none place-items-center rounded-lg border border-line bg-[#fbf7ef]">
                  <span className="font-display text-[1.1rem] leading-none text-ink">
                    {formatDateShort(event.date, { day: 'numeric', month: 'short' })}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[0.82rem] font-medium text-ink">{event.name}</span>
                  <span className="block text-[0.7rem] text-muted">
                    {event.startTime}
                    {event.venue ? ` · ${event.venue}` : ''}
                  </span>
                </span>
              </li>
            ))}
            {events.length === 0 && (
              <li className="text-[0.8rem] text-muted">
                No ceremonies yet —{' '}
                <Link to={`/studio/${id}`} className="text-gold">
                  add them in the studio
                </Link>
                .
              </li>
            )}
          </ul>
          <Link to={`/studio/${id}`} className={buttonClass('outline', 'sm', 'mt-4')}>
            <CalendarDays size={12} /> Edit the schedule
          </Link>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Latest blessings</p>
            <Link
              to={`/dashboard/i/${id}/messages`}
              className="text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-gold"
            >
              See all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {messages.slice(0, 3).map((message) => (
              <li key={message.id} className="rounded-xl border border-line/70 bg-[#fbf7ef] px-3.5 py-3">
                <p className="text-[0.8rem] leading-relaxed text-ink-soft">{message.text}</p>
                <p className="mt-1.5 flex items-center justify-between text-[0.66rem] text-muted">
                  <span className="font-script text-[0.95rem] text-gold">{message.author}</span>
                  <span>{relativeTime(message.createdAt)}</span>
                </p>
              </li>
            ))}
            {messages.length === 0 && (
              <li className="text-[0.8rem] text-muted">
                No blessings yet. They appear here the moment a guest writes one.
              </li>
            )}
          </ul>
        </section>

        <section className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Guest album</p>
            <Link
              to={`/dashboard/i/${id}/album`}
              className="text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-gold"
            >
              Manage
            </Link>
          </div>
          {photos.length > 0 ? (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {photos.slice(0, 8).map((photo) => (
                <img
                  key={photo.id}
                  src={photo.thumbUrl}
                  alt={`Added by ${photo.uploadedBy}`}
                  loading="lazy"
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 flex items-center gap-2 text-[0.8rem] text-muted">
              <Images size={14} className="text-gold" />
              No guest photographs yet — share the album QR at the venue.
            </p>
          )}
          <p className="mt-3 text-[0.72rem] text-muted">
            {invitation.data.settings.albumEnabled
              ? invitation.data.settings.albumPublic
                ? 'The album is open for uploads.'
                : 'The album is read-only at the moment.'
              : 'The shared album is switched off.'}
          </p>
        </section>
      </div>
    </div>
  );
}
