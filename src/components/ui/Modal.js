import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import clsx from 'clsx';
export function Modal({ open, onClose, title, description, children, footer, size = 'md', hideClose, }) {
    const reduce = useReducedMotion();
    const panelRef = useRef(null);
    useEffect(() => {
        if (!open)
            return;
        const previous = document.activeElement;
        const { overflow } = document.body.style;
        document.body.style.overflow = 'hidden';
        const timer = window.setTimeout(() => {
            const focusable = panelRef.current?.querySelector('input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])');
            focusable?.focus();
        }, 60);
        const onKey = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
            if (event.key !== 'Tab' || !panelRef.current)
                return;
            const nodes = [
                ...panelRef.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])'),
            ].filter((el) => el.offsetParent !== null);
            if (!nodes.length)
                return;
            const first = nodes[0];
            const last = nodes[nodes.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = overflow;
            document.removeEventListener('keydown', onKey);
            window.clearTimeout(timer);
            previous?.focus();
        };
    }, [open, onClose]);
    return createPortal(_jsx(AnimatePresence, { children: open && (_jsxs("div", { className: "fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6", children: [_jsx(motion.button, { type: "button", "aria-label": "Close dialog", className: "absolute inset-0 cursor-default bg-[#1b1510]/55 backdrop-blur-[3px]", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose }), _jsxs(motion.div, { ref: panelRef, role: "dialog", "aria-modal": "true", "aria-label": title, initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.99 }, transition: { duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }, className: clsx('relative z-10 flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-paper shadow-2xl sm:rounded-2xl', size === 'sm' && 'sm:max-w-md', size === 'md' && 'sm:max-w-xl', size === 'lg' && 'sm:max-w-3xl', size === 'xl' && 'sm:max-w-5xl'), children: [(title || !hideClose) && (_jsxs("div", { className: "flex items-start justify-between gap-4 border-b border-line/70 px-5 py-4 sm:px-6", children: [_jsxs("div", { children: [title && (_jsx("h2", { className: "display text-2xl font-medium text-ink sm:text-[1.7rem]", children: title })), description && _jsx("p", { className: "mt-1 text-sm text-muted", children: description })] }), !hideClose && (_jsx("button", { type: "button", onClick: onClose, className: "icon-btn -mr-1 -mt-1 flex-none", "aria-label": "Close", children: _jsx(X, { size: 16 }) }))] })), _jsx("div", { className: "min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6", children: children }), footer && _jsx("div", { className: "border-t border-line/70 px-5 py-4 sm:px-6", children: footer })] })] })) }), document.body);
}
