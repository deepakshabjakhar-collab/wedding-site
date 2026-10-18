import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  Link2,
  Lock,
  Plus,
  Search,
  Send,
  Trash2,
  TriangleAlert,
  Users,
} from 'lucide-react';
import type { GuestRecord } from '@shared/types';
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/Field';
import { Button, buttonClass } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RsvpPill, StatusPill } from '@/components/ui/Misc';
import { useToast } from '@/components/ui/Toast';
import { api, ApiError, shareUrl, whatsappUrl } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { formatDateTime } from '@/lib/format';
import type { PanelProps } from './panel-types';

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export function RsvpPanel({ data, updateSettings }: PanelProps) {
  const settings = data.settings;
  const [newMeal, setNewMeal] = useState('');

  return (
    <div className="space-y-8">
      <section>
        <p className="eyebrow">Replies</p>
        <h3 className="display mt-1.5 text-[1.6rem] text-ink">RSVP settings</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Reply by"
            htmlFor="rsvp-deadline"
            hint="After the deadline guests see a polite closing note"
          >
            <Input
              id="rsvp-deadline"
              type="datetime-local"
              value={toLocalInput(settings.rsvpDeadline)}
              onChange={(event) =>
                updateSettings({
                  rsvpDeadline: event.target.value ? new Date(event.target.value).toISOString() : null,
                })
              }
            />
          </Field>
          <Field label="Who can reply" htmlFor="visibility">
            <Select
              id="visibility"
              value={settings.visibility}
              onChange={(event) => updateSettings({ visibility: event.target.value as 'public' | 'unlisted' })}
            >
              <option value="public">Anyone with the link</option>
              <option value="unlisted">Only personal guest links</option>
            </Select>
          </Field>
        </div>
        {settings.rsvpDeadline && (
          <p className="hint">Currently closes {formatDateTime(settings.rsvpDeadline)}.</p>
        )}
        <div className="mt-4 space-y-2.5">
          <Switch
            checked={settings.allowPublicRsvp}
            onChange={(value) => updateSettings({ allowPublicRsvp: value })}
            label="Accept replies from the public link"
            description="Turn off if you would rather only count replies from invited households."
          />
        </div>
        {settings.visibility === 'unlisted' && (
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-line bg-paper/60 px-4 py-3 text-[0.76rem] leading-relaxed text-muted">
            <Lock size={13} className="mt-0.5 flex-none text-gold" />
            Unlisted means the invitation opens only through personal guest links. Sharing the plain
            link will show a polite privacy note instead.
          </p>
        )}
      </section>

      <section className="border-t border-line/70 pt-7">
        <p className="eyebrow">Questions</p>
        <h3 className="display mt-1.5 text-[1.6rem] text-ink">What you need to know</h3>
        <div className="mt-4 space-y-2.5">
          <Switch
            checked={settings.questions.meal}
            onChange={(value) => updateSettings({ questions: { ...settings.questions, meal: value } })}
            label="Meal preference"
            description="Guests choose from your menu options."
          />
          <Switch
            checked={settings.questions.dietary}
            onChange={(value) => updateSettings({ questions: { ...settings.questions, dietary: value } })}
            label="Dietary requirements & allergies"
          />
          <Switch
            checked={settings.questions.accessibility}
            onChange={(value) => updateSettings({ questions: { ...settings.questions, accessibility: value } })}
            label="Accessibility & seating needs"
          />
          <Switch
            checked={settings.questions.children}
            onChange={(value) => updateSettings({ questions: { ...settings.questions, children: value } })}
            label="Children joining them"
          />
          <Switch
            checked={settings.questions.songRequest}
            onChange={(value) => updateSettings({ questions: { ...settings.questions, songRequest: value } })}
            label="Song requests for the band"
          />
        </div>

        {settings.questions.meal && (
          <div className="mt-6">
            <p className="label">
              <span>Menu options</span>
            </p>
            <div className="space-y-2">
              {settings.mealOptions.map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(event) =>
                      updateSettings(
                        {
                          mealOptions: settings.mealOptions.map((item) =>
                            item === option ? event.target.value : item,
                          ),
                        },
                        `meal-${option}`,
                      )
                    }
                    maxLength={60}
                  />
                  <button
                    type="button"
                    className="icon-btn !h-9 !w-9 flex-none"
                    onClick={() =>
                      updateSettings({ mealOptions: settings.mealOptions.filter((item) => item !== option) })
                    }
                    aria-label={`Remove ${option}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Input
                value={newMeal}
                onChange={(event) => setNewMeal(event.target.value)}
                placeholder="Add another option"
                maxLength={60}
              />
              <Button
                variant="outline"
                size="sm"
                icon={<Plus size={13} />}
                onClick={() => {
                  if (!newMeal.trim()) return;
                  updateSettings({ mealOptions: [...settings.mealOptions, newMeal.trim()] });
                  setNewMeal('');
                }}
              >
                Add
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export function GuestsPanel({ invitation, data, goto }: PanelProps) {
  const { data: loaded, loading, reload } = useAsync(
    () => api.guests.list(invitation.id),
    [invitation.id],
  );
  const { push } = useToast();
  const guests = loaded?.guests ?? [];
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    groupName: 'Friends',
    partySize: 1,
    invitedEventIds: data.events.map((event) => event.id),
    notes: '',
  });

  const groups = useMemo(() => {
    const set = new Set(guests.map((guest) => guest.groupName));
    data.events.forEach((event) => event.guestGroup && set.add(event.guestGroup));
    return [...set];
  }, [data.events, guests]);

  const filtered = guests.filter((guest) =>
    `${guest.name} ${guest.email ?? ''} ${guest.groupName}`.toLowerCase().includes(search.toLowerCase()),
  );

  const copy = async (guest: GuestRecord) => {
    const url = shareUrl(invitation.slug, guest.token);
    try {
      await navigator.clipboard.writeText(url);
      push(`Personal link for ${guest.name} copied.`);
    } catch {
      push(url, 'info');
    }
  };

  const addGuest = async () => {
    if (!form.name.trim()) {
      push('Please add a name.', 'error');
      return;
    }
    setBusy(true);
    try {
      await api.guests.create(invitation.id, { ...form, name: form.name.trim() });
      push(`${form.name.trim()} added.`);
      setForm({
        name: '',
        email: '',
        phone: '',
        groupName: form.groupName,
        partySize: 1,
        invitedEventIds: form.invitedEventIds,
        notes: '',
      });
      setAdding(false);
      reload();
    } catch (error) {
      push(error instanceof ApiError ? error.message : 'The guest could not be added.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const importGuests = async () => {
    const rows = importText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, email, group] = line.split(',').map((part) => part.trim());
        const matchingEvents = data.events.filter(
          (event) => event.guestGroup && group && event.guestGroup.toLowerCase() === group.toLowerCase(),
        );
        return {
          name,
          email: email || undefined,
          groupName: group || 'Guests',
          partySize: 1,
          invitedEventIds: matchingEvents.length
            ? matchingEvents.map((event) => event.id)
            : data.events.map((event) => event.id),
        };
      })
      .filter((row) => row.name);
    if (!rows.length) {
      push('Nothing to import yet.', 'error');
      return;
    }
    setBusy(true);
    try {
      const result = await api.guests.importRows(invitation.id, rows);
      push(`${result.added} guests added.`);
      setImportOpen(false);
      setImportText('');
      reload();
    } catch (error) {
      push(error instanceof ApiError ? error.message : 'The import failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Guests</p>
          <h3 className="display mt-1.5 text-[1.6rem] text-ink">
            {guests.length} {guests.length === 1 ? 'household' : 'households'}
          </h3>
          <p className="mt-1.5 max-w-md text-[0.8rem] leading-relaxed text-muted">
            Each household gets a personal link. Only they see which ceremonies they are invited to.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            Paste a list
          </Button>
          <Button size="sm" icon={<Plus size={13} />} onClick={() => setAdding(true)}>
            Add guest
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search guests"
          className="pl-9"
          aria-label="Search guests"
        />
      </div>

      {adding && (
        <div className="rounded-xl border border-line bg-paper p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name or household" htmlFor="guest-name">
              <Input
                id="guest-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="The Sharma Family"
              />
            </Field>
            <Field label="Email" htmlFor="guest-email" optional>
              <Input
                id="guest-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </Field>
            <Field label="Phone" htmlFor="guest-phone" optional>
              <Input
                id="guest-phone"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </Field>
            <Field label="Group" htmlFor="guest-group">
              <Input
                id="guest-group"
                list="studio-groups"
                value={form.groupName}
                onChange={(event) => {
                  const group = event.target.value;
                  const matching = data.events.filter(
                    (item) => item.guestGroup && item.guestGroup.toLowerCase() === group.toLowerCase(),
                  );
                  setForm({
                    ...form,
                    groupName: group,
                    invitedEventIds: matching.length
                      ? matching.map((item) => item.id)
                      : form.invitedEventIds,
                  });
                }}
              />
              <datalist id="studio-groups">
                {groups.map((group) => (
                  <option key={group} value={group} />
                ))}
              </datalist>
            </Field>
            <Field label="Seats" htmlFor="guest-party">
              <Input
                id="guest-party"
                type="number"
                min={1}
                max={12}
                value={form.partySize}
                onChange={(event) => setForm({ ...form, partySize: Number(event.target.value) })}
              />
            </Field>
            <div className="sm:col-span-2">
              <p className="label">
                <span>Invited to</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {data.events.map((event) => {
                  const checked = form.invitedEventIds.includes(event.id);
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          invitedEventIds: checked
                            ? form.invitedEventIds.filter((id) => id !== event.id)
                            : [...form.invitedEventIds, event.id],
                        })
                      }
                      className={`rounded-full border px-3 py-1.5 text-[0.68rem] transition ${
                        checked ? 'border-ink bg-ink text-paper' : 'border-line text-muted hover:border-gold/50'
                      }`}
                      aria-pressed={checked}
                    >
                      {event.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="sm:col-span-2">
              <Field label="Private notes" htmlFor="guest-notes" optional>
                <Textarea
                  id="guest-notes"
                  value={form.notes}
                  onChange={(event) => setForm({ ...form, notes: event.target.value })}
                  className="!min-h-[70px]"
                  maxLength={600}
                />
              </Field>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button size="sm" onClick={() => void addGuest()} loading={busy}>
              Save guest
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-line bg-paper/60 px-4 py-8 text-center">
          <Users size={20} className="mx-auto text-gold" />
          <p className="mt-3 text-[0.85rem] font-medium text-ink">
            {guests.length ? 'No guests match that search' : 'No guests yet'}
          </p>
          <p className="mt-1 text-[0.78rem] text-muted">
            Add households one by one, or paste a list of names and let us do the rest.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line/60 overflow-hidden rounded-xl border border-line bg-paper">
          {filtered.map((guest) => (
            <li key={guest.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-ivory text-[0.65rem] font-semibold text-muted">
                {guest.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.84rem] font-medium text-ink">{guest.name}</span>
                <span className="block truncate text-[0.72rem] text-muted">
                  {guest.groupName} · {guest.partySize} {guest.partySize === 1 ? 'seat' : 'seats'}
                  {guest.email ? ` · ${guest.email}` : ''}
                </span>
              </span>
              <RsvpPill attending={guest.rsvp ? guest.rsvp.attending : undefined} />
              <span className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => void copy(guest)}
                  className="icon-btn !h-8 !w-8"
                  aria-label={`Copy personal link for ${guest.name}`}
                >
                  <Copy size={13} />
                </button>
                <a
                  href={whatsappUrl(shareUrl(invitation.slug, guest.token), `Dear ${guest.name},`)}
                  target="_blank"
                  rel="noreferrer"
                  className="icon-btn !h-8 !w-8"
                  aria-label={`Send ${guest.name} a WhatsApp message`}
                >
                  <Send size={13} />
                </a>
                <button
                  type="button"
                  className="icon-btn !h-8 !w-8"
                  onClick={async () => {
                    await api.guests.remove(invitation.id, guest.id).catch(() => undefined);
                    reload();
                  }}
                  aria-label={`Remove ${guest.name}`}
                >
                  <Trash2 size={13} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <Link to={`/dashboard/i/${invitation.id}/guests`} className={buttonClass('outline', 'sm')}>
          Open the full guest manager
        </Link>
        <button type="button" className={buttonClass('ghost', 'sm')} onClick={() => goto('rsvp')}>
          RSVP settings
        </button>
      </div>

      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Paste your guest list"
        description="One household per line. Add an email and group if you have them: Name, email, group"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => void importGuests()} loading={busy}>
              Add guests
            </Button>
          </div>
        }
      >
        <Textarea
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          className="textarea-tall"
          placeholder={'The Sharma Family, sharma@example.com, Family\nPriya Nair, priya@example.com, Friends'}
        />
        <p className="hint">
          Guests are invited to every ceremony by default. Groups that match a ceremony&rsquo;s
          “reserved for group” field are pre-filtered automatically.
        </p>
      </Modal>
    </div>
  );
}

export function PublishPanel({ invitation, data, update }: PanelProps) {
  const navigate = useNavigate();
  const { push } = useToast();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(invitation.status);
  const [slug, setSlug] = useState(invitation.slug);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const publicUrl = shareUrl(slug);

  const checks = [
    { label: 'Couple names and monogram', done: Boolean(data.coupleA && data.coupleB && data.monogram), tab: 'content' },
    { label: 'A wedding date and location', done: Boolean(data.weddingDate && data.location), tab: 'content' },
    { label: 'At least one celebration', done: data.events.length > 0 && data.events.every((e) => e.name && e.venue), tab: 'events' },
    { label: 'A type direction and envelope', done: Boolean(invitation.templateId), tab: 'design' },
    { label: 'A reply deadline', done: Boolean(data.settings.rsvpDeadline), tab: 'rsvp' },
    { label: 'At least one guest household', done: true, tab: 'guests' },
  ];

  const togglePublish = async () => {
    setBusy(true);
    try {
      const next = status === 'published' ? 'draft' : 'published';
      const result = await api.invitations.setStatus(invitation.id, next);
      setStatus(result.invitation.status);
      push(next === 'published' ? 'Your invitation is live.' : 'The invitation is now unpublished.');
    } catch (error) {
      push(error instanceof ApiError ? error.message : 'That did not work. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const saveSlug = async () => {
    setBusy(true);
    try {
      const result = await api.invitations.update(invitation.id, { data, slug });
      setSlug(result.invitation.slug);
      push('Link updated.');
    } catch (error) {
      push(error instanceof ApiError ? error.message : 'That link is not available.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.invitations.remove(invitation.id);
      push('Invitation deleted.');
      navigate('/dashboard');
    } catch (error) {
      push(error instanceof ApiError ? error.message : 'Could not delete the invitation.', 'error');
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Publishing</p>
            <h3 className="display mt-1.5 text-[1.6rem] text-ink">
              {status === 'published' ? 'Your invitation is live' : 'Ready when you are'}
            </h3>
          </div>
          <StatusPill status={status} />
        </div>

        <div className="mt-4 rounded-xl border border-line bg-paper p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-ivory px-3 py-2">
              <Link2 size={13} className="flex-none text-muted" />
              <span className="truncate text-[0.76rem] text-ink-soft">{publicUrl}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={<Copy size={13} />}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(publicUrl);
                  push('Link copied.');
                } catch {
                  push(publicUrl, 'info');
                }
              }}
            >
              Copy
            </Button>
            <a
              href={`/preview/${invitation.id}`}
              target="_blank"
              rel="noreferrer"
              className={buttonClass('outline', 'sm')}
            >
              <ExternalLink size={13} /> Guest view
            </a>
            <a
              href={whatsappUrl(publicUrl, `${data.coupleA} & ${data.coupleB} would love you to see this:`)}
              target="_blank"
              rel="noreferrer"
              className={buttonClass('outline', 'sm')}
            >
              <Send size={13} /> WhatsApp
            </a>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <Field label="Custom link" htmlFor="slug" hint="Changing the link breaks previously shared links">
              <div className="flex items-center gap-2">
                <span className="flex-none text-[0.8rem] text-muted">/i/</span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  onBlur={() => slug !== invitation.slug && void saveSlug()}
                  maxLength={60}
                />
              </div>
            </Field>
            <div className="rounded-xl border border-line bg-ivory p-3">
              <QRCodeSVG value={publicUrl} size={86} bgColor="#f6f1e7" fgColor="#211b16" level="M" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line/60 pt-4">
            <Button onClick={() => void togglePublish()} loading={busy} icon={status === 'published' ? <Lock size={13} /> : <Globe size={13} />}>
              {status === 'published' ? 'Unpublish' : 'Publish the invitation'}
            </Button>
            <p className="text-[0.74rem] text-muted">
              {status === 'published'
                ? 'Anyone with the link can open it. Personal links still control who sees which ceremonies.'
                : 'Nothing is public yet. Your work is saved either way.'}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-line/70 pt-7">
        <p className="eyebrow">Sharing</p>
        <div className="mt-4 grid gap-4">
          <Field label="Share title" htmlFor="share-title" hint="Used when the link is pasted into WhatsApp or email">
            <Input
              id="share-title"
              value={data.settings.shareTitle}
              onChange={(event) => update({ settings: { ...data.settings, shareTitle: event.target.value } }, 'share-title')}
              placeholder={`${data.coupleA} & ${data.coupleB} — our wedding invitation`}
              maxLength={120}
            />
          </Field>
          <Field label="Share description" htmlFor="share-description">
            <Textarea
              id="share-description"
              value={data.settings.shareDescription}
              onChange={(event) =>
                update({ settings: { ...data.settings, shareDescription: event.target.value } }, 'share-desc')
              }
              className="!min-h-[70px]"
              maxLength={220}
              placeholder={`Join us${data.location ? ` at ${data.location}` : ''} — the full invitation is inside.`}
            />
          </Field>
        </div>
      </section>

      <section className="border-t border-line/70 pt-7">
        <p className="eyebrow">Before you send</p>
        <ul className="mt-4 space-y-2">
          {checks.map((check) => (
            <li key={check.label} className="flex items-center gap-3 text-[0.82rem]">
              <span
                className={`grid h-5 w-5 flex-none place-items-center rounded-full border ${
                  check.done ? 'border-[#5c7a4f] bg-[#5c7a4f] text-white' : 'border-line text-transparent'
                }`}
              >
                <Check size={11} />
              </span>
              <span className={check.done ? 'text-ink-soft' : 'text-muted'}>{check.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line/70 pt-7">
        <p className="eyebrow">Danger zone</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)} icon={<TriangleAlert size={13} />}>
            Delete this invitation
          </Button>
          <p className="text-[0.74rem] text-muted">
            Removes the invitation, its guests, replies, blessings and photographs.
          </p>
        </div>
      </section>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this invitation?"
        description="This cannot be undone."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
              Keep it
            </Button>
            <Button size="sm" loading={busy} onClick={() => void remove()}>
              Delete permanently
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-muted">
          {data.coupleA} &amp; {data.coupleB}&rsquo;s invitation, along with every guest &mdash; and a
          shared album of photographs &mdash; will be permanently removed.
        </p>
      </Modal>
    </div>
  );
}
