import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Link2, Loader2, Mail, Pencil, Plus, Search, Trash2, Upload, Users, } from 'lucide-react';
import { api, ApiError, shareUrl } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { useToast } from '@/components/ui/Toast';
import { Button, buttonClass } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, RsvpPill, Skeleton } from '@/components/ui/Misc';
import { InvitationHeading, InvitationTabs } from '@/components/dashboard/InvitationTabs';
export default function GuestsPage() {
    const { id = '' } = useParams();
    const { push } = useToast();
    const [query, setQuery] = useState('');
    const [group, setGroup] = useState('all');
    const [status, setStatus] = useState('all');
    const [sort, setSort] = useState('name');
    const [editing, setEditing] = useState(null);
    const [importing, setImporting] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const { data, loading, reload } = useAsync(async () => {
        const [inv, list] = await Promise.all([api.invitations.get(id), api.guests.list(id)]);
        return { invitation: inv.invitation, guests: list.guests, groups: list.groups };
    }, [id]);
    const guests = data?.guests ?? [];
    const groups = useMemo(() => Array.from(new Set(guests.map((guest) => guest.groupName).filter(Boolean))).sort(), [guests]);
    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        const rows = guests.filter((guest) => {
            if (group !== 'all' && guest.groupName !== group)
                return false;
            if (status !== 'all') {
                const state = guest.rsvp ? (guest.rsvp.attending ? 'attending' : 'declined') : 'pending';
                if (state !== status)
                    return false;
            }
            if (!needle)
                return true;
            return (guest.name.toLowerCase().includes(needle) ||
                (guest.email ?? '').toLowerCase().includes(needle) ||
                (guest.phone ?? '').toLowerCase().includes(needle));
        });
        return rows.sort((a, b) => {
            if (sort === 'group')
                return a.groupName.localeCompare(b.groupName) || a.name.localeCompare(b.name);
            if (sort === 'status') {
                const rank = (guest) => (guest.rsvp ? (guest.rsvp.attending ? 0 : 2) : 1);
                return rank(a) - rank(b) || a.name.localeCompare(b.name);
            }
            return a.name.localeCompare(b.name);
        });
    }, [guests, query, group, status, sort]);
    const copyLink = async (guest) => {
        if (!data)
            return;
        const url = shareUrl(data.invitation.slug, guest.token);
        try {
            await navigator.clipboard.writeText(url);
            push(`Personal link for ${guest.name} copied.`);
        }
        catch {
            push(url, 'info');
        }
    };
    return (_jsxs("div", { className: "px-4 py-6 sm:px-7 sm:py-8 lg:px-9", children: [data ? (_jsx(InvitationHeading, { coupleA: data.invitation.data.coupleA, coupleB: data.invitation.data.coupleB, status: data.invitation.status })) : (_jsx(Skeleton, { className: "h-9 w-60" })), _jsx("div", { className: "mt-6", children: _jsx(InvitationTabs, { invitationId: id }) }), _jsxs("div", { className: "mt-7 flex flex-wrap items-end justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Guest list" }), _jsx("h2", { className: "display mt-1.5 text-[1.85rem] text-ink", children: "Who is coming" }), _jsxs("p", { className: "mt-1 text-[0.8rem] text-muted", children: [guests.length, " households \u00B7 each with a private link that pre-fills their RSVP."] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs("a", { href: `/api/invitations/${id}/guests.csv`, className: buttonClass('outline', 'sm'), download: true, children: [_jsx(Download, { size: 12 }), " Export"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setImporting(true), children: [_jsx(Upload, { size: 12 }), " Import"] }), _jsxs(Button, { size: "sm", onClick: () => setEditing('new'), children: [_jsx(Plus, { size: 12 }), " Add guest"] })] })] }), _jsxs("div", { className: "panel mt-4 overflow-hidden", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2 border-b border-line/70 px-4 py-3", children: [_jsxs("label", { className: "flex min-w-[12rem] flex-1 items-center gap-2 rounded-lg border border-line bg-ivory px-3 py-1.5", children: [_jsx(Search, { size: 13, className: "text-muted" }), _jsx("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Search names, emails, phones", className: "w-full bg-transparent text-[0.8rem] text-ink outline-none placeholder:text-muted/70", "aria-label": "Search guests" })] }), _jsxs("select", { value: group, onChange: (event) => setGroup(event.target.value), "aria-label": "Filter by group", className: "rounded-lg border border-line bg-ivory px-2.5 py-1.5 text-[0.76rem] text-ink-soft outline-none", children: [_jsx("option", { value: "all", children: "All groups" }), groups.map((name) => (_jsx("option", { value: name, children: name }, name)))] }), _jsxs("select", { value: status, onChange: (event) => setStatus(event.target.value), "aria-label": "Filter by reply", className: "rounded-lg border border-line bg-ivory px-2.5 py-1.5 text-[0.76rem] text-ink-soft outline-none", children: [_jsx("option", { value: "all", children: "All replies" }), _jsx("option", { value: "attending", children: "Attending" }), _jsx("option", { value: "pending", children: "Awaiting reply" }), _jsx("option", { value: "declined", children: "Declined" })] }), _jsxs("select", { value: sort, onChange: (event) => setSort(event.target.value), "aria-label": "Sort guests", className: "rounded-lg border border-line bg-ivory px-2.5 py-1.5 text-[0.76rem] text-ink-soft outline-none", children: [_jsx("option", { value: "name", children: "Sort: name" }), _jsx("option", { value: "group", children: "Sort: group" }), _jsx("option", { value: "status", children: "Sort: reply" })] })] }), loading ? (_jsx("div", { className: "space-y-2 p-4", children: [0, 1, 2, 3].map((i) => (_jsx(Skeleton, { className: "h-12 w-full" }, i))) })) : filtered.length === 0 ? (_jsx(EmptyState, { icon: _jsx(Users, { size: 20 }), title: guests.length === 0 ? 'No guests yet' : 'Nobody matches those filters', description: guests.length === 0
                            ? 'Add households one at a time, or paste your list from a spreadsheet. Every household gets its own private invitation link.'
                            : 'Try a different search, group or reply filter.', action: guests.length === 0 ? (_jsxs(Button, { onClick: () => setEditing('new'), children: [_jsx(Plus, { size: 13 }), " Add the first guest"] })) : null })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[46rem] border-collapse text-left", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-line/70 bg-[#fbf7ef] text-[0.58rem] uppercase tracking-[0.14em] text-muted", children: [_jsx("th", { className: "px-4 py-2.5 font-semibold", children: "Guest" }), _jsx("th", { className: "px-3 py-2.5 font-semibold", children: "Group" }), _jsx("th", { className: "px-3 py-2.5 font-semibold", children: "Party" }), _jsx("th", { className: "px-3 py-2.5 font-semibold", children: "Reply" }), _jsx("th", { className: "px-3 py-2.5 font-semibold", children: "Seats" }), _jsx("th", { className: "px-3 py-2.5 text-right font-semibold", children: "Actions" })] }) }), _jsx("tbody", { children: filtered.map((guest) => (_jsxs("tr", { className: "border-b border-line/50 last:border-0 hover:bg-[#fbf7ef]/70", children: [_jsxs("td", { className: "px-4 py-3", children: [_jsx("span", { className: "block text-[0.84rem] font-medium text-ink", children: guest.name }), _jsx("span", { className: "block text-[0.68rem] text-muted", children: guest.email ?? guest.phone ?? 'No contact details' })] }), _jsx("td", { className: "px-3 py-3 text-[0.76rem] text-ink-soft", children: guest.groupName || '—' }), _jsx("td", { className: "px-3 py-3 text-[0.76rem] text-ink-soft", children: guest.partySize }), _jsx("td", { className: "px-3 py-3", children: _jsx(RsvpPill, { attending: guest.rsvp ? guest.rsvp.attending : undefined }) }), _jsx("td", { className: "px-3 py-3 text-[0.76rem] text-ink-soft", children: guest.rsvp?.attending ? guest.partySize : '—' }), _jsx("td", { className: "px-3 py-3", children: _jsxs("div", { className: "flex items-center justify-end gap-1", children: [_jsx("button", { type: "button", onClick: () => void copyLink(guest), className: "icon-btn", title: "Copy personal link", "aria-label": `Copy link for ${guest.name}`, children: _jsx(Link2, { size: 13 }) }), guest.email && (_jsx("a", { href: `mailto:${guest.email}?subject=${encodeURIComponent('A little invitation for you')}&body=${encodeURIComponent(`Dear ${guest.name},\n\nWe would love you to celebrate with us. Here is your personal invitation:\n${data ? shareUrl(data.invitation.slug, guest.token) : ''}\n\nWith love`)}`, className: "icon-btn", title: "Email invitation", "aria-label": `Email ${guest.name}`, children: _jsx(Mail, { size: 13 }) })), _jsx("button", { type: "button", onClick: () => setEditing(guest), className: "icon-btn", title: "Edit guest", "aria-label": `Edit ${guest.name}`, children: _jsx(Pencil, { size: 13 }) }), _jsx("button", { type: "button", onClick: () => setDeleting(guest), className: "icon-btn text-[#a05b4c]", title: "Remove guest", "aria-label": `Remove ${guest.name}`, children: _jsx(Trash2, { size: 13 }) })] }) })] }, guest.id))) })] }) }))] }), data && (_jsxs("p", { className: "mt-3 text-[0.72rem] text-muted", children: ["Showing ", filtered.length, " of ", guests.length, ". Guests without a reply have not opened their personal link yet."] })), editing && data && (_jsx(GuestDialog, { invitationId: id, groups: groups, guest: editing === 'new' ? null : editing, events: data.invitation.data.events.map((event) => ({ id: event.id, name: event.name })), onClose: () => setEditing(null), onSaved: () => {
                    setEditing(null);
                    reload();
                } })), importing && (_jsx(ImportDialog, { invitationId: id, onClose: () => setImporting(false), onDone: (added) => {
                    setImporting(false);
                    if (added > 0)
                        push(`${added} ${added === 1 ? 'household' : 'households'} added.`);
                    reload();
                } })), deleting && (_jsx(ConfirmRemove, { guest: deleting, onClose: () => setDeleting(null), onConfirm: async () => {
                    try {
                        await api.guests.remove(id, deleting.id);
                        push(`${deleting.name} removed.`);
                        setDeleting(null);
                        reload();
                    }
                    catch (error) {
                        push(error instanceof ApiError ? error.message : 'Could not remove that guest.', 'error');
                    }
                } }))] }));
}
function GuestDialog({ invitationId, guest, groups, events, onClose, onSaved, }) {
    const { push } = useToast();
    const [name, setName] = useState(guest?.name ?? '');
    const [email, setEmail] = useState(guest?.email ?? '');
    const [phone, setPhone] = useState(guest?.phone ?? '');
    const [groupName, setGroupName] = useState(guest?.groupName ?? '');
    const [partySize, setPartySize] = useState(String(guest?.partySize ?? 2));
    const [invited, setInvited] = useState(guest?.invitedEventIds ?? []);
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
            if (guest)
                await api.guests.update(invitationId, guest.id, body);
            else
                await api.guests.create(invitationId, body);
            push(guest ? 'Guest updated.' : 'Guest added.');
            onSaved();
        }
        catch (error) {
            push(error instanceof ApiError ? error.message : 'That did not save.', 'error');
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs(Modal, { open: true, onClose: onClose, title: guest ? `Edit ${guest.name}` : 'Add a guest', children: [_jsxs("div", { className: "space-y-3.5", children: [_jsx(Field, { label: "Name", children: _jsx(Input, { value: name, onChange: (event) => setName(event.target.value), placeholder: "Amara & Tom Whitfield", autoFocus: true }) }), _jsxs("div", { className: "grid gap-3.5 sm:grid-cols-2", children: [_jsx(Field, { label: "Email", hint: "Used for reminders only", children: _jsx(Input, { type: "email", value: email, onChange: (event) => setEmail(event.target.value), placeholder: "amara@example.com" }) }), _jsx(Field, { label: "Phone", children: _jsx(Input, { value: phone, onChange: (event) => setPhone(event.target.value), placeholder: "+44 7700 900123" }) })] }), _jsxs("div", { className: "grid gap-3.5 sm:grid-cols-2", children: [_jsxs(Field, { label: "Group", hint: "Family, friends, colleagues\u2026", children: [_jsx(Input, { value: groupName, onChange: (event) => setGroupName(event.target.value), placeholder: "Bride's family", list: "guest-groups" }), _jsx("datalist", { id: "guest-groups", children: groups.map((group) => (_jsx("option", { value: group }, group))) })] }), _jsx(Field, { label: "Party size", hint: "Names on the invitation", children: _jsx(Select, { value: partySize, onChange: (event) => setPartySize(event.target.value), children: [1, 2, 3, 4, 5, 6, 7, 8].map((size) => (_jsxs("option", { value: size, children: [size, " ", size === 1 ? 'seat' : 'seats'] }, size))) }) })] }), events.length > 0 && (_jsx(Field, { label: "Invited to", hint: "Leave all unticked to invite them to everything", children: _jsx("div", { className: "mt-1 space-y-1.5", children: events.map((event) => {
                                const checked = invited.includes(event.id);
                                return (_jsxs("label", { className: "flex items-center gap-2 text-[0.8rem] text-ink-soft", children: [_jsx("input", { type: "checkbox", checked: checked, onChange: () => setInvited((current) => checked ? current.filter((value) => value !== event.id) : [...current, event.id]), className: "h-3.5 w-3.5 accent-[#a97c50]" }), event.name] }, event.id));
                            }) }) })), _jsx(Field, { label: "Private notes", hint: "Only you see this", children: _jsx(Textarea, { rows: 2, value: notes, onChange: (event) => setNotes(event.target.value), placeholder: "Vegetarian, arriving Friday" }) })] }), _jsxs("div", { className: "mt-5 flex justify-end gap-2", children: [_jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancel" }), _jsx(Button, { onClick: () => void save(), loading: saving, children: guest ? 'Save changes' : 'Add guest' })] })] }));
}
function ImportDialog({ invitationId, onClose, onDone, }) {
    const { push } = useToast();
    const [text, setText] = useState('');
    const [saving, setSaving] = useState(false);
    const [fileName, setFileName] = useState('');
    const parse = (raw) => raw
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
        }
        catch (error) {
            push(error instanceof ApiError ? error.message : 'The import failed.', 'error');
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs(Modal, { open: true, onClose: onClose, title: "Import your guest list", size: "lg", children: [_jsxs("p", { className: "text-[0.8rem] leading-relaxed text-muted", children: ["Paste rows from a spreadsheet or upload a CSV. Order is", ' ', _jsx("span", { className: "text-ink-soft", children: "name, email, group, party size" }), " \u2014 only the name is required."] }), _jsxs("label", { className: "mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-ivory px-4 py-6 text-[0.78rem] text-ink-soft transition hover:border-gold", children: [_jsx(Upload, { size: 14, className: "text-gold" }), fileName || 'Choose a .csv or .txt file', _jsx("input", { type: "file", accept: ".csv,.txt,text/plain,text/csv", className: "sr-only", onChange: async (event) => {
                            const file = event.target.files?.[0];
                            if (!file)
                                return;
                            setFileName(file.name);
                            setText(await file.text());
                        } })] }), _jsx(Field, { label: "Or paste rows", className: "mt-3", children: _jsx(Textarea, { rows: 7, value: text, onChange: (event) => setText(event.target.value), placeholder: 'Amara Whitfield, amara@example.com, Bride’s family, 2\nTom Whitfield, tom@example.com, Bride’s family, 2\nPriya Shah, priya@example.com, Friends, 1', className: "font-mono text-[0.74rem]" }) }), _jsx("p", { className: "mt-2 text-[0.7rem] text-muted", children: rows > 0 ? `${rows} ${rows === 1 ? 'row' : 'rows'} ready to import.` : 'Nothing detected yet.' }), _jsxs("div", { className: "mt-5 flex justify-end gap-2", children: [_jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancel" }), _jsxs(Button, { onClick: () => void submit(), loading: saving, disabled: rows === 0, children: [_jsx(Upload, { size: 13 }), " Import ", rows > 0 ? rows : ''] })] })] }));
}
function ConfirmRemove({ guest, onClose, onConfirm, }) {
    const [busy, setBusy] = useState(false);
    return (_jsxs(Modal, { open: true, onClose: onClose, title: "Remove this guest?", size: "sm", children: [_jsxs("p", { className: "text-[0.84rem] leading-relaxed text-muted", children: [guest.name, " will be removed from the guest list, along with their personal link and RSVP. This cannot be undone."] }), _jsxs("div", { className: "mt-5 flex justify-end gap-2", children: [_jsx(Button, { variant: "ghost", onClick: onClose, children: "Keep guest" }), _jsxs(Button, { variant: "primary", className: "!bg-[#8d4d3f]", loading: busy, onClick: async () => {
                            setBusy(true);
                            await onConfirm();
                            setBusy(false);
                        }, children: [busy ? _jsx(Loader2, { size: 13, className: "animate-spin" }) : _jsx(Trash2, { size: 13 }), " Remove"] })] })] }));
}
