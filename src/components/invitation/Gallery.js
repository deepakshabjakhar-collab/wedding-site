import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
export function Gallery({ items, layout }) {
    const [active, setActive] = useState(null);
    const reduce = useReducedMotion();
    const close = useCallback(() => setActive(null), []);
    const next = useCallback(() => setActive((i) => (i === null ? null : (i + 1) % items.length)), [items.length]);
    const prev = useCallback(() => setActive((i) => (i === null ? null : (i - 1 + items.length) % items.length)), [items.length]);
    useEffect(() => {
        if (active === null)
            return;
        const previous = document.activeElement;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (event) => {
            if (event.key === 'Escape')
                close();
            if (event.key === 'ArrowRight')
                next();
            if (event.key === 'ArrowLeft')
                prev();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = overflow;
            window.removeEventListener('keydown', onKey);
            previous?.focus();
        };
    }, [active, close, next, prev]);
    if (!items.length)
        return null;
    const activeItem = active !== null ? items[active] : null;
    const editorial = layout === 'editorial' || layout === 'minimal';
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: editorial ? 'grid grid-cols-2 gap-2 sm:grid-cols-3' : 'inv-gallery', children: items.map((item, i) => (_jsxs(motion.button, { type: "button", onClick: () => setActive(i), initial: reduce ? false : { opacity: 0, y: 12 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.1 }, transition: { duration: 0.55, delay: (i % 3) * 0.05 }, className: `group relative block w-full overflow-hidden bg-[var(--inv-accent-soft)] ${editorial ? (i % 5 === 0 ? 'col-span-2 row-span-2' : '') : ''} ${editorial ? '' : 'rounded-[1px]'}`, "aria-label": item.caption ? `Open photograph: ${item.caption}` : 'Open photograph', children: [_jsx("img", { src: item.src, alt: item.alt || item.caption || 'Wedding photograph', loading: "lazy", className: `w-full object-cover transition duration-700 group-hover:scale-[1.03] ${editorial ? (i % 5 === 0 ? 'aspect-[4/5] h-full' : 'aspect-[4/5]') : ''}` }), _jsx("span", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" }), item.caption && (_jsx("span", { className: "pointer-events-none absolute inset-x-0 bottom-0 translate-y-1 p-3 text-left text-[0.62rem] uppercase tracking-[0.14em] text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100", children: item.caption }))] }, item.id))) }), createPortal(_jsx(AnimatePresence, { children: activeItem && (_jsxs(motion.div, { className: "fixed inset-0 z-[95] flex flex-col bg-[#0f0c09]/94 backdrop-blur-sm", role: "dialog", "aria-modal": "true", "aria-label": "Photograph viewer", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3 text-[#efe4d2] sm:px-6", children: [_jsxs("span", { className: "text-[0.65rem] uppercase tracking-[0.2em]", children: [(active ?? 0) + 1, " / ", items.length] }), _jsx("button", { type: "button", onClick: close, className: "grid h-10 w-10 place-items-center rounded-full border border-white/20 transition hover:bg-white/10", "aria-label": "Close photograph", autoFocus: true, children: _jsx(X, { size: 18 }) })] }), _jsxs("div", { className: "relative flex min-h-0 flex-1 items-center justify-center px-3 pb-3 sm:px-16", children: [_jsx("button", { type: "button", onClick: prev, className: "absolute left-2 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/30 text-white transition hover:bg-black/60 sm:left-4", "aria-label": "Previous photograph", children: _jsx(ArrowLeft, { size: 18 }) }), _jsx(motion.img, { src: activeItem.src, alt: activeItem.alt || activeItem.caption || '', initial: reduce ? false : { opacity: 0, scale: 0.99 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3 }, className: "max-h-full max-w-full object-contain shadow-2xl" }, activeItem.id), _jsx("button", { type: "button", onClick: next, className: "absolute right-2 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/30 text-white transition hover:bg-black/60 sm:right-4", "aria-label": "Next photograph", children: _jsx(ArrowRight, { size: 18 }) })] }), activeItem.caption && (_jsx("p", { className: "px-6 pb-6 text-center font-display text-[1.1rem] italic text-[#efe4d2]/85", children: activeItem.caption }))] })) }), document.body)] }));
}
