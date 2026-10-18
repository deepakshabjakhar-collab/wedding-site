import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, ExternalLink, Globe, Link2, Lock, Plus, Search, Send, Trash2, TriangleAlert, Users, } from 'lucide-react';
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/Field';
import { Button, buttonClass } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RsvpPill, StatusPill } from '@/components/ui/Misc';
import { useToast } from '@/components/ui/Toast';
import { api, ApiError, shareUrl, whatsappUrl } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { formatDateTime } from '@/lib/format';
function toLocalInput(iso) {
    if (!iso)
        return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime()))
        return '';
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}
export function RsvpPanel({ data, updateSettings }) {
    const settings = data.settings;
    const [newMeal, setNewMeal] = useState('');
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("section", { children: [_jsx("p", { className: "eyebrow", children: "Replies" }), _jsx("h3", { className: "display mt-1.5 text-[1.6rem] text-ink", children: "RSVP settings" }), _jsxs("div", { className: "mt-4 grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "Reply by", htmlFor: "rsvp-deadline", hint: "After the deadline guests see a polite closing note", children: _jsx(Input, { id: "rsvp-deadline", type: "datetime-local", value: toLocalInput(settings.rsvpDeadline), onChange: (event) => updateSettings({
                                        rsvpDeadline: event.target.value ? new Date(event.target.value).toISOString() : null,
                                    }) }) }), _jsx(Field, { label: "Who can reply", htmlFor: "visibility", children: _jsxs(Select, { id: "visibility", value: settings.visibility, onChange: (event) => updateSettings({ visibility: event.target.value }), children: [_jsx("option", { value: "public", children: "Anyone with the link" }), _jsx("option", { value: "unlisted", children: "Only personal guest links" })] }) })] }), settings.rsvpDeadline && (_jsxs("p", { className: "hint", children: ["Currently closes ", formatDateTime(settings.rsvpDeadline), "."] })), _jsx("div", { className: "mt-4 space-y-2.5", children: _jsx(Switch, { checked: settings.allowPublicRsvp, onChange: (value) => updateSettings({ allowPublicRsvp: value }), label: "Accept replies from the public link", description: "Turn off if you would rather only count replies from invited households." }) }), settings.visibility === 'unlisted' && (_jsxs("p", { className: "mt-3 flex items-start gap-2 rounded-xl border border-line bg-paper/60 px-4 py-3 text-[0.76rem] leading-relaxed text-muted", children: [_jsx(Lock, { size: 13, className: "mt-0.5 flex-none text-gold" }), "Unlisted means the invitation opens only through personal guest links. Sharing the plain link will show a polite privacy note instead."] }))] }), _jsxs("section", { className: "border-t border-line/70 pt-7", children: [_jsx("p", { className: "eyebrow", children: "Questions" }), _jsx("h3", { className: "display mt-1.5 text-[1.6rem] text-ink", children: "What you need to know" }), _jsxs("div", { className: "mt-4 space-y-2.5", children: [_jsx(Switch, { checked: settings.questions.meal, onChange: (value) => updateSettings({ questions: { ...settings.questions, meal: value } }), label: "Meal preference", description: "Guests choose from your menu options." }), _jsx(Switch, { checked: settings.questions.dietary, onChange: (value) => updateSettings({ questions: { ...settings.questions, dietary: value } }), label: "Dietary requirements & allergies" }), _jsx(Switch, { checked: settings.questions.accessibility, onChange: (value) => updateSettings({ questions: { ...settings.questions, accessibility: value } }), label: "Accessibility & seating needs" }), _jsx(Switch, { checked: settings.questions.children, onChange: (value) => updateSettings({ questions: { ...settings.questions, children: value } }), label: "Children joining them" }), _jsx(Switch, { checked: settings.questions.songRequest, onChange: (value) => updateSettings({ questions: { ...settings.questions, songRequest: value } }), label: "Song requests for the band" })] }), settings.questions.meal && (_jsxs("div", { className: "mt-6", children: [_jsx("p", { className: "label", children: _jsx("span", { children: "Menu options" }) }), _jsx("div", { className: "space-y-2", children: settings.mealOptions.map((option) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { value: option, onChange: (event) => updateSettings({
                                                mealOptions: settings.mealOptions.map((item) => item === option ? event.target.value : item),
                                            }, `meal-${option}`), maxLength: 60 }), _jsx("button", { type: "button", className: "icon-btn !h-9 !w-9 flex-none", onClick: () => updateSettings({ mealOptions: settings.mealOptions.filter((item) => item !== option) }), "aria-label": `Remove ${option}`, children: _jsx(Trash2, { size: 13 }) })] }, option))) }), _jsxs("div", { className: "mt-2 flex items-center gap-2", children: [_jsx(Input, { value: newMeal, onChange: (event) => setNewMeal(event.target.value), placeholder: "Add another option", maxLength: 60 }), _jsx(Button, { variant: "outline", size: "sm", icon: _jsx(Plus, { size: 13 }), onClick: () => {
                                            if (!newMeal.trim())
                                                return;
                                            updateSettings({ mealOptions: [...settings.mealOptions, newMeal.trim()] });
                                            setNewMeal('');
                                        }, children: "Add" })] })] }))] })] }));
}
export function GuestsPanel({ invitation, data, goto }) {
    const { data: loaded, loading, reload } = useAsync(() => api.guests.list(invitation.id), [invitation.id]);
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
    const filtered = guests.filter((guest) => `${guest.name} ${guest.email ?? ''} ${guest.groupName}`.toLowerCase().includes(search.toLowerCase()));
    const copy = async (guest) => {
        const url = shareUrl(invitation.slug, guest.token);
        try {
            await navigator.clipboard.writeText(url);
            push(`Personal link for ${guest.name} copied.`);
        }
        catch {
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
        }
        catch (error) {
            push(error instanceof ApiError ? error.message : 'The guest could not be added.', 'error');
        }
        finally {
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
            const matchingEvents = data.events.filter((event) => event.guestGroup && group && event.guestGroup.toLowerCase() === group.toLowerCase());
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
        }
        catch (error) {
            push(error instanceof ApiError ? error.message : 'The import failed.', 'error');
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Guests" }), _jsxs("h3", { className: "display mt-1.5 text-[1.6rem] text-ink", children: [guests.length, " ", guests.length === 1 ? 'household' : 'households'] }), _jsx("p", { className: "mt-1.5 max-w-md text-[0.8rem] leading-relaxed text-muted", children: "Each household gets a personal link. Only they see which ceremonies they are invited to." })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setImportOpen(true), children: "Paste a list" }), _jsx(Button, { size: "sm", icon: _jsx(Plus, { size: 13 }), onClick: () => setAdding(true), children: "Add guest" })] })] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { size: 14, className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" }), _jsx(Input, { value: search, onChange: (event) => setSearch(event.target.value), placeholder: "Search guests", className: "pl-9", "aria-label": "Search guests" })] }), adding && (_jsxs("div", { className: "rounded-xl border border-line bg-paper p-4", children: [_jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [_jsx(Field, { label: "Name or household", htmlFor: "guest-name", children: _jsx(Input, { id: "guest-name", value: form.name, onChange: (event) => setForm({ ...form, name: event.target.value }), placeholder: "The Sharma Family" }) }), _jsx(Field, { label: "Email", htmlFor: "guest-email", optional: true, children: _jsx(Input, { id: "guest-email", type: "email", value: form.email, onChange: (event) => setForm({ ...form, email: event.target.value }) }) }), _jsx(Field, { label: "Phone", htmlFor: "guest-phone", optional: true, children: _jsx(Input, { id: "guest-phone", value: form.phone, onChange: (event) => setForm({ ...form, phone: event.target.value }) }) }), _jsxs(Field, { label: "Group", htmlFor: "guest-group", children: [_jsx(Input, { id: "guest-group", list: "studio-groups", value: form.groupName, onChange: (event) => {
                                            const group = event.target.value;
                                            const matching = data.events.filter((item) => item.guestGroup && item.guestGroup.toLowerCase() === group.toLowerCase());
                                            setForm({
                                                ...form,
                                                groupName: group,
                                                invitedEventIds: matching.length
                                                    ? matching.map((item) => item.id)
                                                    : form.invitedEventIds,
                                            });
                                        } }), _jsx("datalist", { id: "studio-groups", children: groups.map((group) => (_jsx("option", { value: group }, group))) })] }), _jsx(Field, { label: "Seats", htmlFor: "guest-party", children: _jsx(Input, { id: "guest-party", type: "number", min: 1, max: 12, value: form.partySize, onChange: (event) => setForm({ ...form, partySize: Number(event.target.value) }) }) }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("p", { className: "label", children: _jsx("span", { children: "Invited to" }) }), _jsx("div", { className: "flex flex-wrap gap-2", children: data.events.map((event) => {
                                            const checked = form.invitedEventIds.includes(event.id);
                                            return (_jsx("button", { type: "button", onClick: () => setForm({
                                                    ...form,
                                                    invitedEventIds: checked
                                                        ? form.invitedEventIds.filter((id) => id !== event.id)
                                                        : [...form.invitedEventIds, event.id],
                                                }), className: `rounded-full border px-3 py-1.5 text-[0.68rem] transition ${checked ? 'border-ink bg-ink text-paper' : 'border-line text-muted hover:border-gold/50'}`, "aria-pressed": checked, children: event.name }, event.id));
                                        }) })] }), _jsx("div", { className: "sm:col-span-2", children: _jsx(Field, { label: "Private notes", htmlFor: "guest-notes", optional: true, children: _jsx(Textarea, { id: "guest-notes", value: form.notes, onChange: (event) => setForm({ ...form, notes: event.target.value }), className: "!min-h-[70px]", maxLength: 600 }) }) })] }), _jsxs("div", { className: "mt-4 flex items-center gap-2", children: [_jsx(Button, { size: "sm", onClick: () => void addGuest(), loading: busy, children: "Save guest" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setAdding(false), children: "Cancel" })] })] })), loading ? (_jsx("div", { className: "space-y-2", children: [0, 1, 2].map((i) => (_jsx("div", { className: "skeleton h-12 w-full" }, i))) })) : filtered.length === 0 ? (_jsxs("div", { className: "rounded-xl border border-line bg-paper/60 px-4 py-8 text-center", children: [_jsx(Users, { size: 20, className: "mx-auto text-gold" }), _jsx("p", { className: "mt-3 text-[0.85rem] font-medium text-ink", children: guests.length ? 'No guests match that search' : 'No guests yet' }), _jsx("p", { className: "mt-1 text-[0.78rem] text-muted", children: "Add households one by one, or paste a list of names and let us do the rest." })] })) : (_jsx("ul", { className: "divide-y divide-line/60 overflow-hidden rounded-xl border border-line bg-paper", children: filtered.map((guest) => (_jsxs("li", { className: "flex flex-wrap items-center gap-3 px-4 py-3", children: [_jsx("span", { className: "grid h-9 w-9 flex-none place-items-center rounded-full bg-ivory text-[0.65rem] font-semibold text-muted", children: guest.name
                                .split(/\s+/)
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join('') }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsx("span", { className: "block truncate text-[0.84rem] font-medium text-ink", children: guest.name }), _jsxs("span", { className: "block truncate text-[0.72rem] text-muted", children: [guest.groupName, " \u00B7 ", guest.partySize, " ", guest.partySize === 1 ? 'seat' : 'seats', guest.email ? ` · ${guest.email}` : ''] })] }), _jsx(RsvpPill, { attending: guest.rsvp ? guest.rsvp.attending : undefined }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("button", { type: "button", onClick: () => void copy(guest), className: "icon-btn !h-8 !w-8", "aria-label": `Copy personal link for ${guest.name}`, children: _jsx(Copy, { size: 13 }) }), _jsx("a", { href: whatsappUrl(shareUrl(invitation.slug, guest.token), `Dear ${guest.name},`), target: "_blank", rel: "noreferrer", className: "icon-btn !h-8 !w-8", "aria-label": `Send ${guest.name} a WhatsApp message`, children: _jsx(Send, { size: 13 }) }), _jsx("button", { type: "button", className: "icon-btn !h-8 !w-8", onClick: async () => {
                                        await api.guests.remove(invitation.id, guest.id).catch(() => undefined);
                                        reload();
                                    }, "aria-label": `Remove ${guest.name}`, children: _jsx(Trash2, { size: 13 }) })] })] }, guest.id))) })), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Link, { to: `/dashboard/i/${invitation.id}/guests`, className: buttonClass('outline', 'sm'), children: "Open the full guest manager" }), _jsx("button", { type: "button", className: buttonClass('ghost', 'sm'), onClick: () => goto('rsvp'), children: "RSVP settings" })] }), _jsxs(Modal, { open: importOpen, onClose: () => setImportOpen(false), title: "Paste your guest list", description: "One household per line. Add an email and group if you have them: Name, email, group", footer: _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setImportOpen(false), children: "Cancel" }), _jsx(Button, { size: "sm", onClick: () => void importGuests(), loading: busy, children: "Add guests" })] }), children: [_jsx(Textarea, { value: importText, onChange: (event) => setImportText(event.target.value), className: "textarea-tall", placeholder: 'The Sharma Family, sharma@example.com, Family\nPriya Nair, priya@example.com, Friends' }), _jsx("p", { className: "hint", children: "Guests are invited to every ceremony by default. Groups that match a ceremony\u2019s \u201Creserved for group\u201D field are pre-filtered automatically." })] })] }));
}
export function PublishPanel({ invitation, data, update }) {
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
        }
        catch (error) {
            push(error instanceof ApiError ? error.message : 'That did not work. Please try again.', 'error');
        }
        finally {
            setBusy(false);
        }
    };
    const saveSlug = async () => {
        setBusy(true);
        try {
            const result = await api.invitations.update(invitation.id, { data, slug });
            setSlug(result.invitation.slug);
            push('Link updated.');
        }
        catch (error) {
            push(error instanceof ApiError ? error.message : 'That link is not available.', 'error');
        }
        finally {
            setBusy(false);
        }
    };
    const remove = async () => {
        setBusy(true);
        try {
            await api.invitations.remove(invitation.id);
            push('Invitation deleted.');
            navigate('/dashboard');
        }
        catch (error) {
            push(error instanceof ApiError ? error.message : 'Could not delete the invitation.', 'error');
            setBusy(false);
        }
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("section", { children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Publishing" }), _jsx("h3", { className: "display mt-1.5 text-[1.6rem] text-ink", children: status === 'published' ? 'Your invitation is live' : 'Ready when you are' })] }), _jsx(StatusPill, { status: status })] }), _jsxs("div", { className: "mt-4 rounded-xl border border-line bg-paper p-4", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("span", { className: "flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-ivory px-3 py-2", children: [_jsx(Link2, { size: 13, className: "flex-none text-muted" }), _jsx("span", { className: "truncate text-[0.76rem] text-ink-soft", children: publicUrl })] }), _jsx(Button, { variant: "outline", size: "sm", icon: _jsx(Copy, { size: 13 }), onClick: async () => {
                                            try {
                                                await navigator.clipboard.writeText(publicUrl);
                                                push('Link copied.');
                                            }
                                            catch {
                                                push(publicUrl, 'info');
                                            }
                                        }, children: "Copy" }), _jsxs("a", { href: `/preview/${invitation.id}`, target: "_blank", rel: "noreferrer", className: buttonClass('outline', 'sm'), children: [_jsx(ExternalLink, { size: 13 }), " Guest view"] }), _jsxs("a", { href: whatsappUrl(publicUrl, `${data.coupleA} & ${data.coupleB} would love you to see this:`), target: "_blank", rel: "noreferrer", className: buttonClass('outline', 'sm'), children: [_jsx(Send, { size: 13 }), " WhatsApp"] })] }), _jsxs("div", { className: "mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end", children: [_jsx(Field, { label: "Custom link", htmlFor: "slug", hint: "Changing the link breaks previously shared links", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "flex-none text-[0.8rem] text-muted", children: "/i/" }), _jsx(Input, { id: "slug", value: slug, onChange: (event) => setSlug(event.target.value), onBlur: () => slug !== invitation.slug && void saveSlug(), maxLength: 60 })] }) }), _jsx("div", { className: "rounded-xl border border-line bg-ivory p-3", children: _jsx(QRCodeSVG, { value: publicUrl, size: 86, bgColor: "#f6f1e7", fgColor: "#211b16", level: "M" }) })] }), _jsxs("div", { className: "mt-5 flex flex-wrap items-center gap-3 border-t border-line/60 pt-4", children: [_jsx(Button, { onClick: () => void togglePublish(), loading: busy, icon: status === 'published' ? _jsx(Lock, { size: 13 }) : _jsx(Globe, { size: 13 }), children: status === 'published' ? 'Unpublish' : 'Publish the invitation' }), _jsx("p", { className: "text-[0.74rem] text-muted", children: status === 'published'
                                            ? 'Anyone with the link can open it. Personal links still control who sees which ceremonies.'
                                            : 'Nothing is public yet. Your work is saved either way.' })] })] })] }), _jsxs("section", { className: "border-t border-line/70 pt-7", children: [_jsx("p", { className: "eyebrow", children: "Sharing" }), _jsxs("div", { className: "mt-4 grid gap-4", children: [_jsx(Field, { label: "Share title", htmlFor: "share-title", hint: "Used when the link is pasted into WhatsApp or email", children: _jsx(Input, { id: "share-title", value: data.settings.shareTitle, onChange: (event) => update({ settings: { ...data.settings, shareTitle: event.target.value } }, 'share-title'), placeholder: `${data.coupleA} & ${data.coupleB} — our wedding invitation`, maxLength: 120 }) }), _jsx(Field, { label: "Share description", htmlFor: "share-description", children: _jsx(Textarea, { id: "share-description", value: data.settings.shareDescription, onChange: (event) => update({ settings: { ...data.settings, shareDescription: event.target.value } }, 'share-desc'), className: "!min-h-[70px]", maxLength: 220, placeholder: `Join us${data.location ? ` at ${data.location}` : ''} — the full invitation is inside.` }) })] })] }), _jsxs("section", { className: "border-t border-line/70 pt-7", children: [_jsx("p", { className: "eyebrow", children: "Before you send" }), _jsx("ul", { className: "mt-4 space-y-2", children: checks.map((check) => (_jsxs("li", { className: "flex items-center gap-3 text-[0.82rem]", children: [_jsx("span", { className: `grid h-5 w-5 flex-none place-items-center rounded-full border ${check.done ? 'border-[#5c7a4f] bg-[#5c7a4f] text-white' : 'border-line text-transparent'}`, children: _jsx(Check, { size: 11 }) }), _jsx("span", { className: check.done ? 'text-ink-soft' : 'text-muted', children: check.label })] }, check.label))) })] }), _jsxs("section", { className: "border-t border-line/70 pt-7", children: [_jsx("p", { className: "eyebrow", children: "Danger zone" }), _jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-3", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setConfirmDelete(true), icon: _jsx(TriangleAlert, { size: 13 }), children: "Delete this invitation" }), _jsx("p", { className: "text-[0.74rem] text-muted", children: "Removes the invitation, its guests, replies, blessings and photographs." })] })] }), _jsx(Modal, { open: confirmDelete, onClose: () => setConfirmDelete(false), title: "Delete this invitation?", description: "This cannot be undone.", size: "sm", footer: _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setConfirmDelete(false), children: "Keep it" }), _jsx(Button, { size: "sm", loading: busy, onClick: () => void remove(), children: "Delete permanently" })] }), children: _jsxs("p", { className: "text-sm leading-relaxed text-muted", children: [data.coupleA, " & ", data.coupleB, "\u2019s invitation, along with every guest \u2014 and a shared album of photographs \u2014 will be permanently removed."] }) })] }));
}
