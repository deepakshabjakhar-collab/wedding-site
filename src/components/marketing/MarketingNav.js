import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Misc';
import { buttonClass } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
const LINKS = [
    { label: 'Templates', href: '/templates', anchor: false },
    { label: 'The arrival', href: '#arrival', anchor: true },
    { label: 'The studio', href: '#studio', anchor: true },
    { label: 'Music', href: '#music', anchor: true },
    { label: 'Pricing', href: '#pricing', anchor: true },
];
export function MarketingNav({ tone = 'ink' }) {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const { user } = useAuth();
    const location = useLocation();
    const reduce = useReducedMotion();
    const isHome = location.pathname === '/';
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);
    useEffect(() => {
        if (!open)
            return;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = overflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [open]);
    const hrefFor = (link) => {
        if (!link.anchor)
            return link.href;
        return isHome ? link.href : `/${link.href}`;
    };
    return (_jsxs(_Fragment, { children: [_jsx("header", { className: "nav-shell", "data-scrolled": scrolled || tone === 'light' ? 'true' : 'false', children: _jsxs("div", { className: "shell flex h-[74px] items-center justify-between gap-6", children: [_jsx(Logo, {}), _jsx("nav", { className: "hidden items-center gap-8 lg:flex", "aria-label": "Primary", children: LINKS.map((link) => (_jsx("a", { href: hrefFor(link), className: "nav-link", onClick: () => setScrolled(true), children: link.label }, link.label))) }), _jsx("div", { className: "hidden items-center gap-2 md:flex", children: user ? (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/dashboard", className: buttonClass('ghost', 'sm'), children: "Dashboard" }), _jsx(Link, { to: "/templates", className: buttonClass('primary', 'sm'), children: "Create an invitation" })] })) : (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/login", className: buttonClass('ghost', 'sm'), children: "Sign in" }), _jsx(Link, { to: "/signup?next=/templates", className: buttonClass('primary', 'sm'), children: "Create an invitation" })] })) }), _jsx("button", { type: "button", className: "icon-btn md:hidden", onClick: () => setOpen(true), "aria-label": "Open menu", "aria-expanded": open, children: _jsx(Menu, { size: 18 }) })] }) }), _jsx(AnimatePresence, { children: open && (_jsxs(motion.div, { className: "fixed inset-0 z-[80] flex flex-col bg-[#f6f1e7]", initial: reduce ? { opacity: 0 } : { opacity: 0, y: -12 }, animate: { opacity: 1, y: 0 }, exit: reduce ? { opacity: 0 } : { opacity: 0, y: -12 }, transition: { duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }, children: [_jsxs("div", { className: "shell flex h-[74px] flex-none items-center justify-between", children: [_jsx(Logo, {}), _jsx("button", { type: "button", className: "icon-btn", onClick: () => setOpen(false), "aria-label": "Close menu", children: _jsx(X, { size: 18 }) })] }), _jsxs("nav", { className: "shell flex flex-1 flex-col justify-center gap-1 pb-16", "aria-label": "Mobile", children: [LINKS.map((link, i) => (_jsx(motion.a, { href: hrefFor(link), onClick: () => setOpen(false), className: "display border-b border-line/70 py-4 text-3xl text-ink", initial: reduce ? false : { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.05 + i * 0.04 }, children: link.label }, link.label))), _jsxs("div", { className: "mt-8 flex flex-col gap-3", children: [_jsx(Link, { to: "/templates", onClick: () => setOpen(false), className: buttonClass('primary', 'lg', 'w-full'), children: user ? 'Create an invitation' : 'Begin your invitation' }), _jsx(Link, { to: user ? '/dashboard' : '/login', onClick: () => setOpen(false), className: buttonClass('outline', 'lg', 'w-full'), children: user ? 'Your dashboard' : 'Sign in' })] }), _jsx("p", { className: "mt-10 font-display text-lg italic text-muted", children: "Invitations, remembered." })] })] })) })] }));
}
