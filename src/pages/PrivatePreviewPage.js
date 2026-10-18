import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { InvitationExperience } from '@/components/invitation/InvitationExperience';
import { PageLoader } from '@/components/ui/Misc';
import { buttonClass } from '@/components/ui/Button';
export function PrivatePreviewPage() {
    const { id = '' } = useParams();
    const { data, loading, error } = useAsync(() => api.public.preview(id), [id]);
    useEffect(() => {
        if (data) {
            document.title = `Preview · ${data.invitation.data.coupleA} & ${data.invitation.data.coupleB}`;
        }
    }, [data]);
    if (loading)
        return _jsx(PageLoader, { label: "Preparing your preview" });
    if (error || !data) {
        return (_jsx("div", { className: "grid min-h-svh place-items-center bg-[#f6f1e7] px-6 text-center", children: _jsxs("div", { children: [_jsx("h1", { className: "display text-[2rem] text-ink", children: "This preview is unavailable" }), _jsx("p", { className: "mt-3 text-sm text-muted", children: error ?? 'Please sign in to preview your invitation.' }), _jsx(Link, { to: "/dashboard", className: buttonClass('primary', 'md', 'mt-6'), children: "Back to the dashboard" })] }) }));
    }
    return (_jsxs("div", { className: "relative", children: [_jsxs("div", { className: "fixed left-1/2 top-3 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#d8c9b5] bg-[#fffdf8]/95 px-3 py-2 shadow-lg backdrop-blur", children: [_jsxs("span", { className: "flex items-center gap-1.5 pl-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-ink-soft", children: [_jsx(Eye, { size: 12, className: "text-gold" }), " Your invitation, exactly as guests see it"] }), _jsxs(Link, { to: `/studio/${id}`, className: buttonClass('primary', 'sm'), children: [_jsx(ArrowLeft, { size: 12 }), " Back to the studio"] })] }), _jsx(InvitationExperience, { invitation: data.invitation, messages: data.messages, photos: data.photos, personalization: data.personalization, mode: "preview", initialOpen: true })] }));
}
