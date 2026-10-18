import { useMemo, useState, type FormEvent } from 'react';
import { Check, ChevronDown, Loader2, PartyPopper } from 'lucide-react';
import type { InvitationData, RsvpRecord } from '@shared/types';
import { api, ApiError } from '@/lib/api';
import { formatDateShort, formatDateTime } from '@/lib/format';
import { t, type InvitationLang } from './i18n';

interface GuestIdentity {
  name: string;
  partySize: number;
  invitedEventIds: string[];
  token: string;
}

export function RsvpForm({
  data,
  slug,
  guest,
  existingRsvp,
  token,
  lang,
  mode,
  onSubmitted,
}: {
  data: InvitationData;
  slug: string;
  guest: GuestIdentity | null;
  existingRsvp: RsvpRecord | null;
  token?: string;
  lang: InvitationLang;
  mode: 'live' | 'sample' | 'preview';
  onSubmitted?: (rsvp: RsvpRecord) => void;
}) {
  const settings = data.settings;
  const allowedEvents = useMemo(() => {
    const invited = guest?.invitedEventIds ?? [];
    if (!invited.length) return data.events;
    const set = new Set(invited);
    return data.events.filter((event) => set.has(event.id));
  }, [data.events, guest?.invitedEventIds]);

  const closed = Boolean(settings.rsvpDeadline && new Date(settings.rsvpDeadline).getTime() < Date.now());
  const needsIdentity = !guest && mode === 'live';

  const [attending, setAttending] = useState<boolean | null>(
    existingRsvp ? existingRsvp.attending : null,
  );
  const [eventIds, setEventIds] = useState<string[]>(
    existingRsvp?.eventIds?.length ? existingRsvp.eventIds : allowedEvents.map((e) => e.id),
  );
  const [meal, setMeal] = useState(existingRsvp?.meal ?? '');
  const [dietary, setDietary] = useState(existingRsvp?.dietary ?? '');
  const [accessibility, setAccessibility] = useState(existingRsvp?.accessibility ?? '');
  const [children, setChildren] = useState(existingRsvp?.children ?? '');
  const [song, setSong] = useState(existingRsvp?.songRequest ?? '');
  const [note, setNote] = useState(existingRsvp?.note ?? '');
  const [name, setName] = useState(guest?.name ?? '');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<RsvpRecord | null>(existingRsvp);
  const [editing, setEditing] = useState(!existingRsvp);
  const [activeToken, setActiveToken] = useState<string | undefined>(token);

  const toggleEvent = (id: string) => {
    setEventIds((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (attending === null) {
      setError('Please let us know whether you can join us.');
      return;
    }
    if (attending && allowedEvents.length > 0 && eventIds.length === 0) {
      setError('Please choose at least one celebration you will attend.');
      return;
    }
    if (needsIdentity && !name.trim()) {
      setError('Please tell us your name.');
      return;
    }
    if (needsIdentity && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError('Please check the email address you entered.');
      return;
    }

    if (mode !== 'live') {
      setSubmitted({
        id: 'preview',
        invitationId: 'preview',
        guestId: 'preview',
        attending,
        eventIds: attending ? eventIds : [],
        meal: settings.questions.meal ? meal : null,
        dietary: settings.questions.dietary ? dietary : null,
        accessibility: settings.questions.accessibility ? accessibility : null,
        children: settings.questions.children ? children : null,
        songRequest: settings.questions.songRequest ? song : null,
        note: note || null,
        updatedAt: new Date().toISOString(),
      });
      setEditing(false);
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.public.rsvp(slug, {
        token: activeToken,
        attending,
        eventIds: attending ? eventIds : [],
        meal: settings.questions.meal ? meal : '',
        dietary: settings.questions.dietary ? dietary : '',
        accessibility: settings.questions.accessibility ? accessibility : '',
        children: settings.questions.children ? children : '',
        songRequest: settings.questions.songRequest ? song : '',
        note,
        name: name.trim(),
        email: email.trim(),
      });
      try {
        if (!token) window.localStorage.setItem(`vellum:guest:${slug}`, result.token);
      } catch {
        /* storage may be unavailable */
      }
      setActiveToken(result.token);
      setSubmitted(result.rsvp);
      setEditing(false);
      onSubmitted?.(result.rsvp);
      if (!token && typeof window !== 'undefined') {
        const next = `/i/${slug}/g/${result.token}`;
        if (window.location.pathname !== next) {
          window.history.replaceState({}, '', next);
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Your reply could not be sent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (closed && !existingRsvp) {
    return (
      <div className="inv-card mx-auto max-w-2xl px-6 py-10 text-center">
        <p className="inv-label">{t(lang, 'rsvp')}</p>
        <p className="mt-3 font-[var(--inv-display)] text-[1.7rem] text-[var(--inv-ink)]">
          {t(lang, 'closed')}
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--inv-muted)]">
          If you need to change an existing reply, please write to the couple directly — they would
          much rather hear from you.
        </p>
      </div>
    );
  }

  if (!settings.allowPublicRsvp && !guest) {
    return (
      <div className="inv-card mx-auto max-w-2xl px-6 py-10 text-center">
        <p className="inv-label">{t(lang, 'rsvp')}</p>
        <p className="mt-3 font-[var(--inv-display)] text-[1.7rem] text-[var(--inv-ink)]">
          {t(lang, 'inviteOnly')}
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--inv-muted)]">
          Your personal link knows which celebrations you are invited to, and keeps your reply
          private.
        </p>
      </div>
    );
  }

  if (submitted && !editing) {
    const selected = (submitted.eventIds ?? [])
      .map((id) => data.events.find((event) => event.id === id)?.name)
      .filter(Boolean);
    return (
      <div className="inv-card mx-auto max-w-2xl overflow-hidden">
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-[var(--inv-accent)]/40 bg-[var(--inv-accent)]/10 text-[var(--inv-accent)]">
            <PartyPopper size={22} />
          </span>
          <p className="inv-label mt-5">{mode === 'live' ? 'Your reply is with us' : 'Preview reply'}</p>
          <p className="mt-2 font-[var(--inv-display)] text-[1.9rem] leading-tight text-[var(--inv-ink)]">
            {submitted.attending ? 'We cannot wait to celebrate with you.' : 'We will miss you, but we understand.'}
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--inv-muted)]">
            {mode === 'live'
              ? submitted.attending
                ? 'Your reply has been saved for the couple. You can return to this link any time to change it.'
                : 'The couple has been told. If your plans change, you can update your reply with this link.'
              : 'This is a live design preview, so nothing has been sent. The form is exactly what your guests will use.'}
          </p>

          <dl className="mt-7 w-full max-w-sm space-y-2.5 text-left text-sm">
            <div className="flex justify-between gap-4 border-b border-[var(--inv-line)]/60 pb-2.5">
              <dt className="text-[var(--inv-muted)]">Attending</dt>
              <dd className="font-medium text-[var(--inv-ink)]">
                {submitted.attending ? 'Joyfully yes' : 'Regretfully no'}
              </dd>
            </div>
            {submitted.attending && selected.length > 0 && (
              <div className="flex justify-between gap-4 border-b border-[var(--inv-line)]/60 pb-2.5">
                <dt className="shrink-0 text-[var(--inv-muted)]">Celebrations</dt>
                <dd className="text-right font-medium text-[var(--inv-ink)]">{selected.join(' · ')}</dd>
              </div>
            )}
            {submitted.attending && submitted.meal && (
              <div className="flex justify-between gap-4 border-b border-[var(--inv-line)]/60 pb-2.5">
                <dt className="text-[var(--inv-muted)]">Meal</dt>
                <dd className="font-medium text-[var(--inv-ink)]">{submitted.meal}</dd>
              </div>
            )}
            {guest && guest.partySize > 1 && (
              <div className="flex justify-between gap-4 border-b border-[var(--inv-line)]/60 pb-2.5">
                <dt className="text-[var(--inv-muted)]">Seats reserved</dt>
                <dd className="font-medium text-[var(--inv-ink)]">{guest.partySize}</dd>
              </div>
            )}
          </dl>

          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setSubmitted(null);
            }}
            className="inv-btn inv-btn-outline mt-7"
          >
            Change our reply
          </button>
          {mode === 'live' && !token && (
            <p className="mt-4 max-w-xs text-[0.68rem] leading-relaxed text-[var(--inv-muted)]">
              Your personal link is now in the address bar. Keep it — it is how you will update your
              reply.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="inv-card mx-auto max-w-2xl p-6 sm:p-9" noValidate>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="inv-label">{t(lang, 'yourReply')}</p>
          <h3 className="mt-2 font-[var(--inv-display)] text-[1.9rem] leading-tight text-[var(--inv-ink)]">
            {guest ? `Dear ${guest.name}, will you join us?` : 'Will you join us?'}
          </h3>
        </div>
        {settings.rsvpDeadline && (
          <p className="shrink-0 text-[0.68rem] leading-relaxed text-[var(--inv-muted)] sm:text-right">
            {t(lang, 'deadline')}
            <br />
            <span className="font-medium text-[var(--inv-ink)]">{formatDateTime(settings.rsvpDeadline)}</span>
          </p>
        )}
      </div>

      {guest && guest.partySize > 1 && (
        <p className="mt-3 text-xs leading-relaxed text-[var(--inv-muted)]">
          We have reserved {guest.partySize} seats for your household.
        </p>
      )}

      {needsIdentity && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rsvp-name" className="inv-field-label">
              {t(lang, 'name')}
            </label>
            <input
              id="rsvp-name"
              className="inv-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label htmlFor="rsvp-email" className="inv-field-label">
              {t(lang, 'email')} <span className="normal-case opacity-60">(optional)</span>
            </label>
            <input
              id="rsvp-email"
              type="email"
              className="inv-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="For a confirmation, if you would like one"
            />
          </div>
        </div>
      )}

      <fieldset className="mt-7">
        <legend className="inv-field-label">{t(lang, 'rsvp')}</legend>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {[
            { value: true, label: t(lang, 'attending'), sub: 'I will be there with bells on.' },
            { value: false, label: t(lang, 'declining'), sub: 'I will be thinking of you.' },
          ].map((option) => (
            <label
              key={String(option.value)}
              className={`flex cursor-pointer items-start gap-3 rounded-[2px] border p-4 transition ${
                attending === option.value
                  ? 'border-[var(--inv-accent)] bg-[var(--inv-accent)]/8'
                  : 'border-[var(--inv-line)] hover:border-[var(--inv-accent)]/50'
              }`}
            >
              <input
                type="radio"
                name="attending"
                className="sr-only"
                checked={attending === option.value}
                onChange={() => setAttending(option.value)}
              />
              <span
                className={`mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full border ${
                  attending === option.value
                    ? 'border-[var(--inv-accent)] bg-[var(--inv-accent)] text-[var(--inv-deep)]'
                    : 'border-[var(--inv-line)]'
                }`}
                aria-hidden
              >
                {attending === option.value && <Check size={11} />}
              </span>
              <span>
                <span className="block text-sm font-medium text-[var(--inv-ink)]">{option.label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-[var(--inv-muted)]">{option.sub}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {attending === true && allowedEvents.length > 0 && (
        <fieldset className="mt-6">
          <legend className="inv-field-label">{t(lang, 'events')}</legend>
          <div className="mt-2 grid gap-2">
            {allowedEvents.map((event) => {
              const checked = eventIds.includes(event.id);
              return (
                <label
                  key={event.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-[2px] border px-4 py-3 transition ${
                    checked
                      ? 'border-[var(--inv-accent)]/70 bg-[var(--inv-accent)]/6'
                      : 'border-[var(--inv-line)] hover:border-[var(--inv-accent)]/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggleEvent(event.id)}
                  />
                  <span
                    className={`grid h-5 w-5 flex-none place-items-center border ${
                      checked
                        ? 'border-[var(--inv-accent)] bg-[var(--inv-accent)] text-[var(--inv-deep)]'
                        : 'border-[var(--inv-line)]'
                    }`}
                    aria-hidden
                  >
                    {checked && <Check size={12} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-[var(--inv-ink)]">{event.name}</span>
                    <span className="block text-[0.7rem] text-[var(--inv-muted)]">
                      {formatDateShort(event.date)} · {event.venue}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {attending === true && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {settings.questions.meal && (
            <div className={settings.questions.dietary ? '' : 'sm:col-span-2'}>
              <label htmlFor="rsvp-meal" className="inv-field-label">
                {t(lang, 'meal')}
              </label>
              <div className="relative">
                <select
                  id="rsvp-meal"
                  className="inv-select"
                  value={meal}
                  onChange={(e) => setMeal(e.target.value)}
                >
                  <option value="">No preference</option>
                  {settings.mealOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--inv-muted)]" />
              </div>
            </div>
          )}
          {settings.questions.dietary && (
            <div>
              <label htmlFor="rsvp-dietary" className="inv-field-label">
                {t(lang, 'dietary')}
              </label>
              <input
                id="rsvp-dietary"
                className="inv-input"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder="Allergies, intolerances, anything we should know"
              />
            </div>
          )}
          {settings.questions.children && (
            <div>
              <label htmlFor="rsvp-children" className="inv-field-label">
                {t(lang, 'children')}
              </label>
              <input
                id="rsvp-children"
                className="inv-input"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                placeholder="Names and ages, if you are bringing them"
              />
            </div>
          )}
          {settings.questions.accessibility && (
            <div>
              <label htmlFor="rsvp-access" className="inv-field-label">
                {t(lang, 'accessibility')}
              </label>
              <input
                id="rsvp-access"
                className="inv-input"
                value={accessibility}
                onChange={(e) => setAccessibility(e.target.value)}
                placeholder="Step-free access, seating, anything at all"
              />
            </div>
          )}
          {settings.questions.songRequest && (
            <div className="sm:col-span-2">
              <label htmlFor="rsvp-song" className="inv-field-label">
                {t(lang, 'song')}
              </label>
              <input
                id="rsvp-song"
                className="inv-input"
                value={song}
                onChange={(e) => setSong(e.target.value)}
                placeholder="We are building the dance floor around you"
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <label htmlFor="rsvp-note" className="inv-field-label">
          {t(lang, 'note')} <span className="normal-case opacity-60">(optional)</span>
        </label>
        <textarea
          id="rsvp-note"
          className="inv-textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={800}
          placeholder="Anything you would like them to know…"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-[2px] border border-[#b4553f]/40 bg-[#b4553f]/8 px-3 py-2 text-sm text-[#8f3c2b]" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="max-w-[17rem] text-[0.65rem] leading-relaxed text-[var(--inv-muted)]">
          Your reply is private. Only the couple can see your details.
        </p>
        <button
          type="submit"
          className="inv-btn min-w-[11rem]"
          disabled={submitting || (closed && !existingRsvp)}
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
          {submitting ? t(lang, 'sending') : existingRsvp ? 'Update reply' : t(lang, 'send')}
        </button>
      </div>
      {closed && existingRsvp && (
        <p className="mt-3 text-[0.7rem] text-[var(--inv-muted)]">
          Replies closed on {formatDateTime(settings.rsvpDeadline ?? '')}, but you can still update an
          existing reply.
        </p>
      )}
    </form>
  );
}
