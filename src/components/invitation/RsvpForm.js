import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Check, ChevronDown, Loader2, PartyPopper } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { formatDateShort, formatDateTime } from '@/lib/format';
import { t } from './i18n';
export function RsvpForm({ data, slug, guest, existingRsvp, token, lang, mode, onSubmitted, }) {
    const settings = data.settings;
    const allowedEvents = useMemo(() => {
        const invited = guest?.invitedEventIds ?? [];
        if (!invited.length)
            return data.events;
        const set = new Set(invited);
        return data.events.filter((event) => set.has(event.id));
    }, [data.events, guest?.invitedEventIds]);
    const closed = Boolean(settings.rsvpDeadline && new Date(settings.rsvpDeadline).getTime() < Date.now());
    const needsIdentity = !guest && mode === 'live';
    const [attending, setAttending] = useState(existingRsvp ? existingRsvp.attending : null);
    const [eventIds, setEventIds] = useState(existingRsvp?.eventIds?.length ? existingRsvp.eventIds : allowedEvents.map((e) => e.id));
    const [meal, setMeal] = useState(existingRsvp?.meal ?? '');
    const [dietary, setDietary] = useState(existingRsvp?.dietary ?? '');
    const [accessibility, setAccessibility] = useState(existingRsvp?.accessibility ?? '');
    const [children, setChildren] = useState(existingRsvp?.children ?? '');
    const [song, setSong] = useState(existingRsvp?.songRequest ?? '');
    const [note, setNote] = useState(existingRsvp?.note ?? '');
    const [name, setName] = useState(guest?.name ?? '');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(existingRsvp);
    const [editing, setEditing] = useState(!existingRsvp);
    const [activeToken, setActiveToken] = useState(token);
    const toggleEvent = (id) => {
        setEventIds((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
    };
    const submit = async (event) => {
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
                if (!token)
                    window.localStorage.setItem(`vellum:guest:${slug}`, result.token);
            }
            catch {
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
        }
        catch (err) {
            setError(err instanceof ApiError ? err.message : 'Your reply could not be sent. Please try again.');
        }
        finally {
            setSubmitting(false);
        }
    };
    if (closed && !existingRsvp) {
        return (_jsxs("div", { className: "inv-card mx-auto max-w-2xl px-6 py-10 text-center", children: [_jsx("p", { className: "inv-label", children: t(lang, 'rsvp') }), _jsx("p", { className: "mt-3 font-[var(--inv-display)] text-[1.7rem] text-[var(--inv-ink)]", children: t(lang, 'closed') }), _jsx("p", { className: "mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--inv-muted)]", children: "If you need to change an existing reply, please write to the couple directly \u2014 they would much rather hear from you." })] }));
    }
    if (!settings.allowPublicRsvp && !guest) {
        return (_jsxs("div", { className: "inv-card mx-auto max-w-2xl px-6 py-10 text-center", children: [_jsx("p", { className: "inv-label", children: t(lang, 'rsvp') }), _jsx("p", { className: "mt-3 font-[var(--inv-display)] text-[1.7rem] text-[var(--inv-ink)]", children: t(lang, 'inviteOnly') }), _jsx("p", { className: "mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--inv-muted)]", children: "Your personal link knows which celebrations you are invited to, and keeps your reply private." })] }));
    }
    if (submitted && !editing) {
        const selected = (submitted.eventIds ?? [])
            .map((id) => data.events.find((event) => event.id === id)?.name)
            .filter(Boolean);
        return (_jsx("div", { className: "inv-card mx-auto max-w-2xl overflow-hidden", children: _jsxs("div", { className: "flex flex-col items-center px-6 py-10 text-center", children: [_jsx("span", { className: "grid h-14 w-14 place-items-center rounded-full border border-[var(--inv-accent)]/40 bg-[var(--inv-accent)]/10 text-[var(--inv-accent)]", children: _jsx(PartyPopper, { size: 22 }) }), _jsx("p", { className: "inv-label mt-5", children: mode === 'live' ? 'Your reply is with us' : 'Preview reply' }), _jsx("p", { className: "mt-2 font-[var(--inv-display)] text-[1.9rem] leading-tight text-[var(--inv-ink)]", children: submitted.attending ? 'We cannot wait to celebrate with you.' : 'We will miss you, but we understand.' }), _jsx("p", { className: "mt-2 max-w-md text-sm leading-relaxed text-[var(--inv-muted)]", children: mode === 'live'
                            ? submitted.attending
                                ? 'Your reply has been saved for the couple. You can return to this link any time to change it.'
                                : 'The couple has been told. If your plans change, you can update your reply with this link.'
                            : 'This is a live design preview, so nothing has been sent. The form is exactly what your guests will use.' }), _jsxs("dl", { className: "mt-7 w-full max-w-sm space-y-2.5 text-left text-sm", children: [_jsxs("div", { className: "flex justify-between gap-4 border-b border-[var(--inv-line)]/60 pb-2.5", children: [_jsx("dt", { className: "text-[var(--inv-muted)]", children: "Attending" }), _jsx("dd", { className: "font-medium text-[var(--inv-ink)]", children: submitted.attending ? 'Joyfully yes' : 'Regretfully no' })] }), submitted.attending && selected.length > 0 && (_jsxs("div", { className: "flex justify-between gap-4 border-b border-[var(--inv-line)]/60 pb-2.5", children: [_jsx("dt", { className: "shrink-0 text-[var(--inv-muted)]", children: "Celebrations" }), _jsx("dd", { className: "text-right font-medium text-[var(--inv-ink)]", children: selected.join(' · ') })] })), submitted.attending && submitted.meal && (_jsxs("div", { className: "flex justify-between gap-4 border-b border-[var(--inv-line)]/60 pb-2.5", children: [_jsx("dt", { className: "text-[var(--inv-muted)]", children: "Meal" }), _jsx("dd", { className: "font-medium text-[var(--inv-ink)]", children: submitted.meal })] })), guest && guest.partySize > 1 && (_jsxs("div", { className: "flex justify-between gap-4 border-b border-[var(--inv-line)]/60 pb-2.5", children: [_jsx("dt", { className: "text-[var(--inv-muted)]", children: "Seats reserved" }), _jsx("dd", { className: "font-medium text-[var(--inv-ink)]", children: guest.partySize })] }))] }), _jsx("button", { type: "button", onClick: () => {
                            setEditing(true);
                            setSubmitted(null);
                        }, className: "inv-btn inv-btn-outline mt-7", children: "Change our reply" }), mode === 'live' && !token && (_jsx("p", { className: "mt-4 max-w-xs text-[0.68rem] leading-relaxed text-[var(--inv-muted)]", children: "Your personal link is now in the address bar. Keep it \u2014 it is how you will update your reply." }))] }) }));
    }
    return (_jsxs("form", { onSubmit: submit, className: "inv-card mx-auto max-w-2xl p-6 sm:p-9", noValidate: true, children: [_jsxs("div", { className: "flex flex-col justify-between gap-3 sm:flex-row sm:items-start", children: [_jsxs("div", { children: [_jsx("p", { className: "inv-label", children: t(lang, 'yourReply') }), _jsx("h3", { className: "mt-2 font-[var(--inv-display)] text-[1.9rem] leading-tight text-[var(--inv-ink)]", children: guest ? `Dear ${guest.name}, will you join us?` : 'Will you join us?' })] }), settings.rsvpDeadline && (_jsxs("p", { className: "shrink-0 text-[0.68rem] leading-relaxed text-[var(--inv-muted)] sm:text-right", children: [t(lang, 'deadline'), _jsx("br", {}), _jsx("span", { className: "font-medium text-[var(--inv-ink)]", children: formatDateTime(settings.rsvpDeadline) })] }))] }), guest && guest.partySize > 1 && (_jsxs("p", { className: "mt-3 text-xs leading-relaxed text-[var(--inv-muted)]", children: ["We have reserved ", guest.partySize, " seats for your household."] })), needsIdentity && (_jsxs("div", { className: "mt-6 grid gap-4 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "rsvp-name", className: "inv-field-label", children: t(lang, 'name') }), _jsx("input", { id: "rsvp-name", className: "inv-input", value: name, onChange: (e) => setName(e.target.value), autoComplete: "name", required: true })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "rsvp-email", className: "inv-field-label", children: [t(lang, 'email'), " ", _jsx("span", { className: "normal-case opacity-60", children: "(optional)" })] }), _jsx("input", { id: "rsvp-email", type: "email", className: "inv-input", value: email, onChange: (e) => setEmail(e.target.value), autoComplete: "email", placeholder: "For a confirmation, if you would like one" })] })] })), _jsxs("fieldset", { className: "mt-7", children: [_jsx("legend", { className: "inv-field-label", children: t(lang, 'rsvp') }), _jsx("div", { className: "mt-1 grid gap-2 sm:grid-cols-2", children: [
                            { value: true, label: t(lang, 'attending'), sub: 'I will be there with bells on.' },
                            { value: false, label: t(lang, 'declining'), sub: 'I will be thinking of you.' },
                        ].map((option) => (_jsxs("label", { className: `flex cursor-pointer items-start gap-3 rounded-[2px] border p-4 transition ${attending === option.value
                                ? 'border-[var(--inv-accent)] bg-[var(--inv-accent)]/8'
                                : 'border-[var(--inv-line)] hover:border-[var(--inv-accent)]/50'}`, children: [_jsx("input", { type: "radio", name: "attending", className: "sr-only", checked: attending === option.value, onChange: () => setAttending(option.value) }), _jsx("span", { className: `mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full border ${attending === option.value
                                        ? 'border-[var(--inv-accent)] bg-[var(--inv-accent)] text-[var(--inv-deep)]'
                                        : 'border-[var(--inv-line)]'}`, "aria-hidden": true, children: attending === option.value && _jsx(Check, { size: 11 }) }), _jsxs("span", { children: [_jsx("span", { className: "block text-sm font-medium text-[var(--inv-ink)]", children: option.label }), _jsx("span", { className: "mt-0.5 block text-xs leading-relaxed text-[var(--inv-muted)]", children: option.sub })] })] }, String(option.value)))) })] }), attending === true && allowedEvents.length > 0 && (_jsxs("fieldset", { className: "mt-6", children: [_jsx("legend", { className: "inv-field-label", children: t(lang, 'events') }), _jsx("div", { className: "mt-2 grid gap-2", children: allowedEvents.map((event) => {
                            const checked = eventIds.includes(event.id);
                            return (_jsxs("label", { className: `flex cursor-pointer items-center gap-3 rounded-[2px] border px-4 py-3 transition ${checked
                                    ? 'border-[var(--inv-accent)]/70 bg-[var(--inv-accent)]/6'
                                    : 'border-[var(--inv-line)] hover:border-[var(--inv-accent)]/50'}`, children: [_jsx("input", { type: "checkbox", className: "sr-only", checked: checked, onChange: () => toggleEvent(event.id) }), _jsx("span", { className: `grid h-5 w-5 flex-none place-items-center border ${checked
                                            ? 'border-[var(--inv-accent)] bg-[var(--inv-accent)] text-[var(--inv-deep)]'
                                            : 'border-[var(--inv-line)]'}`, "aria-hidden": true, children: checked && _jsx(Check, { size: 12 }) }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsx("span", { className: "block text-sm text-[var(--inv-ink)]", children: event.name }), _jsxs("span", { className: "block text-[0.7rem] text-[var(--inv-muted)]", children: [formatDateShort(event.date), " \u00B7 ", event.venue] })] })] }, event.id));
                        }) })] })), attending === true && (_jsxs("div", { className: "mt-6 grid gap-4 sm:grid-cols-2", children: [settings.questions.meal && (_jsxs("div", { className: settings.questions.dietary ? '' : 'sm:col-span-2', children: [_jsx("label", { htmlFor: "rsvp-meal", className: "inv-field-label", children: t(lang, 'meal') }), _jsxs("div", { className: "relative", children: [_jsxs("select", { id: "rsvp-meal", className: "inv-select", value: meal, onChange: (e) => setMeal(e.target.value), children: [_jsx("option", { value: "", children: "No preference" }), settings.mealOptions.map((option) => (_jsx("option", { value: option, children: option }, option)))] }), _jsx(ChevronDown, { size: 13, className: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--inv-muted)]" })] })] })), settings.questions.dietary && (_jsxs("div", { children: [_jsx("label", { htmlFor: "rsvp-dietary", className: "inv-field-label", children: t(lang, 'dietary') }), _jsx("input", { id: "rsvp-dietary", className: "inv-input", value: dietary, onChange: (e) => setDietary(e.target.value), placeholder: "Allergies, intolerances, anything we should know" })] })), settings.questions.children && (_jsxs("div", { children: [_jsx("label", { htmlFor: "rsvp-children", className: "inv-field-label", children: t(lang, 'children') }), _jsx("input", { id: "rsvp-children", className: "inv-input", value: children, onChange: (e) => setChildren(e.target.value), placeholder: "Names and ages, if you are bringing them" })] })), settings.questions.accessibility && (_jsxs("div", { children: [_jsx("label", { htmlFor: "rsvp-access", className: "inv-field-label", children: t(lang, 'accessibility') }), _jsx("input", { id: "rsvp-access", className: "inv-input", value: accessibility, onChange: (e) => setAccessibility(e.target.value), placeholder: "Step-free access, seating, anything at all" })] })), settings.questions.songRequest && (_jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { htmlFor: "rsvp-song", className: "inv-field-label", children: t(lang, 'song') }), _jsx("input", { id: "rsvp-song", className: "inv-input", value: song, onChange: (e) => setSong(e.target.value), placeholder: "We are building the dance floor around you" })] }))] })), _jsxs("div", { className: "mt-6", children: [_jsxs("label", { htmlFor: "rsvp-note", className: "inv-field-label", children: [t(lang, 'note'), " ", _jsx("span", { className: "normal-case opacity-60", children: "(optional)" })] }), _jsx("textarea", { id: "rsvp-note", className: "inv-textarea", value: note, onChange: (e) => setNote(e.target.value), maxLength: 800, placeholder: "Anything you would like them to know\u2026" })] }), error && (_jsx("p", { className: "mt-4 rounded-[2px] border border-[#b4553f]/40 bg-[#b4553f]/8 px-3 py-2 text-sm text-[#8f3c2b]", role: "alert", children: error })), _jsxs("div", { className: "mt-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center", children: [_jsx("p", { className: "max-w-[17rem] text-[0.65rem] leading-relaxed text-[var(--inv-muted)]", children: "Your reply is private. Only the couple can see your details." }), _jsxs("button", { type: "submit", className: "inv-btn min-w-[11rem]", disabled: submitting || (closed && !existingRsvp), children: [submitting ? _jsx(Loader2, { size: 14, className: "animate-spin" }) : null, submitting ? t(lang, 'sending') : existingRsvp ? 'Update reply' : t(lang, 'send')] })] }), closed && existingRsvp && (_jsxs("p", { className: "mt-3 text-[0.7rem] text-[var(--inv-muted)]", children: ["Replies closed on ", formatDateTime(settings.rsvpDeadline ?? ''), ", but you can still update an existing reply."] }))] }));
}
