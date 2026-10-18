import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ArrowRight, Loader2 } from 'lucide-react';
export function Logo({ tone = 'ink', compact }) {
    return (_jsxs(Link, { to: "/", className: "group inline-flex items-center gap-2.5", "aria-label": "Vellum home", children: [_jsx("span", { className: clsx('grid h-8 w-8 place-items-center rounded-full border transition group-hover:border-gold', tone === 'light' ? 'border-white/35 text-[#f5ebdc]' : 'border-ink/25 text-ink'), children: _jsx("span", { className: "font-display text-[1.05rem] leading-none", children: "V" }) }), _jsxs("span", { className: "flex flex-col leading-none", children: [_jsx("span", { className: clsx('font-editorial text-[0.95rem] tracking-[0.28em] uppercase', tone === 'light' ? 'text-[#f7f0e5]' : 'text-ink'), children: "Vellum" }), !compact && (_jsx("span", { className: clsx('mt-1 text-[0.47rem] font-semibold tracking-[0.34em] uppercase', tone === 'light' ? 'text-white/55' : 'text-muted'), children: "Invitations" }))] })] }));
}
export function Spinner({ className }) {
    return _jsx(Loader2, { size: 16, className: clsx('animate-spin', className), "aria-hidden": true });
}
export function PageLoader({ label = 'Setting the table' }) {
    return (_jsx("div", { className: "dash-shell grid min-h-svh place-items-center px-6", children: _jsxs("div", { className: "flex flex-col items-center gap-5", children: [_jsx("span", { className: "spin h-8 w-8 rounded-full border border-line border-t-gold" }), _jsx("p", { className: "eyebrow", children: label })] }) }));
}
export function Skeleton({ className }) {
    return _jsx("div", { className: clsx('skeleton', className), "aria-hidden": true });
}
export function EmptyState({ eyebrow, title, description, action, icon, className, }) {
    return (_jsxs("div", { className: clsx('flex flex-col items-center px-6 py-14 text-center', className), children: [icon && (_jsx("div", { className: "mb-5 grid h-14 w-14 place-items-center rounded-full border border-line bg-ivory text-gold", children: icon })), eyebrow && _jsx("p", { className: "eyebrow mb-2", children: eyebrow }), _jsx("h3", { className: "display text-[1.8rem] text-ink", children: title }), _jsx("p", { className: "mt-2 max-w-sm text-sm leading-relaxed text-muted", children: description }), action && _jsx("div", { className: "mt-6", children: action })] }));
}
export function StatusPill({ status }) {
    return (_jsxs("span", { className: status === 'published' ? 'pill pill-green' : 'pill pill-neutral', children: [_jsx("span", { className: clsx('h-1.5 w-1.5 rounded-full', status === 'published' ? 'bg-[#5c7a4f]' : 'bg-[#9a8a78]') }), status === 'published' ? 'Published' : 'Draft'] }));
}
export function RsvpPill({ attending }) {
    if (attending === true)
        return _jsx("span", { className: "pill pill-green", children: "Attending" });
    if (attending === false)
        return _jsx("span", { className: "pill pill-rose", children: "Declined" });
    return _jsx("span", { className: "pill pill-neutral", children: "Awaiting reply" });
}
export function SmartImage({ src, alt, className, imgClassName, color = '#e5dccd', priority, onClick, }) {
    const [loaded, setLoaded] = useState(false);
    return (_jsxs("div", { className: clsx('relative overflow-hidden', className), style: { backgroundColor: color }, children: [_jsx("img", { src: src, alt: alt, loading: priority ? 'eager' : 'lazy', decoding: priority ? 'sync' : 'async', onLoad: () => setLoaded(true), onClick: onClick, className: clsx('h-full w-full object-cover transition-opacity duration-700', loaded ? 'opacity-100' : 'opacity-0', imgClassName) }), !loaded && _jsx("div", { className: "absolute inset-0 skeleton opacity-40", "aria-hidden": true })] }));
}
export function InlineLink({ to, children, className, }) {
    return (_jsxs(Link, { to: to, className: clsx('inline-flex items-center gap-1.5 text-[0.72rem] font-semibold tracking-[0.1em] uppercase text-gold transition hover:text-ink', className), children: [children, _jsx(ArrowRight, { size: 12 })] }));
}
export function Monogram({ monogram, className, style, }) {
    return (_jsx("span", { className: clsx('font-script text-2xl text-gold', className), style: style, "aria-hidden": true, children: monogram }));
}
