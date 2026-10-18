import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Download,
  Link2,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import type { GuestRecord } from '@shared/types';
import { api, ApiError, shareUrl } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { useToast } from '@/components/ui/Toast';
import { Button, buttonClass } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, RsvpPill, Skeleton } from '@/components/ui/Misc';
import { InvitationHeading, InvitationTabs } from '@/components/dashboard/InvitationTabs';

type SortKey = 'name' | 'group' | 'status';

export default function GuestsPage() {
  const { id = '' } = useParams();
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState<SortKey>('name');
  const [editing, setEditing] = useState<GuestRecord | 'new' | null>(null);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState<GuestRecord | null>(null);

  const { data, loading, reload } = useAsync(async () => {
    const [inv, list] = await Promise.all([api.invitations.get(id), api.guests.list(id)]);
    return { invitation: inv.invitation, guests: list.guests, groups: list.groups };
  }, [id]);

  const guests = data?.guests ?? [];
  const groups = useMemo(
    () => Array.from(new Set(guests.map((guest) => guest.groupName).filter(Boolean))).sort(),
    [guests],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = guests.filter((guest) => {
      if (group !== 'all' && guest.groupName !== group) return false;
      if (status !== 'all') {
        const state = guest.rsvp ? (guest.rsvp.attending ? 'attending' : 'declined') : 'pending';
        if (state !== status) return false;
      }
      if (!needle) return true;
      return (
        guest.name.toLowerCase().includes(needle) ||
        (guest.email ?? '').toLowerCase().includes(needle) ||
        (guest.phone ?? '').toLowerCase().includes(needle)
      );
    });
    return rows.sort((a, b) => {
      if (sort === 'group') return a.groupName.localeCompare(b.groupName) || a.name.localeCompare(b.name);
      if (sort === 'status') {
        const rank = (guest: GuestRecord) => (guest.rsvp ? (guest.rsvp.attending ? 0 : 2) : 1);
        return rank(a) - rank(b) || a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });
  }, [guests, query, group, status, sort]);

  const copyLink = async (guest: GuestRecord) => {
    if (!data) return;
    const url = shareUrl(data.invitation.slug, guest.token);
    try {
      await navigator.clipboard.writeText(url);
      push(`Personal link for ${guest.name} copied.`);
    } catch {
      push(url, 'info');
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
          <p className="eyebrow">Guest list</p>
          <h2 className="display mt-1.5 text-[1.85rem] text-ink">Who is coming</h2>
          <p className="mt-1 text-[0.8rem] text-muted">
            {guests.length} households · each with a private link that pre-fills their RSVP.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/invitations/${id}/guests.csv`} className={buttonClass('outline', 'sm')} download>
            <Download size={12} /> Export
          </a>
          <Button variant="outline" size="sm" onClick={() => setImporting(true)}>
            <Upload size={12} /> Import
          </Button>
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus size={12} /> Add guest
          </Button>
        </div>
      </div>

      <div className="panel mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-line/70 px-4 py-3">
          <label className="flex min-w-[12rem] flex-1 items-center gap-2 rounded-lg border border-line bg-ivory px-3 py-1.5">
            <Search size={13} className="text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search names, emails, phones"
              className="w-full bg-transparent text-[0.8rem] text-ink outline-none placeholder:text-muted/70"
              aria-label="Search guests"
            />
          </label>
          <select
            value={group}
            onChange={(event) => setGroup(event.target.value)}
            aria-label="Filter by group"
            className="rounded-lg border border-line bg-ivory px-2.5 py-1.5 text-[0.76rem] text-ink-soft outline-none"
          >
            <option value="all">All groups</option>
            {groups.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by reply"
            className="rounded-lg border border-line bg-ivory px-2.5 py-1.5 text-[0.76rem] text-ink-soft outline-none"
          >
            <option value="all">All replies</option>
            <option value="attending">Attending</option>
            <option value="pending">Awaiting reply</option>
            <option value="declined">Declined</option>
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            aria-label="Sort guests"
            className="rounded-lg border border-line bg-ivory px-2.5 py-1.5 text-[0.76rem] text-ink-soft outline-none"
          >
            <option value="name">Sort: name</option>
            <option value="group">Sort: group</option>
            <option value="status">Sort: reply</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={20} />}
            title={guests.length === 0 ? 'No guests yet' : 'Nobody matches those filters'}
            description={
              guests.length === 0
                ? 'Add households one at a time, or paste your list from a spreadsheet. Every household gets its own private invitation link.'
                : 'Try a different search, group or reply filter.'
            }
            action={
              guests.length === 0 ? (
                <Button onClick={() => setEditing('new')}>
                  <Plus size={13} /> Add the first guest
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line/70 bg-[#fbf7ef] text-[0.58rem] uppercase tracking-[0.14em] text-muted">
                  <th className="px-4 py-2.5 font-semibold">Guest</th>
                  <th className="px-3 py-2.5 font-semibold">Group</th>
                  <th className="px-3 py-2.5 font-semibold">Party</th>
                  <th className="px-3 py-2.5 font-semibold">Reply</th>
                  <th className="px-3 py-2.5 font-semibold">Seats</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((guest) => (
                  <tr key={guest.id} className="border-b border-line/50 last:border-0 hover:bg-[#fbf7ef]/70">
                    <td className="px-4 py-3">
                      <span className="block text-[0.84rem] font-medium text-ink">{guest.name}</span>
                      <span className="block text-[0.68rem] text-muted">
                        {guest.email ?? guest.phone ?? 'No contact details'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[0.76rem] text-ink-soft">{guest.groupName || '—'}</td>
                    <td className="px-3 py-3 text-[0.76rem] text-ink-soft">{guest.partySize}</td>
                    <td className="px-3 py-3">
                      <RsvpPill attending={guest.rsvp ? guest.rsvp.attending : undefined} />
                    </td>
                    <td className="px-3 py-3 text-[0.76rem] text-ink-soft">
                      {guest.rsvp?.attending ? guest.partySize : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => void copyLink(guest)}
                          className="icon-btn"
                          title="Copy personal link"
                          aria-label={`Copy link for ${guest.name}`}
                        >
                          <Link2 size={13} />
                        </button>
                        {guest.email && (
                          <a
                            href={`mailto:${guest.email}?subject=${encodeURIComponent('A little invitation for you')}&body=${encodeURIComponent(
                              `Dear ${guest.name},\n\nWe would love you to celebrate with us. Here is your personal invitation:\n${data ? shareUrl(data.invitation.slug, guest.token) : ''}\n\nWith love`,
                            )}`}
                            className="icon-btn"
                            title="Email invitation"
                            aria-label={`Email ${guest.name}`}
                          >
                            <Mail size={13} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditing(guest)}
                          className="icon-btn"
                          title="Edit guest"
                          aria-label={`Edit ${guest.name}`}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(guest)}
                          className="icon-btn text-[#a05b4c]"
                          title="Remove guest"
                          aria-label={`Remove ${guest.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && (
        <p className="mt-3 text-[0.72rem] text-muted">
          Showing {filtered.length} of {guests.length}. Guests without a reply have not opened their personal
          link yet.
        </p>
      )}

      {editing && data && (
        <GuestDialog
          invitationId={id}
          groups={groups}
          guest={editing === 'new' ? null : editing}
          events={data.invitation.data.events.map((event) => ({ id: event.id, name: event.name }))}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}

      {importing && (
        <ImportDialog
          invitationId={id}
          onClose={() => setImporting(false)}
          onDone={(added) => {
            setImporting(false);
            if (added > 0) push(`${added} ${added === 1 ? 'household' : 'households'} added.`);
            reload();
          }}
        />
      )}

      {deleting && (
        <ConfirmRemove
          guest={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await api.guests.remove(id, deleting.id);
              push(`${deleting.name} removed.`);
              setDeleting(null);
              reload();
            } catch (error) {
              push(error instanceof ApiError ? error.message : 'Could not remove that guest.', 'error');
            }
          }}
        />
      )}
    </div>
  );
}

function GuestDialog({
  invitationId,
  guest,
  groups,
  events,
  onClose,
  onSaved,
}: {
  invitationId: string;
  guest: GuestRecord | null;
  groups: string[];
  events: { id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { push } = useToast();
  const [name, setName] = useState(guest?.name ?? '');
  const [email, setEmail] = useState(guest?.email ?? '');
  const [phone, setPhone] = useState(guest?.phone ?? '');
  const [groupName, setGroupName] = useState(guest?.groupName ?? '');
  const [partySize, setPartySize] = useState(String(guest?.partySize ?? 2));
  const [invited, setInvited] = useState<string[]>(guest?.invitedEventIds ?? []);
  const [notes, setNotes] = useState(guest?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      push('A name is needed.', 'error');
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        groupName: groupName.trim() || 'Guests',
        partySize: Math.max(1, Math.min(12, Number(partySize) || 1)),
        invitedEventIds: invited,
        notes: notes.trim(),
      };
      if (guest) await api.guests.update(invitationId, guest.id, body);
      else await api.guests.create(invitationId, body);
      push(guest ? 'Guest updated.' : 'Guest added.');
      onSaved();
    } catch (error) {
      push(error instanceof ApiError ? error.message : 'That did not save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={guest ? `Edit ${guest.name}` : 'Add a guest'}>
      <div className="space-y-3.5">
        <Field label="Name">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Amara & Tom Whitfield" autoFocus />
        </Field>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Email" hint="Used for reminders only">
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="amara@example.com" />
          </Field>
          <Field label="Phone">
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+44 7700 900123" />
          </Field>
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Group" hint="Family, friends, colleagues…">
            <Input
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="Bride's family"
              list="guest-groups"
            />
            <datalist id="guest-groups">
              {groups.map((group) => (
                <option key={group} value={group} />
              ))}
            </datalist>
          </Field>
          <Field label="Party size" hint="Names on the invitation">
            <Select value={partySize} onChange={(event) => setPartySize(event.target.value)}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                <option key={size} value={size}>
                  {size} {size === 1 ? 'seat' : 'seats'}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {events.length > 0 && (
          <Field label="Invited to" hint="Leave all unticked to invite them to everything">
            <div className="mt-1 space-y-1.5">
              {events.map((event) => {
                const checked = invited.includes(event.id);
                return (
                  <label key={event.id} className="flex items-center gap-2 text-[0.8rem] text-ink-soft">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setInvited((current) =>
                          checked ? current.filter((value) => value !== event.id) : [...current, event.id],
                        )
                      }
                      className="h-3.5 w-3.5 accent-[#a97c50]"
                    />
                    {event.name}
                  </label>
                );
              })}
            </div>
          </Field>
        )}
        <Field label="Private notes" hint="Only you see this">
          <Textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Vegetarian, arriving Friday" />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => void save()} loading={saving}>
          {guest ? 'Save changes' : 'Add guest'}
        </Button>
      </div>
    </Modal>
  );
}

function ImportDialog({
  invitationId,
  onClose,
  onDone,
}: {
  invitationId: string;
  onClose: () => void;
  onDone: (added: number) => void;
}) {
  const { push } = useToast();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState('');

  const parse = (raw: string) =>
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !/^name\s*[,;\t]/i.test(line))
      .map((line) => {
        const [name = '', email = '', groupName = '', party = ''] = line.split(/[,;\t]/).map((cell) => cell.trim());
        return {
          name,
          email: email || undefined,
          groupName: groupName || undefined,
          partySize: party ? Math.max(1, Math.min(12, Number(party) || 1)) : undefined,
        };
      })
      .filter((row) => row.name);

  const rows = parse(text).length;

  const submit = async () => {
    const parsed = parse(text);
    if (parsed.length === 0) {
      push('Paste at least one name.', 'error');
      return;
    }
    setSaving(true);
    try {
      const result = await api.guests.importRows(invitationId, parsed);
      onDone(result.added);
    } catch (error) {
      push(error instanceof ApiError ? error.message : 'The import failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Import your guest list" size="lg">
      <p className="text-[0.8rem] leading-relaxed text-muted">
        Paste rows from a spreadsheet or upload a CSV. Order is{' '}
        <span className="text-ink-soft">name, email, group, party size</span> — only the name is required.
      </p>
      <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-ivory px-4 py-6 text-[0.78rem] text-ink-soft transition hover:border-gold">
        <Upload size={14} className="text-gold" />
        {fileName || 'Choose a .csv or .txt file'}
        <input
          type="file"
          accept=".csv,.txt,text/plain,text/csv"
          className="sr-only"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setFileName(file.name);
            setText(await file.text());
          }}
        />
      </label>
      <Field label="Or paste rows" className="mt-3">
        <Textarea
          rows={7}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={'Amara Whitfield, amara@example.com, Bride’s family, 2\nTom Whitfield, tom@example.com, Bride’s family, 2\nPriya Shah, priya@example.com, Friends, 1'}
          className="font-mono text-[0.74rem]"
        />
      </Field>
      <p className="mt-2 text-[0.7rem] text-muted">
        {rows > 0 ? `${rows} ${rows === 1 ? 'row' : 'rows'} ready to import.` : 'Nothing detected yet.'}
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => void submit()} loading={saving} disabled={rows === 0}>
          <Upload size={13} /> Import {rows > 0 ? rows : ''}
        </Button>
      </div>
    </Modal>
  );
}

function ConfirmRemove({
  guest,
  onClose,
  onConfirm,
}: {
  guest: GuestRecord;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal open onClose={onClose} title="Remove this guest?" size="sm">
      <p className="text-[0.84rem] leading-relaxed text-muted">
        {guest.name} will be removed from the guest list, along with their personal link and RSVP. This cannot
        be undone.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Keep guest
        </Button>
        <Button
          variant="primary"
          className="!bg-[#8d4d3f]"
          loading={busy}
          onClick={async () => {
            setBusy(true);
            await onConfirm();
            setBusy(false);
          }}
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Remove
        </Button>
      </div>
    </Modal>
  );
}
