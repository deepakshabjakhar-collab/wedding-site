import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Reveal } from '@/components/marketing/Reveal';
import { TemplateArt, TemplateMark } from '@/templates/art';
import { TEMPLATES } from '@/templates/registry';
import { sampleInvitation } from '@/templates/samples';
import { formatDateShort } from '@/lib/format';
import { buttonClass } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
const FILTERS = [
    'All',
    'Editorial',
    'Botanical',
    'Indian',
    'Celestial',
    'Destination',
    'Black tie',
    'Vintage',
    'Playful',
    'Multi-day',
];
export function TemplatesPage() {
    const [filter, setFilter] = useState('All');
    const [creating, setCreating] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { push } = useToast();
    const templates = useMemo(() => {
        if (filter === 'All')
            return TEMPLATES;
        return TEMPLATES.filter((template) => template.keywords.some((keyword) => keyword.toLowerCase() === filter.toLowerCase()) ||
            template.descriptor.toLowerCase().includes(filter.toLowerCase()));
    }, [filter]);
    const useTemplate = async (templateId) => {
        if (!user) {
            navigate(`/signup?next=/templates&design=${templateId}`);
            return;
        }
        setCreating(templateId);
        try {
            const { invitation } = await api.invitations.create(templateId);
            push('Your studio is ready. Let’s make it yours.');
            navigate(`/studio/${invitation.id}`);
        }
        catch (error) {
            push(error instanceof ApiError ? error.message : 'Could not create the invitation.', 'error');
            setCreating(null);
        }
    };
    return (_jsxs("div", { className: "texture-paper min-h-svh", children: [_jsx(MarketingNav, {}), _jsxs("main", { className: "pt-[112px]", children: [_jsxs("section", { className: "shell pb-10", children: [_jsx("p", { className: "eyebrow", children: "The collection" }), _jsxs("div", { className: "mt-5 grid items-end gap-8 lg:grid-cols-[1.25fr_0.75fr]", children: [_jsxs("h1", { className: "display text-[2.8rem] leading-[1.02] text-ink sm:text-[4.2rem]", children: ["Eight design directions,", _jsx("br", {}), "drawn from ", _jsx("em", { className: "text-gold", children: "scratch." })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm leading-relaxed text-muted sm:text-[0.98rem]", children: "Not one template recoloured eight times. Each design has its own typography, palette, illustration, envelope and rhythm \u2014 then everything is yours to change." }), _jsxs("p", { className: "mt-4 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.16em] text-gold", children: [_jsx(Sparkles, { size: 13 }), " Every preview is live and interactive"] })] })] }), _jsx("div", { className: "no-scrollbar mt-9 flex gap-2 overflow-x-auto pb-1", children: FILTERS.map((item) => (_jsx("button", { type: "button", onClick: () => setFilter(item), "aria-pressed": filter === item, className: `flex-none rounded-full border px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.14em] transition ${filter === item
                                        ? 'border-ink bg-ink text-paper'
                                        : 'border-line text-ink-soft hover:border-gold/60 hover:text-ink'}`, children: item }, item))) })] }), _jsxs("section", { className: "shell pb-20", children: [_jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3", children: templates.map((template, index) => {
                                    const sample = sampleInvitation(template.id);
                                    return (_jsx(Reveal, { delay: Math.min(index * 0.04, 0.2), children: _jsxs("article", { className: "group flex h-full flex-col", children: [_jsxs(Link, { to: `/templates/${template.id}`, className: "template-card relative block aspect-[3/4] overflow-hidden", style: { background: template.palette.deep }, children: [_jsx(TemplateArt, { templateId: template.id, className: "absolute inset-0 h-full w-full text-[#d9b87b] opacity-80" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/30 via-black/5 to-black/80" }), _jsx("div", { className: "absolute inset-x-6 top-6 h-px bg-[#fcf5e8]/25" }), _jsxs("div", { className: "relative flex h-full flex-col items-center justify-between p-7 text-center text-[#fcf5e8]", children: [_jsx("span", { className: "text-[0.5rem] font-semibold uppercase tracking-[0.3em] opacity-80", children: template.descriptor }), _jsxs("div", { children: [_jsxs("p", { className: `text-[2.1rem] leading-[1.02] ${template.cover.namesCase === 'upper' ? 'uppercase' : ''}`, style: { fontFamily: template.display, letterSpacing: template.cover.tracking }, children: [sample.coupleA, _jsx("span", { className: "mx-1 text-[1.6rem] italic", style: { fontFamily: template.script, color: template.palette.accent }, children: "&" }), sample.coupleB] }), _jsxs("p", { className: "mt-3 text-[0.5rem] font-semibold uppercase tracking-[0.22em] opacity-80", children: [formatDateShort(sample.weddingDate), " \u00B7 ", sample.location.split(',')[0]] })] }), _jsxs("div", { children: [_jsx(TemplateMark, { templateId: template.id, className: "mx-auto h-6 w-20 opacity-70" }), _jsx("span", { className: "mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-[0.55rem] uppercase tracking-[0.2em] opacity-0 transition group-hover:opacity-100", children: "Open the live preview" })] })] })] }), _jsxs("div", { className: "mt-4 flex flex-1 flex-col", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-display text-[1.55rem] leading-tight text-ink", children: template.name }), _jsx("p", { className: "text-[0.75rem] italic text-muted", children: template.tagline })] }), _jsx("span", { className: "mt-1 flex items-center gap-1.5", children: [template.palette.bg, template.palette.accent, template.palette.deep].map((color) => (_jsx("span", { className: "h-2.5 w-2.5 rounded-full ring-1 ring-black/10", style: { background: color } }, color))) })] }), _jsx("p", { className: "mt-3 text-[0.83rem] leading-relaxed text-muted", children: template.description }), _jsxs("div", { className: "mt-4 flex flex-wrap gap-2 pt-1", children: [_jsx(Link, { to: `/templates/${template.id}`, className: buttonClass('outline', 'sm'), children: "Live preview" }), _jsxs("button", { type: "button", onClick: () => void useTemplate(template.id), className: buttonClass('primary', 'sm'), disabled: creating === template.id, children: [creating === template.id ? _jsx(Loader2, { size: 13, className: "animate-spin" }) : null, "Use this design"] })] })] })] }) }, template.id));
                                }) }), templates.length === 0 && (_jsxs("p", { className: "py-16 text-center text-sm text-muted", children: ["No designs match that filter. ", _jsx("button", { type: "button", className: "text-gold underline", onClick: () => setFilter('All'), children: "Show everything" })] }))] }), _jsx("section", { className: "border-t border-line/70 bg-[#f1e9dc] py-16", children: _jsx("div", { className: "shell grid gap-8 md:grid-cols-3", children: [
                                ['Change anything', 'Names, wording, colours, fonts, photographs, ceremonies and the envelope itself.'],
                                ['Preview as a guest', 'See the exact experience your guests get, with sample names or your own guests.'],
                                ['Publish in one click', 'Share a public link or personal links for each household — you decide who sees what.'],
                            ].map(([title, body]) => (_jsxs("div", { children: [_jsx("h3", { className: "font-display text-[1.4rem] text-ink", children: title }), _jsx("p", { className: "mt-2 text-[0.83rem] leading-relaxed text-muted", children: body })] }, title))) }) })] }), _jsx(MarketingFooter, {})] }));
}
