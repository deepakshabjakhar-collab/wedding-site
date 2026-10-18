import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Eye, EyeOff, Heart, MessageSquareHeart, Search, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { EmptyState, Skeleton } from '@/components/ui/Misc';
import { InvitationHeading, InvitationTabs } from '@/components/dashboard/InvitationTabs';
import { relativeTime } from '@/lib/format';
export default function MessagesPage() {
    const { id = '' } = useParams();
    const { push } = useToast();
    const [query, setQuery] = useState('');
    const [tab, setTab] = useState('visible');
    const [busyId, setBusyId] = useState(null);
    const { data, loading, reload } = useAsync(async () => {
        const [inv, notes] = await Promise.all([api.invitations.get(id), api.messages.list(id)]);
        return { invitation: inv.invitation, messages: notes.messages };
    }, [id]);
    const messages = data?.messages ?? [];
    const visible = messages.filter((message) => !message.hidden);
    const hidden = messages.filter((message) => message.hidden);
    const filtered = useMemo(() => {
        const rows = tab === 'visible' ? visible : hidden;
        const needle = query.trim().toLowerCase();
        return [...rows]
            .filter((message) => !needle ||
            message.text.toLowerCase().includes(needle) ||
            message.author.toLowerCase().includes(needle))
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }, [tab, visible, hidden, query]);
    const toggle = async (message) => {
        setBusyId(message.id);
        try {
            await api.messages.setHidden(id, message.id, !message.hidden);
            push(message.hidden ? 'The blessing is visible again.' : 'The blessing is hidden from guests.');
            reload();
        }
        catch (error) {
            push(error instanceof ApiError ? error.message : 'That did not work.', 'error');
        }
        finally {
            setBusyId(null);
        }
    };
    const remove = async (message) => {
        if (!window.confirm(`Delete the blessing from ${message.author}? This cannot be undone.`))
            return;
        setBusyId(message.id);
        try {
            await api.messages.remove(id, message.id);
            push('Blessing deleted.');
            reload();
        }
        catch (error) {
            push(error instanceof ApiError ? error.message : 'Could not delete that blessing.', 'error');
        }
        finally {
            setBusyId(null);
        }
    };
    const copyAll = async () => {
        const text = visible
            .map((message) => `“${message.text}” — ${message.author}`)
            .join('\n\n');
        try {
            await navigator.clipboard.writeText(text);
            push('All blessings copied — ready for the album.');
        }
        catch {
            push('Your browser blocked clipboard access.', 'error');
        }
    };
    return (_jsxs("div", { className: "px-4 py-6 sm:px-7 sm:py-8 lg:px-9", children: [data ? (_jsx(InvitationHeading, { coupleA: data.invitation.data.coupleA, coupleB: data.invitation.data.coupleB, status: data.invitation.status })) : (_jsx(Skeleton, { className: "h-9 w-60" })), _jsx("div", { className: "mt-6", children: _jsx(InvitationTabs, { invitationId: id }) }), _jsxs("div", { className: "mt-7 flex flex-wrap items-end justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Blessings" }), _jsx("h2", { className: "display mt-1.5 text-[1.85rem] text-ink", children: "Notes from the people you love" }), _jsxs("p", { className: "mt-1 text-[0.8rem] text-muted", children: [visible.length, " ", visible.length === 1 ? 'message' : 'messages', " on the wall", hidden.length > 0 ? ` · ${hidden.length} hidden` : ''] })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: () => void copyAll(), disabled: visible.length === 0, children: [_jsx(Copy, { size: 12 }), " Copy all"] }) })] }), _jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-2", children: [_jsx("div", { className: "flex items-center gap-1 rounded-full border border-line p-0.5", children: ['visible', 'hidden'].map((key) => (_jsxs("button", { type: "button", onClick: () => setTab(key), className: `rounded-full px-3.5 py-1 text-[0.68rem] font-semibold capitalize transition ${tab === key ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`, children: [key, _jsx("span", { className: "ml-1.5 opacity-60", children: key === 'visible' ? visible.length : hidden.length })] }, key))) }), _jsxs("label", { className: "flex min-w-[12rem] flex-1 items-center gap-2 rounded-lg border border-line bg-ivory px-3 py-1.5 sm:max-w-xs", children: [_jsx(Search, { size: 13, className: "text-muted" }), _jsx("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Search notes or names", "aria-label": "Search blessings", className: "w-full bg-transparent text-[0.78rem] text-ink outline-none placeholder:text-muted/70" })] })] }), loading ? (_jsx("div", { className: "mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3", children: [0, 1, 2, 3, 4, 5].map((i) => (_jsx(Skeleton, { className: "h-32 w-full" }, i))) })) : filtered.length === 0 ? (_jsx("div", { className: "panel mt-4", children: _jsx(EmptyState, { icon: tab === 'visible' ? _jsx(MessageSquareHeart, { size: 20 }) : _jsx(EyeOff, { size: 20 }), title: tab === 'visible' ? 'No blessings yet' : 'Nothing hidden', description: tab === 'visible'
                        ? 'Guests can leave a note at the end of the invitation. As they write, each one appears here — and on the wall your guests see.'
                        : 'Messages you hide are kept here privately, in case you change your mind.' }) })) : (_jsx("ul", { className: "mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3", children: filtered.map((message) => (_jsxs("li", { className: `panel flex flex-col p-4 ${message.hidden ? 'opacity-70' : ''}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-script text-[1.45rem] leading-none text-gold", children: message.author }), _jsx("span", { className: "text-[0.62rem] text-muted", children: relativeTime(message.createdAt) })] }), _jsxs("p", { className: "mt-2.5 flex-1 text-[0.84rem] leading-relaxed text-ink-soft", children: ["\u201C", message.text, "\u201D"] }), _jsxs("div", { className: "mt-3 flex items-center justify-between border-t border-line/60 pt-2.5", children: [_jsxs("span", { className: "flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.1em] text-muted", children: [_jsx(Heart, { size: 10, className: "text-gold" }), message.hidden ? 'Hidden' : 'On the wall'] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { type: "button", onClick: () => void toggle(message), disabled: busyId === message.id, className: "icon-btn", title: message.hidden ? 'Show this blessing' : 'Hide from guests', "aria-label": message.hidden ? 'Show blessing' : 'Hide blessing', children: message.hidden ? _jsx(Eye, { size: 13 }) : _jsx(EyeOff, { size: 13 }) }), _jsx("button", { type: "button", onClick: () => void remove(message), disabled: busyId === message.id, className: "icon-btn text-[#a05b4c]", title: "Delete blessing", "aria-label": "Delete blessing", children: _jsx(Trash2, { size: 13 }) })] })] })] }, message.id))) }))] }));
}
