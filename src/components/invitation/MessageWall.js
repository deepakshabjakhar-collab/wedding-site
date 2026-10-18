import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { relativeTime } from '@/lib/format';
import { t } from './i18n';
export function MessageWall({ data, slug, guest, token, initialMessages, lang, mode, }) {
    const [messages, setMessages] = useState(initialMessages);
    const [author, setAuthor] = useState(guest?.name ?? '');
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);
    if (!data.settings.messagesEnabled)
        return null;
    const submit = async (event) => {
        event.preventDefault();
        setError(null);
        setNotice(null);
        if (!guest && !author.trim()) {
            setError('Please add your name.');
            return;
        }
        if (!text.trim()) {
            setError('Please write a few words.');
            return;
        }
        if (mode !== 'live') {
            setNotice('This is a design preview — your blessing would appear here, but nothing was sent.');
            setText('');
            return;
        }
        setSending(true);
        try {
            const result = await api.public.message(slug, {
                token,
                author: author.trim(),
                text: text.trim(),
            });
            setMessages((prev) => [
                {
                    id: result.message.id,
                    author: result.message.author,
                    text: result.message.text,
                    createdAt: result.message.createdAt,
                },
                ...prev,
            ]);
            setText('');
            setNotice('Your blessing has been added. Thank you.');
        }
        catch (err) {
            setError(err instanceof ApiError ? err.message : 'Your blessing could not be sent.');
        }
        finally {
            setSending(false);
        }
    };
    return (_jsxs("div", { className: "mx-auto w-full max-w-3xl", children: [_jsxs("form", { onSubmit: submit, className: "inv-card p-5 sm:p-6", noValidate: true, children: [_jsx("p", { className: "inv-label", children: t(lang, 'leaveMessage') }), !guest && (_jsxs("div", { className: "mt-3", children: [_jsx("label", { htmlFor: "blessing-name", className: "inv-field-label", children: t(lang, 'name') }), _jsx("input", { id: "blessing-name", className: "inv-input", value: author, onChange: (e) => setAuthor(e.target.value), maxLength: 80, autoComplete: "name" })] })), _jsxs("div", { className: "mt-3", children: [_jsx("label", { htmlFor: "blessing-text", className: "inv-field-label", children: "Your words" }), _jsx("textarea", { id: "blessing-text", className: "inv-textarea", value: text, onChange: (e) => setText(e.target.value), maxLength: 800, placeholder: t(lang, 'messagePlaceholder') }), _jsxs("div", { className: "mt-1 flex items-center justify-between", children: [_jsxs("span", { className: "text-[0.62rem] text-[var(--inv-muted)]", children: [text.length, "/800"] }), _jsxs("button", { type: "submit", className: "inv-btn inv-btn-outline !min-h-[38px] !px-4 !text-[0.6rem]", disabled: sending, children: [sending ? _jsx(Loader2, { size: 13, className: "animate-spin" }) : _jsx(Send, { size: 12 }), sending ? 'Sending' : 'Send blessing'] })] })] }), error && (_jsx("p", { className: "mt-2 text-xs text-[#8f3c2b]", role: "alert", children: error })), notice && (_jsx("p", { className: "mt-2 text-xs text-[var(--inv-muted)]", role: "status", children: notice }))] }), messages.length > 0 ? (_jsx("div", { className: "mt-6 grid gap-3 sm:grid-cols-2", children: messages.map((message) => (_jsxs("article", { className: "inv-message", children: [_jsx("p", { className: "relative z-10 pt-3 text-sm leading-relaxed text-[var(--inv-ink)]", children: message.text }), _jsxs("footer", { className: "mt-3 flex items-baseline justify-between gap-3", children: [_jsx("p", { className: "font-[var(--inv-script)] text-[1.15rem] leading-none text-[var(--inv-accent)]", children: message.author }), _jsx("p", { className: "text-[0.58rem] uppercase tracking-[0.1em] text-[var(--inv-muted)]/70", children: relativeTime(message.createdAt) })] })] }, message.id))) })) : (_jsx("p", { className: "mt-6 text-center text-sm italic text-[var(--inv-muted)]", children: "The first blessing could be yours." }))] }));
}
