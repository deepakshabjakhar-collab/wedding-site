import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BedDouble, Car, ChevronRight, Gift, Images, Info, MapPin, QrCode, Shirt, Sparkles, } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { TemplateArt, TemplateMark } from '@/templates/art';
import { formatDate, formatDateShort, formatDayMonth, formatTime, groupEventsByDate } from '@/lib/format';
import { Countdown } from './Countdown';
import { Gallery } from './Gallery';
import { RsvpForm } from './RsvpForm';
import { MessageWall } from './MessageWall';
import { t } from './i18n';
const EASE = [0.22, 0.61, 0.36, 1];
/** The single drawn ornament that sits under the names on every cover. */
function CoverFlourish({ kind }) {
    if (kind === 'none')
        return _jsx("span", { className: "block h-4", "aria-hidden": true });
    return (_jsxs("span", { className: "mx-auto flex h-4 items-center justify-center gap-3 text-[var(--inv-accent)]", "aria-hidden": true, children: [_jsx("span", { className: "h-px w-12 bg-current opacity-60" }), kind === 'rule' && _jsx("span", { className: "h-1.5 w-1.5 rotate-45 border border-current" }), kind === 'star' && (_jsx("svg", { viewBox: "0 0 24 24", className: "h-3.5 w-3.5", children: _jsx("path", { d: "M12 1.6l1.9 8.5 8.5 1.9-8.5 1.9L12 22.4l-1.9-8.5L1.6 12l8.5-1.9Z", fill: "currentColor", fillOpacity: "0.75" }) })), kind === 'sprig' && (_jsxs("svg", { viewBox: "0 0 34 16", className: "h-3.5 w-8", fill: "none", stroke: "currentColor", strokeWidth: "0.9", children: [_jsx("path", { d: "M17 15c0-6 0-11 0-13" }), _jsx("path", { d: "M17 6c-3-1-5-3-5-6 3 0 5 2 5 6ZM17 6c3-1 5-3 5-6-3 0-5 2-5 6ZM17 11c-2-1-4-2-4-4 2 0 4 1 4 4ZM17 11c2-1 4-2 4-4-2 0-4 1-4 4Z" })] })), _jsx("span", { className: "h-px w-12 bg-current opacity-60" })] }));
}
function Header({ eyebrow, title, description, centered = true, }) {
    return (_jsxs("div", { className: centered ? 'text-center' : '', children: [_jsx("p", { className: "inv-eyebrow", children: eyebrow }), _jsx("h2", { className: "inv-display mt-3 text-[clamp(2rem,7.5cqw,3.3rem)] leading-[1.05] text-[var(--inv-ink)]", children: title }), description && (_jsx("p", { className: `inv-body-copy mt-4 ${centered ? 'mx-auto max-w-xl' : 'max-w-xl'}`, children: description })), _jsx("span", { className: `mt-6 block h-px w-16 bg-[var(--inv-accent)]/45 ${centered ? 'mx-auto' : ''}`, "aria-hidden": true })] }));
}
export function Hero({ data, theme, guest, mode, }) {
    const templateId = theme.template.id;
    const reduce = useReducedMotion();
    const centered = ['garden', 'georgian', 'celestial', 'vintage', 'playful'].includes(theme.layout);
    const minimal = theme.layout === 'minimal';
    const stacked = centered || minimal;
    const cover = theme.template.cover;
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const artY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '9%']);
    const artScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.06]);
    const contentY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-14%']);
    const contentFade = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0]);
    const reveal = (delay) => ({
        initial: reduce ? { opacity: 1 } : { y: '112%', opacity: 0 },
        animate: { y: '0%', opacity: 1 },
        transition: { duration: 1.15, ease: EASE, delay },
    });
    return (_jsxs("header", { ref: heroRef, className: "inv-hero", id: "top", children: [_jsx(motion.div, { className: "absolute inset-0", style: { y: artY, scale: artScale, background: `linear-gradient(165deg, ${theme.palette.deep}, ${theme.palette.ink})` }, children: _jsx(TemplateArt, { templateId: templateId, className: "absolute inset-0 h-full w-full text-[var(--inv-accent)] opacity-[0.55]" }) }), _jsx("div", { className: "inv-hero-scrim" }), _jsxs(motion.div, { className: "inv-hero-inner", style: { y: contentY, opacity: contentFade }, children: [_jsxs("div", { className: centered ? 'mx-auto max-w-4xl text-center' : 'max-w-4xl', children: [_jsx("span", { className: "block overflow-hidden", children: _jsx(motion.p, { className: "inv-eyebrow !text-[#f0e4d2]/70", ...reveal(0.05), children: guest && data.settings.showGuestName
                                        ? `${t(data.settings.language, 'forGuest')} ${guest.name}${guest.partySize > 1 ? ` · ${guest.partySize} guests` : ''}`
                                        : data.welcomeHeading }) }), _jsx("h1", { className: `inv-names mt-5 text-[#fdf7ea] ${cover.namesCase === 'upper' ? 'uppercase' : ''}`, style: { letterSpacing: cover.tracking }, children: stacked ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "block overflow-hidden", children: _jsx(motion.span, { className: "block", ...reveal(0.16), children: data.coupleA }) }), _jsx("span", { className: "block overflow-hidden py-[0.04em]", children: _jsx(motion.span, { className: "amp block !text-[0.34em] leading-none", ...reveal(0.3), children: "&" }) }), _jsx("span", { className: "block overflow-hidden", children: _jsx(motion.span, { className: "block", ...reveal(0.42), children: data.coupleB }) })] })) : (_jsxs(motion.span, { className: "block", ...reveal(0.16), children: [data.coupleA, _jsx("span", { className: "amp", children: "&" }), data.coupleB] })) }), _jsx("span", { className: `block overflow-hidden ${centered ? '' : 'max-w-lg'}`, children: _jsx(motion.span, { className: `mt-6 block ${centered ? '' : ''}`, ...reveal(0.58), children: _jsx(CoverFlourish, { kind: cover.flourish }) }) }), data.tagline && (_jsx("span", { className: "block overflow-hidden", children: _jsx(motion.p, { className: "inv-scripture mt-5 !text-[#f3e7d4]/85", ...reveal(0.68), children: data.tagline }) })), _jsx("span", { className: "block overflow-hidden", children: _jsxs(motion.div, { className: `mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#f1e4d1]/80 ${centered ? 'justify-center' : ''}`, ...reveal(0.8), children: [_jsx("span", { children: formatDate(data.weddingDate) }), _jsx("span", { className: "h-1 w-1 rounded-full bg-[var(--inv-accent)]" }), _jsx("span", { children: data.location })] }) }), _jsxs("div", { className: `mt-10 flex items-center gap-3 ${centered ? 'justify-center' : ''}`, children: [_jsxs("a", { href: "#rsvp", className: "inv-btn", children: [t(data.settings.language, 'rsvpCta'), _jsx(ArrowRight, { size: 13 })] }), _jsx("a", { href: "#schedule", className: "hidden text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#f1e4d1]/70 transition hover:text-[#f1e4d1] sm:inline-block", children: "The celebrations" })] }), mode !== 'live' && (_jsxs("p", { className: "mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#f1e4d1]/25 px-3 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-[#f1e4d1]/60", children: [_jsx(Sparkles, { size: 10 }), " Design preview"] }))] }), _jsx("div", { className: `mt-12 flex ${centered ? 'justify-center' : 'justify-start'}`, children: _jsxs("a", { href: "#welcome", className: "flex flex-col items-center gap-2 text-[0.52rem] uppercase tracking-[0.28em] text-[#f1e4d1]/55 transition hover:text-[#f1e4d1]", "aria-label": "Scroll to the welcome", children: [_jsx("span", { className: "inv-scroll-cue" }), "Scroll"] }) })] })] }));
}
export function Welcome({ data, theme }) {
    const reduce = useReducedMotion();
    const centered = ['garden', 'georgian', 'celestial', 'vintage', 'playful'].includes(theme.layout);
    return (_jsx("section", { id: "welcome", className: "inv-section", children: _jsxs(motion.div, { initial: reduce ? false : { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.25 }, transition: { duration: 0.8, ease: EASE }, className: `inv-narrow ${centered ? 'text-center' : ''}`, children: [_jsxs("div", { className: `flex items-center gap-4 ${centered ? 'justify-center' : ''}`, children: [_jsx("span", { className: "h-px w-10 bg-[var(--inv-accent)]/50" }), _jsx("span", { className: "inv-label", children: t(data.settings.language, 'welcome') }), _jsx("span", { className: "h-px w-10 bg-[var(--inv-accent)]/50" })] }), _jsx("h2", { className: "inv-display mt-5 text-[clamp(1.9rem,7cqw,3rem)] leading-[1.08]", children: data.welcomeHeading }), data.welcomeNote && _jsx("p", { className: "inv-body-copy mt-5 whitespace-pre-line", children: data.welcomeNote }), _jsxs("p", { className: "inv-script mt-8 text-[clamp(1.8rem,6cqw,2.5rem)] text-[var(--inv-accent)]", children: [data.coupleA, " & ", data.coupleB] }), _jsx("p", { className: "inv-label mt-3 !text-[0.52rem]", children: formatDate(data.weddingDate) })] }) }));
}
export function Story({ data, theme }) {
    const reduce = useReducedMotion();
    if (!data.story.length)
        return null;
    return (_jsx("section", { className: "inv-section", style: { background: 'color-mix(in srgb, var(--inv-accent-soft) 24%, var(--inv-bg))' }, children: _jsxs("div", { className: "inv-narrow !max-w-5xl", children: [_jsx(Header, { eyebrow: t(data.settings.language, 'ourStory'), title: "How we got here", description: data.storyIntro }), _jsx("div", { className: "mt-12 space-y-12 sm:space-y-16", children: data.story.map((chapter, index) => {
                        const reverse = index % 2 === 1;
                        return (_jsxs(motion.article, { initial: reduce ? false : { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.8, ease: EASE }, className: `grid items-center gap-6 sm:grid-cols-2 sm:gap-10 ${reverse ? 'sm:[&>figure]:order-2' : ''}`, children: [chapter.image ? (_jsxs("figure", { className: `relative ${theme.layout === 'editorial' ? 'arch-frame' : ''}`, children: [_jsx("div", { className: "overflow-hidden", children: _jsx("img", { src: chapter.image, alt: chapter.title, loading: "lazy", className: "aspect-[4/5] w-full object-cover transition duration-700 hover:scale-[1.02]" }) }), _jsxs("figcaption", { className: "inv-label mt-3 !text-[0.5rem]", children: ["Chapter ", String(index + 1).padStart(2, '0')] })] })) : (_jsx("div", { className: "hidden sm:block" })), _jsxs("div", { className: chapter.image ? '' : 'sm:col-span-2 sm:mx-auto sm:max-w-2xl sm:text-center', children: [_jsx("p", { className: "inv-script text-[2rem] leading-none text-[var(--inv-accent)]", children: String(index + 1).padStart(2, '0') }), _jsx("h3", { className: "inv-display mt-3 text-[clamp(1.5rem,5cqw,2.1rem)] leading-tight", children: chapter.title }), _jsx("p", { className: "inv-body-copy mt-3 whitespace-pre-line", children: chapter.body })] })] }, chapter.id));
                    }) })] }) }));
}
export function CountdownSection({ data, theme }) {
    if (!data.settings.countdown || !data.weddingDate)
        return null;
    const primary = [...data.events].sort((a, b) => a.date.localeCompare(b.date))[0];
    const target = primary?.date ?? data.weddingDate;
    return (_jsxs("section", { className: "inv-section relative overflow-hidden", style: { background: 'var(--inv-deep)', color: 'var(--inv-deep-ink)' }, children: [_jsx(TemplateArt, { templateId: theme.template.id, className: "pointer-events-none absolute inset-0 h-full w-full text-[var(--inv-accent)] opacity-[0.14]" }), _jsxs("div", { className: "inv-narrow relative text-center", children: [_jsx("p", { className: "inv-label !text-[var(--inv-deep-ink)]/50", children: t(data.settings.language, 'countdown') }), _jsx("p", { className: "inv-display mt-3 text-[clamp(1.6rem,5.5cqw,2.4rem)] !text-[var(--inv-deep-ink)]", children: formatDate(target) }), _jsx("div", { className: "mt-8", children: _jsx(Countdown, { date: target, time: primary?.startTime ?? data.weddingTime, lang: data.settings.language }) }), _jsx("p", { className: "mt-8 text-[0.65rem] uppercase tracking-[0.24em] text-[var(--inv-deep-ink)]/45", children: data.location })] })] }));
}
function EventRow({ event, lang }) {
    const day = formatDayMonth(event.date);
    return (_jsxs("div", { className: "inv-event-row", children: [_jsx("div", { children: _jsxs("p", { className: "inv-event-date", children: [day.day, _jsx("span", { children: day.month })] }) }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex flex-wrap items-baseline justify-between gap-2", children: [_jsx("h3", { className: "inv-display text-[clamp(1.3rem,4.6cqw,1.7rem)] leading-tight", children: event.name }), _jsxs("p", { className: "inv-label !text-[0.52rem]", children: [formatTime(event.startTime), event.endTime ? ` – ${formatTime(event.endTime)}` : ''] })] }), event.subtitle && _jsx("p", { className: "mt-0.5 font-[var(--inv-script)] text-[1.1rem] text-[var(--inv-accent)]", children: event.subtitle }), _jsx("p", { className: "mt-2 text-[0.82rem] font-medium text-[var(--inv-ink)]", children: event.venue }), event.address && _jsx("p", { className: "text-[0.76rem] leading-relaxed text-[var(--inv-muted)]", children: event.address }), event.description && _jsx("p", { className: "inv-body-copy mt-2 !text-[0.86rem]", children: event.description }), _jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-3", children: [event.mapUrl && (_jsxs("a", { href: event.mapUrl, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1.5 border-b border-[var(--inv-accent)]/40 pb-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--inv-accent)] transition hover:border-[var(--inv-accent)]", children: [_jsx(MapPin, { size: 11 }), " ", t(lang, 'map')] })), event.dressCode && (_jsxs("span", { className: "inline-flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--inv-muted)]", children: [_jsx(Shirt, { size: 11 }), " ", event.dressCode] }))] })] })] }));
}
export function Schedule({ data, guestEventIds, }) {
    const allowed = guestEventIds?.length
        ? data.events.filter((event) => guestEventIds.includes(event.id))
        : data.events;
    if (!allowed.length)
        return null;
    const groups = groupEventsByDate(allowed);
    return (_jsx("section", { id: "schedule", className: "inv-section", children: _jsxs("div", { className: "inv-narrow !max-w-3xl", children: [_jsx(Header, { eyebrow: t(data.settings.language, 'celebrations'), title: data.events.length > 3 ? 'The celebrations' : 'The day, in order', description: guestEventIds?.length && guestEventIds.length < data.events.length
                        ? `You are invited to ${guestEventIds.length} of our ${data.events.length} celebrations. Every detail of those days is below.`
                        : 'Every ceremony, every venue, every time — so you can plan the weekend with ease.' }), _jsx("div", { className: "mt-10", children: groups.map((group) => (_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "mb-1 flex items-center gap-3", children: [_jsx("span", { className: "h-px flex-1 bg-[var(--inv-line)]" }), _jsx("p", { className: "inv-label !text-[0.55rem]", children: formatDate(group.date, { weekday: 'long', day: 'numeric', month: 'long' }) }), _jsx("span", { className: "h-px flex-1 bg-[var(--inv-line)]" })] }), group.events.map((event) => (_jsx(EventRow, { event: event, lang: data.settings.language }, event.id)))] }, group.date))) }), data.details.mapUrl && (_jsxs("a", { href: data.details.mapUrl, target: "_blank", rel: "noreferrer", className: "inv-btn inv-btn-outline mt-2 w-full sm:w-auto", children: [_jsx(MapPin, { size: 13 }), " ", data.details.venue, _jsx(ChevronRight, { size: 13 })] }))] }) }));
}
export function Details({ data }) {
    const detail = data.details;
    const cards = [
        detail.dressCode && {
            icon: _jsx(Shirt, { size: 16 }),
            title: 'Dress code',
            body: [detail.dressCode, detail.dressCodeNote].filter(Boolean).join(' — '),
        },
        detail.travel && { icon: _jsx(Car, { size: 16 }), title: 'Getting there', body: detail.travel },
        detail.accommodation && { icon: _jsx(BedDouble, { size: 16 }), title: 'Where to stay', body: detail.accommodation },
        detail.gifts && { icon: _jsx(Gift, { size: 16 }), title: 'Gifts', body: detail.gifts },
        detail.additional && {
            icon: _jsx(Info, { size: 16 }),
            title: detail.additionalTitle || 'A little more',
            body: detail.additional,
        },
    ].filter(Boolean);
    if (!cards.length && !detail.address)
        return null;
    return (_jsx("section", { className: "inv-section", style: { background: 'color-mix(in srgb, var(--inv-accent-soft) 22%, var(--inv-bg))' }, children: _jsxs("div", { className: "inv-narrow !max-w-4xl", children: [_jsx(Header, { eyebrow: t(data.settings.language, 'details'), title: "A few practicalities", description: "Everything you might want to know before you pack a bag." }), _jsxs("div", { className: "mt-10 grid gap-3 sm:grid-cols-2", children: [detail.address && (_jsxs("div", { className: "inv-detail-card sm:col-span-2", children: [_jsx("span", { className: "grid h-9 w-9 flex-none place-items-center rounded-full border border-[var(--inv-accent)]/30 text-[var(--inv-accent)]", children: _jsx(MapPin, { size: 15 }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "inv-label !text-[0.52rem]", children: "The venue" }), _jsx("p", { className: "mt-1 text-sm font-medium text-[var(--inv-ink)]", children: detail.venue || data.location }), _jsx("p", { className: "text-[0.8rem] leading-relaxed text-[var(--inv-muted)]", children: detail.address }), detail.mapUrl && (_jsxs("a", { href: detail.mapUrl, target: "_blank", rel: "noreferrer", className: "mt-2 inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--inv-accent)]", children: [t(data.settings.language, 'map'), " ", _jsx(ArrowRight, { size: 11 })] }))] })] })), cards.map((card) => (_jsxs("div", { className: "inv-detail-card", children: [_jsx("span", { className: "grid h-9 w-9 flex-none place-items-center rounded-full border border-[var(--inv-accent)]/30 text-[var(--inv-accent)]", children: card.icon }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "inv-label !text-[0.52rem]", children: card.title }), _jsx("p", { className: "mt-1 whitespace-pre-line text-[0.83rem] leading-relaxed text-[var(--inv-muted)]", children: card.body })] })] }, card.title)))] })] }) }));
}
export function GallerySection({ data, templateId }) {
    if (!data.gallery.length)
        return null;
    return (_jsx("section", { className: "inv-section", children: _jsxs("div", { className: "inv-narrow !max-w-5xl", children: [_jsx(Header, { eyebrow: t(data.settings.language, 'gallery'), title: "Moments, so far", description: "A few frames from the road that brought us here. The rest will be taken on the day \u2014 by you, we hope." }), _jsx("div", { className: "mt-9", children: _jsx(Gallery, { items: data.gallery, layout: templateId }) }), data.settings.albumEnabled && (_jsxs("p", { className: "mt-8 text-center text-[0.72rem] text-[var(--inv-muted)]", children: [_jsx(Images, { size: 12, className: "mr-1.5 inline text-[var(--inv-accent)]" }), "After the wedding, this becomes the shared album \u2014 every guest\u2019s photographs in one place."] }))] }) }));
}
export function RsvpSection({ data, slug, guest, existingRsvp, token, mode, onSubmitted, }) {
    return (_jsx("section", { id: "rsvp", className: "inv-section", style: { background: 'var(--inv-deep)', color: 'var(--inv-deep-ink)' }, children: _jsxs("div", { className: "inv-narrow !max-w-3xl", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "inv-label !text-[var(--inv-deep-ink)]/50", children: t(data.settings.language, 'rsvp') }), _jsx("p", { className: "mx-auto mt-3 max-w-md text-[0.84rem] leading-relaxed text-[var(--inv-deep-ink)]/60", children: "A reply helps us set a place for you, choose the menu, and plan the seating." })] }), _jsx("div", { className: "mt-7", children: _jsx(RsvpForm, { data: data, slug: slug, guest: guest, existingRsvp: existingRsvp, token: token, lang: data.settings.language, mode: mode, onSubmitted: onSubmitted }) })] }) }));
}
export function MessagesSection({ data, slug, guest, token, messages, mode, }) {
    if (!data.settings.messagesEnabled)
        return null;
    return (_jsx("section", { id: "messages", className: "inv-section", children: _jsxs("div", { className: "inv-narrow !max-w-5xl", children: [_jsx(Header, { eyebrow: t(data.settings.language, 'messages'), title: "Blessings, from the people we love", description: "Leave a note for the two of us \u2014 we will be reading every one, probably more than once." }), _jsx("div", { className: "mt-9", children: _jsx(MessageWall, { data: data, slug: slug, guest: guest, token: token, initialMessages: messages, lang: data.settings.language, mode: mode }) })] }) }));
}
export function AlbumSection({ data, slug, photos, token, mode, }) {
    if (!data.settings.albumEnabled)
        return null;
    const albumHref = `/i/${slug}/album${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    const qrValue = typeof window !== 'undefined'
        ? `${window.location.origin}/i/${slug}/album${token ? `?token=${encodeURIComponent(token)}` : ''}`
        : albumHref;
    return (_jsx("section", { className: "inv-section", style: { background: 'color-mix(in srgb, var(--inv-accent-soft) 26%, var(--inv-bg))' }, children: _jsxs("div", { className: "inv-narrow !max-w-4xl", children: [_jsxs("div", { className: "grid items-center gap-8 sm:grid-cols-[1fr_auto]", children: [_jsxs("div", { children: [_jsx("p", { className: "inv-label", children: t(data.settings.language, 'album') }), _jsx("h2", { className: "inv-display mt-3 text-[clamp(1.9rem,6.5cqw,2.8rem)] leading-[1.05]", children: "Your photographs, together." }), _jsx("p", { className: "inv-body-copy mt-3 max-w-lg", children: "We would love to see the day through your eyes. Add your photographs to the shared album \u2014 at the table, from the dance floor, or the morning after." }), _jsxs("div", { className: "mt-6 flex flex-wrap items-center gap-3", children: [mode === 'live' ? (_jsxs(Link, { to: albumHref, className: "inv-btn", children: [_jsx(Images, { size: 13 }), " ", t(data.settings.language, 'addPhotos')] })) : (_jsxs("button", { type: "button", className: "inv-btn opacity-70", disabled: true, children: [_jsx(Images, { size: 13 }), " ", t(data.settings.language, 'addPhotos')] })), _jsx("span", { className: "text-[0.68rem] text-[var(--inv-muted)]", children: photos.length > 0
                                                ? `${photos.length} ${photos.length === 1 ? 'photograph' : 'photographs'} so far`
                                                : 'Be the first to add one' })] })] }), _jsxs("div", { className: "justify-self-center rounded-[2px] border border-[var(--inv-line)] bg-[var(--inv-surface)] p-3", children: [_jsx(QRCodeSVG, { value: qrValue, size: 104, bgColor: "#fffdf8", fgColor: "#211b16", level: "M" }), _jsxs("p", { className: "mt-2 flex items-center justify-center gap-1 text-[0.5rem] uppercase tracking-[0.14em] text-[var(--inv-muted)]", children: [_jsx(QrCode, { size: 9 }), " Scan at the table"] })] })] }), photos.length > 0 && (_jsx("div", { className: "mt-8 grid grid-cols-4 gap-1.5 sm:grid-cols-6", children: photos.slice(0, 6).map((photo) => (_jsx("img", { src: photo.thumbUrl, alt: `Photograph by ${photo.uploadedBy}`, loading: "lazy", className: "aspect-square w-full rounded-[1px] object-cover" }, photo.id))) }))] }) }));
}
export function Closing({ data, theme }) {
    return (_jsxs("section", { className: "inv-section relative overflow-hidden !pb-16", style: { background: 'var(--inv-bg)' }, children: [_jsx(TemplateArt, { templateId: theme.template.id, className: "pointer-events-none absolute -bottom-16 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 text-[var(--inv-accent)] opacity-[0.14]" }), _jsxs("div", { className: "inv-narrow relative text-center", children: [_jsx("span", { className: "inv-mono mx-auto", children: data.monogram }), _jsx("p", { className: "inv-display mt-7 text-[clamp(1.8rem,6cqw,2.6rem)] leading-[1.1]", children: "Thank you for being part of our story." }), _jsx("p", { className: "inv-body-copy mx-auto mt-4 max-w-md", children: "We cannot wait to see your face, hear your laugh, and dance badly with you." }), _jsxs("p", { className: "inv-script mt-6 text-[clamp(1.9rem,7cqw,2.8rem)] text-[var(--inv-accent)]", children: [data.coupleA, " & ", data.coupleB] }), _jsxs("div", { className: "mt-3 flex flex-wrap items-center justify-center gap-3 text-[0.6rem] uppercase tracking-[0.22em] text-[var(--inv-muted)]", children: [_jsx("span", { children: formatDateShort(data.weddingDate) }), data.hashtag && _jsx("span", { className: "h-1 w-1 rounded-full bg-[var(--inv-accent)]" }), data.hashtag && _jsx("span", { children: data.hashtag })] }), _jsx("div", { className: "mt-10 border-t border-[var(--inv-line)] pt-5", children: _jsx(Link, { to: "/", className: "text-[0.55rem] uppercase tracking-[0.22em] text-[var(--inv-muted)]/70 transition hover:text-[var(--inv-accent)]", children: "An invitation made with Vellum" }) })] })] }));
}
export function SectionDivider({ templateId }) {
    return (_jsx("div", { className: "pointer-events-none flex justify-center py-1", "aria-hidden": true, children: _jsx(TemplateMark, { templateId: templateId, className: "h-8 w-28 text-[var(--inv-accent)] opacity-50" }) }));
}
