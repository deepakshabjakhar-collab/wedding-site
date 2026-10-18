import { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CalendarPlus,
  Copy,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import type { EventDetails, GalleryItem, StoryChapter } from '@shared/types';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';
import type { PanelProps } from './panel-types';

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

export function ContentPanel({ data, update }: PanelProps) {
  return (
    <div className="space-y-8">
      <section>
        <p className="eyebrow">The two of you</p>
        <h3 className="display mt-1.5 text-[1.6rem] text-ink">Names &amp; wording</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="couple-a">
            <Input
              id="couple-a"
              value={data.coupleA}
              onChange={(event) => update({ coupleA: event.target.value }, 'coupleA')}
              maxLength={60}
            />
          </Field>
          <Field label="Second name" htmlFor="couple-b">
            <Input
              id="couple-b"
              value={data.coupleB}
              onChange={(event) => update({ coupleB: event.target.value }, 'coupleB')}
              maxLength={60}
            />
          </Field>
          <Field label="Monogram" htmlFor="monogram" hint="Used on the seal, the cover and the closing">
            <Input
              id="monogram"
              value={data.monogram}
              onChange={(event) => update({ monogram: event.target.value }, 'monogram')}
              maxLength={16}
            />
          </Field>
          <Field label="Tagline" htmlFor="tagline" optional>
            <Input
              id="tagline"
              value={data.tagline}
              onChange={(event) => update({ tagline: event.target.value }, 'tagline')}
              maxLength={160}
              placeholder="Two families, one endless celebration"
            />
          </Field>
        </div>
      </section>

      <section className="border-t border-line/70 pt-7">
        <p className="eyebrow">The day</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Wedding date" htmlFor="wedding-date">
            <Input
              id="wedding-date"
              type="date"
              value={data.weddingDate}
              onChange={(event) => update({ weddingDate: event.target.value }, 'date')}
            />
          </Field>
          <Field label="Ceremony time" htmlFor="wedding-time">
            <Input
              id="wedding-time"
              type="time"
              value={data.weddingTime}
              onChange={(event) => update({ weddingTime: event.target.value }, 'time')}
            />
          </Field>
          <Field label="Time zone" htmlFor="timezone">
            <Select
              id="timezone"
              value={data.timeZone}
              onChange={(event) => update({ timeZone: event.target.value }, 'timezone')}
            >
              {[...new Set([data.timeZone, ...TIME_ZONES])].filter(Boolean).map((zone) => (
                <option key={zone} value={zone}>
                  {zone.replace(/_/g, ' ')}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Location line" htmlFor="location" hint="Shown under your names on the cover">
            <Input
              id="location"
              value={data.location}
              onChange={(event) => update({ location: event.target.value }, 'location')}
              maxLength={160}
            />
          </Field>
        </div>
      </section>

      <section className="border-t border-line/70 pt-7">
        <p className="eyebrow">Welcome</p>
        <h3 className="display mt-1.5 text-[1.6rem] text-ink">The first words they read</h3>
        <div className="mt-4 space-y-4">
          <Field label="Heading" htmlFor="welcome-heading">
            <Input
              id="welcome-heading"
              value={data.welcomeHeading}
              onChange={(event) => update({ welcomeHeading: event.target.value }, 'welcome-head')}
              maxLength={120}
              placeholder="Together with our families"
            />
          </Field>
          <Field
            label="Welcome note"
            htmlFor="welcome-note"
            hint={`${data.welcomeNote.length}/1200 characters`}
          >
            <Textarea
              id="welcome-note"
              className="textarea-tall"
              value={data.welcomeNote}
              onChange={(event) => update({ welcomeNote: event.target.value }, 'welcome-note')}
              maxLength={1200}
            />
          </Field>
        </div>
      </section>
    </div>
  );
}

function newEvent(index: number): EventDetails {
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

export function EventsPanel({ data, update }: PanelProps) {
  const events = data.events;
  const setEvents = (next: EventDetails[], key?: string) => update({ events: next }, key);

  const patch = (id: string, fields: Partial<EventDetails>, key: string) =>
    setEvents(
      events.map((event) => (event.id === id ? { ...event, ...fields } : event)),
      key,
    );

  const move = (index: number, direction: -1 | 1) => {
    const next = [...events];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setEvents(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Ceremonies</p>
        <h3 className="display mt-1.5 text-[1.6rem] text-ink">Every celebration, on its own card</h3>
        <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted">
          Mehendi, haldi, sangeet, wedding, reception — or a ceremony, a lunch and a party. Each one
          can be shown to selected guests only.
        </p>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <article key={event.id} className="rounded-xl border border-line bg-paper p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-ivory text-[0.7rem] font-semibold text-muted">
                  {index + 1}
                </span>
                <span className="text-[0.8rem] font-medium text-ink">{event.name || 'Untitled celebration'}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="icon-btn !h-8 !w-8"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move celebration up"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  className="icon-btn !h-8 !w-8"
                  onClick={() => move(index, 1)}
                  disabled={index === events.length - 1}
                  aria-label="Move celebration down"
                >
                  <ArrowDown size={13} />
                </button>
                <button
                  type="button"
                  className="icon-btn !h-8 !w-8"
                  onClick={() => setEvents([...events, { ...event, id: `event-${Date.now()}`, name: `${event.name} (copy)` }])}
                  aria-label="Duplicate celebration"
                >
                  <Copy size={13} />
                </button>
                <button
                  type="button"
                  className="icon-btn !h-8 !w-8"
                  onClick={() => setEvents(events.filter((item) => item.id !== event.id))}
                  aria-label="Remove celebration"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Name" htmlFor={`event-name-${event.id}`}>
                <Input
                  id={`event-name-${event.id}`}
                  value={event.name}
                  onChange={(input) => patch(event.id, { name: input.target.value }, `ev-name-${event.id}`)}
                  maxLength={100}
                />
              </Field>
              <Field label="Sub-line" htmlFor={`event-sub-${event.id}`} optional>
                <Input
                  id={`event-sub-${event.id}`}
                  value={event.subtitle ?? ''}
                  onChange={(input) => patch(event.id, { subtitle: input.target.value }, `ev-sub-${event.id}`)}
                  placeholder="Henna, chai and old Bollywood songs"
                  maxLength={120}
                />
              </Field>
              <Field label="Date" htmlFor={`event-date-${event.id}`}>
                <Input
                  id={`event-date-${event.id}`}
                  type="date"
                  value={event.date}
                  onChange={(input) => patch(event.id, { date: input.target.value }, `ev-date-${event.id}`)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Starts" htmlFor={`event-start-${event.id}`}>
                  <Input
                    id={`event-start-${event.id}`}
                    type="time"
                    value={event.startTime}
                    onChange={(input) => patch(event.id, { startTime: input.target.value }, `ev-start-${event.id}`)}
                  />
                </Field>
                <Field label="Ends" htmlFor={`event-end-${event.id}`} optional>
                  <Input
                    id={`event-end-${event.id}`}
                    type="time"
                    value={event.endTime ?? ''}
                    onChange={(input) => patch(event.id, { endTime: input.target.value }, `ev-end-${event.id}`)}
                  />
                </Field>
              </div>
              <Field label="Venue" htmlFor={`event-venue-${event.id}`}>
                <Input
                  id={`event-venue-${event.id}`}
                  value={event.venue}
                  onChange={(input) => patch(event.id, { venue: input.target.value }, `ev-venue-${event.id}`)}
                  maxLength={140}
                />
              </Field>
              <Field label="Address" htmlFor={`event-address-${event.id}`}>
                <Input
                  id={`event-address-${event.id}`}
                  value={event.address ?? ''}
                  onChange={(input) => patch(event.id, { address: input.target.value }, `ev-address-${event.id}`)}
                  maxLength={240}
                />
              </Field>
              <Field label="Map link" htmlFor={`event-map-${event.id}`} optional>
                <Input
                  id={`event-map-${event.id}`}
                  value={event.mapUrl ?? ''}
                  onChange={(input) => patch(event.id, { mapUrl: input.target.value }, `ev-map-${event.id}`)}
                  placeholder="https://maps.google.com/?q=…"
                />
              </Field>
              <Field label="Dress code" htmlFor={`event-dress-${event.id}`} optional>
                <Input
                  id={`event-dress-${event.id}`}
                  value={event.dressCode ?? ''}
                  onChange={(input) => patch(event.id, { dressCode: input.target.value }, `ev-dress-${event.id}`)}
                  placeholder="Jewel tones"
                  maxLength={160}
                />
              </Field>
              <Field label="Reserved for group" htmlFor={`event-group-${event.id}`} optional hint="Used to pre-select events when you add guests in bulk">
                <Input
                  id={`event-group-${event.id}`}
                  value={event.guestGroup ?? ''}
                  onChange={(input) => patch(event.id, { guestGroup: input.target.value }, `ev-group-${event.id}`)}
                  placeholder="Family, Colleagues…"
                  maxLength={60}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description" htmlFor={`event-desc-${event.id}`} optional>
                  <Textarea
                    id={`event-desc-${event.id}`}
                    value={event.description ?? ''}
                    onChange={(input) => patch(event.id, { description: input.target.value }, `ev-desc-${event.id}`)}
                    maxLength={700}
                    placeholder="Please be seated by 16:15. Champagne follows in the orangery."
                  />
                </Field>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={() => setEvents([...events, newEvent(events.length)])}
        icon={<CalendarPlus size={14} />}
      >
        Add a celebration
      </Button>
      {events.length > 5 && (
        <p className="hint">
          Five or more ceremonies make the schedule feel long on a phone. Consider grouping small
          moments into one card.
        </p>
      )}
    </div>
  );
}

export function StoryPanel({ invitation, data, update }: PanelProps) {
  const story = data.story;
  const setStory = (next: StoryChapter[], key?: string) => update({ story: next }, key);
  const [busyId, setBusyId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFor = async (chapterId: string, file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setBusyId(chapterId);
    try {
      const result = await api.invitations.uploadImage(invitation.id, file);
      setStory(story.map((chapter) => (chapter.id === chapterId ? { ...chapter, image: result.url } : chapter)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'The image could not be uploaded.');
    } finally {
      setBusyId(null);
    }
  };

  const patch = (id: string, fields: Partial<StoryChapter>, key: string) =>
    setStory(story.map((chapter) => (chapter.id === id ? { ...chapter, ...fields } : chapter)), key);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Your story</p>
        <h3 className="display mt-1.5 text-[1.6rem] text-ink">How you got here</h3>
        <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted">
          Two or three honest chapters are perfect. Write like you talk, not like a brochure.
        </p>
      </div>

      <Field label="Introduction" htmlFor="story-intro" optional>
        <Textarea
          id="story-intro"
          value={data.storyIntro}
          onChange={(event) => update({ storyIntro: event.target.value }, 'story-intro')}
          maxLength={400}
          placeholder="A few chapters from the road that brought us here."
        />
      </Field>

      <div className="space-y-4">
        {story.map((chapter, index) => (
          <article key={chapter.id} className="rounded-xl border border-line bg-paper p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Chapter {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="icon-btn !h-8 !w-8"
                  onClick={() => {
                    const next = [...story];
                    const target = index - 1;
                    if (target < 0) return;
                    [next[index], next[target]] = [next[target], next[index]];
                    setStory(next);
                  }}
                  disabled={index === 0}
                  aria-label="Move chapter up"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  className="icon-btn !h-8 !w-8"
                  onClick={() => setStory(story.filter((item) => item.id !== chapter.id))}
                  aria-label="Remove chapter"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                <Field label="Chapter title" htmlFor={`chapter-title-${chapter.id}`}>
                  <Input
                    id={`chapter-title-${chapter.id}`}
                    value={chapter.title}
                    onChange={(event) => patch(chapter.id, { title: event.target.value }, `ch-title-${chapter.id}`)}
                    maxLength={120}
                  />
                </Field>
                <Field label="The story" htmlFor={`chapter-body-${chapter.id}`}>
                  <Textarea
                    id={`chapter-body-${chapter.id}`}
                    value={chapter.body}
                    onChange={(event) => patch(chapter.id, { body: event.target.value }, `ch-body-${chapter.id}`)}
                    maxLength={1500}
                  />
                </Field>
              </div>
              <div className="w-full sm:w-32">
                <p className="label">
                  <span>Image</span>
                </p>
                {chapter.image ? (
                  <div className="relative">
                    <img src={chapter.image} alt="" className="aspect-[4/5] w-full rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => patch(chapter.id, { image: '' }, `ch-img-${chapter.id}`)}
                      className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"
                      aria-label="Remove chapter image"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveChapter(chapter.id);
                      inputRef.current?.click();
                    }}
                    className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-gold/50 bg-gold/5 text-gold transition hover:bg-gold/10"
                  >
                    {busyId === chapter.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <ImagePlus size={16} />
                        <span className="text-[0.6rem] uppercase tracking-[0.1em]">Add image</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file && activeChapter) void uploadFor(activeChapter, file);
          event.target.value = '';
        }}
      />

      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}

      <Button
        variant="outline"
        icon={<Plus size={14} />}
        onClick={() =>
          setStory([
            ...story,
            { id: `chapter-${Date.now()}`, title: '', body: '', image: '' },
          ])
        }
      >
        Add a chapter
      </Button>
    </div>
  );
}

export function GalleryPanel({ invitation, data, update }: PanelProps) {
  const gallery = data.gallery;
  const setGallery = (next: GalleryItem[]) => update({ gallery: next });
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = async (files: FileList) => {
    setError(null);
    setBusy(true);
    const added: GalleryItem[] = [];
    try {
      for (const file of [...files].slice(0, 12)) {
        if (!file.type.startsWith('image/')) continue;
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
      if (added.length) setGallery([...gallery, ...added]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Some images could not be uploaded.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Gallery</p>
        <h3 className="display mt-1.5 text-[1.6rem] text-ink">A few frames, well chosen</h3>
        <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted">
          Six to ten photographs work best. Landscape and portrait can be mixed freely.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {gallery.map((item) => (
          <div key={item.id} className="rounded-xl border border-line bg-paper p-2">
            <div className="relative">
              <img src={item.src} alt={item.alt || ''} className="aspect-square w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setGallery(gallery.filter((entry) => entry.id !== item.id))}
                className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"
                aria-label="Remove photograph"
              >
                <Trash2 size={11} />
              </button>
            </div>
            <Input
              value={item.caption ?? ''}
              onChange={(event) =>
                setGallery(
                  gallery.map((entry) =>
                    entry.id === item.id ? { ...entry, caption: event.target.value } : entry,
                  ),
                )
              }
              placeholder="Caption"
              className="mt-2 !py-1.5 !text-[0.72rem]"
              aria-label="Photograph caption"
              maxLength={160}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gold/50 bg-gold/5 text-gold transition hover:bg-gold/10"
          disabled={busy}
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
          <span className="text-[0.62rem] uppercase tracking-[0.12em]">
            {busy ? 'Uploading' : 'Add photographs'}
          </span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) void uploadFiles(event.target.files);
          event.target.value = '';
        }}
      />

      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}

      <p className="rounded-xl border border-line bg-paper/60 px-4 py-3 text-[0.76rem] leading-relaxed text-muted">
        These become the &ldquo;Moments, so far&rdquo; section. After the wedding, guests can add
        their own photographs to the shared album in the dashboard.
      </p>
    </div>
  );
}
