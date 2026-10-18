import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Armchair,
  Check,
  Loader2,
  Pencil,
  Plus,
  Printer,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import type { SeatingTable } from '@shared/types';
import { api, ApiError } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { useToast } from '@/components/ui/Toast';
import { Button, buttonClass } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Select } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Misc';
import { InvitationHeading, InvitationTabs } from '@/components/dashboard/InvitationTabs';

export default function SeatingPage() {
  const { id = '' } = useParams();
  const { push } = useToast();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragGuest, setDragGuest] = useState<string | null>(null);
  const [overTable, setOverTable] = useState<string | null>(null);

  const { data, loading, reload, setData } = useAsync(async () => {
    const [inv, seating] = await Promise.all([api.invitations.get(id), api.seating.get(id)]);
    return { invitation: inv.invitation, tables: seating.tables, guests: seating.guests };
  }, [id]);

  const tables = data?.tables ?? [];
  const guests = data?.guests ?? [];
  const attending = useMemo(
    () => guests.filter((guest) => guest.rsvp?.attending),
    [guests],
  );
  const unseated = attending.filter((guest) => !guest.tableId);
  const seatedCount = attending.length - unseated.length;
  const seats = tables.reduce((sum, table) => sum + table.capacity, 0);

  const assign = async (guestId: string, tableId: string | null) => {
    if (!data) return;
    const previous = data;
    setData({
      ...data,
      guests: data.guests.map((guest) => (guest.id === guestId ? { ...guest, tableId } : guest)),
    });
    try {
      await api.seating.assign(id, guestId, tableId);
    } catch (error) {
      setData(previous);
      push(error instanceof ApiError ? error.message : 'Could not move that guest.', 'error');
    }
  };

  const autoArrange = async () => {
    setBusy(true);
    try {
      const result = await api.seating.auto(id);
      push(
        result.remaining
          ? `${result.assigned} guests seated · ${result.remaining} need another table.`
          : `${result.assigned} guests seated.`,
      );
      reload();
    } catch (error) {
      push(error instanceof ApiError ? error.message : 'The arrangement failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const removeTable = async (table: SeatingTable) => {
    if (!window.confirm(`Remove ${table.name}? Guests seated there become unassigned.`)) return;
    try {
      await api.seating.removeTable(id, table.id);
      push(`${table.name} removed.`);
      reload();
    } catch (error) {
      push(error instanceof ApiError ? error.message : 'Could not remove that table.', 'error');
    }
  };

  return (
    <div className="px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
      <div className="print:hidden">
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
      </div>

      <div className="mt-7 flex flex-wrap items-end justify-between gap-3 print:mt-0">
        <div>
          <p className="eyebrow print:hidden">Seating</p>
          <h2 className="display mt-1.5 text-[1.85rem] text-ink">
            {data ? `${data.invitation.data.coupleA} & ${data.invitation.data.coupleB} — seating plan` : 'Seating plan'}
          </h2>
          <p className="mt-1 text-[0.8rem] text-muted print:text-ink">
            {seatedCount} of {attending.length} attending guests seated · {seats} seats across {tables.length}{' '}
            {tables.length === 1 ? 'table' : 'tables'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button type="button" onClick={() => window.print()} className={buttonClass('outline', 'sm')}>
            <Printer size={12} /> Print chart
          </button>
          <Button variant="outline" size="sm" onClick={() => void autoArrange()} loading={busy} disabled={tables.length === 0}>
            <Sparkles size={12} /> Seat everyone
          </Button>
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus size={12} /> Add a table
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_20rem]">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_20rem]">
          <section className="panel p-4 print:border-0 print:p-0">
            {tables.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center print:hidden">
                <Armchair size={22} className="text-gold" />
                <p className="display mt-3 text-[1.5rem] text-ink">No tables yet</p>
                <p className="mt-1 max-w-xs text-[0.8rem] text-muted">
                  Add your tables, set how many seats each holds, then seat guests by dragging them across.
                </p>
                <Button className="mt-4" size="sm" onClick={() => setAdding(true)}>
                  <Plus size={12} /> Add the first table
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {tables.map((table) => {
                  const occupants = attending.filter((guest) => guest.tableId === table.id);
                  const full = occupants.length >= table.capacity;
                  return (
                    <div
                      key={table.id}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setOverTable(table.id);
                      }}
                      onDragLeave={() => setOverTable((current) => (current === table.id ? null : current))}
                      onDrop={(event) => {
                        event.preventDefault();
                        setOverTable(null);
                        const guestId = event.dataTransfer.getData('text/guest');
                        if (guestId) void assign(guestId, table.id);
                        setDragGuest(null);
                      }}
                      className={`rounded-xl border bg-[#fbf7ef] p-3 transition print:break-inside-avoid print:bg-white ${
                        overTable === table.id
                          ? 'border-gold shadow-[0_0_0_3px_rgba(169,124,80,0.15)]'
                          : 'border-line'
                      }`}
                    >
                      <TableHeader table={table} onSave={async (name, capacity) => {
                        try {
                          await api.seating.updateTable(id, table.id, { name, capacity });
                          reload();
                        } catch (error) {
                          push(error instanceof ApiError ? error.message : 'Could not rename that table.', 'error');
                        }
                      }} />
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`text-[0.62rem] uppercase tracking-[0.1em] ${
                            full ? 'text-[#a05b4c]' : 'text-muted'
                          }`}
                        >
                          {occupants.length} / {table.capacity} seats
                        </span>
                        <button
                          type="button"
                          onClick={() => void removeTable(table)}
                          className="text-muted transition hover:text-[#a05b4c] print:hidden"
                          aria-label={`Remove ${table.name}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <ul className="mt-2 min-h-[3rem] space-y-1.5">
                        {occupants.map((guest) => (
                          <li
                            key={guest.id}
                            draggable
                            onDragStart={(event) => {
                              event.dataTransfer.setData('text/guest', guest.id);
                              event.dataTransfer.effectAllowed = 'move';
                              setDragGuest(guest.id);
                            }}
                            onDragEnd={() => setDragGuest(null)}
                            className={`group flex cursor-grab items-center gap-1.5 rounded-lg border border-line/70 bg-paper px-2 py-1.5 text-[0.74rem] text-ink-soft active:cursor-grabbing ${
                              dragGuest === guest.id ? 'opacity-50' : ''
                            }`}
                          >
                            <span className="truncate">{guest.name}</span>
                            <span className="ml-auto flex-none text-[0.6rem] text-muted">×{guest.partySize}</span>
                            <button
                              type="button"
                              onClick={() => void assign(guest.id, null)}
                              className="text-muted opacity-0 transition hover:text-[#a05b4c] group-hover:opacity-100 print:hidden"
                              aria-label={`Unseat ${guest.name}`}
                            >
                              <X size={11} />
                            </button>
                          </li>
                        ))}
                        {occupants.length === 0 && (
                          <li className="rounded-lg border border-dashed border-line px-2 py-3 text-center text-[0.66rem] text-muted">
                            Drag guests here
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="panel h-fit p-4 print:hidden">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Not yet seated</p>
              <span className="pill pill-neutral">{unseated.length}</span>
            </div>
            <p className="mt-1.5 text-[0.72rem] text-muted">
              Only guests who replied yes appear here.
            </p>
            <ul className="mt-3 max-h-[26rem] space-y-1.5 overflow-y-auto pr-1">
              {unseated.map((guest) => (
                <li
                  key={guest.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/guest', guest.id);
                    event.dataTransfer.effectAllowed = 'move';
                    setDragGuest(guest.id);
                  }}
                  onDragEnd={() => setDragGuest(null)}
                  className={`flex cursor-grab items-center gap-2 rounded-lg border border-line/70 bg-[#fbf7ef] px-2 py-2 active:cursor-grabbing ${
                    dragGuest === guest.id ? 'opacity-50' : ''
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.76rem] text-ink">{guest.name}</span>
                    <span className="block truncate text-[0.62rem] text-muted">{guest.groupName}</span>
                  </span>
                  <select
                    defaultValue=""
                    onChange={(event) => {
                      if (event.target.value) void assign(guest.id, event.target.value);
                    }}
                    aria-label={`Seat ${guest.name}`}
                    className="w-[5.6rem] rounded-md border border-line bg-paper px-1 py-1 text-[0.62rem] text-ink-soft outline-none"
                  >
                    <option value="">Seat at…</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
              {unseated.length === 0 && (
                <li className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-[0.72rem] text-muted">
                  <Check size={14} className="mx-auto mb-1.5 text-[#5c7a4f]" />
                  Everyone has a seat.
                </li>
              )}
            </ul>
            {tables.length > 0 && unseated.length > 0 && (
              <p className="mt-3 rounded-lg bg-gold/10 px-3 py-2 text-[0.68rem] leading-relaxed text-[#856032]">
                “Seat everyone” fills tables in order, keeping households together and never exceeding capacity.
              </p>
            )}
          </aside>
        </div>
      )}

      <p className="mt-4 text-[0.7rem] text-muted print:hidden">
        {seatedCount > 0 && (
          <>
            <Users size={11} className="mr-1 inline text-gold" />
            {attending.length - seatedCount} guest
            {attending.length - seatedCount === 1 ? '' : 's'} still need a table.
          </>
        )}
      </p>

      {adding && (
        <AddTableDialog
          invitationId={id}
          existingNames={tables.map((table) => table.name)}
          onClose={() => setAdding(false)}
          onDone={() => {
            setAdding(false);
            reload();
          }}
        />
      )}
    </div>
  );
}

function TableHeader({
  table,
  onSave,
}: {
  table: SeatingTable;
  onSave: (name: string, capacity: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(table.name);
  const [capacity, setCapacity] = useState(String(table.capacity));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(table.name);
    setCapacity(String(table.capacity));
  }, [table.name, table.capacity]);

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-[1.1rem] leading-tight text-ink">{table.name}</h3>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-muted transition hover:text-gold print:hidden"
          aria-label={`Edit ${table.name}`}
        >
          <Pencil size={11} />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        await onSave(name.trim() || table.name, Math.max(1, Number(capacity) || table.capacity));
        setSaving(false);
        setEditing(false);
      }}
      className="flex items-center gap-1.5 print:hidden"
    >
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="min-w-0 flex-1 rounded-md border border-line bg-paper px-1.5 py-1 font-display text-[0.95rem] text-ink outline-none"
        aria-label="Table name"
        autoFocus
      />
      <input
        type="number"
        min={1}
        max={20}
        value={capacity}
        onChange={(event) => setCapacity(event.target.value)}
        className="w-12 rounded-md border border-line bg-paper px-1 py-1 text-center text-[0.72rem] text-ink outline-none"
        aria-label="Seats"
      />
      <button type="submit" className="text-[#5c7a4f]" aria-label="Save table" disabled={saving}>
        {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
      </button>
    </form>
  );
}

function AddTableDialog({
  invitationId,
  existingNames,
  onClose,
  onDone,
}: {
  invitationId: string;
  existingNames: string[];
  onClose: () => void;
  onDone: () => void;
}) {
  const { push } = useToast();
  const [name, setName] = useState(`Table ${existingNames.length + 1}`);
  const [capacity, setCapacity] = useState('8');
  const [saving, setSaving] = useState(false);
  const [count, setCount] = useState('1');

  const submit = async () => {
    setSaving(true);
    try {
      const amount = Math.max(1, Math.min(12, Number(count) || 1));
      for (let index = 0; index < amount; index += 1) {
        const label = amount === 1 ? name : `${name.replace(/\d+$/, '').trim() || 'Table'} ${existingNames.length + index + 1}`;
        await api.seating.addTable(invitationId, label, Math.max(1, Number(capacity) || 8));
      }
      push(amount === 1 ? 'Table added.' : `${amount} tables added.`);
      onDone();
    } catch (error) {
      push(error instanceof ApiError ? error.message : 'Could not add that table.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Add tables" size="sm">
      <div className="space-y-3.5">
        <Field label="Table name">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Top table" />
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Seats">
            <Select value={capacity} onChange={(event) => setCapacity(event.target.value)}>
              {[4, 6, 8, 10, 12].map((value) => (
                <option key={value} value={value}>
                  {value} seats
                </option>
              ))}
            </Select>
          </Field>
          <Field label="How many">
            <Select value={count} onChange={(event) => setCount(event.target.value)}>
              {[1, 2, 3, 4, 5, 6, 8, 10].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => void submit()} loading={saving}>
          <Plus size={13} /> Add
        </Button>
      </div>
    </Modal>
  );
}
