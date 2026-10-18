import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { buttonClass } from '@/components/ui/Button';
import { TemplateMark } from '@/templates/art';
export function NotFound() {
    return (_jsxs("div", { className: "texture-paper flex min-h-svh flex-col", children: [_jsx(MarketingNav, {}), _jsx("main", { className: "flex flex-1 items-center justify-center px-6 py-32", children: _jsxs("div", { className: "max-w-lg text-center", children: [_jsx(TemplateMark, { templateId: "heirloom", className: "mx-auto h-10 w-32 text-gold" }), _jsx("p", { className: "eyebrow mt-6", children: "Page not found" }), _jsxs("h1", { className: "display mt-4 text-[2.6rem] leading-tight text-ink", children: ["This page has been", _jsx("br", {}), _jsx("em", { className: "text-gold", children: "folded away." })] }), _jsx("p", { className: "mt-4 text-sm leading-relaxed text-muted", children: "The link may be old, or the invitation may not be published yet. The collection, however, is right where you left it." }), _jsxs("div", { className: "mt-8 flex flex-col justify-center gap-3 sm:flex-row", children: [_jsx(Link, { to: "/", className: buttonClass('primary', 'md'), children: "Back to Vellum" }), _jsx(Link, { to: "/templates", className: buttonClass('outline', 'md'), children: "Browse the collection" })] })] }) }), _jsx(MarketingFooter, {})] }));
}
