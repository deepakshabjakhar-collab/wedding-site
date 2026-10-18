import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Accessibility, CalendarCheck, ChefHat, Download, Mail, Music4, Search, Sparkles, Users, } from 'lucide-react';
import { api } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { useToast } from '@/components/ui/Toast';
import { buttonClass } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, RsvpPill, Skeleton } from '@/components/ui/Misc';
import { InvitationHeading, InvitationTabs } from '@/components/dashboard/InvitationTabs';
import { relativeTime } from '@/lib/format';
export default function RsvpPage() {
    const { id = '' } = useParams();
    const { push } = useToast();
    const [filter, setFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [detail, setDetail] = useState(null);
    const { data, loading } = useAsync(async () => {
        const [inv, replies] = await Promise.all([api.invitations.get(id), api.rsvps.list(id)]);
        return { invitation: inv.invitation, guests: replies.guests, summary: replies.summary };
    }, [id]);
    const guests = data?.guests ?? [];
    const summary = data?.summary;
    const stateOf = (guest) => guest.rsvp ? (guest.rsvp.attending ? 'attending' : 'declined') : 'pending';
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
        .filter((email) => Boolean(email));
    const copyEmails = async () => {
        try {
            await navigator.clipboard.writeText(emails.join(', '));
            push(`${emails.length} email addresses copied.`);
        }
        catch {
            push('Your browser blocked clipboard access.', 'error');
        }
    };
    return (_jsxs("div", { className: "px-4 py-6 sm:px-7 sm:py-8 lg:px-9", children: [data ? (_jsx(InvitationHeading, { coupleA: data.invitation.data.coupleA, coupleB: data.invitation.data.coupleB, status: data.invitation.status })) : (_jsx(Skeleton, { className: "h-9 w-60" })), _jsx("div", { className: "mt-6", children: _jsx(InvitationTabs, { invitationId: id }) }), _jsxs("div", { className: "mt-7 flex flex-wrap items-end justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Replies" }), _jsx("h2", { className: "display mt-1.5 text-[1.85rem] text-ink", children: "Every answer, in one place" }), _jsx("p", { className: "mt-1 text-[0.8rem] text-muted", children: "Meals, dietary needs and song requests \u2014 ready for your caterer and band." })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs("a", { href: `/api/invitations/${id}/rsvps.csv`, download: true, className: buttonClass('outline', 'sm'), children: [_jsx(Download, { size: 12 }), " Export CSV"] }), _jsxs("button", { type: "button", onClick: () => void copyEmails(), className: buttonClass('ghost', 'sm'), children: [_jsx(Mail, { size: 12 }), " Copy emails"] })] })] }), _jsx("div", { className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
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
                ].map((card) => (_jsxs("div", { className: "panel p-4", children: [_jsx("p", { className: "text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted", children: card.label }), _jsx("p", { className: `mt-2 font-display text-[2rem] leading-none ${card.tone}`, children: card.value }), _jsx("p", { className: "mt-1.5 text-[0.7rem] text-muted", children: card.hint })] }, card.label))) }), _jsxs("div", { className: "mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]", children: [_jsxs("section", { className: "panel overflow-hidden", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2 border-b border-line/70 px-4 py-3", children: [_jsx("div", { className: "flex items-center gap-1 rounded-full border border-line p-0.5", children: ['all', 'attending', 'pending', 'declined'].map((key) => (_jsx("button", { type: "button", onClick: () => setFilter(key), className: `rounded-full px-3 py-1 text-[0.66rem] font-semibold capitalize transition ${filter === key ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`, children: key }, key))) }), _jsxs("label", { className: "ml-auto flex min-w-[10rem] flex-1 items-center gap-2 rounded-lg border border-line bg-ivory px-3 py-1.5 sm:max-w-[16rem]", children: [_jsx(Search, { size: 13, className: "text-muted" }), _jsx("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Find a guest", "aria-label": "Search replies", className: "w-full bg-transparent text-[0.78rem] text-ink outline-none placeholder:text-muted/70" })] })] }), loading ? (_jsx("div", { className: "space-y-2 p-4", children: [0, 1, 2, 3].map((i) => (_jsx(Skeleton, { className: "h-12 w-full" }, i))) })) : filtered.length === 0 ? (_jsx(EmptyState, { icon: _jsx(CalendarCheck, { size: 20 }), title: "No replies here yet", description: "As guests answer, their meals, notes and requests appear here in real time." })) : (_jsx("ul", { className: "divide-y divide-line/50", children: filtered.map((guest) => (_jsx("li", { children: _jsxs("button", { type: "button", onClick: () => setDetail(guest), className: "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#fbf7ef]/80", children: [_jsx("span", { className: "grid h-9 w-9 flex-none place-items-center rounded-full border border-line bg-ivory text-[0.68rem] font-semibold text-ink-soft", children: guest.partySize }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsx("span", { className: "block truncate text-[0.84rem] font-medium text-ink", children: guest.name }), _jsx("span", { className: "block truncate text-[0.68rem] text-muted", children: guest.rsvp?.attending
                                                            ? `${guest.rsvp.meal || 'Meal not chosen'}${guest.rsvp.dietary ? ` · ${guest.rsvp.dietary}` : ''}`
                                                            : guest.rsvp
                                                                ? 'Declined with grace'
                                                                : guest.groupName || 'Awaiting a reply' })] }), _jsxs("span", { className: "hidden items-center gap-2 sm:flex", children: [guest.rsvp?.songRequest && _jsx(Music4, { size: 12, className: "text-gold" }), guest.rsvp?.accessibility && _jsx(Accessibility, { size: 12, className: "text-gold" })] }), _jsx(RsvpPill, { attending: guest.rsvp ? guest.rsvp.attending : undefined })] }) }, guest.id))) }))] }), _jsxs("div", { className: "space-y-5", children: [_jsxs("section", { className: "panel p-5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ChefHat, { size: 14, className: "text-gold" }), _jsx("p", { className: "eyebrow", children: "Menu tallies" })] }), _jsxs("ul", { className: "mt-3.5 space-y-2.5", children: [mealRows.entries.map(([meal, count]) => (_jsxs("li", { children: [_jsxs("div", { className: "flex items-center justify-between text-[0.76rem]", children: [_jsx("span", { className: "text-ink-soft", children: meal }), _jsx("span", { className: "font-semibold text-ink", children: count })] }), _jsx("div", { className: "mt-1 h-1.5 overflow-hidden rounded-full bg-[#ece2d1]", children: _jsx("div", { className: "h-full rounded-full bg-gold/70", style: { width: `${(count / mealRows.max) * 100}%` } }) })] }, meal))), mealRows.entries.length === 0 && (_jsx("li", { className: "text-[0.78rem] text-muted", children: "No meal choices yet." }))] })] }), _jsxs("section", { className: "panel p-5", children: [_jsx("p", { className: "eyebrow", children: "Kitchen notes" }), _jsxs("ul", { className: "mt-3 space-y-2.5", children: [dietary.map((guest) => (_jsxs("li", { className: "rounded-lg border border-line/70 bg-[#fbf7ef] px-3 py-2", children: [_jsx("p", { className: "text-[0.72rem] font-medium text-ink", children: guest.name }), _jsx("p", { className: "text-[0.76rem] text-ink-soft", children: guest.rsvp?.dietary })] }, guest.id))), dietary.length === 0 && _jsx("li", { className: "text-[0.78rem] text-muted", children: "No dietary needs shared." })] }), accessible.length > 0 && (_jsxs(_Fragment, { children: [_jsxs("p", { className: "mt-4 flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted", children: [_jsx(Accessibility, { size: 11 }), " Access needs"] }), _jsx("ul", { className: "mt-2 space-y-1.5 text-[0.76rem] text-ink-soft", children: accessible.map((guest) => (_jsxs("li", { children: [_jsxs("span", { className: "text-ink", children: [guest.name, ":"] }), " ", guest.rsvp?.accessibility] }, guest.id))) })] }))] }), _jsxs("section", { className: "panel p-5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Sparkles, { size: 13, className: "text-gold" }), _jsx("p", { className: "eyebrow", children: "Song requests" })] }), _jsxs("ul", { className: "mt-3 space-y-1.5 text-[0.78rem]", children: [songs.map((guest) => (_jsxs("li", { className: "flex items-baseline gap-2", children: [_jsx(Music4, { size: 11, className: "flex-none text-gold" }), _jsx("span", { className: "text-ink-soft", children: guest.rsvp?.songRequest }), _jsx("span", { className: "ml-auto flex-none text-[0.64rem] text-muted", children: guest.name.split(' ')[0] })] }, guest.id))), songs.length === 0 && _jsx("li", { className: "text-muted", children: "The dance floor is still a blank page." })] })] }), _jsxs("section", { className: "panel p-5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { size: 13, className: "text-gold" }), _jsx("p", { className: "eyebrow", children: "Latest replies" })] }), _jsxs("ul", { className: "mt-3 space-y-2 text-[0.74rem]", children: [[...guests]
                                                .filter((guest) => guest.rsvp)
                                                .sort((a, b) => (b.rsvp?.updatedAt ?? '').localeCompare(a.rsvp?.updatedAt ?? ''))
                                                .slice(0, 5)
                                                .map((guest) => (_jsxs("li", { className: "flex justify-between gap-2 text-muted", children: [_jsx("span", { className: "truncate text-ink-soft", children: guest.name }), _jsx("span", { className: "flex-none", children: relativeTime(guest.rsvp?.updatedAt ?? '') })] }, guest.id))), guests.filter((guest) => guest.rsvp).length === 0 && (_jsx("li", { className: "text-muted", children: "Nothing yet." }))] })] })] })] }), detail && (_jsxs(Modal, { open: true, onClose: () => setDetail(null), title: detail.name, description: detail.email ?? detail.phone ?? undefined, children: [_jsxs("div", { className: "space-y-4 text-[0.82rem]", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(RsvpPill, { attending: detail.rsvp ? detail.rsvp.attending : undefined }), detail.rsvp && _jsxs("span", { className: "text-[0.7rem] text-muted", children: ["Answered ", relativeTime(detail.rsvp.updatedAt)] })] }), _jsx(Row, { label: "Party size", value: `${detail.partySize} ${detail.partySize === 1 ? 'seat' : 'seats'}` }), _jsx(Row, { label: "Group", value: detail.groupName || '—' }), _jsx(Row, { label: "Meal", value: detail.rsvp?.meal || '—' }), _jsx(Row, { label: "Dietary needs", value: detail.rsvp?.dietary || '—' }), _jsx(Row, { label: "Children", value: detail.rsvp?.children || '—' }), _jsx(Row, { label: "Accessibility", value: detail.rsvp?.accessibility || '—' }), _jsx(Row, { label: "Song request", value: detail.rsvp?.songRequest || '—' }), _jsx(Row, { label: "Note", value: detail.rsvp?.note || '—' }), detail.notes && _jsx(Row, { label: "Your private note", value: detail.notes })] }), _jsxs("div", { className: "mt-5 flex justify-end gap-2", children: [detail.email && (_jsxs("a", { href: `mailto:${detail.email}?subject=${encodeURIComponent('A note about our wedding')}`, className: buttonClass('outline', 'sm'), children: [_jsx(Mail, { size: 12 }), " Email"] })), _jsx("button", { type: "button", onClick: () => setDetail(null), className: buttonClass('primary', 'sm'), children: "Close" })] })] }))] }));
}
function Row({ label, value }) {
    return (_jsxs("div", { className: "flex flex-col gap-0.5 border-b border-line/50 pb-2.5 last:border-0 sm:flex-row sm:justify-between sm:gap-6", children: [_jsx("span", { className: "text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted", children: label }), _jsx("span", { className: "text-right text-[0.84rem] text-ink", children: value })] }));
}
