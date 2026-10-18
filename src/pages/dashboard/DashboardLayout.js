import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, LogOut, Menu, Plus, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/ui/Misc';
import { buttonClass } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Misc';
export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [invitations, setInvitations] = useState([]);
    const [open, setOpen] = useState(false);
    useEffect(() => {
        let alive = true;
        api.invitations
            .list()
            .then((result) => alive && setInvitations(result.invitations))
            .catch(() => undefined);
        return () => {
            alive = false;
        };
    }, [location.pathname]);
    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);
    const nav = (_jsxs("div", { className: "flex h-full flex-col", children: [_jsx("div", { className: "flex items-center justify-between gap-2 px-4 py-4", children: _jsx(Logo, {}) }), _jsx("div", { className: "px-3", children: _jsxs(Link, { to: "/templates", className: buttonClass('primary', 'sm', 'w-full'), children: [_jsx(Plus, { size: 13 }), " New invitation"] }) }), _jsxs("nav", { className: "mt-4 flex-1 overflow-y-auto px-3 pb-4", "aria-label": "Dashboard", children: [_jsxs(NavLink, { to: "/dashboard", end: true, className: ({ isActive }) => `dash-link ${isActive ? '' : ''}`, "data-active": location.pathname === '/dashboard', children: [_jsx(LayoutDashboard, { size: 15 }), " All invitations"] }), _jsx("p", { className: "mt-5 px-2 pb-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-muted", children: "Your weddings" }), invitations.length === 0 && (_jsx("p", { className: "px-2 py-1 text-[0.75rem] text-muted", children: "Nothing yet \u2014 start with a design." })), _jsx("ul", { className: "space-y-1", children: invitations.map((invitation) => {
                            const active = location.pathname.includes(invitation.id);
                            return (_jsx("li", { children: _jsxs(Link, { to: `/dashboard/i/${invitation.id}`, className: "flex flex-col gap-1 rounded-lg px-2 py-2 transition hover:bg-ink/5", "data-active": active, children: [_jsx("span", { className: "flex items-center justify-between gap-2", children: _jsxs("span", { className: "truncate font-display text-[1.02rem] leading-tight text-ink", children: [invitation.data.coupleA, " & ", invitation.data.coupleB] }) }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(StatusPill, { status: invitation.status }), _jsxs("span", { className: "truncate text-[0.66rem] text-muted", children: [invitation.counts.attending, " attending \u00B7 ", invitation.counts.pending, " waiting"] })] })] }) }, invitation.id));
                        }) })] }), _jsxs("div", { className: "border-t border-line/70 p-3", children: [_jsxs("div", { className: "flex items-center gap-2.5 rounded-xl px-2 py-2", children: [_jsx("span", { className: "grid h-8 w-8 flex-none place-items-center rounded-full bg-ink text-[0.62rem] font-semibold text-paper", children: (user?.name ?? 'V').slice(0, 1).toUpperCase() }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsx("span", { className: "block truncate text-[0.78rem] font-medium text-ink", children: user?.name }), _jsx("span", { className: "block truncate text-[0.66rem] text-muted", children: user?.email })] })] }), _jsxs("button", { type: "button", onClick: async () => {
                            await logout();
                            navigate('/');
                        }, className: "dash-link w-full", children: [_jsx(LogOut, { size: 15 }), " Sign out"] })] })] }));
    return (_jsxs("div", { className: "dash-shell", children: [_jsxs("div", { className: "mx-auto flex min-h-svh w-full max-w-[100rem]", children: [_jsx("aside", { className: "sticky top-0 hidden h-svh w-[260px] flex-none border-r border-line/70 bg-[#fbf7ef]/80 lg:block", children: nav }), _jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [_jsxs("header", { className: "sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-line/70 bg-[#f6f1e7]/95 px-4 py-3 backdrop-blur lg:hidden", children: [_jsx(Logo, { compact: true }), _jsx("button", { type: "button", className: "icon-btn", onClick: () => setOpen(true), "aria-label": "Open menu", children: _jsx(Menu, { size: 17 }) })] }), _jsx("main", { className: "min-w-0 flex-1", children: _jsx(Outlet, {}) })] })] }), _jsx(AnimatePresence, { children: open && (_jsxs(motion.div, { className: "fixed inset-0 z-[80] lg:hidden", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: [_jsx("button", { type: "button", className: "absolute inset-0 bg-[#1b1510]/50", onClick: () => setOpen(false), "aria-label": "Close menu" }), _jsxs(motion.aside, { className: "absolute inset-y-0 left-0 w-[280px] border-r border-line bg-[#fbf7ef]", initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 }, transition: { duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }, children: [_jsx("button", { type: "button", className: "icon-btn absolute right-3 top-3 z-10", onClick: () => setOpen(false), "aria-label": "Close menu", children: _jsx(X, { size: 16 }) }), nav] })] })) })] }));
}
