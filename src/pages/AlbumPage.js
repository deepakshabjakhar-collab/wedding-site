import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, CloudUpload, ImagePlus, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { resolveTheme, themeStyle } from '@/templates/registry';
import { Gallery } from '@/components/invitation/Gallery';
import { uploadPhoto, validatePhoto } from '@/lib/upload';
import { buttonClass } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Misc';
export function AlbumPage() {
    const { slug = '' } = useParams();
    const [params] = useSearchParams();
    const token = params.get('token') ?? undefined;
    const storedToken = useMemo(() => {
        if (token)
            return token;
        try {
            return window.localStorage.getItem(`vellum:guest:${slug}`) ?? undefined;
        }
        catch {
            return undefined;
        }
    }, [slug, token]);
    const { data, loading, error } = useAsync(() => api.public.get(slug, storedToken), [slug, storedToken]);
    const [photos, setPhotos] = useState(null);
    const [queue, setQueue] = useState([]);
    const [author, setAuthor] = useState('');
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);
    const allPhotos = photos ?? data?.photos ?? [];
    const guest = data?.personalization?.guest ?? null;
    const theme = data ? resolveTheme(data.invitation.templateId, data.invitation.data.theme) : null;
    const invitation = data?.invitation;
    const handleFiles = async (files) => {
        const list = [...files].slice(0, 20);
        if (!list.length)
            return;
        for (const file of list) {
            const validation = validatePhoto(file);
            const id = `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`;
            if (validation) {
                setQueue((prev) => [...prev, { id, name: file.name, size: file.size, progress: 0, status: 'error', error: validation }]);
                continue;
            }
            setQueue((prev) => [...prev, { id, name: file.name, size: file.size, progress: 0, status: 'uploading' }]);
            const result = await uploadPhoto(slug, file, {
                token: storedToken,
                author: guest?.name ?? author,
                onProgress: (percent) => setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, progress: percent } : item))),
            });
            const uploaded = result.photo;
            if (uploaded) {
                setPhotos((prev) => [uploaded, ...(prev ?? data?.photos ?? [])]);
                setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'done', progress: 100 } : item)));
                window.setTimeout(() => setQueue((prev) => prev.filter((item) => item.id !== id)), 2600);
            }
            else {
                setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'error', error: result.error } : item)));
            }
        }
    };
    if (loading) {
        return (_jsx("div", { className: "grid min-h-svh place-items-center bg-[#f6f1e7]", children: _jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx(Loader2, { size: 22, className: "animate-spin text-[#a9835b]" }), _jsx("p", { className: "eyebrow", children: "Fetching the album" })] }) }));
    }
    if (error || !data || !theme || !invitation) {
        return (_jsx("div", { className: "grid min-h-svh place-items-center bg-[#191410] px-5", children: _jsxs("div", { className: "w-full max-w-md text-center text-[#f3e8d7]", children: [_jsx(Logo, { tone: "light" }), _jsx("h1", { className: "mt-8 font-display text-[1.9rem]", children: "This album is not open" }), _jsxs("p", { className: "mt-3 text-sm leading-relaxed text-[#cfc0ad]", children: [error ?? 'The shared album could not be loaded.', " If you received a personal link, open it and try again."] }), _jsx(Link, { to: "/", className: buttonClass('gold', 'md', 'mt-6'), children: "Visit Vellum" })] }) }));
    }
    const albumEnabled = invitation.data.settings.albumEnabled && invitation.data.settings.albumPublic;
    return (_jsx("div", { className: "invite-shell min-h-svh", style: themeStyle(theme), children: _jsxs("div", { className: "invite-root min-h-svh", "data-layout": theme.layout, children: [_jsx("header", { className: "border-b border-[var(--inv-line)] px-5 py-6 sm:px-8", children: _jsxs("div", { className: "mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4", children: [_jsxs(Link, { to: `/i/${slug}${storedToken ? `/g/${storedToken}` : ''}`, className: "inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--inv-muted)] transition hover:text-[var(--inv-accent)]", children: [_jsx(ArrowLeft, { size: 13 }), " Back to the invitation"] }), _jsxs("span", { className: "inv-label !text-[0.52rem]", children: [invitation.data.coupleA, " & ", invitation.data.coupleB] })] }) }), _jsxs("main", { className: "mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14", children: [_jsxs("div", { className: "max-w-2xl", children: [_jsx("p", { className: "inv-eyebrow", children: "Shared album" }), _jsx("h1", { className: "inv-display mt-3 text-[clamp(2.1rem,8cqw,3.4rem)] leading-[1.03]", children: "Add your photographs" }), _jsx("p", { className: "inv-body-copy mt-4", children: guest
                                        ? `Thank you for being part of ${invitation.data.coupleA} and ${invitation.data.coupleB}'s day, ${guest.name}. Every photograph you add appears here for the couple.`
                                        : `Every photograph you add appears here for ${invitation.data.coupleA} and ${invitation.data.coupleB}.` })] }), !albumEnabled ? (_jsx("div", { className: "inv-card mt-9 p-6", children: _jsx("p", { className: "text-sm text-[var(--inv-muted)]", children: "The shared album is currently closed. Please speak to the couple if you would like to share photographs." }) })) : (_jsxs(_Fragment, { children: [!guest && (_jsxs("div", { className: "mt-8 max-w-md", children: [_jsx("label", { htmlFor: "album-author", className: "inv-field-label", children: "Your name (so they know who to thank)" }), _jsx("input", { id: "album-author", className: "inv-input", value: author, onChange: (event) => setAuthor(event.target.value), placeholder: "Optional", maxLength: 80 })] })), _jsxs("div", { className: `mt-7 rounded-[3px] border-2 border-dashed p-8 text-center transition sm:p-12 ${dragging
                                        ? 'border-[var(--inv-accent)] bg-[var(--inv-accent)]/8'
                                        : 'border-[var(--inv-line)] bg-[var(--inv-surface)]/60'}`, onDragOver: (event) => {
                                        event.preventDefault();
                                        setDragging(true);
                                    }, onDragLeave: () => setDragging(false), onDrop: (event) => {
                                        event.preventDefault();
                                        setDragging(false);
                                        void handleFiles(event.dataTransfer.files);
                                    }, children: [_jsx("span", { className: "mx-auto grid h-14 w-14 place-items-center rounded-full border border-[var(--inv-accent)]/35 text-[var(--inv-accent)]", children: _jsx(CloudUpload, { size: 22 }) }), _jsx("p", { className: "inv-display mt-4 text-[1.4rem]", children: "Drop your photographs here" }), _jsx("p", { className: "mt-1.5 text-[0.8rem] text-[var(--inv-muted)]", children: "JPEG, PNG or WebP \u00B7 up to 15 MB each \u00B7 up to 20 at a time" }), _jsxs("button", { type: "button", onClick: () => inputRef.current?.click(), className: "inv-btn mt-5", children: [_jsx(ImagePlus, { size: 13 }), " Choose photographs"] }), _jsx("input", { ref: inputRef, type: "file", accept: "image/*", multiple: true, className: "sr-only", onChange: (event) => {
                                                if (event.target.files)
                                                    void handleFiles(event.target.files);
                                                event.target.value = '';
                                            } }), _jsx("p", { className: "mt-4 text-[0.68rem] text-[var(--inv-muted)]", children: "On a phone, you can take a photograph as you add it." })] }), _jsx(AnimatePresence, { children: queue.length > 0 && (_jsx(motion.ul, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, className: "mt-5 space-y-2", children: queue.map((item) => (_jsxs("li", { className: "inv-card flex items-center gap-3 px-3.5 py-2.5", children: [_jsx("span", { className: "grid h-8 w-8 flex-none place-items-center rounded-full border border-[var(--inv-line)] text-[var(--inv-accent)]", children: item.status === 'done' ? (_jsx(Check, { size: 14 })) : item.status === 'error' ? (_jsx(X, { size: 14 })) : (_jsx(Loader2, { size: 14, className: "animate-spin" })) }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsx("span", { className: "block truncate text-[0.78rem] text-[var(--inv-ink)]", children: item.name }), item.status === 'uploading' ? (_jsx("span", { className: "mt-1 block h-1 w-full overflow-hidden rounded-full bg-[var(--inv-line)]/60", children: _jsx("span", { className: "block h-full rounded-full bg-[var(--inv-accent)] transition-[width] duration-300", style: { width: `${item.progress}%` } }) })) : (_jsx("span", { className: "block text-[0.68rem] text-[var(--inv-muted)]", children: item.status === 'done' ? 'Added to the album' : item.error }))] })] }, item.id))) })) }), _jsxs("section", { className: "mt-14", children: [_jsxs("div", { className: "flex items-end justify-between gap-4", children: [_jsx("h2", { className: "inv-display text-[1.7rem]", children: allPhotos.length > 0
                                                        ? `${allPhotos.length} ${allPhotos.length === 1 ? 'photograph' : 'photographs'} so far`
                                                        : 'No photographs yet' }), guest && (_jsxs("p", { className: "text-[0.68rem] uppercase tracking-[0.14em] text-[var(--inv-muted)]", children: ["Adding as ", guest.name] }))] }), allPhotos.length > 0 ? (_jsx("div", { className: "mt-6", children: _jsx(Gallery, { items: allPhotos.map((photo) => ({
                                                    id: photo.id,
                                                    src: photo.url,
                                                    alt: `Photograph by ${photo.uploadedBy}`,
                                                    caption: photo.uploadedBy ? `Added by ${photo.uploadedBy}` : undefined,
                                                })), layout: theme.layout }) })) : (_jsx("p", { className: "mt-4 text-sm italic text-[var(--inv-muted)]", children: "Yours could be the first. Be quick \u2014 before the couple starts scrolling." }))] })] }))] })] }) }));
}
