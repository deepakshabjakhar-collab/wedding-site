import { useEffect, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Eye, EyeOff, Pause, Play } from 'lucide-react';
import { BUILT_IN_TRACKS } from '@shared/defaults';
import type { InvitationSettings, MusicSettings, Palette, SectionId } from '@shared/types';
import { SECTION_LABELS } from '@shared/types';
import { TEMPLATES } from '@/templates/registry';
import { FONT_PAIRS, PALETTE_PRESETS, SCRIPT_FONTS } from '@/templates/types';
import { Field, Input, Select, Switch } from '@/components/ui/Field';
import { buttonClass } from '@/components/ui/Button';
import { useAudioPlayer } from '@/lib/useAudioPlayer';
import { AudioUploader } from './Uploader';
import type { PanelProps } from './panel-types';

const ENVELOPES: { id: 'seal' | 'ribbon' | 'curtain' | 'none'; label: string; description: string }[] = [
  { id: 'seal', label: 'Wax seal', description: 'A seal breaks and the flap lifts' },
  { id: 'ribbon', label: 'Silk ribbon', description: 'A ribbon slips away, then the flap' },
  { id: 'curtain', label: 'Ivory curtains', description: 'Two panels part on the monogram' },
  { id: 'none', label: 'No theatre', description: 'Guests go straight to the invitation' },
];

export function DesignPanel({ data, templateId, update, setTemplateId }: PanelProps) {
  const palette: Partial<Palette> = data.theme.palette ?? {};
  const activeTemplate = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  const merged: Palette = { ...activeTemplate.palette, ...palette };

  const setPalette = (patch: Partial<Palette>, key: string) =>
    update({ theme: { ...data.theme, palette: { ...palette, ...patch } } }, key);

  const updateSettings = (patch: Partial<InvitationSettings>, key: string) =>
    update({ settings: { ...data.settings, ...patch } }, key);

  return (
    <div className="space-y-8">
      <section>
        <p className="eyebrow">Design direction</p>
        <h3 className="display mt-1.5 text-[1.6rem] text-ink">Choose the world you want</h3>
        <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted">
          Switching template keeps everything you have written and re-dresses it in the new design.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {TEMPLATES.map((template) => {
            const active = template.id === templateId;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setTemplateId(template.id)}
                aria-pressed={active}
                className={`relative overflow-hidden rounded-xl border p-3 text-left transition ${
                  active ? 'border-ink bg-paper shadow-sm' : 'border-line bg-paper/50 hover:border-gold/50'
                }`}
              >
                <span className="flex gap-1">
                  {[template.palette.bg, template.palette.accent, template.palette.deep].map((color) => (
                    <span key={color} className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: color }} />
                  ))}
                </span>
                <span className="mt-2 block font-display text-[1rem] leading-tight text-ink">{template.name}</span>
                <span className="block text-[0.6rem] leading-snug text-muted">{template.descriptor}</span>
                {active && (
                  <span className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-ink text-paper">
                    <Check size={10} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="border-t border-line/70 pt-7">
        <p className="eyebrow">Colour</p>
        <h3 className="display mt-1.5 text-[1.6rem] text-ink">Palette</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {PALETTE_PRESETS.map((preset) => {
            const active =
              preset.palette.bg === merged.bg &&
              preset.palette.accent === merged.accent &&
              preset.palette.ink === merged.ink;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  update(
                    { theme: { ...data.theme, palette: { ...preset.palette, ...palette, ...preset.palette } } },
                    `palette-${preset.id}`,
                  )
                }
                className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-[0.68rem] transition ${
                  active ? 'border-ink/50 bg-paper text-ink' : 'border-line text-muted hover:border-gold/50'
                }`}
                aria-pressed={active}
              >
                <span
                  className="h-6 w-6 rounded-full ring-1 ring-black/10"
                  style={{
                    background: `conic-gradient(${preset.palette.bg} 0 40%, ${preset.palette.accent} 40% 70%, ${preset.palette.deep} 70% 100%)`,
                  }}
                />
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {(
            [
              ['bg', 'Background'],
              ['accent', 'Accent'],
              ['ink', 'Text'],
            ] as [keyof Palette, string][]
          ).map(([key, label]) => (
            <div key={key}>
              <p className="label">
                <span>{label}</span>
              </p>
              <input
                type="color"
                value={merged[key]}
                onChange={(event) => setPalette({ [key]: event.target.value } as Partial<Palette>, `color-${key}`)}
                aria-label={`${label} colour`}
              />
            </div>
          ))}
        </div>
        {Object.keys(palette).length > 1 && (
          <button
            type="button"
            onClick={() => update({ theme: { ...data.theme, palette: {} } })}
            className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted transition hover:text-ink"
          >
            Reset to {activeTemplate.name} colours
          </button>
        )}
      </section>

      <section className="border-t border-line/70 pt-7">
        <p className="eyebrow">Typography</p>
        <h3 className="display mt-1.5 text-[1.6rem] text-ink">Type pairing</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Headings" htmlFor="font-pair">
            <Select
              id="font-pair"
              value={data.theme.fontPair ?? ''}
              onChange={(event) =>
                update({ theme: { ...data.theme, fontPair: event.target.value } }, 'font-pair')
              }
            >
              <option value="">{activeTemplate.name} default</option>
              {FONT_PAIRS.map((pair) => (
                <option key={pair.id} value={pair.id}>
                  {pair.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Script accents" htmlFor="script-font">
            <Select
              id="script-font"
              value={data.theme.scriptFont ?? ''}
              onChange={(event) =>
                update({ theme: { ...data.theme, scriptFont: event.target.value } }, 'script-font')
              }
            >
              <option value="">{activeTemplate.name} default</option>
              {SCRIPT_FONTS.map((script) => (
                <option key={script.id} value={script.id}>
                  {script.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="mt-4 space-y-2">
          <Field label="Monogram treatment" htmlFor="monogram-style">
            <Select
              id="monogram-style"
              value={data.settings.monogramStyle}
              onChange={(event) =>
                updateSettings({ monogramStyle: event.target.value as 'serif' | 'script' | 'circle' }, 'monogram')
              }
            >
              <option value="script">Handwritten script</option>
              <option value="serif">Serif initials</option>
              <option value="circle">Sealed in a circle</option>
            </Select>
          </Field>
        </div>
      </section>

      <section className="border-t border-line/70 pt-7">
        <p className="eyebrow">The cover</p>
        <h3 className="display mt-1.5 text-[1.6rem] text-ink">How it opens</h3>
        <div className="mt-4 grid gap-2">
          {ENVELOPES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => updateSettings({ envelopeAnimation: option.id }, 'envelope')}
              aria-pressed={data.settings.envelopeAnimation === option.id}
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                data.settings.envelopeAnimation === option.id
                  ? 'border-ink/40 bg-paper text-ink'
                  : 'border-line bg-paper/50 text-ink-soft hover:border-gold/50'
              }`}
            >
              <span>
                <span className="block text-[0.82rem] font-medium">{option.label}</span>
                <span className="block text-[0.72rem] text-muted">{option.description}</span>
              </span>
              {data.settings.envelopeAnimation === option.id && <Check size={14} className="text-gold" />}
            </button>
          ))}
          {data.settings.envelopeAnimation === 'none' && (
            <p className="hint">Guests land directly on the invitation — recommended when you share it widely.</p>
          )}
        </div>

        <p className="mt-5 max-w-md text-[0.78rem] leading-relaxed text-muted">
          The cover is set entirely in type — your names, a monogram, a hairline rule and the drawn
          artwork of the template you chose. No photograph, nothing to crop, nothing that dates.
        </p>
      </section>
    </div>
  );
}

export function SectionsPanel({ data, update, updateSettings }: PanelProps) {
  const order = data.settings.sectionsOrder;
  const hidden = new Set(data.settings.hiddenSections);

  const move = (index: number, direction: -1 | 1) => {
    const next = [...order];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    updateSettings({ sectionsOrder: next }, `move-${index}`);
  };

  const toggle = (section: SectionId) => {
    const next = new Set(hidden);
    if (next.has(section)) next.delete(section);
    else next.add(section);
    updateSettings({ hiddenSections: [...next] });
  };

  return (
    <div className="space-y-8">
      <section>
        <p className="eyebrow">Structure</p>
        <h3 className="display mt-1.5 text-[1.6rem] text-ink">What guests see, in what order</h3>
        <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted">
          Reorder or hide any section. An invitation with fewer, better sections always reads better.
        </p>
        <ul className="mt-4 space-y-2">
          {order.map((section, index) => {
            const meta = SECTION_LABELS[section];
            const isHidden = hidden.has(section);
            return (
              <li
                key={section}
                className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition ${
                  isHidden ? 'border-line/60 bg-paper/40 opacity-60' : 'border-line bg-paper'
                }`}
              >
                <span className="flex flex-none flex-col">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    className="text-muted transition hover:text-ink disabled:opacity-30"
                    disabled={index === 0}
                    aria-label={`Move ${meta.label} up`}
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    className="text-muted transition hover:text-ink disabled:opacity-30"
                    disabled={index === order.length - 1}
                    aria-label={`Move ${meta.label} down`}
                  >
                    <ChevronDown size={14} />
                  </button>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.82rem] font-medium text-ink">{meta.label}</span>
                  <span className="block text-[0.72rem] text-muted">{meta.hint}</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggle(section)}
                  className="icon-btn !h-8 !w-8 flex-none"
                  aria-label={isHidden ? `Show ${meta.label}` : `Hide ${meta.label}`}
                  aria-pressed={!isHidden}
                >
                  {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-t border-line/70 pt-7">
        <p className="eyebrow">Behaviour</p>
        <h3 className="display mt-1.5 text-[1.6rem] text-ink">Details that matter</h3>
        <div className="mt-4 space-y-2.5">
          <Switch
            checked={data.settings.countdown}
            onChange={(value) => updateSettings({ countdown: value })}
            label="Show a live countdown"
            description="Counts down to the first ceremony on the schedule."
          />
          <Switch
            checked={data.settings.messagesEnabled}
            onChange={(value) => updateSettings({ messagesEnabled: value })}
            label="Allow blessings from guests"
            description="A wall of notes and well-wishes, moderated by you."
          />
          <Switch
            checked={data.settings.albumEnabled}
            onChange={(value) => updateSettings({ albumEnabled: value })}
            label="Collect guest photographs"
            description="Guests can upload from the invitation or a QR code at the venue."
          />
          {data.settings.albumEnabled && (
            <Switch
              checked={data.settings.albumPublic}
              onChange={(value) => updateSettings({ albumPublic: value })}
              label="Album accepts uploads now"
              description="Turn this off after the wedding to keep the album read-only."
            />
          )}
          <Switch
            checked={data.settings.showGuestName}
            onChange={(value) => updateSettings({ showGuestName: value })}
            label="Address guests by name"
            description="Their household name appears on the envelope and hero."
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Invitation language" htmlFor="language" hint="Interface wording for guests">
            <Select
              id="language"
              value={data.settings.language}
              onChange={(event) =>
                updateSettings({ language: event.target.value as 'en' | 'hi' | 'fr' | 'it' })
              }
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="it">Italiano</option>
              <option value="hi">हिन्दी</option>
            </Select>
          </Field>
          <Field label="Hashtag" htmlFor="hashtag" optional>
            <Input
              id="hashtag"
              value={data.hashtag}
              onChange={(event) => update({ hashtag: event.target.value }, 'hashtag')}
              placeholder="#ClaraAndJulien"
              maxLength={60}
            />
          </Field>
        </div>
      </section>
    </div>
  );
}

function TrackRow({
  track,
  selected,
  onSelect,
}: {
  track: (typeof BUILT_IN_TRACKS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const [previewing, setPreviewing] = useState(false);
  const player = useAudioPlayer(previewing ? track.src : null, { loop: false, volume: 0.6 });

  useEffect(() => {
    if (previewing) {
      void player.play().then((ok) => {
        if (!ok) setPreviewing(false);
      });
    }
  }, [previewing, player]);

  useEffect(() => {
    if (previewing && !player.playing && player.time > 0 && player.time >= player.duration) {
      setPreviewing(false);
    }
  }, [player.duration, player.playing, player.time, previewing]);

  return (
    <li
      className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition ${
        selected ? 'border-ink/40 bg-paper' : 'border-line bg-paper/50'
      }`}
    >
      <button
        type="button"
        onClick={() => {
          if (previewing) {
            player.pause();
            setPreviewing(false);
          } else {
            setPreviewing(true);
          }
        }}
        className="icon-btn !h-9 !w-9 flex-none"
        aria-label={previewing ? `Pause ${track.title}` : `Preview ${track.title}`}
      >
        {previewing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.82rem] font-medium text-ink">{track.title}</span>
        <span className="block truncate text-[0.7rem] text-muted">{track.mood}</span>
      </span>
      <button
        type="button"
        onClick={onSelect}
        className={selected ? 'pill pill-dark' : 'pill pill-neutral'}
        aria-pressed={selected}
      >
        {selected ? 'Selected' : 'Choose'}
      </button>
    </li>
  );
}

export function MusicPanel({ invitation, data, update }: PanelProps) {
  const music = data.music;
  const setMusic = (patch: Partial<MusicSettings>, key?: string) =>
    update({ music: { ...music, ...patch } }, key);

  return (
    <div className="space-y-8">
      <section>
        <p className="eyebrow">The soundtrack</p>
        <h3 className="display mt-1.5 text-[1.6rem] text-ink">Music for the moment it opens</h3>
        <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted">
          Every recording below was composed for Vellum, so there are no licences to worry about.
        </p>
        <div className="mt-4 space-y-2.5">
          <Switch
            checked={music.enabled}
            onChange={(value) => setMusic({ enabled: value })}
            label="Include music"
            description="Guests still choose to start it — browsers never allow sound before a tap."
          />
          {music.enabled && (
            <Switch
              checked={music.startOnOpen}
              onChange={(value) => setMusic({ startOnOpen: value })}
              label="Begin when the envelope opens"
              description="Starts with the opening gesture. Turn off to let guests press play themselves."
            />
          )}
        </div>
      </section>

      {music.enabled && (
        <>
          <section className="border-t border-line/70 pt-7">
            <p className="eyebrow">Included recordings</p>
            <ul className="mt-4 space-y-2.5">
              {BUILT_IN_TRACKS.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  selected={!music.customSrc && music.trackId === track.id}
                  onSelect={() =>
                    setMusic({ trackId: track.id, customSrc: null, title: track.title, artist: track.artist })
                  }
                />
              ))}
            </ul>
          </section>

          <section className="border-t border-line/70 pt-7">
            <p className="eyebrow">Or your own</p>
            <div className="mt-4">
              <AudioUploader
                invitationId={invitation.id}
                value={music.customSrc}
                onChange={(url, name) =>
                  setMusic({
                    customSrc: url,
                    trackId: url ? null : (music.trackId ?? 'golden-hour'),
                    title: url ? name || 'Our song' : music.title,
                    artist: url ? '' : music.artist,
                  })
                }
                onMeta={(title, artist) => setMusic({ title, artist })}
              />
              <p className="hint">
                Please only upload music you have the right to use — a live recording, a friend’s
                composition, or something you own.
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Track title" htmlFor="music-title">
                <Input
                  id="music-title"
                  value={music.title}
                  onChange={(event) => setMusic({ title: event.target.value }, 'music-title')}
                  placeholder="Our song"
                  maxLength={80}
                />
              </Field>
              <Field label="Artist" htmlFor="music-artist" optional>
                <Input
                  id="music-artist"
                  value={music.artist}
                  onChange={(event) => setMusic({ artist: event.target.value }, 'music-artist')}
                  placeholder="The Vellum Ensemble"
                  maxLength={80}
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Player style" htmlFor="music-style">
                <Select
                  id="music-style"
                  value={music.style}
                  onChange={(event) => setMusic({ style: event.target.value as MusicSettings['style'] })}
                >
                  <option value="pill">Compact pill (recommended)</option>
                  <option value="minimal">Minimal — play button only</option>
                  <option value="disc">Disc with track details</option>
                </Select>
              </Field>
            </div>
          </section>
        </>
      )}

      {!music.enabled && (
        <p className="rounded-xl border border-line bg-paper/60 px-4 py-3 text-[0.8rem] text-muted">
          The invitation will be silent, with no player shown to guests.
        </p>
      )}

      {music.enabled && music.customSrc && (
        <p className="text-[0.72rem] text-muted">
          Using your uploaded recording. Guests will hear it after they open the envelope.
        </p>
      )}

      <div className="border-t border-line/70 pt-6">
        <a href="/#music" target="_blank" rel="noreferrer" className={buttonClass('outline', 'sm')}>
          Listen to the collection
        </a>
      </div>
    </div>
  );
}
