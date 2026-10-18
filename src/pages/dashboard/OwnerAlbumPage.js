import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Copy, Download, Images, Link2, Trash2, Upload, X, } from 'lucide-react';
import { api, ApiError, albumUrl } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { useToast } from '@/components/ui/Toast';
import { Button, buttonClass } from '@/components/ui/Button';
import { EmptyState, Skeleton } from '@/components/ui/Misc';
import { InvitationHeading, InvitationTabs } from '@/components/dashboard/InvitationTabs';
import { relativeTime } from '@/lib/format';
export default function OwnerAlbumPage() {
    const { id = '' } = useParams();
    const { push } = useToast();
    const [active, setActive] = useState(null);
    const [busy, setBusy] = useState(false);
    const { data, loading, reload, setData } = useAsync(async () => {
        const [inv, photos] = await Promise.all([api.invitations.get(id), api.photos.list(id)]);
        return { invitation: inv.invitation, photos: photos.photos };
    }, [id]);
    const photos = data?.photos ?? [];
    const invitation = data?.invitation;
    const sorted = useMemo(() => [...photos].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [photos]);
    const copyLink = async () => {
        if (!invitation)
            return;
        try {
            await navigator.clipboard.writeText(albumUrl(invitation.slug));
            push('Album link copied.');
        }
        catch {
            push(albumUrl(invitation.slug), 'info');
        }
    };
    const setAlbumPublic = async (value) => {
        if (!invitation || !data)
            return;
        setBusy(true);
        const next = {
            ...invitation,
            data: {
                ...invitation.data,
                settings: { ...invitation.data.settings, albumPublic: value },
            },
        };
        setData({ ...data, invitation: next });
        try {
            await api.invitations.update(id, { data: next.data });
            push(value ? 'Guests can add photographs again.' : 'The album is now read-only.');
        }
        catch (error) {
            setData({ ...data, invitation });
            push(error instanceof ApiError ? error.message : 'Could not update the album.', 'error');
        }
        finally {
            setBusy(false);
        }
    };
    const remove = async (photo) => {
        try {
            await api.photos.remove(id, photo.id);
            setActive(null);
            push('Photograph removed.');
            reload();
        }
        catch (error) {
            push(error instanceof ApiError ? error.message : 'Could not remove that photograph.', 'error');
        }
    };
    const downloadAll = () => {
        push(`Preparing ${sorted.length} photographs — your browser may ask to allow multiple downloads.`, 'info');
        sorted.forEach((photo, index) => {
            window.setTimeout(() => {
                const anchor = document.createElement('a');
                anchor.href = photo.url;
                anchor.download = `wedding-${photo.id}.jpg`;
                anchor.rel = 'noreferrer';
                document.body.appendChild(anchor);
                anchor.click();
                anchor.remove();
            }, index * 450);
        });
    };
    useEffect(() => {
        if (active === null)
            return;
        const onKey = (event) => {
            if (event.key === 'Escape')
                setActive(null);
            if (event.key === 'ArrowRight')
                setActive((i) => (i === null ? null : (i + 1) % sorted.length));
            if (event.key === 'ArrowLeft')
                setActive((i) => (i === null ? null : (i - 1 + sorted.length) % sorted.length));
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, [active, sorted.length]);
    return (_jsxs("div", { className: "px-4 py-6 sm:px-7 sm:py-8 lg:px-9", children: [invitation ? (_jsx(InvitationHeading, { coupleA: invitation.data.coupleA, coupleB: invitation.data.coupleB, status: invitation.status })) : (_jsx(Skeleton, { className: "h-9 w-60" })), _jsx("div", { className: "mt-6", children: _jsx(InvitationTabs, { invitationId: id }) }), _jsxs("div", { className: "mt-7 flex flex-wrap items-end justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Shared album" }), _jsx("h2", { className: "display mt-1.5 text-[1.85rem] text-ink", children: "Photographs from your guests" }), _jsxs("p", { className: "mt-1 text-[0.8rem] text-muted", children: [sorted.length, " ", sorted.length === 1 ? 'photograph' : 'photographs', " \u00B7 every image is stored at full resolution."] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs("button", { type: "button", onClick: () => void copyLink(), className: buttonClass('outline', 'sm'), children: [_jsx(Link2, { size: 12 }), " Copy album link"] }), _jsxs(Button, { size: "sm", onClick: downloadAll, disabled: sorted.length === 0, children: [_jsx(Download, { size: 12 }), " Download all"] })] })] }), _jsxs("div", { className: "mt-4 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]", children: [_jsx("section", { className: "panel p-4", children: loading ? (_jsx("div", { className: "grid grid-cols-3 gap-2 sm:grid-cols-4", children: [0, 1, 2, 3, 4, 5].map((i) => (_jsx(Skeleton, { className: "aspect-square w-full" }, i))) })) : sorted.length === 0 ? (_jsx(EmptyState, { icon: _jsx(Images, { size: 20 }), title: "The album is waiting", description: "Print the QR code for your tables, or share the album link. Guests can add photographs without an account.", action: _jsxs("button", { type: "button", onClick: () => void copyLink(), className: buttonClass('primary', 'sm'), children: [_jsx(Link2, { size: 12 }), " Copy the album link"] }) })) : (_jsx("ul", { className: "grid grid-cols-2 gap-2 sm:grid-cols-3", children: sorted.map((photo, index) => (_jsxs("li", { className: "group relative", children: [_jsx("button", { type: "button", onClick: () => setActive(index), className: "block w-full overflow-hidden rounded-lg bg-[#ece2d1]", "aria-label": `View photograph by ${photo.uploadedBy}`, children: _jsx("img", { src: photo.thumbUrl, alt: `Photograph added by ${photo.uploadedBy}`, loading: "lazy", className: "aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.03]" }) }), _jsx("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 rounded-b-lg bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover:opacity-100", children: _jsx("p", { className: "truncate text-[0.62rem] text-white/90", children: photo.uploadedBy }) }), _jsx("button", { type: "button", onClick: () => void remove(photo), className: "absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/45 text-white opacity-0 transition hover:bg-[#8d4d3f] group-hover:opacity-100", "aria-label": `Remove photograph by ${photo.uploadedBy}`, children: _jsx(Trash2, { size: 11 }) })] }, photo.id))) })) }), _jsxs("div", { className: "space-y-5", children: [_jsxs("section", { className: "panel p-5", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Guest uploads" }), _jsx("p", { className: "mt-1.5 text-[0.82rem] font-medium text-ink", children: invitation?.data.settings.albumPublic ? 'Open for photographs' : 'Read-only' }), _jsx("p", { className: "mt-1 text-[0.72rem] leading-relaxed text-muted", children: invitation?.data.settings.albumPublic
                                                            ? 'Anyone with the link can add images. You can pause this at any time.'
                                                            : 'Guests can browse, but new uploads are paused.' })] }), _jsx("button", { type: "button", role: "switch", "aria-checked": Boolean(invitation?.data.settings.albumPublic), "aria-label": "Allow guest uploads", disabled: busy || !invitation, onClick: () => void setAlbumPublic(!invitation?.data.settings.albumPublic), className: `relative mt-1 h-6 w-11 flex-none rounded-full border transition ${invitation?.data.settings.albumPublic
                                                    ? 'border-ink bg-ink'
                                                    : 'border-line bg-[#e8dfd1]'}`, children: _jsx("span", { className: `absolute top-[2px] h-[18px] w-[18px] rounded-full bg-paper shadow transition ${invitation?.data.settings.albumPublic ? 'left-[22px]' : 'left-[3px]'}` }) })] }), invitation && (_jsxs("div", { className: "mt-4 flex flex-col items-center gap-2 rounded-xl border border-line bg-[#fbf7ef] p-4", children: [_jsx(QRCodeSVG, { value: albumUrl(invitation.slug), size: 128, bgColor: "#fbf7ef", fgColor: "#211b16", level: "M" }), _jsx("p", { className: "text-center text-[0.66rem] leading-relaxed text-muted", children: "Print this for the tables \u2014 guests scan, add photographs, and the album fills itself." }), _jsx("a", { href: albumUrl(invitation.slug), target: "_blank", rel: "noreferrer", className: "text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-gold", children: "Open the guest album" })] }))] }), _jsxs("section", { className: "panel p-5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Upload, { size: 13, className: "text-gold" }), _jsx("p", { className: "eyebrow", children: "Recent additions" })] }), _jsxs("ul", { className: "mt-3 space-y-2 text-[0.74rem]", children: [sorted.slice(0, 6).map((photo) => (_jsxs("li", { className: "flex items-center justify-between gap-3", children: [_jsxs("span", { className: "flex min-w-0 items-center gap-2", children: [_jsx("img", { src: photo.thumbUrl, alt: "", className: "h-7 w-7 flex-none rounded object-cover" }), _jsx("span", { className: "truncate text-ink-soft", children: photo.uploadedBy })] }), _jsx("span", { className: "flex-none text-muted", children: relativeTime(photo.createdAt) })] }, photo.id))), sorted.length === 0 && _jsx("li", { className: "text-muted", children: "No uploads yet." })] })] }), _jsxs("section", { className: "panel p-5", children: [_jsx("p", { className: "eyebrow", children: "Keeping the archive" }), _jsx("p", { className: "mt-2 text-[0.76rem] leading-relaxed text-muted", children: "Download everything before your hosting period ends. Images are served from your own workspace, so nothing is locked behind a third party." }), _jsxs("button", { type: "button", onClick: () => void copyLink(), className: "mt-3 inline-flex items-center gap-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-gold", children: [_jsx(Copy, { size: 11 }), " Share the album"] })] })] })] }), _jsx(AnimatePresence, { children: active !== null && sorted[active] && (_jsxs(motion.div, { className: "fixed inset-0 z-[95] flex flex-col bg-[#0f0c09]/95 backdrop-blur-sm", role: "dialog", "aria-modal": "true", "aria-label": "Photograph viewer", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3 text-[#efe4d2] sm:px-6", children: [_jsxs("span", { className: "text-[0.65rem] uppercase tracking-[0.18em]", children: [active + 1, " / ", sorted.length, " \u00B7 ", sorted[active].uploadedBy] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("a", { href: sorted[active].url, download: true, className: "grid h-10 w-10 place-items-center rounded-full border border-white/20 transition hover:bg-white/10", "aria-label": "Download photograph", children: _jsx(Download, { size: 16 }) }), _jsx("button", { type: "button", onClick: () => void remove(sorted[active]), className: "grid h-10 w-10 place-items-center rounded-full border border-white/20 transition hover:bg-[#8d4d3f]", "aria-label": "Remove photograph", children: _jsx(Trash2, { size: 16 }) }), _jsx("button", { type: "button", onClick: () => setActive(null), className: "grid h-10 w-10 place-items-center rounded-full border border-white/20 transition hover:bg-white/10", "aria-label": "Close viewer", children: _jsx(X, { size: 18 }) })] })] }), _jsxs("div", { className: "relative flex min-h-0 flex-1 items-center justify-center px-3 pb-4 sm:px-16", children: [_jsx("button", { type: "button", onClick: () => setActive((i) => (i === null ? null : (i - 1 + sorted.length) % sorted.length)), className: "absolute left-2 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/30 text-white transition hover:bg-black/60 sm:left-4", "aria-label": "Previous photograph", children: _jsx(ArrowLeft, { size: 18 }) }), _jsx("img", { src: sorted[active].url, alt: `Photograph added by ${sorted[active].uploadedBy}`, className: "max-h-full max-w-full object-contain shadow-2xl" }, sorted[active].id), _jsx("button", { type: "button", onClick: () => setActive((i) => (i === null ? null : (i + 1) % sorted.length)), className: "absolute right-2 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/30 text-white transition hover:bg-black/60 sm:right-4", "aria-label": "Next photograph", children: _jsx(ArrowRight, { size: 18 }) })] }), _jsxs("p", { className: "px-6 pb-5 text-center text-[0.66rem] uppercase tracking-[0.14em] text-[#efe4d2]/60", children: ["Added ", relativeTime(sorted[active].createdAt)] })] })) })] }));
}
