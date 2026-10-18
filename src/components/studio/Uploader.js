import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Music4, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
export function ImageUploader({ invitationId, label, hint, value, onChange, aspect = 'aspect-[4/5]', }) {
    const inputRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const [dragging, setDragging] = useState(false);
    const upload = async (file) => {
        setError(null);
        if (!file.type.startsWith('image/')) {
            setError('Please choose a JPEG, PNG or WebP image.');
            return;
        }
        if (file.size > 15 * 1024 * 1024) {
            setError('That image is larger than 15 MB.');
            return;
        }
        setBusy(true);
        try {
            const result = await api.invitations.uploadImage(invitationId, file);
            onChange(result.url);
        }
        catch (err) {
            setError(err instanceof ApiError ? err.message : 'The image could not be uploaded.');
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs("div", { children: [_jsxs("p", { className: "label", children: [_jsx("span", { children: label }), value && (_jsx("button", { type: "button", onClick: () => onChange(''), className: "text-[0.62rem] font-semibold tracking-[0.1em] text-muted uppercase transition hover:text-[#a84632]", children: "Remove" }))] }), _jsxs("div", { className: `upload-drop ${dragging ? 'border-gold bg-gold/10' : ''}`, onDragOver: (event) => {
                    event.preventDefault();
                    setDragging(true);
                }, onDragLeave: () => setDragging(false), onDrop: (event) => {
                    event.preventDefault();
                    setDragging(false);
                    const file = event.dataTransfer.files?.[0];
                    if (file)
                        void upload(file);
                }, children: [value ? (_jsxs("div", { className: "flex items-center gap-3 text-left", children: [_jsx("img", { src: value, alt: "", className: `${aspect} h-20 w-20 flex-none rounded-lg object-cover` }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-[0.75rem] text-ink-soft", children: "Uploaded" }), _jsx("button", { type: "button", onClick: () => inputRef.current?.click(), className: "mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gold", children: "Replace" })] })] })) : (_jsxs("button", { type: "button", onClick: () => inputRef.current?.click(), className: "flex w-full flex-col items-center gap-2 py-2", disabled: busy, children: [_jsx("span", { className: "grid h-10 w-10 place-items-center rounded-full border border-line bg-paper text-gold", children: busy ? _jsx(Loader2, { size: 16, className: "animate-spin" }) : _jsx(ImagePlus, { size: 16 }) }), _jsx("span", { className: "text-[0.78rem] font-medium text-ink", children: busy ? 'Uploading…' : 'Choose an image' }), hint && _jsx("span", { className: "text-[0.68rem] text-muted", children: hint })] })), _jsx("input", { ref: inputRef, type: "file", accept: "image/*", className: "sr-only", onChange: (event) => {
                            const file = event.target.files?.[0];
                            if (file)
                                void upload(file);
                            event.target.value = '';
                        } })] }), error && (_jsx("p", { className: "error-text", role: "alert", children: error }))] }));
}
export function AudioUploader({ invitationId, value, onChange, onMeta, }) {
    const inputRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const upload = async (file) => {
        setError(null);
        if (!file.type.startsWith('audio/')) {
            setError('Please choose an MP3, M4A, WAV or OGG file.');
            return;
        }
        if (file.size > 15 * 1024 * 1024) {
            setError('That audio file is larger than 15 MB.');
            return;
        }
        setBusy(true);
        try {
            const result = await api.invitations.uploadAudio(invitationId, file);
            const clean = file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ');
            onChange(result.url, clean);
            onMeta?.(clean, '');
        }
        catch (err) {
            setError(err instanceof ApiError ? err.message : 'The audio file could not be uploaded.');
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs("div", { children: [_jsxs("p", { className: "label", children: [_jsx("span", { children: "Your own recording" }), value && (_jsxs("button", { type: "button", onClick: () => {
                            onChange(null);
                            onMeta?.('', '');
                        }, className: "inline-flex items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-muted transition hover:text-[#a84632]", children: [_jsx(Trash2, { size: 11 }), " Remove"] }))] }), _jsxs("div", { className: "upload-drop", children: [_jsxs("button", { type: "button", onClick: () => inputRef.current?.click(), className: "flex w-full items-center gap-3 text-left", disabled: busy, children: [_jsx("span", { className: "grid h-10 w-10 flex-none place-items-center rounded-full border border-line bg-paper text-gold", children: busy ? _jsx(Loader2, { size: 16, className: "animate-spin" }) : _jsx(Music4, { size: 16 }) }), _jsxs("span", { className: "min-w-0", children: [_jsx("span", { className: "block truncate text-[0.78rem] font-medium text-ink", children: value ? value.split('/').pop() : busy ? 'Uploading…' : 'Choose an audio file' }), _jsx("span", { className: "block text-[0.68rem] text-muted", children: "MP3, M4A, WAV or OGG \u00B7 up to 15 MB" })] })] }), _jsx("input", { ref: inputRef, type: "file", accept: "audio/*", className: "sr-only", onChange: (event) => {
                            const file = event.target.files?.[0];
                            if (file)
                                void upload(file);
                            event.target.value = '';
                        } })] }), error && (_jsx("p", { className: "error-text", role: "alert", children: error }))] }));
}
