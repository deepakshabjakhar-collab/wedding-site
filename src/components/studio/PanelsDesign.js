import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Eye, EyeOff, Pause, Play } from 'lucide-react';
import { BUILT_IN_TRACKS } from '@shared/defaults';
import { SECTION_LABELS } from '@shared/types';
import { TEMPLATES } from '@/templates/registry';
import { FONT_PAIRS, PALETTE_PRESETS, SCRIPT_FONTS } from '@/templates/types';
import { Field, Input, Select, Switch } from '@/components/ui/Field';
import { buttonClass } from '@/components/ui/Button';
import { useAudioPlayer } from '@/lib/useAudioPlayer';
import { AudioUploader } from './Uploader';
const ENVELOPES = [
    { id: 'seal', label: 'Wax seal', description: 'A seal breaks and the flap lifts' },
    { id: 'ribbon', label: 'Silk ribbon', description: 'A ribbon slips away, then the flap' },
    { id: 'curtain', label: 'Ivory curtains', description: 'Two panels part on the monogram' },
    { id: 'none', label: 'No theatre', description: 'Guests go straight to the invitation' },
];
export function DesignPanel({ data, templateId, update, setTemplateId }) {
    const palette = data.theme.palette ?? {};
    const activeTemplate = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
    const merged = { ...activeTemplate.palette, ...palette };
    const setPalette = (patch, key) => update({ theme: { ...data.theme, palette: { ...palette, ...patch } } }, key);
    const updateSettings = (patch, key) => update({ settings: { ...data.settings, ...patch } }, key);
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("section", { children: [_jsx("p", { className: "eyebrow", children: "Design direction" }), _jsx("h3", { className: "display mt-1.5 text-[1.6rem] text-ink", children: "Choose the world you want" }), _jsx("p", { className: "mt-1.5 text-[0.8rem] leading-relaxed text-muted", children: "Switching template keeps everything you have written and re-dresses it in the new design." }), _jsx("div", { className: "mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4", children: TEMPLATES.map((template) => {
                            const active = template.id === templateId;
                            return (_jsxs("button", { type: "button", onClick: () => setTemplateId(template.id), "aria-pressed": active, className: `relative overflow-hidden rounded-xl border p-3 text-left transition ${active ? 'border-ink bg-paper shadow-sm' : 'border-line bg-paper/50 hover:border-gold/50'}`, children: [_jsx("span", { className: "flex gap-1", children: [template.palette.bg, template.palette.accent, template.palette.deep].map((color) => (_jsx("span", { className: "h-3 w-3 rounded-full ring-1 ring-black/10", style: { background: color } }, color))) }), _jsx("span", { className: "mt-2 block font-display text-[1rem] leading-tight text-ink", children: template.name }), _jsx("span", { className: "block text-[0.6rem] leading-snug text-muted", children: template.descriptor }), active && (_jsx("span", { className: "absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-ink text-paper", children: _jsx(Check, { size: 10 }) }))] }, template.id));
                        }) })] }), _jsxs("section", { className: "border-t border-line/70 pt-7", children: [_jsx("p", { className: "eyebrow", children: "Colour" }), _jsx("h3", { className: "display mt-1.5 text-[1.6rem] text-ink", children: "Palette" }), _jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: PALETTE_PRESETS.map((preset) => {
                            const active = preset.palette.bg === merged.bg &&
                                preset.palette.accent === merged.accent &&
                                preset.palette.ink === merged.ink;
                            return (_jsxs("button", { type: "button", onClick: () => update({ theme: { ...data.theme, palette: { ...preset.palette, ...palette, ...preset.palette } } }, `palette-${preset.id}`), className: `flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-[0.68rem] transition ${active ? 'border-ink/50 bg-paper text-ink' : 'border-line text-muted hover:border-gold/50'}`, "aria-pressed": active, children: [_jsx("span", { className: "h-6 w-6 rounded-full ring-1 ring-black/10", style: {
                                            background: `conic-gradient(${preset.palette.bg} 0 40%, ${preset.palette.accent} 40% 70%, ${preset.palette.deep} 70% 100%)`,
                                        } }), preset.label] }, preset.id));
                        }) }), _jsx("div", { className: "mt-5 grid grid-cols-3 gap-3", children: [
                            ['bg', 'Background'],
                            ['accent', 'Accent'],
                            ['ink', 'Text'],
                        ].map(([key, label]) => (_jsxs("div", { children: [_jsx("p", { className: "label", children: _jsx("span", { children: label }) }), _jsx("input", { type: "color", value: merged[key], onChange: (event) => setPalette({ [key]: event.target.value }, `color-${key}`), "aria-label": `${label} colour` })] }, key))) }), Object.keys(palette).length > 1 && (_jsxs("button", { type: "button", onClick: () => update({ theme: { ...data.theme, palette: {} } }), className: "mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted transition hover:text-ink", children: ["Reset to ", activeTemplate.name, " colours"] }))] }), _jsxs("section", { className: "border-t border-line/70 pt-7", children: [_jsx("p", { className: "eyebrow", children: "Typography" }), _jsx("h3", { className: "display mt-1.5 text-[1.6rem] text-ink", children: "Type pairing" }), _jsxs("div", { className: "mt-4 grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "Headings", htmlFor: "font-pair", children: _jsxs(Select, { id: "font-pair", value: data.theme.fontPair ?? '', onChange: (event) => update({ theme: { ...data.theme, fontPair: event.target.value } }, 'font-pair'), children: [_jsxs("option", { value: "", children: [activeTemplate.name, " default"] }), FONT_PAIRS.map((pair) => (_jsx("option", { value: pair.id, children: pair.label }, pair.id)))] }) }), _jsx(Field, { label: "Script accents", htmlFor: "script-font", children: _jsxs(Select, { id: "script-font", value: data.theme.scriptFont ?? '', onChange: (event) => update({ theme: { ...data.theme, scriptFont: event.target.value } }, 'script-font'), children: [_jsxs("option", { value: "", children: [activeTemplate.name, " default"] }), SCRIPT_FONTS.map((script) => (_jsx("option", { value: script.id, children: script.label }, script.id)))] }) })] }), _jsx("div", { className: "mt-4 space-y-2", children: _jsx(Field, { label: "Monogram treatment", htmlFor: "monogram-style", children: _jsxs(Select, { id: "monogram-style", value: data.settings.monogramStyle, onChange: (event) => updateSettings({ monogramStyle: event.target.value }, 'monogram'), children: [_jsx("option", { value: "script", children: "Handwritten script" }), _jsx("option", { value: "serif", children: "Serif initials" }), _jsx("option", { value: "circle", children: "Sealed in a circle" })] }) }) })] }), _jsxs("section", { className: "border-t border-line/70 pt-7", children: [_jsx("p", { className: "eyebrow", children: "The cover" }), _jsx("h3", { className: "display mt-1.5 text-[1.6rem] text-ink", children: "How it opens" }), _jsxs("div", { className: "mt-4 grid gap-2", children: [ENVELOPES.map((option) => (_jsxs("button", { type: "button", onClick: () => updateSettings({ envelopeAnimation: option.id }, 'envelope'), "aria-pressed": data.settings.envelopeAnimation === option.id, className: `flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${data.settings.envelopeAnimation === option.id
                                    ? 'border-ink/40 bg-paper text-ink'
                                    : 'border-line bg-paper/50 text-ink-soft hover:border-gold/50'}`, children: [_jsxs("span", { children: [_jsx("span", { className: "block text-[0.82rem] font-medium", children: option.label }), _jsx("span", { className: "block text-[0.72rem] text-muted", children: option.description })] }), data.settings.envelopeAnimation === option.id && _jsx(Check, { size: 14, className: "text-gold" })] }, option.id))), data.settings.envelopeAnimation === 'none' && (_jsx("p", { className: "hint", children: "Guests land directly on the invitation \u2014 recommended when you share it widely." }))] }), _jsx("p", { className: "mt-5 max-w-md text-[0.78rem] leading-relaxed text-muted", children: "The cover is set entirely in type \u2014 your names, a monogram, a hairline rule and the drawn artwork of the template you chose. No photograph, nothing to crop, nothing that dates." })] })] }));
}
export function SectionsPanel({ data, update, updateSettings }) {
    const order = data.settings.sectionsOrder;
    const hidden = new Set(data.settings.hiddenSections);
    const move = (index, direction) => {
        const next = [...order];
        const target = index + direction;
        if (target < 0 || target >= next.length)
            return;
        [next[index], next[target]] = [next[target], next[index]];
        updateSettings({ sectionsOrder: next }, `move-${index}`);
    };
    const toggle = (section) => {
        const next = new Set(hidden);
        if (next.has(section))
            next.delete(section);
        else
            next.add(section);
        updateSettings({ hiddenSections: [...next] });
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("section", { children: [_jsx("p", { className: "eyebrow", children: "Structure" }), _jsx("h3", { className: "display mt-1.5 text-[1.6rem] text-ink", children: "What guests see, in what order" }), _jsx("p", { className: "mt-1.5 text-[0.8rem] leading-relaxed text-muted", children: "Reorder or hide any section. An invitation with fewer, better sections always reads better." }), _jsx("ul", { className: "mt-4 space-y-2", children: order.map((section, index) => {
                            const meta = SECTION_LABELS[section];
                            const isHidden = hidden.has(section);
                            return (_jsxs("li", { className: `flex items-center gap-3 rounded-xl border px-3.5 py-3 transition ${isHidden ? 'border-line/60 bg-paper/40 opacity-60' : 'border-line bg-paper'}`, children: [_jsxs("span", { className: "flex flex-none flex-col", children: [_jsx("button", { type: "button", onClick: () => move(index, -1), className: "text-muted transition hover:text-ink disabled:opacity-30", disabled: index === 0, "aria-label": `Move ${meta.label} up`, children: _jsx(ChevronUp, { size: 14 }) }), _jsx("button", { type: "button", onClick: () => move(index, 1), className: "text-muted transition hover:text-ink disabled:opacity-30", disabled: index === order.length - 1, "aria-label": `Move ${meta.label} down`, children: _jsx(ChevronDown, { size: 14 }) })] }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsx("span", { className: "block text-[0.82rem] font-medium text-ink", children: meta.label }), _jsx("span", { className: "block text-[0.72rem] text-muted", children: meta.hint })] }), _jsx("button", { type: "button", onClick: () => toggle(section), className: "icon-btn !h-8 !w-8 flex-none", "aria-label": isHidden ? `Show ${meta.label}` : `Hide ${meta.label}`, "aria-pressed": !isHidden, children: isHidden ? _jsx(EyeOff, { size: 14 }) : _jsx(Eye, { size: 14 }) })] }, section));
                        }) })] }), _jsxs("section", { className: "border-t border-line/70 pt-7", children: [_jsx("p", { className: "eyebrow", children: "Behaviour" }), _jsx("h3", { className: "display mt-1.5 text-[1.6rem] text-ink", children: "Details that matter" }), _jsxs("div", { className: "mt-4 space-y-2.5", children: [_jsx(Switch, { checked: data.settings.countdown, onChange: (value) => updateSettings({ countdown: value }), label: "Show a live countdown", description: "Counts down to the first ceremony on the schedule." }), _jsx(Switch, { checked: data.settings.messagesEnabled, onChange: (value) => updateSettings({ messagesEnabled: value }), label: "Allow blessings from guests", description: "A wall of notes and well-wishes, moderated by you." }), _jsx(Switch, { checked: data.settings.albumEnabled, onChange: (value) => updateSettings({ albumEnabled: value }), label: "Collect guest photographs", description: "Guests can upload from the invitation or a QR code at the venue." }), data.settings.albumEnabled && (_jsx(Switch, { checked: data.settings.albumPublic, onChange: (value) => updateSettings({ albumPublic: value }), label: "Album accepts uploads now", description: "Turn this off after the wedding to keep the album read-only." })), _jsx(Switch, { checked: data.settings.showGuestName, onChange: (value) => updateSettings({ showGuestName: value }), label: "Address guests by name", description: "Their household name appears on the envelope and hero." })] }), _jsxs("div", { className: "mt-5 grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "Invitation language", htmlFor: "language", hint: "Interface wording for guests", children: _jsxs(Select, { id: "language", value: data.settings.language, onChange: (event) => updateSettings({ language: event.target.value }), children: [_jsx("option", { value: "en", children: "English" }), _jsx("option", { value: "fr", children: "Fran\u00E7ais" }), _jsx("option", { value: "it", children: "Italiano" }), _jsx("option", { value: "hi", children: "\u0939\u093F\u0928\u094D\u0926\u0940" })] }) }), _jsx(Field, { label: "Hashtag", htmlFor: "hashtag", optional: true, children: _jsx(Input, { id: "hashtag", value: data.hashtag, onChange: (event) => update({ hashtag: event.target.value }, 'hashtag'), placeholder: "#ClaraAndJulien", maxLength: 60 }) })] })] })] }));
}
function TrackRow({ track, selected, onSelect, }) {
    const [previewing, setPreviewing] = useState(false);
    const player = useAudioPlayer(previewing ? track.src : null, { loop: false, volume: 0.6 });
    useEffect(() => {
        if (previewing) {
            void player.play().then((ok) => {
                if (!ok)
                    setPreviewing(false);
            });
        }
    }, [previewing, player]);
    useEffect(() => {
        if (previewing && !player.playing && player.time > 0 && player.time >= player.duration) {
            setPreviewing(false);
        }
    }, [player.duration, player.playing, player.time, previewing]);
    return (_jsxs("li", { className: `flex items-center gap-3 rounded-xl border px-3.5 py-3 transition ${selected ? 'border-ink/40 bg-paper' : 'border-line bg-paper/50'}`, children: [_jsx("button", { type: "button", onClick: () => {
                    if (previewing) {
                        player.pause();
                        setPreviewing(false);
                    }
                    else {
                        setPreviewing(true);
                    }
                }, className: "icon-btn !h-9 !w-9 flex-none", "aria-label": previewing ? `Pause ${track.title}` : `Preview ${track.title}`, children: previewing ? _jsx(Pause, { size: 14 }) : _jsx(Play, { size: 14, className: "ml-0.5" }) }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsx("span", { className: "block truncate text-[0.82rem] font-medium text-ink", children: track.title }), _jsx("span", { className: "block truncate text-[0.7rem] text-muted", children: track.mood })] }), _jsx("button", { type: "button", onClick: onSelect, className: selected ? 'pill pill-dark' : 'pill pill-neutral', "aria-pressed": selected, children: selected ? 'Selected' : 'Choose' })] }));
}
export function MusicPanel({ invitation, data, update }) {
    const music = data.music;
    const setMusic = (patch, key) => update({ music: { ...music, ...patch } }, key);
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("section", { children: [_jsx("p", { className: "eyebrow", children: "The soundtrack" }), _jsx("h3", { className: "display mt-1.5 text-[1.6rem] text-ink", children: "Music for the moment it opens" }), _jsx("p", { className: "mt-1.5 text-[0.8rem] leading-relaxed text-muted", children: "Every recording below was composed for Vellum, so there are no licences to worry about." }), _jsxs("div", { className: "mt-4 space-y-2.5", children: [_jsx(Switch, { checked: music.enabled, onChange: (value) => setMusic({ enabled: value }), label: "Include music", description: "Guests still choose to start it \u2014 browsers never allow sound before a tap." }), music.enabled && (_jsx(Switch, { checked: music.startOnOpen, onChange: (value) => setMusic({ startOnOpen: value }), label: "Begin when the envelope opens", description: "Starts with the opening gesture. Turn off to let guests press play themselves." }))] })] }), music.enabled && (_jsxs(_Fragment, { children: [_jsxs("section", { className: "border-t border-line/70 pt-7", children: [_jsx("p", { className: "eyebrow", children: "Included recordings" }), _jsx("ul", { className: "mt-4 space-y-2.5", children: BUILT_IN_TRACKS.map((track) => (_jsx(TrackRow, { track: track, selected: !music.customSrc && music.trackId === track.id, onSelect: () => setMusic({ trackId: track.id, customSrc: null, title: track.title, artist: track.artist }) }, track.id))) })] }), _jsxs("section", { className: "border-t border-line/70 pt-7", children: [_jsx("p", { className: "eyebrow", children: "Or your own" }), _jsxs("div", { className: "mt-4", children: [_jsx(AudioUploader, { invitationId: invitation.id, value: music.customSrc, onChange: (url, name) => setMusic({
                                            customSrc: url,
                                            trackId: url ? null : (music.trackId ?? 'golden-hour'),
                                            title: url ? name || 'Our song' : music.title,
                                            artist: url ? '' : music.artist,
                                        }), onMeta: (title, artist) => setMusic({ title, artist }) }), _jsx("p", { className: "hint", children: "Please only upload music you have the right to use \u2014 a live recording, a friend\u2019s composition, or something you own." })] }), _jsxs("div", { className: "mt-5 grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "Track title", htmlFor: "music-title", children: _jsx(Input, { id: "music-title", value: music.title, onChange: (event) => setMusic({ title: event.target.value }, 'music-title'), placeholder: "Our song", maxLength: 80 }) }), _jsx(Field, { label: "Artist", htmlFor: "music-artist", optional: true, children: _jsx(Input, { id: "music-artist", value: music.artist, onChange: (event) => setMusic({ artist: event.target.value }, 'music-artist'), placeholder: "The Vellum Ensemble", maxLength: 80 }) })] }), _jsx("div", { className: "mt-4", children: _jsx(Field, { label: "Player style", htmlFor: "music-style", children: _jsxs(Select, { id: "music-style", value: music.style, onChange: (event) => setMusic({ style: event.target.value }), children: [_jsx("option", { value: "pill", children: "Compact pill (recommended)" }), _jsx("option", { value: "minimal", children: "Minimal \u2014 play button only" }), _jsx("option", { value: "disc", children: "Disc with track details" })] }) }) })] })] })), !music.enabled && (_jsx("p", { className: "rounded-xl border border-line bg-paper/60 px-4 py-3 text-[0.8rem] text-muted", children: "The invitation will be silent, with no player shown to guests." })), music.enabled && music.customSrc && (_jsx("p", { className: "text-[0.72rem] text-muted", children: "Using your uploaded recording. Guests will hear it after they open the envelope." })), _jsx("div", { className: "border-t border-line/70 pt-6", children: _jsx("a", { href: "/#music", target: "_blank", rel: "noreferrer", className: buttonClass('outline', 'sm'), children: "Listen to the collection" }) })] }));
}
