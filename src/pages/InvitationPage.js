import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Lock, MailQuestion } from 'lucide-react';
import { api } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { InvitationExperience } from '@/components/invitation/InvitationExperience';
import { buttonClass } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Misc';
function GuestShell({ children }) {
    return (_jsx("div", { className: "grid min-h-svh place-items-center bg-[#191410] px-5 py-16 text-center", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsx(Logo, { tone: "light" }), _jsx("div", { className: "mt-10 rounded-2xl border border-white/10 bg-[#241d18] p-7 text-[#f3e8d7] shadow-2xl", children: children }), _jsx("p", { className: "mt-8 font-script text-[1.4rem] text-[#d9bb8c]/80", children: "Invitations, remembered." })] }) }));
}
function Loading() {
    return (_jsx("div", { className: "grid min-h-svh place-items-center bg-[#f6f1e7]", children: _jsxs("div", { className: "flex flex-col items-center gap-5", children: [_jsx("span", { className: "grid h-16 w-16 place-items-center rounded-full border border-[#d8c9b5]", children: _jsx("span", { className: "font-script text-[1.8rem] text-[#a9835b]", children: "V" }) }), _jsx("p", { className: "eyebrow", children: "Opening the envelope" })] }) }));
}
export function InvitationPage() {
    const { slug = '', token: routeToken } = useParams();
    const storedToken = useMemo(() => {
        if (routeToken)
            return routeToken;
        try {
            return window.localStorage.getItem(`vellum:guest:${slug}`) ?? undefined;
        }
        catch {
            return undefined;
        }
    }, [routeToken, slug]);
    const { data, loading, error } = useAsync(() => api.public.get(slug, storedToken), [slug, storedToken]);
    useEffect(() => {
        const recipe = data?.invitation.data;
        if (!recipe)
            return;
        const names = `${recipe.coupleA} & ${recipe.coupleB}`;
        document.title = `${names} — a wedding invitation`;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', `${names} invite you to ${recipe.location || 'their wedding'}. Open the invitation for the full schedule, music and RSVP.`);
        }
    }, [data]);
    if (loading)
        return _jsx(Loading, {});
    if (error) {
        const requiresToken = /private|personal link/i.test(error);
        const notFound = /not found/i.test(error);
        return (_jsxs(GuestShell, { children: [_jsx("span", { className: "mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/15 text-[#d9bb8c]", children: requiresToken ? _jsx(Lock, { size: 18 }) : _jsx(MailQuestion, { size: 18 }) }), _jsx("h1", { className: "mt-5 font-display text-[1.9rem] leading-tight", children: notFound ? 'This invitation could not be found' : requiresToken ? 'This invitation is private' : 'Something went wrong' }), _jsx("p", { className: "mt-3 text-sm leading-relaxed text-[#cfc0ad]", children: notFound
                        ? 'The link may have changed, or the invitation has not been published yet. Ask the couple for a fresh link.'
                        : requiresToken
                            ? 'This celebration is unlisted. Please open the personal link you were sent — it knows who you are and which ceremonies you are invited to.'
                            : error }), _jsxs("div", { className: "mt-7 flex flex-col gap-2.5", children: [_jsx(Link, { to: "/", className: buttonClass('gold', 'md'), children: "Visit Vellum" }), _jsx(Link, { to: "/templates", className: buttonClass('outline', 'md', '!border-white/20 !text-[#f3e8d7]'), children: "Browse the collection" })] })] }));
    }
    if (!data)
        return null;
    return (_jsx(InvitationExperience, { invitation: data.invitation, messages: data.messages, photos: data.photos, personalization: data.personalization, token: routeToken ?? storedToken, mode: "live" }));
}
