import { createInvitationData, TEMPLATE_IDS } from '../shared/defaults.ts';
import { EMPTY_PALETTE } from '../shared/types.ts';
import type {
  EventDetails,
  GalleryItem,
  InvitationData,
  Palette,
  SectionId,
  StoryChapter,
} from '../shared/types.ts';
import { SECTION_LABELS } from '../shared/types.ts';

const SECTION_IDS = Object.keys(SECTION_LABELS) as SectionId[];

export function str(value: unknown, max = 200, allowNewlines = false): string {
  if (typeof value !== 'string') return '';
  let out = value.replace(allowNewlines ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g : /[\u0000-\u001f]/g, '');
  out = out.trim();
  return out.slice(0, max);
}

export function safeUrl(value: unknown, kind: 'image' | 'link' | 'audio' = 'link'): string {
  const raw = str(value, 800);
  if (!raw) return '';
  if (raw.startsWith('/uploads/') || raw.startsWith('/media/')) return raw;
  if (raw.startsWith('https://')) {
    try {
      const url = new URL(raw);
      if (url.protocol !== 'https:') return '';
      return url.toString();
    } catch {
      return '';
    }
  }
  if (kind === 'link' && raw.startsWith('http://')) {
    try {
      const url = new URL(raw);
      return url.protocol === 'http:' ? url.toString() : '';
    } catch {
      return '';
    }
  }
  return '';
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function isoDate(value: unknown, fallback = ''): string {
  const raw = str(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : fallback;
}

function isoDateTime(value: unknown): string | null {
  const raw = str(value, 40);
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function clock(value: unknown, fallback = ''): string {
  const raw = str(value, 5);
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(raw) ? raw : fallback;
}

export function sanitizePalette(input: unknown): Partial<Palette> {
  const p = (input ?? {}) as Record<string, unknown>;
  const out: Partial<Palette> = {};
  for (const key of Object.keys(EMPTY_PALETTE) as (keyof Palette)[]) {
    const value = p[key];
    if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) out[key] = value;
  }
  return out;
}

function sanitizeEvents(input: unknown): EventDetails[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 14).map((raw, i) => {
    const e = (raw ?? {}) as Record<string, unknown>;
    return {
      id: str(e.id, 40) || `event-${i + 1}-${Date.now()}`,
      name: str(e.name, 100) || 'Celebration',
      subtitle: str(e.subtitle, 120),
      date: isoDate(e.date),
      startTime: clock(e.startTime, '16:00'),
      endTime: clock(e.endTime),
      venue: str(e.venue, 140),
      address: str(e.address, 240),
      mapUrl: safeUrl(e.mapUrl),
      description: str(e.description, 700, true),
      dressCode: str(e.dressCode, 160),
      guestGroup: str(e.guestGroup, 60),
    };
  });
}

function sanitizeStory(input: unknown): StoryChapter[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 8).map((raw, i) => {
    const s = (raw ?? {}) as Record<string, unknown>;
    return {
      id: str(s.id, 40) || `chapter-${i + 1}`,
      title: str(s.title, 120),
      body: str(s.body, 1500, true),
      image: safeUrl(s.image, 'image'),
    };
  });
}

function sanitizeGallery(input: unknown): GalleryItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, 30)
    .map((raw, i) => {
      const g = (raw ?? {}) as Record<string, unknown>;
      return {
        id: str(g.id, 40) || `image-${i + 1}`,
        src: safeUrl(g.src, 'image'),
        caption: str(g.caption, 160),
        alt: str(g.alt, 200),
      };
    })
    .filter((g) => g.src);
}

/** Merge arbitrary client JSON onto a known-good invitation, clamping every field. */
export function sanitizeInvitationData(input: unknown, templateId: string): InvitationData {
  const raw = (input ?? {}) as Record<string, unknown>;
  const base = createInvitationData(templateId);
  const settings = (raw.settings ?? {}) as Record<string, unknown>;
  const questions = (settings.questions ?? {}) as Record<string, unknown>;
  const details = (raw.details ?? {}) as Record<string, unknown>;
  const music = (raw.music ?? {}) as Record<string, unknown>;
  const theme = (raw.theme ?? {}) as Record<string, unknown>;
  const palette = sanitizePalette(theme.palette);

  const requestedOrder = Array.isArray(settings.sectionsOrder)
    ? settings.sectionsOrder.filter((s): s is SectionId => SECTION_IDS.includes(s as SectionId))
    : base.settings.sectionsOrder;
  const order = [...new Set([...requestedOrder, ...SECTION_IDS])];
  const hidden = Array.isArray(settings.hiddenSections)
    ? settings.hiddenSections.filter((s): s is SectionId => SECTION_IDS.includes(s as SectionId))
    : base.settings.hiddenSections;

  const mealOptions = Array.isArray(settings.mealOptions)
    ? settings.mealOptions.map((m) => str(m, 60)).filter(Boolean).slice(0, 8)
    : base.settings.mealOptions;

  if (!TEMPLATE_IDS.includes(templateId as never)) templateId = 'aurelia';

  return {
    coupleA: str(raw.coupleA, 60) || base.coupleA,
    coupleB: str(raw.coupleB, 60) || base.coupleB,
    monogram: str(raw.monogram, 16) || base.monogram,
    tagline: str(raw.tagline, 160),
    hashtag: str(raw.hashtag, 60),
    weddingDate: isoDate(raw.weddingDate, base.weddingDate),
    weddingTime: clock(raw.weddingTime, base.weddingTime),
    timeZone: str(raw.timeZone, 60) || base.timeZone,
    location: str(raw.location, 160),
    welcomeHeading: str(raw.welcomeHeading, 120),
    welcomeNote: str(raw.welcomeNote, 1200, true),
    storyIntro: str(raw.storyIntro, 400, true),
    story: sanitizeStory(raw.story),
    events: sanitizeEvents(raw.events),
    gallery: sanitizeGallery(raw.gallery),
    music: {
      trackId: str(music.trackId, 40) || null,
      customSrc: safeUrl(music.customSrc, 'audio') || null,
      title: str(music.title, 80) || 'Our song',
      artist: str(music.artist, 80),
      enabled: bool(music.enabled, true),
      startOnOpen: bool(music.startOnOpen, true),
      style: ['minimal', 'pill', 'disc'].includes(String(music.style))
        ? (music.style as 'minimal' | 'pill' | 'disc')
        : 'pill',
    },
    details: {
      venue: str(details.venue, 160),
      address: str(details.address, 300),
      mapUrl: safeUrl(details.mapUrl),
      dressCode: str(details.dressCode, 160),
      dressCodeNote: str(details.dressCodeNote, 600, true),
      travel: str(details.travel, 900, true),
      accommodation: str(details.accommodation, 900, true),
      gifts: str(details.gifts, 700, true),
      additionalTitle: str(details.additionalTitle, 120),
      additional: str(details.additional, 900, true),
    },
    settings: {
      sectionsOrder: order as SectionId[],
      hiddenSections: hidden,
      countdown: bool(settings.countdown, true),
      rsvpDeadline: isoDateTime(settings.rsvpDeadline),
      questions: {
        meal: bool(questions.meal, true),
        dietary: bool(questions.dietary, true),
        accessibility: bool(questions.accessibility, true),
        children: bool(questions.children, true),
        songRequest: bool(questions.songRequest, true),
      },
      mealOptions: mealOptions.length ? mealOptions : base.settings.mealOptions,
      messagesEnabled: bool(settings.messagesEnabled, true),
      albumEnabled: bool(settings.albumEnabled, true),
      albumPublic: bool(settings.albumPublic, true),
      allowPublicRsvp: bool(settings.allowPublicRsvp, true),
      visibility: settings.visibility === 'unlisted' ? 'unlisted' : 'public',
      envelopeAnimation: (['seal', 'curtain', 'ribbon', 'none'] as const).includes(
        settings.envelopeAnimation as never,
      )
        ? (settings.envelopeAnimation as 'seal' | 'curtain' | 'ribbon' | 'none')
        : 'seal',
      showGuestName: bool(settings.showGuestName, true),
      language: (['en', 'hi', 'fr', 'it'] as const).includes(settings.language as never)
        ? (settings.language as 'en' | 'hi' | 'fr' | 'it')
        : 'en',
      monogramStyle: (['serif', 'script', 'circle'] as const).includes(
        settings.monogramStyle as never,
      )
        ? (settings.monogramStyle as 'serif' | 'script' | 'circle')
        : 'script',
      shareTitle: str(settings.shareTitle, 120),
      shareDescription: str(settings.shareDescription, 220),
    },
    theme: {
      palette,
      fontPair: str(theme.fontPair, 40),
      scriptFont: str(theme.scriptFont, 40),
    },
  };
}

export function sanitizeGuestInput(input: unknown) {
  const raw = (input ?? {}) as Record<string, unknown>;
  return {
    name: str(raw.name, 120),
    email: str(raw.email, 160),
    phone: str(raw.phone, 60),
    groupName: str(raw.groupName, 60) || 'Friends',
    partySize: Math.min(12, Math.max(1, Number(raw.partySize) || 1)),
    invitedEventIds: Array.isArray(raw.invitedEventIds)
      ? raw.invitedEventIds.map((id) => str(id, 40)).filter(Boolean).slice(0, 20)
      : [],
    notes: str(raw.notes, 600, true),
  };
}

export function sanitizeRsvp(input: unknown) {
  const raw = (input ?? {}) as Record<string, unknown>;
  return {
    attending: raw.attending === true || raw.attending === 'yes',
    eventIds: Array.isArray(raw.eventIds)
      ? raw.eventIds.map((e) => str(e, 40)).filter(Boolean).slice(0, 20)
      : [],
    meal: str(raw.meal, 80),
    dietary: str(raw.dietary, 500, true),
    accessibility: str(raw.accessibility, 500, true),
    children: str(raw.children, 300, true),
    songRequest: str(raw.songRequest, 160),
    note: str(raw.note, 800, true),
    name: str(raw.name, 120),
    email: str(raw.email, 160),
    token: str(raw.token, 80),
  };
}
