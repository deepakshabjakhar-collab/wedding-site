import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { CalendarCheck, Images, LayoutPanelTop, LayoutTemplate, MessageSquareHeart, Users, UtensilsCrossed } from 'lucide-react';
const TABS = [
    { slug: '', label: 'Overview', icon: LayoutPanelTop, exact: true },
    { slug: 'guests', label: 'Guests', icon: Users },
    { slug: 'rsvps', label: 'RSVPs', icon: CalendarCheck },
    { slug: 'messages', label: 'Blessings', icon: MessageSquareHeart },
    { slug: 'album', label: 'Album', icon: Images },
    { slug: 'seating', label: 'Seating', icon: UtensilsCrossed },
];
export function InvitationTabs({ invitationId }) {
    return (_jsxs("div", { className: "no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1", children: [TABS.map((tab) => {
                const Icon = tab.icon;
                const to = tab.exact
                    ? `/dashboard/i/${invitationId}`
                    : `/dashboard/i/${invitationId}/${tab.slug}`;
                return (_jsxs(NavLink, { to: to, end: tab.exact, className: ({ isActive }) => `flex flex-none items-center gap-1.5 rounded-full border px-3.5 py-2 text-[0.68rem] font-medium transition ${isActive
                        ? 'border-ink bg-ink text-paper'
                        : 'border-line text-ink-soft hover:border-gold/60 hover:text-ink'}`, children: [_jsx(Icon, { size: 12 }), tab.label] }, tab.label));
            }), _jsxs(NavLink, { to: `/studio/${invitationId}`, className: "flex flex-none items-center gap-1.5 rounded-full border border-gold/50 bg-gold/10 px-3.5 py-2 text-[0.68rem] font-semibold text-[#856032] transition hover:bg-gold/20", children: [_jsx(LayoutTemplate, { size: 12 }), "Open the studio"] })] }));
}
export function InvitationHeading({ coupleA, coupleB, status, subtitle, }) {
    return (_jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Wedding dashboard" }), _jsxs("h1", { className: "display mt-2 text-[2.2rem] leading-tight text-ink sm:text-[2.6rem]", children: [coupleA, " & ", coupleB] }), subtitle && _jsx("p", { className: "mt-1.5 text-[0.82rem] text-muted", children: subtitle })] }), _jsx("span", { className: status === 'published' ? 'pill pill-green' : 'pill pill-neutral', children: status === 'published' ? 'Published' : 'Draft' })] }));
}
