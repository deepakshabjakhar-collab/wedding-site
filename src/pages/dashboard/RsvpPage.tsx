import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Accessibility,
  CalendarCheck,
  ChefHat,
  Download,
  Mail,
  Music4,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import type { GuestRecord } from '@shared/types';
import { api } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { useToast } from '@/components/ui/Toast';
import { buttonClass } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, RsvpPill, Skeleton } from '@/components/ui/Misc';
import { InvitationHeading, InvitationTabs } from '@/components/dashboard/InvitationTabs';
import { relativeTime } from '@/lib/format';

type Filter = 'all' | 'attending' | 'pending' | 'declined';

export default function RsvpPage() {
  const { id = '' } = useParams();
  const { push } = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<GuestRecord | null>(null);

  const { data, loading } = useAsync(async () => {
    const [inv, replies] = await Promise.all([api.invitations.get(id), api.rsvps.list(id)]);
    return { invitation: inv.invitation, guests: replies.guests, summary: replies.summary };
  }, [id]);

  const guests = data?.guests ?? [];
  const summary = data?.summary;

  const stateOf = (guest: GuestRecord) =>
    guest.rsvp ? (guest.rsvp.attending ? 'attending' : 'declined') : 'pending';

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return guests
      .filter((guest) => (filter === 'all' ? true : stateOf(guest) === filter))
      .filter((guest) => (needle ? guest.name.toLowerCase().includes(needle) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guests, filter, query]);

  const mealRows = useMemo(() => {
    const entries = Object.entries(summary?.meals ?? {}).sort((a, b) => b[1] - a[1]);
    const max = Math.max(1, ...entries.map(([, count]) => count));
    return { entries, max };
  }, [summary]);

  const needs = guests.filter((guest) => guest.rsvp?.attending);
  const dietary = needs.filter((guest) => guest.rsvp?.dietary?.trim());
  const accessible = needs.filter((guest) => guest.rsvp?.accessibility?.trim());
  const songs = needs.filter((guest) => guest.rsvp?.songRequest?.trim());

  const emails = guests
    .map((guest) => guest.email)
    .filter((email): email is string => Boolean(email));

  const copyEmails = async () => {
    try {
      await navigator.clipboard.writeText(emails.join(', '));
      push(`${emails.length} email addresses copied.`);
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
          <p className="eyebrow">Replies</p>
          <h2 className="display mt-1.5 text-[1.85rem] text-ink">Every answer, in one place</h2>
          <p className="mt-1 text-[0.8rem] text-muted">
            Meals, dietary needs and song requests — ready for your caterer and band.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/invitations/${id}/rsvps.csv`} download className={buttonClass('outline', 'sm')}>
            <Download size={12} /> Export CSV
          </a>
          <button type="button" onClick={() => void copyEmails()} className={buttonClass('ghost', 'sm')}>
            <Mail size={12} /> Copy emails
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Yes',
            value: summary?.attending ?? 0,
            hint: `${summary?.headcount ?? 0} seats confirmed`,
            tone: 'text-[#5c7a4f]',
          },
          { label: 'Waiting', value: summary?.pending ?? 0, hint: 'No reply yet', tone: 'text-gold' },
          { label: 'No', value: summary?.declined ?? 0, hint: 'Unable to attend', tone: 'text-[#a05b4c]' },
          {
            label: 'Households',
            value: summary?.total ?? 0,
            hint: 'Invitations issued',
            tone: 'text-ink',
          },
        ].map((card) => (
          <div key={card.label} className="panel p-4">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted">{card.label}</p>
            <p className={`mt-2 font-display text-[2rem] leading-none ${card.tone}`}>{card.value}</p>
            <p className="mt-1.5 text-[0.7rem] text-muted">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line/70 px-4 py-3">
            <div className="flex items-center gap-1 rounded-full border border-line p-0.5">
              {(['all', 'attending', 'pending', 'declined'] as Filter[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`rounded-full px-3 py-1 text-[0.66rem] font-semibold capitalize transition ${
                    filter === key ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
            <label className="ml-auto flex min-w-[10rem] flex-1 items-center gap-2 rounded-lg border border-line bg-ivory px-3 py-1.5 sm:max-w-[16rem]">
              <Search size={13} className="text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a guest"
                aria-label="Search replies"
                className="w-full bg-transparent text-[0.78rem] text-ink outline-none placeholder:text-muted/70"
              />
            </label>
          </div>

          {loading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck size={20} />}
              title="No replies here yet"
              description="As guests answer, their meals, notes and requests appear here in real time."
            />
          ) : (
            <ul className="divide-y divide-line/50">
              {filtered.map((guest) => (
                <li key={guest.id}>
                  <button
                    type="button"
                    onClick={() => setDetail(guest)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#fbf7ef]/80"
                  >
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-full border border-line bg-ivory text-[0.68rem] font-semibold text-ink-soft">
                      {guest.partySize}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.84rem] font-medium text-ink">{guest.name}</span>
                      <span className="block truncate text-[0.68rem] text-muted">
                        {guest.rsvp?.attending
                          ? `${guest.rsvp.meal || 'Meal not chosen'}${guest.rsvp.dietary ? ` · ${guest.rsvp.dietary}` : ''}`
                          : guest.rsvp
                            ? 'Declined with grace'
                            : guest.groupName || 'Awaiting a reply'}
                      </span>
                    </span>
                    <span className="hidden items-center gap-2 sm:flex">
                      {guest.rsvp?.songRequest && <Music4 size={12} className="text-gold" />}
                      {guest.rsvp?.accessibility && <Accessibility size={12} className="text-gold" />}
                    </span>
                    <RsvpPill attending={guest.rsvp ? guest.rsvp.attending : undefined} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-5">
          <section className="panel p-5">
            <div className="flex items-center gap-2">
              <ChefHat size={14} className="text-gold" />
              <p className="eyebrow">Menu tallies</p>
            </div>
            <ul className="mt-3.5 space-y-2.5">
              {mealRows.entries.map(([meal, count]) => (
                <li key={meal}>
                  <div className="flex items-center justify-between text-[0.76rem]">
                    <span className="text-ink-soft">{meal}</span>
                    <span className="font-semibold text-ink">{count}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#ece2d1]">
                    <div
                      className="h-full rounded-full bg-gold/70"
                      style={{ width: `${(count / mealRows.max) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
              {mealRows.entries.length === 0 && (
                <li className="text-[0.78rem] text-muted">No meal choices yet.</li>
              )}
            </ul>
          </section>

          <section className="panel p-5">
            <p className="eyebrow">Kitchen notes</p>
            <ul className="mt-3 space-y-2.5">
              {dietary.map((guest) => (
                <li key={guest.id} className="rounded-lg border border-line/70 bg-[#fbf7ef] px-3 py-2">
                  <p className="text-[0.72rem] font-medium text-ink">{guest.name}</p>
                  <p className="text-[0.76rem] text-ink-soft">{guest.rsvp?.dietary}</p>
                </li>
              ))}
              {dietary.length === 0 && <li className="text-[0.78rem] text-muted">No dietary needs shared.</li>}
            </ul>
            {accessible.length > 0 && (
              <>
                <p className="mt-4 flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  <Accessibility size={11} /> Access needs
                </p>
                <ul className="mt-2 space-y-1.5 text-[0.76rem] text-ink-soft">
                  {accessible.map((guest) => (
                    <li key={guest.id}>
                      <span className="text-ink">{guest.name}:</span> {guest.rsvp?.accessibility}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section className="panel p-5">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-gold" />
              <p className="eyebrow">Song requests</p>
            </div>
            <ul className="mt-3 space-y-1.5 text-[0.78rem]">
              {songs.map((guest) => (
                <li key={guest.id} className="flex items-baseline gap-2">
                  <Music4 size={11} className="flex-none text-gold" />
                  <span className="text-ink-soft">{guest.rsvp?.songRequest}</span>
                  <span className="ml-auto flex-none text-[0.64rem] text-muted">{guest.name.split(' ')[0]}</span>
                </li>
              ))}
              {songs.length === 0 && <li className="text-muted">The dance floor is still a blank page.</li>}
            </ul>
          </section>

          <section className="panel p-5">
            <div className="flex items-center gap-2">
              <Users size={13} className="text-gold" />
              <p className="eyebrow">Latest replies</p>
            </div>
            <ul className="mt-3 space-y-2 text-[0.74rem]">
              {[...guests]
                .filter((guest) => guest.rsvp)
                .sort((a, b) => (b.rsvp?.updatedAt ?? '').localeCompare(a.rsvp?.updatedAt ?? ''))
                .slice(0, 5)
                .map((guest) => (
                  <li key={guest.id} className="flex justify-between gap-2 text-muted">
                    <span className="truncate text-ink-soft">{guest.name}</span>
                    <span className="flex-none">{relativeTime(guest.rsvp?.updatedAt ?? '')}</span>
                  </li>
                ))}
              {guests.filter((guest) => guest.rsvp).length === 0 && (
                <li className="text-muted">Nothing yet.</li>
              )}
            </ul>
          </section>
        </div>
      </div>

      {detail && (
        <Modal
          open
          onClose={() => setDetail(null)}
          title={detail.name}
          description={detail.email ?? detail.phone ?? undefined}
        >
          <div className="space-y-4 text-[0.82rem]">
            <div className="flex items-center gap-2">
              <RsvpPill attending={detail.rsvp ? detail.rsvp.attending : undefined} />
              {detail.rsvp && <span className="text-[0.7rem] text-muted">Answered {relativeTime(detail.rsvp.updatedAt)}</span>}
            </div>
            <Row label="Party size" value={`${detail.partySize} ${detail.partySize === 1 ? 'seat' : 'seats'}`} />
            <Row label="Group" value={detail.groupName || '—'} />
            <Row label="Meal" value={detail.rsvp?.meal || '—'} />
            <Row label="Dietary needs" value={detail.rsvp?.dietary || '—'} />
            <Row label="Children" value={detail.rsvp?.children || '—'} />
            <Row label="Accessibility" value={detail.rsvp?.accessibility || '—'} />
            <Row label="Song request" value={detail.rsvp?.songRequest || '—'} />
            <Row label="Note" value={detail.rsvp?.note || '—'} />
            {detail.notes && <Row label="Your private note" value={detail.notes} />}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            {detail.email && (
              <a
                href={`mailto:${detail.email}?subject=${encodeURIComponent('A note about our wedding')}`}
                className={buttonClass('outline', 'sm')}
              >
                <Mail size={12} /> Email
              </a>
            )}
            <button type="button" onClick={() => setDetail(null)} className={buttonClass('primary', 'sm')}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line/50 pb-2.5 last:border-0 sm:flex-row sm:justify-between sm:gap-6">
      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">{label}</span>
      <span className="text-right text-[0.84rem] text-ink">{value}</span>
    </div>
  );
}
