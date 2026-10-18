import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { InvitationExperience } from '@/components/invitation/InvitationExperience';
import { getTemplate } from '@/templates/registry';
import { sampleInvitation } from '@/templates/samples';
import { TEMPLATE_IDS } from '@shared/defaults';
import { buttonClass } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
export function TemplatePreviewPage() {
    const { templateId = '' } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { push } = useToast();
    const [creating, setCreating] = useState(false);
    const valid = TEMPLATE_IDS.includes(templateId);
    const template = getTemplate(templateId);
    const invitation = useMemo(() => {
        const data = sampleInvitation(template.id);
        return {
            id: `sample-${template.id}`,
            userId: 'sample',
            slug: `sample-${template.id}`,
            templateId: template.id,
            status: 'draft',
            data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }, [template.id]);
    if (!valid)
        return _jsx(Navigate, { to: "/templates", replace: true });
    const useTemplate = async () => {
        if (!user) {
            navigate(`/signup?next=/templates&design=${template.id}`);
            return;
        }
        setCreating(true);
        try {
            const { invitation: created } = await api.invitations.create(template.id);
            push(`${template.name} is yours. Let’s make it personal.`);
            navigate(`/studio/${created.id}`);
        }
        catch (error) {
            push(error instanceof ApiError ? error.message : 'Could not create the invitation.', 'error');
            setCreating(false);
        }
    };
    return (_jsxs("div", { className: "relative", children: [_jsx(InvitationExperience, { invitation: invitation, messages: [], photos: [], personalization: null, mode: "sample" }), _jsx("div", { className: "pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4", children: _jsxs("div", { className: "pointer-events-auto flex w-full max-w-[38rem] flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-[var(--color-paper)]/97 px-4 py-3 shadow-[0_24px_60px_-30px_rgba(40,28,16,0.6)] backdrop-blur", children: [_jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [_jsx("span", { className: "grid h-9 w-9 flex-none place-items-center rounded-full border border-line text-gold", children: _jsx(Sparkles, { size: 15 }) }), _jsxs("span", { className: "min-w-0", children: [_jsx("span", { className: "block text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-muted", children: "Live design preview" }), _jsxs("span", { className: "block truncate font-display text-[1.15rem] leading-tight text-ink", children: [template.name, " \u2014 ", template.descriptor] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Link, { to: "/templates", className: buttonClass('ghost', 'sm'), children: [_jsx(ArrowLeft, { size: 12 }), " All designs"] }), _jsxs("button", { type: "button", onClick: () => void useTemplate(), className: buttonClass('primary', 'sm'), disabled: creating, children: [creating ? _jsx(Loader2, { size: 13, className: "animate-spin" }) : null, "Use this design"] })] })] }) })] }));
}
