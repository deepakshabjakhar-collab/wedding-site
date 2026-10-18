import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, Share2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
export function ShareDialog({ open, onClose, url, title, description, guestName, }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2200);
        }
        catch {
            setCopied(false);
        }
    };
    const nativeShare = async () => {
        if (!navigator.share)
            return;
        try {
            await navigator.share({ title, text: description, url });
        }
        catch {
            /* dismissed */
        }
    };
    const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${guestName ? `${guestName}, ` : ''}${description} ${url}`)}`;
    return (_jsx(Modal, { open: open, onClose: onClose, title: "Share the invitation", description: guestName ? `Personal link for ${guestName}` : undefined, size: "sm", children: _jsxs("div", { className: "flex flex-col items-center gap-5", children: [_jsx("div", { className: "rounded-xl border border-line bg-paper p-3 shadow-sm", children: _jsx(QRCodeSVG, { value: url, size: 150, bgColor: "#fffdf8", fgColor: "#211b16", level: "M" }) }), _jsxs("p", { className: "text-center text-xs leading-relaxed text-muted", children: ["Scan to open, or send the link directly. ", guestName ? 'This link is personal to their household.' : 'Anyone with this link can open the invitation.'] }), _jsxs("div", { className: "flex w-full items-stretch gap-2", children: [_jsx("input", { readOnly: true, value: url, className: "input min-w-0 flex-1 text-xs", "aria-label": "Invitation link", onFocus: (e) => e.currentTarget.select() }), _jsxs("button", { type: "button", onClick: copy, className: "btn btn-outline btn-sm flex-none", "aria-label": "Copy link", children: [copied ? _jsx(Check, { size: 13 }) : _jsx(Copy, { size: 13 }), copied ? 'Copied' : 'Copy'] })] }), _jsxs("div", { className: "grid w-full grid-cols-2 gap-2", children: [_jsx("a", { href: whatsapp, target: "_blank", rel: "noreferrer", className: "btn btn-outline btn-sm", children: "WhatsApp" }), _jsxs("button", { type: "button", onClick: () => void nativeShare(), className: "btn btn-outline btn-sm", disabled: !navigator.share, children: [_jsx(Share2, { size: 13 }), " Share\u2026"] })] })] }) }));
}
