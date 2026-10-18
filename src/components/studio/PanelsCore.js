import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, CalendarPlus, Copy, ImagePlus, Loader2, Plus, Trash2, } from 'lucide-react';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';
const TIME_ZONES = [
    'Europe/London',
    'Europe/Paris',
    'Europe/Rome',
    'Europe/Madrid',
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Pacific/Auckland',
];
export function ContentPanel({ data, update }) {
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("section", { children: [_jsx("p", { className: "eyebrow", children: "The two of you" }), _jsx("h3", { className: "display mt-1.5 text-[1.6rem] text-ink", children: "Names & wording" }), _jsxs("div", { className: "mt-4 grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "First name", htmlFor: "couple-a", children: _jsx(Input, { id: "couple-a", value: data.coupleA, onChange: (event) => update({ coupleA: event.target.value }, 'coupleA'), maxLength: 60 }) }), _jsx(Field, { label: "Second name", htmlFor: "couple-b", children: _jsx(Input, { id: "couple-b", value: data.coupleB, onChange: (event) => update({ coupleB: event.target.value }, 'coupleB'), maxLength: 60 }) }), _jsx(Field, { label: "Monogram", htmlFor: "monogram", hint: "Used on the seal, the cover and the closing", children: _jsx(Input, { id: "monogram", value: data.monogram, onChange: (event) => update({ monogram: event.target.value }, 'monogram'), maxLength: 16 }) }), _jsx(Field, { label: "Tagline", htmlFor: "tagline", optional: true, children: _jsx(Input, { id: "tagline", value: data.tagline, onChange: (event) => update({ tagline: event.target.value }, 'tagline'), maxLength: 160, placeholder: "Two families, one endless celebration" }) })] })] }), _jsxs("section", { className: "border-t border-line/70 pt-7", children: [_jsx("p", { className: "eyebrow", children: "The day" }), _jsxs("div", { className: "mt-4 grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "Wedding date", htmlFor: "wedding-date", children: _jsx(Input, { id: "wedding-date", type: "date", value: data.weddingDate, onChange: (event) => update({ weddingDate: event.target.value }, 'date') }) }), _jsx(Field, { label: "Ceremony time", htmlFor: "wedding-time", children: _jsx(Input, { id: "wedding-time", type: "time", value: data.weddingTime, onChange: (event) => update({ weddingTime: event.target.value }, 'time') }) }), _jsx(Field, { label: "Time zone", htmlFor: "timezone", children: _jsx(Select, { id: "timezone", value: data.timeZone, onChange: (event) => update({ timeZone: event.target.value }, 'timezone'), children: [...new Set([data.timeZone, ...TIME_ZONES])].filter(Boolean).map((zone) => (_jsx("option", { value: zone, children: zone.replace(/_/g, ' ') }, zone))) }) }), _jsx(Field, { label: "Location line", htmlFor: "location", hint: "Shown under your names on the cover", children: _jsx(Input, { id: "location", value: data.location, onChange: (event) => update({ location: event.target.value }, 'location'), maxLength: 160 }) })] })] }), _jsxs("section", { className: "border-t border-line/70 pt-7", children: [_jsx("p", { className: "eyebrow", children: "Welcome" }), _jsx("h3", { className: "display mt-1.5 text-[1.6rem] text-ink", children: "The first words they read" }), _jsxs("div", { className: "mt-4 space-y-4", children: [_jsx(Field, { label: "Heading", htmlFor: "welcome-heading", children: _jsx(Input, { id: "welcome-heading", value: data.welcomeHeading, onChange: (event) => update({ welcomeHeading: event.target.value }, 'welcome-head'), maxLength: 120, placeholder: "Together with our families" }) }), _jsx(Field, { label: "Welcome note", htmlFor: "welcome-note", hint: `${data.welcomeNote.length}/1200 characters`, children: _jsx(Textarea, { id: "welcome-note", className: "textarea-tall", value: data.welcomeNote, onChange: (event) => update({ welcomeNote: event.target.value }, 'welcome-note'), maxLength: 1200 }) })] })] })] }));
}
function newEvent(index) {
    return {
        id: `event-${Date.now()}-${index}`,
        name: index === 0 ? 'The Ceremony' : 'Celebration',
        subtitle: '',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString().slice(0, 10),
        startTime: '16:00',
        endTime: '',
        venue: '',
        address: '',
        mapUrl: '',
        description: '',
        dressCode: '',
    };
}
export function EventsPanel({ data, update }) {
    const events = data.events;
    const setEvents = (next, key) => update({ events: next }, key);
    const patch = (id, fields, key) => setEvents(events.map((event) => (event.id === id ? { ...event, ...fields } : event)), key);
    const move = (index, direction) => {
        const next = [...events];
        const target = index + direction;
        if (target < 0 || target >= next.length)
            return;
        [next[index], next[target]] = [next[target], next[index]];
        setEvents(next);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Ceremonies" }), _jsx("h3", { className: "display mt-1.5 text-[1.6rem] text-ink", children: "Every celebration, on its own card" }), _jsx("p", { className: "mt-1.5 text-[0.8rem] leading-relaxed text-muted", children: "Mehendi, haldi, sangeet, wedding, reception \u2014 or a ceremony, a lunch and a party. Each one can be shown to selected guests only." })] }), _jsx("div", { className: "space-y-4", children: events.map((event, index) => (_jsxs("article", { className: "rounded-xl border border-line bg-paper p-4", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-ivory text-[0.7rem] font-semibold text-muted", children: index + 1 }), _jsx("span", { className: "text-[0.8rem] font-medium text-ink", children: event.name || 'Untitled celebration' })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { type: "button", className: "icon-btn !h-8 !w-8", onClick: () => move(index, -1), disabled: index === 0, "aria-label": "Move celebration up", children: _jsx(ArrowUp, { size: 13 }) }), _jsx("button", { type: "button", className: "icon-btn !h-8 !w-8", onClick: () => move(index, 1), disabled: index === events.length - 1, "aria-label": "Move celebration down", children: _jsx(ArrowDown, { size: 13 }) }), _jsx("button", { type: "button", className: "icon-btn !h-8 !w-8", onClick: () => setEvents([...events, { ...event, id: `event-${Date.now()}`, name: `${event.name} (copy)` }]), "aria-label": "Duplicate celebration", children: _jsx(Copy, { size: 13 }) }), _jsx("button", { type: "button", className: "icon-btn !h-8 !w-8", onClick: () => setEvents(events.filter((item) => item.id !== event.id)), "aria-label": "Remove celebration", children: _jsx(Trash2, { size: 13 }) })] })] }), _jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: [_jsx(Field, { label: "Name", htmlFor: `event-name-${event.id}`, children: _jsx(Input, { id: `event-name-${event.id}`, value: event.name, onChange: (input) => patch(event.id, { name: input.target.value }, `ev-name-${event.id}`), maxLength: 100 }) }), _jsx(Field, { label: "Sub-line", htmlFor: `event-sub-${event.id}`, optional: true, children: _jsx(Input, { id: `event-sub-${event.id}`, value: event.subtitle ?? '', onChange: (input) => patch(event.id, { subtitle: input.target.value }, `ev-sub-${event.id}`), placeholder: "Henna, chai and old Bollywood songs", maxLength: 120 }) }), _jsx(Field, { label: "Date", htmlFor: `event-date-${event.id}`, children: _jsx(Input, { id: `event-date-${event.id}`, type: "date", value: event.date, onChange: (input) => patch(event.id, { date: input.target.value }, `ev-date-${event.id}`) }) }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Field, { label: "Starts", htmlFor: `event-start-${event.id}`, children: _jsx(Input, { id: `event-start-${event.id}`, type: "time", value: event.startTime, onChange: (input) => patch(event.id, { startTime: input.target.value }, `ev-start-${event.id}`) }) }), _jsx(Field, { label: "Ends", htmlFor: `event-end-${event.id}`, optional: true, children: _jsx(Input, { id: `event-end-${event.id}`, type: "time", value: event.endTime ?? '', onChange: (input) => patch(event.id, { endTime: input.target.value }, `ev-end-${event.id}`) }) })] }), _jsx(Field, { label: "Venue", htmlFor: `event-venue-${event.id}`, children: _jsx(Input, { id: `event-venue-${event.id}`, value: event.venue, onChange: (input) => patch(event.id, { venue: input.target.value }, `ev-venue-${event.id}`), maxLength: 140 }) }), _jsx(Field, { label: "Address", htmlFor: `event-address-${event.id}`, children: _jsx(Input, { id: `event-address-${event.id}`, value: event.address ?? '', onChange: (input) => patch(event.id, { address: input.target.value }, `ev-address-${event.id}`), maxLength: 240 }) }), _jsx(Field, { label: "Map link", htmlFor: `event-map-${event.id}`, optional: true, children: _jsx(Input, { id: `event-map-${event.id}`, value: event.mapUrl ?? '', onChange: (input) => patch(event.id, { mapUrl: input.target.value }, `ev-map-${event.id}`), placeholder: "https://maps.google.com/?q=\u2026" }) }), _jsx(Field, { label: "Dress code", htmlFor: `event-dress-${event.id}`, optional: true, children: _jsx(Input, { id: `event-dress-${event.id}`, value: event.dressCode ?? '', onChange: (input) => patch(event.id, { dressCode: input.target.value }, `ev-dress-${event.id}`), placeholder: "Jewel tones", maxLength: 160 }) }), _jsx(Field, { label: "Reserved for group", htmlFor: `event-group-${event.id}`, optional: true, hint: "Used to pre-select events when you add guests in bulk", children: _jsx(Input, { id: `event-group-${event.id}`, value: event.guestGroup ?? '', onChange: (input) => patch(event.id, { guestGroup: input.target.value }, `ev-group-${event.id}`), placeholder: "Family, Colleagues\u2026", maxLength: 60 }) }), _jsx("div", { className: "sm:col-span-2", children: _jsx(Field, { label: "Description", htmlFor: `event-desc-${event.id}`, optional: true, children: _jsx(Textarea, { id: `event-desc-${event.id}`, value: event.description ?? '', onChange: (input) => patch(event.id, { description: input.target.value }, `ev-desc-${event.id}`), maxLength: 700, placeholder: "Please be seated by 16:15. Champagne follows in the orangery." }) }) })] })] }, event.id))) }), _jsx(Button, { variant: "outline", onClick: () => setEvents([...events, newEvent(events.length)]), icon: _jsx(CalendarPlus, { size: 14 }), children: "Add a celebration" }), events.length > 5 && (_jsx("p", { className: "hint", children: "Five or more ceremonies make the schedule feel long on a phone. Consider grouping small moments into one card." }))] }));
}
export function StoryPanel({ invitation, data, update }) {
    const story = data.story;
    const setStory = (next, key) => update({ story: next }, key);
    const [busyId, setBusyId] = useState(null);
    const inputRef = useRef(null);
    const [activeChapter, setActiveChapter] = useState(null);
    const [error, setError] = useState(null);
    const uploadFor = async (chapterId, file) => {
        setError(null);
        if (!file.type.startsWith('image/')) {
            setError('Please choose an image file.');
            return;
        }
        setBusyId(chapterId);
        try {
            const result = await api.invitations.uploadImage(invitation.id, file);
            setStory(story.map((chapter) => (chapter.id === chapterId ? { ...chapter, image: result.url } : chapter)));
        }
        catch (err) {
            setError(err instanceof ApiError ? err.message : 'The image could not be uploaded.');
        }
        finally {
            setBusyId(null);
        }
    };
    const patch = (id, fields, key) => setStory(story.map((chapter) => (chapter.id === id ? { ...chapter, ...fields } : chapter)), key);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Your story" }), _jsx("h3", { className: "display mt-1.5 text-[1.6rem] text-ink", children: "How you got here" }), _jsx("p", { className: "mt-1.5 text-[0.8rem] leading-relaxed text-muted", children: "Two or three honest chapters are perfect. Write like you talk, not like a brochure." })] }), _jsx(Field, { label: "Introduction", htmlFor: "story-intro", optional: true, children: _jsx(Textarea, { id: "story-intro", value: data.storyIntro, onChange: (event) => update({ storyIntro: event.target.value }, 'story-intro'), maxLength: 400, placeholder: "A few chapters from the road that brought us here." }) }), _jsx("div", { className: "space-y-4", children: story.map((chapter, index) => (_jsxs("article", { className: "rounded-xl border border-line bg-paper p-4", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("span", { className: "text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted", children: ["Chapter ", index + 1] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { type: "button", className: "icon-btn !h-8 !w-8", onClick: () => {
                                                const next = [...story];
                                                const target = index - 1;
                                                if (target < 0)
                                                    return;
                                                [next[index], next[target]] = [next[target], next[index]];
                                                setStory(next);
                                            }, disabled: index === 0, "aria-label": "Move chapter up", children: _jsx(ArrowUp, { size: 13 }) }), _jsx("button", { type: "button", className: "icon-btn !h-8 !w-8", onClick: () => setStory(story.filter((item) => item.id !== chapter.id)), "aria-label": "Remove chapter", children: _jsx(Trash2, { size: 13 }) })] })] }), _jsxs("div", { className: "mt-3 grid gap-3 sm:grid-cols-[1fr_auto]", children: [_jsxs("div", { className: "space-y-3", children: [_jsx(Field, { label: "Chapter title", htmlFor: `chapter-title-${chapter.id}`, children: _jsx(Input, { id: `chapter-title-${chapter.id}`, value: chapter.title, onChange: (event) => patch(chapter.id, { title: event.target.value }, `ch-title-${chapter.id}`), maxLength: 120 }) }), _jsx(Field, { label: "The story", htmlFor: `chapter-body-${chapter.id}`, children: _jsx(Textarea, { id: `chapter-body-${chapter.id}`, value: chapter.body, onChange: (event) => patch(chapter.id, { body: event.target.value }, `ch-body-${chapter.id}`), maxLength: 1500 }) })] }), _jsxs("div", { className: "w-full sm:w-32", children: [_jsx("p", { className: "label", children: _jsx("span", { children: "Image" }) }), chapter.image ? (_jsxs("div", { className: "relative", children: [_jsx("img", { src: chapter.image, alt: "", className: "aspect-[4/5] w-full rounded-lg object-cover" }), _jsx("button", { type: "button", onClick: () => patch(chapter.id, { image: '' }, `ch-img-${chapter.id}`), className: "absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white", "aria-label": "Remove chapter image", children: _jsx(Trash2, { size: 11 }) })] })) : (_jsx("button", { type: "button", onClick: () => {
                                                setActiveChapter(chapter.id);
                                                inputRef.current?.click();
                                            }, className: "flex aspect-[4/5] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-gold/50 bg-gold/5 text-gold transition hover:bg-gold/10", children: busyId === chapter.id ? (_jsx(Loader2, { size: 16, className: "animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx(ImagePlus, { size: 16 }), _jsx("span", { className: "text-[0.6rem] uppercase tracking-[0.1em]", children: "Add image" })] })) }))] })] })] }, chapter.id))) }), _jsx("input", { ref: inputRef, type: "file", accept: "image/*", className: "sr-only", onChange: (event) => {
                    const file = event.target.files?.[0];
                    if (file && activeChapter)
                        void uploadFor(activeChapter, file);
                    event.target.value = '';
                } }), error && (_jsx("p", { className: "error-text", role: "alert", children: error })), _jsx(Button, { variant: "outline", icon: _jsx(Plus, { size: 14 }), onClick: () => setStory([
                    ...story,
                    { id: `chapter-${Date.now()}`, title: '', body: '', image: '' },
                ]), children: "Add a chapter" })] }));
}
export function GalleryPanel({ invitation, data, update }) {
    const gallery = data.gallery;
    const setGallery = (next) => update({ gallery: next });
    const inputRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const uploadFiles = async (files) => {
        setError(null);
        setBusy(true);
        const added = [];
        try {
            for (const file of [...files].slice(0, 12)) {
                if (!file.type.startsWith('image/'))
                    continue;
                if (file.size > 15 * 1024 * 1024) {
                    setError('One image was larger than 15 MB and was skipped.');
                    continue;
                }
                const result = await api.invitations.uploadImage(invitation.id, file);
                added.push({
                    id: `image-${Date.now()}-${added.length}`,
                    src: result.url,
                    caption: '',
                    alt: '',
                });
            }
            if (added.length)
                setGallery([...gallery, ...added]);
        }
        catch (err) {
            setError(err instanceof ApiError ? err.message : 'Some images could not be uploaded.');
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Gallery" }), _jsx("h3", { className: "display mt-1.5 text-[1.6rem] text-ink", children: "A few frames, well chosen" }), _jsx("p", { className: "mt-1.5 text-[0.8rem] leading-relaxed text-muted", children: "Six to ten photographs work best. Landscape and portrait can be mixed freely." })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3", children: [gallery.map((item) => (_jsxs("div", { className: "rounded-xl border border-line bg-paper p-2", children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: item.src, alt: item.alt || '', className: "aspect-square w-full rounded-lg object-cover" }), _jsx("button", { type: "button", onClick: () => setGallery(gallery.filter((entry) => entry.id !== item.id)), className: "absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white", "aria-label": "Remove photograph", children: _jsx(Trash2, { size: 11 }) })] }), _jsx(Input, { value: item.caption ?? '', onChange: (event) => setGallery(gallery.map((entry) => entry.id === item.id ? { ...entry, caption: event.target.value } : entry)), placeholder: "Caption", className: "mt-2 !py-1.5 !text-[0.72rem]", "aria-label": "Photograph caption", maxLength: 160 })] }, item.id))), _jsxs("button", { type: "button", onClick: () => inputRef.current?.click(), className: "flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gold/50 bg-gold/5 text-gold transition hover:bg-gold/10", disabled: busy, children: [busy ? _jsx(Loader2, { size: 18, className: "animate-spin" }) : _jsx(ImagePlus, { size: 18 }), _jsx("span", { className: "text-[0.62rem] uppercase tracking-[0.12em]", children: busy ? 'Uploading' : 'Add photographs' })] })] }), _jsx("input", { ref: inputRef, type: "file", accept: "image/*", multiple: true, className: "sr-only", onChange: (event) => {
                    if (event.target.files)
                        void uploadFiles(event.target.files);
                    event.target.value = '';
                } }), error && (_jsx("p", { className: "error-text", role: "alert", children: error })), _jsx("p", { className: "rounded-xl border border-line bg-paper/60 px-4 py-3 text-[0.76rem] leading-relaxed text-muted", children: "These become the \u201CMoments, so far\u201D section. After the wedding, guests can add their own photographs to the shared album in the dashboard." })] }));
}
