import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Armchair, Check, Loader2, Pencil, Plus, Printer, Sparkles, Trash2, Users, X, } from 'lucide-react';
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
    const [dragGuest, setDragGuest] = useState(null);
    const [overTable, setOverTable] = useState(null);
    const { data, loading, reload, setData } = useAsync(async () => {
        const [inv, seating] = await Promise.all([api.invitations.get(id), api.seating.get(id)]);
        return { invitation: inv.invitation, tables: seating.tables, guests: seating.guests };
    }, [id]);
    const tables = data?.tables ?? [];
    const guests = data?.guests ?? [];
    const attending = useMemo(() => guests.filter((guest) => guest.rsvp?.attending), [guests]);
    const unseated = attending.filter((guest) => !guest.tableId);
    const seatedCount = attending.length - unseated.length;
    const seats = tables.reduce((sum, table) => sum + table.capacity, 0);
    const assign = async (guestId, tableId) => {
        if (!data)
            return;
        const previous = data;
        setData({
            ...data,
            guests: data.guests.map((guest) => (guest.id === guestId ? { ...guest, tableId } : guest)),
        });
        try {
            await api.seating.assign(id, guestId, tableId);
        }
        catch (error) {
            setData(previous);
            push(error instanceof ApiError ? error.message : 'Could not move that guest.', 'error');
        }
    };
    const autoArrange = async () => {
        setBusy(true);
        try {
            const result = await api.seating.auto(id);
            push(result.remaining
                ? `${result.assigned} guests seated · ${result.remaining} need another table.`
                : `${result.assigned} guests seated.`);
            reload();
        }
        catch (error) {
            push(error instanceof ApiError ? error.message : 'The arrangement failed.', 'error');
        }
        finally {
            setBusy(false);
        }
    };
    const removeTable = async (table) => {
        if (!window.confirm(`Remove ${table.name}? Guests seated there become unassigned.`))
            return;
        try {
            await api.seating.removeTable(id, table.id);
            push(`${table.name} removed.`);
            reload();
        }
        catch (error) {
            push(error instanceof ApiError ? error.message : 'Could not remove that table.', 'error');
        }
    };
    return (_jsxs("div", { className: "px-4 py-6 sm:px-7 sm:py-8 lg:px-9", children: [_jsxs("div", { className: "print:hidden", children: [data ? (_jsx(InvitationHeading, { coupleA: data.invitation.data.coupleA, coupleB: data.invitation.data.coupleB, status: data.invitation.status })) : (_jsx(Skeleton, { className: "h-9 w-60" })), _jsx("div", { className: "mt-6", children: _jsx(InvitationTabs, { invitationId: id }) })] }), _jsxs("div", { className: "mt-7 flex flex-wrap items-end justify-between gap-3 print:mt-0", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow print:hidden", children: "Seating" }), _jsx("h2", { className: "display mt-1.5 text-[1.85rem] text-ink", children: data ? `${data.invitation.data.coupleA} & ${data.invitation.data.coupleB} — seating plan` : 'Seating plan' }), _jsxs("p", { className: "mt-1 text-[0.8rem] text-muted print:text-ink", children: [seatedCount, " of ", attending.length, " attending guests seated \u00B7 ", seats, " seats across ", tables.length, ' ', tables.length === 1 ? 'table' : 'tables'] })] }), _jsxs("div", { className: "flex flex-wrap gap-2 print:hidden", children: [_jsxs("button", { type: "button", onClick: () => window.print(), className: buttonClass('outline', 'sm'), children: [_jsx(Printer, { size: 12 }), " Print chart"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => void autoArrange(), loading: busy, disabled: tables.length === 0, children: [_jsx(Sparkles, { size: 12 }), " Seat everyone"] }), _jsxs(Button, { size: "sm", onClick: () => setAdding(true), children: [_jsx(Plus, { size: 12 }), " Add a table"] })] })] }), loading ? (_jsxs("div", { className: "mt-5 grid gap-4 lg:grid-cols-[1fr_20rem]", children: [_jsx(Skeleton, { className: "h-72 w-full" }), _jsx(Skeleton, { className: "h-72 w-full" })] })) : (_jsxs("div", { className: "mt-5 grid gap-5 lg:grid-cols-[1fr_20rem]", children: [_jsx("section", { className: "panel p-4 print:border-0 print:p-0", children: tables.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center py-10 text-center print:hidden", children: [_jsx(Armchair, { size: 22, className: "text-gold" }), _jsx("p", { className: "display mt-3 text-[1.5rem] text-ink", children: "No tables yet" }), _jsx("p", { className: "mt-1 max-w-xs text-[0.8rem] text-muted", children: "Add your tables, set how many seats each holds, then seat guests by dragging them across." }), _jsxs(Button, { className: "mt-4", size: "sm", onClick: () => setAdding(true), children: [_jsx(Plus, { size: 12 }), " Add the first table"] })] })) : (_jsx("div", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3", children: tables.map((table) => {
                                const occupants = attending.filter((guest) => guest.tableId === table.id);
                                const full = occupants.length >= table.capacity;
                                return (_jsxs("div", { onDragOver: (event) => {
                                        event.preventDefault();
                                        setOverTable(table.id);
                                    }, onDragLeave: () => setOverTable((current) => (current === table.id ? null : current)), onDrop: (event) => {
                                        event.preventDefault();
                                        setOverTable(null);
                                        const guestId = event.dataTransfer.getData('text/guest');
                                        if (guestId)
                                            void assign(guestId, table.id);
                                        setDragGuest(null);
                                    }, className: `rounded-xl border bg-[#fbf7ef] p-3 transition print:break-inside-avoid print:bg-white ${overTable === table.id
                                        ? 'border-gold shadow-[0_0_0_3px_rgba(169,124,80,0.15)]'
                                        : 'border-line'}`, children: [_jsx(TableHeader, { table: table, onSave: async (name, capacity) => {
                                                try {
                                                    await api.seating.updateTable(id, table.id, { name, capacity });
                                                    reload();
                                                }
                                                catch (error) {
                                                    push(error instanceof ApiError ? error.message : 'Could not rename that table.', 'error');
                                                }
                                            } }), _jsxs("div", { className: "mt-2 flex items-center justify-between", children: [_jsxs("span", { className: `text-[0.62rem] uppercase tracking-[0.1em] ${full ? 'text-[#a05b4c]' : 'text-muted'}`, children: [occupants.length, " / ", table.capacity, " seats"] }), _jsx("button", { type: "button", onClick: () => void removeTable(table), className: "text-muted transition hover:text-[#a05b4c] print:hidden", "aria-label": `Remove ${table.name}`, children: _jsx(Trash2, { size: 12 }) })] }), _jsxs("ul", { className: "mt-2 min-h-[3rem] space-y-1.5", children: [occupants.map((guest) => (_jsxs("li", { draggable: true, onDragStart: (event) => {
                                                        event.dataTransfer.setData('text/guest', guest.id);
                                                        event.dataTransfer.effectAllowed = 'move';
                                                        setDragGuest(guest.id);
                                                    }, onDragEnd: () => setDragGuest(null), className: `group flex cursor-grab items-center gap-1.5 rounded-lg border border-line/70 bg-paper px-2 py-1.5 text-[0.74rem] text-ink-soft active:cursor-grabbing ${dragGuest === guest.id ? 'opacity-50' : ''}`, children: [_jsx("span", { className: "truncate", children: guest.name }), _jsxs("span", { className: "ml-auto flex-none text-[0.6rem] text-muted", children: ["\u00D7", guest.partySize] }), _jsx("button", { type: "button", onClick: () => void assign(guest.id, null), className: "text-muted opacity-0 transition hover:text-[#a05b4c] group-hover:opacity-100 print:hidden", "aria-label": `Unseat ${guest.name}`, children: _jsx(X, { size: 11 }) })] }, guest.id))), occupants.length === 0 && (_jsx("li", { className: "rounded-lg border border-dashed border-line px-2 py-3 text-center text-[0.66rem] text-muted", children: "Drag guests here" }))] })] }, table.id));
                            }) })) }), _jsxs("aside", { className: "panel h-fit p-4 print:hidden", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "eyebrow", children: "Not yet seated" }), _jsx("span", { className: "pill pill-neutral", children: unseated.length })] }), _jsx("p", { className: "mt-1.5 text-[0.72rem] text-muted", children: "Only guests who replied yes appear here." }), _jsxs("ul", { className: "mt-3 max-h-[26rem] space-y-1.5 overflow-y-auto pr-1", children: [unseated.map((guest) => (_jsxs("li", { draggable: true, onDragStart: (event) => {
                                            event.dataTransfer.setData('text/guest', guest.id);
                                            event.dataTransfer.effectAllowed = 'move';
                                            setDragGuest(guest.id);
                                        }, onDragEnd: () => setDragGuest(null), className: `flex cursor-grab items-center gap-2 rounded-lg border border-line/70 bg-[#fbf7ef] px-2 py-2 active:cursor-grabbing ${dragGuest === guest.id ? 'opacity-50' : ''}`, children: [_jsxs("span", { className: "min-w-0 flex-1", children: [_jsx("span", { className: "block truncate text-[0.76rem] text-ink", children: guest.name }), _jsx("span", { className: "block truncate text-[0.62rem] text-muted", children: guest.groupName })] }), _jsxs("select", { defaultValue: "", onChange: (event) => {
                                                    if (event.target.value)
                                                        void assign(guest.id, event.target.value);
                                                }, "aria-label": `Seat ${guest.name}`, className: "w-[5.6rem] rounded-md border border-line bg-paper px-1 py-1 text-[0.62rem] text-ink-soft outline-none", children: [_jsx("option", { value: "", children: "Seat at\u2026" }), tables.map((table) => (_jsx("option", { value: table.id, children: table.name }, table.id)))] })] }, guest.id))), unseated.length === 0 && (_jsxs("li", { className: "rounded-lg border border-dashed border-line px-3 py-6 text-center text-[0.72rem] text-muted", children: [_jsx(Check, { size: 14, className: "mx-auto mb-1.5 text-[#5c7a4f]" }), "Everyone has a seat."] }))] }), tables.length > 0 && unseated.length > 0 && (_jsx("p", { className: "mt-3 rounded-lg bg-gold/10 px-3 py-2 text-[0.68rem] leading-relaxed text-[#856032]", children: "\u201CSeat everyone\u201D fills tables in order, keeping households together and never exceeding capacity." }))] })] })), _jsx("p", { className: "mt-4 text-[0.7rem] text-muted print:hidden", children: seatedCount > 0 && (_jsxs(_Fragment, { children: [_jsx(Users, { size: 11, className: "mr-1 inline text-gold" }), attending.length - seatedCount, " guest", attending.length - seatedCount === 1 ? '' : 's', " still need a table."] })) }), adding && (_jsx(AddTableDialog, { invitationId: id, existingNames: tables.map((table) => table.name), onClose: () => setAdding(false), onDone: () => {
                    setAdding(false);
                    reload();
                } }))] }));
}
function TableHeader({ table, onSave, }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(table.name);
    const [capacity, setCapacity] = useState(String(table.capacity));
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        setName(table.name);
        setCapacity(String(table.capacity));
    }, [table.name, table.capacity]);
    if (!editing) {
        return (_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("h3", { className: "font-display text-[1.1rem] leading-tight text-ink", children: table.name }), _jsx("button", { type: "button", onClick: () => setEditing(true), className: "text-muted transition hover:text-gold print:hidden", "aria-label": `Edit ${table.name}`, children: _jsx(Pencil, { size: 11 }) })] }));
    }
    return (_jsxs("form", { onSubmit: async (event) => {
            event.preventDefault();
            setSaving(true);
            await onSave(name.trim() || table.name, Math.max(1, Number(capacity) || table.capacity));
            setSaving(false);
            setEditing(false);
        }, className: "flex items-center gap-1.5 print:hidden", children: [_jsx("input", { value: name, onChange: (event) => setName(event.target.value), className: "min-w-0 flex-1 rounded-md border border-line bg-paper px-1.5 py-1 font-display text-[0.95rem] text-ink outline-none", "aria-label": "Table name", autoFocus: true }), _jsx("input", { type: "number", min: 1, max: 20, value: capacity, onChange: (event) => setCapacity(event.target.value), className: "w-12 rounded-md border border-line bg-paper px-1 py-1 text-center text-[0.72rem] text-ink outline-none", "aria-label": "Seats" }), _jsx("button", { type: "submit", className: "text-[#5c7a4f]", "aria-label": "Save table", disabled: saving, children: saving ? _jsx(Loader2, { size: 13, className: "animate-spin" }) : _jsx(Check, { size: 13 }) })] }));
}
function AddTableDialog({ invitationId, existingNames, onClose, onDone, }) {
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
        }
        catch (error) {
            push(error instanceof ApiError ? error.message : 'Could not add that table.', 'error');
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs(Modal, { open: true, onClose: onClose, title: "Add tables", size: "sm", children: [_jsxs("div", { className: "space-y-3.5", children: [_jsx(Field, { label: "Table name", children: _jsx(Input, { value: name, onChange: (event) => setName(event.target.value), placeholder: "Top table" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-3.5", children: [_jsx(Field, { label: "Seats", children: _jsx(Select, { value: capacity, onChange: (event) => setCapacity(event.target.value), children: [4, 6, 8, 10, 12].map((value) => (_jsxs("option", { value: value, children: [value, " seats"] }, value))) }) }), _jsx(Field, { label: "How many", children: _jsx(Select, { value: count, onChange: (event) => setCount(event.target.value), children: [1, 2, 3, 4, 5, 6, 8, 10].map((value) => (_jsx("option", { value: value, children: value }, value))) }) })] })] }), _jsxs("div", { className: "mt-5 flex justify-end gap-2", children: [_jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancel" }), _jsxs(Button, { onClick: () => void submit(), loading: saving, children: [_jsx(Plus, { size: 13 }), " Add"] })] })] }));
}
