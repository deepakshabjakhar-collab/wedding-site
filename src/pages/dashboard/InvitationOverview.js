import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CalendarDays, Check, Copy, ExternalLink, Images, MessageSquareHeart, Send, Users, } from 'lucide-react';
import { api, ApiError, albumUrl, shareUrl, whatsappUrl } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { useToast } from '@/components/ui/Toast';
import { Button, buttonClass } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Misc';
import { InvitationHeading, InvitationTabs } from '@/components/dashboard/InvitationTabs';
import { formatDate, formatDateShort, relativeTime } from '@/lib/format';
export default function InvitationOverview() {
    const { id = '' } = useParams();
    const { push } = useToast();
    const [publishing, setPublishing] = useState(false);
    const { data, loading, reload } = useAsync(async () => {
        const [inv, replies, notes, photos, guests] = await Promise.all([
            api.invitations.get(id),
            api.rsvps.list(id),
            api.messages.list(id),
            api.photos.list(id),
            api.guests.list(id),
        ]);
        return {
            invitation: inv.invitation,
            summary: replies.summary,
            messages: notes.messages,
            photos: photos.photos,
            guests: guests.guests,
        };
    }, [id]);
    if (loading || !data) {
        return (_jsxs("div", { className: "px-4 py-8 sm:px-7 lg:px-9", children: [_jsx(Skeleton, { className: "h-8 w-64" }), _jsx(Skeleton, { className: "mt-4 h-4 w-80" }), _jsx("div", { className: "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [0, 1, 2, 3].map((i) => (_jsx(Skeleton, { className: "h-24 w-full" }, i))) })] }));
    }
    const invitation = data.invitation;
    const summary = data.summary;
    const messages = data.messages;
    const photos = data.photos;
    const guests = data.guests;
    const events = [...invitation.data.events].sort((a, b) => a.date.localeCompare(b.date));
    const togglePublish = async () => {
        setPublishing(true);
        try {
            const next = invitation.status === 'published' ? 'draft' : 'published';
            await api.invitations.setStatus(id, next);
            push(next === 'published' ? 'Your invitation is live.' : 'The invitation is now a draft.');
            reload();
        }
        catch (error) {
            push(error instanceof ApiError ? error.message : 'That did not work.', 'error');
        }
        finally {
            setPublishing(false);
        }
    };
    const copy = async (value, label) => {
        try {
            await navigator.clipboard.writeText(value);
            push(label);
        }
        catch {
            push(value, 'info');
        }
    };
    const total = Math.max(1, summary.total);
    const segments = [
        { label: 'Attending', value: summary.attending, color: '#7f8d78' },
        { label: 'Awaiting reply', value: summary.pending, color: '#b58a43' },
        { label: 'Declined', value: summary.declined, color: '#ded2c0' },
    ];
    let offset = 0;
    return (_jsxs("div", { className: "px-4 py-6 sm:px-7 sm:py-8 lg:px-9", children: [_jsx(InvitationHeading, { coupleA: invitation.data.coupleA, coupleB: invitation.data.coupleB, status: invitation.status, subtitle: `${formatDate(invitation.data.weddingDate)}${invitation.data.location ? ` · ${invitation.data.location}` : ''}` }), _jsx("div", { className: "mt-6", children: _jsx(InvitationTabs, { invitationId: id }) }), _jsx("div", { className: "mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
                    {
                        label: 'Attending',
                        value: summary.attending,
                        hint: `${summary.headcount} seats in total`,
                        icon: _jsx(Check, { size: 13 }),
                    },
                    {
                        label: 'Awaiting reply',
                        value: summary.pending,
                        hint: 'Nudge them if needed',
                        icon: _jsx(Send, { size: 13 }),
                    },
                    {
                        label: 'Households',
                        value: guests.length,
                        hint: 'Personal links issued',
                        icon: _jsx(Users, { size: 13 }),
                    },
                    {
                        label: 'Blessings & photos',
                        value: messages.length + photos.length,
                        hint: `${messages.length} notes · ${photos.length} photographs`,
                        icon: _jsx(MessageSquareHeart, { size: 13 }),
                    },
                ].map((card) => (_jsxs("div", { className: "panel p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted", children: card.label }), _jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full border border-line text-gold", children: card.icon })] }), _jsx("p", { className: "mt-3 font-display text-[2.1rem] leading-none text-ink", children: card.value }), _jsx("p", { className: "mt-1.5 text-[0.72rem] text-muted", children: card.hint })] }, card.label))) }), _jsxs("div", { className: "mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]", children: [_jsxs("section", { className: "panel p-5", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Sharing" }), _jsx("h2", { className: "display mt-1.5 text-[1.55rem] text-ink", children: invitation.status === 'published' ? 'The invitation is live' : 'Not published yet' })] }), _jsx(Button, { variant: invitation.status === 'published' ? 'outline' : 'primary', size: "sm", loading: publishing, onClick: () => void togglePublish(), children: invitation.status === 'published' ? 'Unpublish' : 'Publish' })] }), _jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "flex min-w-0 flex-1 items-center rounded-lg border border-line bg-ivory px-3 py-2", children: _jsx("span", { className: "truncate text-[0.76rem] text-ink-soft", children: shareUrl(invitation.slug) }) }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => void copy(shareUrl(invitation.slug), 'Invitation link copied.'), children: [_jsx(Copy, { size: 12 }), " Copy"] }), _jsxs("a", { href: `/preview/${id}`, target: "_blank", rel: "noreferrer", className: buttonClass('outline', 'sm'), children: [_jsx(ExternalLink, { size: 12 }), " Preview"] })] }), _jsxs("div", { className: "mt-5 grid gap-3 sm:grid-cols-[1fr_auto]", children: [_jsxs("div", { className: "rounded-xl border border-line bg-[#fbf7ef] p-4", children: [_jsx("p", { className: "text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted", children: "RSVP progress" }), _jsxs("div", { className: "mt-3 flex items-center gap-5", children: [_jsxs("div", { className: "relative h-[6.4rem] w-[6.4rem] flex-none", children: [_jsxs("svg", { viewBox: "0 0 100 100", className: "h-full w-full -rotate-90", children: [_jsx("circle", { cx: "50", cy: "50", r: "42", fill: "none", stroke: "#ece2d1", strokeWidth: "10" }), segments.map((segment) => {
                                                                        const length = (segment.value / total) * 264;
                                                                        offset += length;
                                                                        return (_jsx("circle", { cx: "50", cy: "50", r: "42", fill: "none", stroke: segment.color, strokeWidth: "10", strokeDasharray: `${length} 264`, strokeDashoffset: -offset }, segment.label));
                                                                    })] }), _jsx("span", { className: "absolute inset-0 grid place-items-center text-center", children: _jsxs("span", { children: [_jsx("span", { className: "block font-display text-[1.35rem] leading-none text-ink", children: summary.total }), _jsx("span", { className: "text-[0.48rem] uppercase tracking-[0.12em] text-muted", children: "households" })] }) })] }), _jsx("ul", { className: "space-y-2 text-[0.76rem]", children: segments.map((segment) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: "h-2.5 w-2.5 rounded-full", style: { background: segment.color } }), _jsx("span", { className: "text-ink-soft", children: segment.label }), _jsx("span", { className: "font-semibold text-ink", children: segment.value })] }, segment.label))) })] }), _jsx(Link, { to: `/dashboard/i/${id}/rsvps`, className: "mt-3 inline-flex text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-gold", children: "Open all replies" })] }), _jsxs("div", { className: "flex flex-col items-center gap-2 rounded-xl border border-line bg-[#fbf7ef] p-4", children: [_jsx(QRCodeSVG, { value: shareUrl(invitation.slug), size: 96, bgColor: "#fbf7ef", fgColor: "#211b16", level: "M" }), _jsx("p", { className: "text-[0.55rem] uppercase tracking-[0.12em] text-muted", children: "Scan to open" }), _jsx("button", { type: "button", className: "text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-gold", onClick: () => void copy(albumUrl(invitation.slug), 'Album link copied.'), children: "Copy album link" })] })] }), _jsxs("a", { href: whatsappUrl(shareUrl(invitation.slug), `${invitation.data.coupleA} & ${invitation.data.coupleB} would love you to see this:`), target: "_blank", rel: "noreferrer", className: buttonClass('ghost', 'sm', 'mt-4'), children: [_jsx(Send, { size: 12 }), " Share on WhatsApp"] })] }), _jsxs("section", { className: "panel p-5", children: [_jsx("p", { className: "eyebrow", children: "The schedule" }), _jsxs("h2", { className: "display mt-1.5 text-[1.55rem] text-ink", children: [events.length, " ", events.length === 1 ? 'celebration' : 'celebrations'] }), _jsxs("ul", { className: "mt-4 space-y-3", children: [events.map((event) => (_jsxs("li", { className: "flex gap-3 border-b border-line/60 pb-3 last:border-0", children: [_jsx("span", { className: "grid h-11 w-11 flex-none place-items-center rounded-lg border border-line bg-[#fbf7ef]", children: _jsx("span", { className: "font-display text-[1.1rem] leading-none text-ink", children: formatDateShort(event.date, { day: 'numeric', month: 'short' }) }) }), _jsxs("span", { className: "min-w-0", children: [_jsx("span", { className: "block truncate text-[0.82rem] font-medium text-ink", children: event.name }), _jsxs("span", { className: "block text-[0.7rem] text-muted", children: [event.startTime, event.venue ? ` · ${event.venue}` : ''] })] })] }, event.id))), events.length === 0 && (_jsxs("li", { className: "text-[0.8rem] text-muted", children: ["No ceremonies yet \u2014", ' ', _jsx(Link, { to: `/studio/${id}`, className: "text-gold", children: "add them in the studio" }), "."] }))] }), _jsxs(Link, { to: `/studio/${id}`, className: buttonClass('outline', 'sm', 'mt-4'), children: [_jsx(CalendarDays, { size: 12 }), " Edit the schedule"] })] })] }), _jsxs("div", { className: "mt-5 grid gap-5 lg:grid-cols-2", children: [_jsxs("section", { className: "panel p-5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "eyebrow", children: "Latest blessings" }), _jsx(Link, { to: `/dashboard/i/${id}/messages`, className: "text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-gold", children: "See all" })] }), _jsxs("ul", { className: "mt-4 space-y-3", children: [messages.slice(0, 3).map((message) => (_jsxs("li", { className: "rounded-xl border border-line/70 bg-[#fbf7ef] px-3.5 py-3", children: [_jsx("p", { className: "text-[0.8rem] leading-relaxed text-ink-soft", children: message.text }), _jsxs("p", { className: "mt-1.5 flex items-center justify-between text-[0.66rem] text-muted", children: [_jsx("span", { className: "font-script text-[0.95rem] text-gold", children: message.author }), _jsx("span", { children: relativeTime(message.createdAt) })] })] }, message.id))), messages.length === 0 && (_jsx("li", { className: "text-[0.8rem] text-muted", children: "No blessings yet. They appear here the moment a guest writes one." }))] })] }), _jsxs("section", { className: "panel p-5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "eyebrow", children: "Guest album" }), _jsx(Link, { to: `/dashboard/i/${id}/album`, className: "text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-gold", children: "Manage" })] }), photos.length > 0 ? (_jsx("div", { className: "mt-4 grid grid-cols-4 gap-2", children: photos.slice(0, 8).map((photo) => (_jsx("img", { src: photo.thumbUrl, alt: `Added by ${photo.uploadedBy}`, loading: "lazy", className: "aspect-square w-full rounded-lg object-cover" }, photo.id))) })) : (_jsxs("p", { className: "mt-4 flex items-center gap-2 text-[0.8rem] text-muted", children: [_jsx(Images, { size: 14, className: "text-gold" }), "No guest photographs yet \u2014 share the album QR at the venue."] })), _jsx("p", { className: "mt-3 text-[0.72rem] text-muted", children: invitation.data.settings.albumEnabled
                                    ? invitation.data.settings.albumPublic
                                        ? 'The album is open for uploads.'
                                        : 'The album is read-only at the moment.'
                                    : 'The shared album is switched off.' })] })] })] }));
}
