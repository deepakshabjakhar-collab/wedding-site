import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, ExternalLink, LayoutTemplate, Plus, Sparkles, Users } from 'lucide-react';
import { api, ApiError, shareUrl } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { buttonClass } from '@/components/ui/Button';
import { EmptyState, Skeleton, StatusPill } from '@/components/ui/Misc';
import { formatDate } from '@/lib/format';
import { TEMPLATES } from '@/templates/registry';
import { TemplateArt } from '@/templates/art';
export default function DashboardHome() {
    const { user } = useAuth();
    const { push } = useToast();
    const { data, loading, error } = useAsync(() => api.invitations.list(), []);
    const [busy, setBusy] = useState(null);
    const invitations = data?.invitations ?? [];
    const create = async (templateId) => {
        setBusy(templateId);
        try {
            const { invitation } = await api.invitations.create(templateId);
            push('Your studio is ready.');
            window.location.assign(`/studio/${invitation.id}`);
        }
        catch (err) {
            push(err instanceof ApiError ? err.message : 'Could not create the invitation.', 'error');
            setBusy(null);
        }
    };
    return (_jsxs("div", { className: "px-4 py-6 sm:px-7 sm:py-8 lg:px-9", children: [_jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) }), _jsx("h1", { className: "display mt-2 text-[2.3rem] leading-tight text-ink sm:text-[2.8rem]", children: invitations.length ? 'Your invitations' : 'Welcome to the studio' }), _jsxs("p", { className: "mt-2 max-w-xl text-[0.86rem] leading-relaxed text-muted", children: ["Signed in as ", user?.email, ". Design freely \u2014 publishing happens only when you decide it is ready."] })] }), _jsxs(Link, { to: "/templates", className: buttonClass('primary', 'md'), children: [_jsx(Plus, { size: 14 }), " New invitation"] })] }), error && (_jsx("p", { className: "mt-6 rounded-xl border border-[#b4553f]/30 bg-[#b4553f]/8 px-4 py-3 text-sm text-[#8f3c2b]", children: error })), loading ? (_jsx("div", { className: "mt-8 grid gap-5 lg:grid-cols-2", children: [0, 1].map((i) => (_jsxs("div", { className: "panel p-5", children: [_jsx(Skeleton, { className: "h-5 w-40" }), _jsx(Skeleton, { className: "mt-3 h-4 w-56" }), _jsx(Skeleton, { className: "mt-6 h-24 w-full" })] }, i))) })) : invitations.length === 0 ? (_jsx("div", { className: "panel mt-8", children: _jsx(EmptyState, { icon: _jsx(LayoutTemplate, { size: 20 }), eyebrow: "Begin anywhere", title: "No invitations yet", description: "Choose one of eight design directions, then make it entirely yours. You can preview everything before paying a penny.", action: _jsx(Link, { to: "/templates", className: buttonClass('primary', 'md'), children: "Browse the collection" }) }) })) : (_jsx("div", { className: "mt-8 grid gap-5 lg:grid-cols-2", children: invitations.map((invitation) => {
                    const attending = invitation.counts.attending;
                    const total = Math.max(1, invitation.counts.guests);
                    const percent = Math.round((attending / total) * 100);
                    return (_jsxs("article", { className: "panel overflow-hidden", children: [_jsxs("div", { className: "flex items-start gap-4 p-5", children: [_jsx("span", { className: "hidden h-16 w-16 flex-none place-items-center rounded-xl border border-line text-[0.7rem] uppercase tracking-[0.1em] sm:grid", style: {
                                            background: `linear-gradient(150deg, ${invitation.data.theme.palette?.bg ?? '#f6f1e7'}, ${invitation.data.theme.palette?.accentSoft ?? '#e9dcc9'})`,
                                        }, children: _jsx("span", { className: "font-script text-[1.3rem] text-ink", children: invitation.data.monogram }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("h2", { className: "font-display text-[1.5rem] leading-tight text-ink", children: [invitation.data.coupleA, " & ", invitation.data.coupleB] }), _jsx(StatusPill, { status: invitation.status })] }), _jsxs("p", { className: "mt-1 text-[0.78rem] text-muted", children: [invitation.data.weddingDate ? formatDate(invitation.data.weddingDate) : 'Date to be set', invitation.data.location ? ` · ${invitation.data.location}` : ''] })] })] }), _jsx("div", { className: "grid grid-cols-2 gap-px border-y border-line/70 bg-line/40 sm:grid-cols-4", children: [
                                    ['Attending', invitation.counts.attending],
                                    ['Awaiting', invitation.counts.pending],
                                    ['Declined', invitation.counts.declined],
                                    ['Guests', invitation.counts.guests],
                                ].map(([label, value]) => (_jsxs("div", { className: "bg-[#fbf7ef] px-4 py-3", children: [_jsx("p", { className: "font-display text-[1.5rem] leading-none text-ink", children: value }), _jsx("p", { className: "mt-1 text-[0.6rem] uppercase tracking-[0.14em] text-muted", children: label })] }, String(label)))) }), _jsxs("div", { className: "p-5", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "h-1.5 flex-1 overflow-hidden rounded-full bg-line/70", children: _jsx("span", { className: "block h-full rounded-full bg-[#7f8d78] transition-[width] duration-700", style: { width: `${percent}%` } }) }), _jsxs("span", { className: "text-[0.68rem] text-muted", children: [percent, "% replied yes"] })] }), _jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [_jsx(Link, { to: `/studio/${invitation.id}`, className: buttonClass('primary', 'sm'), children: "Open the studio" }), _jsxs(Link, { to: `/dashboard/i/${invitation.id}`, className: buttonClass('outline', 'sm'), children: [_jsx(Users, { size: 12 }), " Replies & guests"] }), _jsxs("a", { href: `/preview/${invitation.id}`, target: "_blank", rel: "noreferrer", className: buttonClass('ghost', 'sm'), children: [_jsx(ExternalLink, { size: 12 }), " Guest view"] }), _jsxs("button", { type: "button", className: buttonClass('ghost', 'sm'), onClick: async () => {
                                                    const url = shareUrl(invitation.slug);
                                                    try {
                                                        await navigator.clipboard.writeText(url);
                                                        push('Invitation link copied.');
                                                    }
                                                    catch {
                                                        push(url, 'info');
                                                    }
                                                }, children: [_jsx(Copy, { size: 12 }), " Copy link"] })] })] })] }, invitation.id));
                }) })), _jsxs("section", { className: "mt-12", children: [_jsxs("div", { className: "flex items-end justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Start something new" }), _jsx("h2", { className: "display mt-1.5 text-[1.7rem] text-ink", children: "Pick a design direction" })] }), _jsx(Link, { to: "/templates", className: buttonClass('ghost', 'sm'), children: "See the full collection" })] }), _jsx("div", { className: "mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: TEMPLATES.slice(0, 4).map((template) => (_jsxs("button", { type: "button", onClick: () => void create(template.id), className: "group overflow-hidden rounded-xl border border-line bg-paper text-left transition hover:border-gold/60", disabled: busy === template.id, children: [_jsxs("span", { className: "relative block h-28 overflow-hidden", style: { background: template.palette.deep }, children: [_jsx(TemplateArt, { templateId: template.id, className: "absolute inset-0 h-full w-full text-[#d9b87b] opacity-70 transition duration-700 group-hover:scale-105" }), _jsx("span", { className: "absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" }), _jsx("span", { className: "absolute inset-x-0 bottom-0 p-3 text-center text-[0.8rem] text-[#fcf5e8]", children: _jsx("span", { className: template.cover.namesCase === 'upper' ? 'uppercase' : '', style: { fontFamily: template.display, letterSpacing: template.cover.tracking }, children: template.name }) })] }), _jsxs("span", { className: "flex items-center justify-between gap-2 px-3.5 py-3", children: [_jsxs("span", { children: [_jsx("span", { className: "block font-display text-[1.1rem] leading-tight text-ink", children: template.name }), _jsx("span", { className: "block text-[0.66rem] text-muted", children: template.descriptor })] }), _jsx(Sparkles, { size: 14, className: "text-gold" })] })] }, template.id))) })] })] }));
}
