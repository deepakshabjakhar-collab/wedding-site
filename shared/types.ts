/** Shared domain model used by both the API and the React client. */

export type SectionId =
  | 'welcome'
  | 'story'
  | 'countdown'
  | 'schedule'
  | 'gallery'
  | 'details'
  | 'rsvp'
  | 'messages'
  | 'album'
  | 'closing';

export const SECTION_LABELS: Record<SectionId, { label: string; hint: string }> = {
  welcome: { label: 'Welcome note', hint: 'A short, warm greeting for your guests' },
  story: { label: 'Your story', hint: 'Chapters of how you came to be here' },
  countdown: { label: 'Countdown', hint: 'A live countdown to the first ceremony' },
  schedule: { label: 'Celebrations', hint: 'Every ceremony, in order' },
  gallery: { label: 'Gallery', hint: 'Portraits and moments, with a full-screen viewer' },
  details: { label: 'Guest details', hint: 'Dress code, travel, stays and gifts' },
  rsvp: { label: 'RSVP', hint: 'Attendance, meals and accessibility' },
  messages: { label: 'Blessings', hint: 'A wall of notes from your guests' },
  album: { label: 'Shared album', hint: 'Guests upload photographs; you download them' },
  closing: { label: 'Closing', hint: 'A final thank-you and monogram' },
};

export interface Palette {
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  accentSoft: string;
  line: string;
  deep: string;
  deepInk: string;
}

export interface EventDetails {
  id: string;
  name: string;
  subtitle?: string;
  date: string; // ISO date (YYYY-MM-DD)
  startTime: string; // HH:mm
  endTime?: string;
  venue: string;
  address?: string;
  mapUrl?: string;
  description?: string;
  dressCode?: string;
  /** ids of guest groups / events available to everyone. empty = all guests */
  guestGroup?: string;
}

export interface StoryChapter {
  id: string;
  title: string;
  body: string;
  image?: string;
}

export interface GalleryItem {
  id: string;
  src: string;
  caption?: string;
  alt?: string;
}

export interface WeddingDetails {
  venue: string;
  address: string;
  mapUrl: string;
  dressCode: string;
  dressCodeNote: string;
  travel: string;
  accommodation: string;
  gifts: string;
  additionalTitle: string;
  additional: string;
}

export interface MusicSettings {
  trackId: string | null; // built-in track id
  customSrc: string | null; // uploaded file URL
  title: string;
  artist: string;
  enabled: boolean;
  startOnOpen: boolean;
  style: 'minimal' | 'pill' | 'disc';
}

export interface RsvpQuestions {
  meal: boolean;
  dietary: boolean;
  accessibility: boolean;
  children: boolean;
  songRequest: boolean;
}

export interface InvitationSettings {
  sectionsOrder: SectionId[];
  hiddenSections: SectionId[];
  countdown: boolean;
  rsvpDeadline: string | null; // ISO datetime
  questions: RsvpQuestions;
  mealOptions: string[];
  messagesEnabled: boolean;
  albumEnabled: boolean;
  albumPublic: boolean;
  allowPublicRsvp: boolean;
  visibility: 'public' | 'unlisted';
  envelopeAnimation: 'seal' | 'curtain' | 'ribbon' | 'none';
  showGuestName: boolean;
  language: 'en' | 'hi' | 'fr' | 'it';
  monogramStyle: 'serif' | 'script' | 'circle';
  shareTitle: string;
  shareDescription: string;
}

export interface ThemeOverrides {
  palette?: Partial<Palette>;
  fontPair?: string;
  scriptFont?: string;
}

export interface InvitationData {
  coupleA: string;
  coupleB: string;
  monogram: string;
  tagline: string;
  hashtag: string;
  weddingDate: string; // ISO date
  weddingTime: string;
  timeZone: string;
  location: string;
  welcomeHeading: string;
  welcomeNote: string;
  storyIntro: string;
  story: StoryChapter[];
  events: EventDetails[];
  gallery: GalleryItem[];
  music: MusicSettings;
  details: WeddingDetails;
  settings: InvitationSettings;
  theme: ThemeOverrides;
}

export interface InvitationRecord {
  id: string;
  userId: string;
  slug: string;
  templateId: string;
  status: 'draft' | 'published';
  data: InvitationData;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationSummary extends InvitationRecord {
  counts: {
    guests: number;
    attending: number;
    declined: number;
    pending: number;
    messages: number;
    photos: number;
  };
}

export interface GuestRecord {
  id: string;
  invitationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  groupName: string;
  token: string;
  partySize: number;
  invitedEventIds: string[];
  notes: string | null;
  tableId: string | null;
  createdAt: string;
  rsvp?: RsvpRecord | null;
}

export interface RsvpRecord {
  id: string;
  invitationId: string;
  guestId: string;
  attending: boolean;
  eventIds: string[];
  meal: string | null;
  dietary: string | null;
  accessibility: string | null;
  children: string | null;
  songRequest: string | null;
  note: string | null;
  updatedAt: string;
}

export interface GuestMessage {
  id: string;
  invitationId: string;
  guestId: string | null;
  author: string;
  text: string;
  createdAt: string;
  hidden: boolean;
}

export interface PhotoRecord {
  id: string;
  invitationId: string;
  guestId: string | null;
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
  uploadedBy: string;
  createdAt: string;
}

export interface SeatingTable {
  id: string;
  invitationId: string;
  name: string;
  capacity: number;
  x: number;
  y: number;
}

export interface PublicInvitationPayload {
  invitation: InvitationRecord;
  demo: boolean;
  personalization?: {
    guest: Pick<GuestRecord, 'id' | 'name' | 'partySize' | 'invitedEventIds' | 'groupName' | 'token'>;
    existingRsvp: RsvpRecord | null;
  } | null;
  messages: Pick<GuestMessage, 'id' | 'author' | 'text' | 'createdAt'>[];
  photos: PhotoRecord[];
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  plan: string;
}

/** A loosely validated guest RSVP submission. */
export interface RsvpSubmission {
  attending: boolean;
  eventIds: string[];
  meal?: string;
  dietary?: string;
  accessibility?: string;
  children?: string;
  songRequest?: string;
  note?: string;
  name?: string;
  email?: string;
  token?: string;
}

export const EMPTY_PALETTE: Palette = {
  bg: '#f7f2e9',
  surface: '#fffdf8',
  ink: '#241f1a',
  muted: '#76695c',
  accent: '#a97c50',
  accentSoft: '#e8d7c1',
  line: '#d9cbb8',
  deep: '#2a2119',
  deepInk: '#f7f0e4',
};

export function sectionOrder(data: InvitationData): SectionId[] {
  const base = data.settings.sectionsOrder?.length
    ? data.settings.sectionsOrder
    : (Object.keys(SECTION_LABELS) as SectionId[]);
  return base.filter((s) => !data.settings.hiddenSections.includes(s));
}

export function primaryEvent(data: InvitationData): EventDetails | undefined {
  return [...data.events].sort((a, b) => a.date.localeCompare(b.date))[0];
}

export function fullNames(data: InvitationData): string {
  return `${data.coupleA} & ${data.coupleB}`;
}
