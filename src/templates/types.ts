import type { Palette } from '@shared/types';

export type TemplateId =
  | 'aurelia'
  | 'maison'
  | 'belgrave'
  | 'celeste'
  | 'salento'
  | 'noir'
  | 'heirloom'
  | 'miel';

export type LayoutKind =
  | 'editorial'
  | 'garden'
  | 'georgian'
  | 'celestial'
  | 'coastal'
  | 'minimal'
  | 'vintage'
  | 'playful';

export interface TemplateArtDef {
  /** Portrait (768x1376) gatefold invitation cover shown before opening. */
  gate: string;
  /** Portrait full-bleed scene behind the names on the cover section. */
  hero: string;
  /** Colour of the table the invitation lies on. */
  gateBg: string;
  /** Text colour used on top of that table. */
  gateInk: string;
}

export interface TemplateDefinition {
  id: TemplateId;
  art: TemplateArtDef;
  name: string;
  descriptor: string;
  tagline: string;
  description: string;
  story: string;
  palette: Palette;
  display: string;
  body: string;
  script: string;
  scriptFamily: string;
  layout: LayoutKind;
  envelope: 'seal' | 'curtain' | 'ribbon';
  keywords: string[];
  monogramStyle: 'serif' | 'script' | 'circle';
  /** Optional rules that give the cover its particular voice. */
  cover: {
    ruleWidth: string;
    namesCase: 'upper' | 'title';
    tracking: string;
    flourish: 'none' | 'rule' | 'star' | 'sprig';
  };
}

export const FONT_STACKS = {
  italiana: "'Italiana', 'Bodoni Moda', Didot, Georgia, serif",
  gilda: "'Gilda Display', 'Italiana', Georgia, serif",
  bodoni: "'Bodoni Moda', Didot, Georgia, serif",
  playfair: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
  cormorant: "'Cormorant Garamond', 'Iowan Old Style', Georgia, serif",
  marcellus: "'Marcellus', 'Cinzel', Georgia, serif",
  cinzel: "'Cinzel', 'Marcellus', Georgia, serif",
  cinzelDecorative: "'Cinzel Decorative', 'Cinzel', Georgia, serif",
  fraunces: "'Fraunces', 'Playfair Display', Georgia, serif",
  josefin: "'Hanken Grotesk', 'Josefin Sans', 'Jost', sans-serif",
  jost: "'Jost', 'Josefin Sans', sans-serif",
  pinyon: "'Pinyon Script', 'Snell Roundhand', cursive",
  allura: "'Allura', 'Italianno', cursive",
  greatVibes: "'Great Vibes', 'Allura', cursive",
  parisienne: "'Parisienne', 'Allura', cursive",
  italianno: "'Italianno', 'Allura', cursive",
  tangerine: "'Tangerine', 'Italianno', cursive",
  delafield: "'Mrs Saint Delafield', 'Pinyon Script', cursive",
  sacramento: "'Sacramento', 'Italianno', cursive",
} as const;

/**
 * Engraved inscriptional capitals for eyebrows, labels, buttons and numerals.
 * Cinzel is never a body face — it only ever whispers in small caps.
 */
export const CAPS_STACK = FONT_STACKS.cinzel;

export const FONT_PAIRS = [
  { id: 'italiana', label: 'Italiana · fashion-house capitals', stack: FONT_STACKS.italiana },
  { id: 'gilda', label: 'Gilda Display · deco elegance', stack: FONT_STACKS.gilda },
  { id: 'bodoni', label: 'Bodoni Moda · high-contrast Didone', stack: FONT_STACKS.bodoni },
  { id: 'cinzelDecorative', label: 'Cinzel Decorative · engraved ornament', stack: FONT_STACKS.cinzelDecorative },
  { id: 'playfair', label: 'Playfair Display · broadsheet classic', stack: FONT_STACKS.playfair },
  { id: 'cormorant', label: 'Cormorant Garamond · old-style', stack: FONT_STACKS.cormorant },
] as const;

export const SCRIPT_FONTS = [
  { id: 'pinyon', label: 'Pinyon Script · engraved copperplate', stack: FONT_STACKS.pinyon },
  { id: 'italianno', label: 'Italianno · Venetian flourish', stack: FONT_STACKS.italianno },
  { id: 'allura', label: 'Allura · light calligraphy', stack: FONT_STACKS.allura },
  { id: 'greatVibes', label: 'Great Vibes · formal flourish', stack: FONT_STACKS.greatVibes },
  { id: 'tangerine', label: 'Tangerine · Spencerian sweep', stack: FONT_STACKS.tangerine },
  { id: 'delafield', label: 'Mrs Saint Delafield · wedding hand', stack: FONT_STACKS.delafield },
  { id: 'parisienne', label: 'Parisienne · French salon', stack: FONT_STACKS.parisienne },
] as const;

export const PALETTE_PRESETS: { id: string; label: string; palette: Palette }[] = [
  {
    id: 'ivory-gold',
    label: 'Ivory & gilt',
    palette: {
      bg: '#f7f2e7',
      surface: '#fffdf8',
      ink: '#201c17',
      muted: '#7b6d5d',
      accent: '#a8865c',
      accentSoft: '#ebdfcb',
      line: '#d9cab6',
      deep: '#221c15',
      deepInk: '#f9f2e6',
    },
  },
  {
    id: 'boxwood',
    label: 'Boxwood & chalk',
    palette: {
      bg: '#f4f3ec',
      surface: '#fffef9',
      ink: '#222a23',
      muted: '#6f7a6f',
      accent: '#8d9a7c',
      accentSoft: '#e3e6d9',
      line: '#d5d8c9',
      deep: '#243027',
      deepInk: '#f5f4ec',
    },
  },
  {
    id: 'burgundy-gold',
    label: 'Claret & gold',
    palette: {
      bg: '#f8efe1',
      surface: '#fff9ee',
      ink: '#38161f',
      muted: '#8a6a5c',
      accent: '#b58a43',
      accentSoft: '#ecd9b4',
      line: '#dcc7a2',
      deep: '#481521',
      deepInk: '#fbf0dc',
    },
  },
  {
    id: 'ink-couture',
    label: 'Ink & ivory',
    palette: {
      bg: '#f4f1ea',
      surface: '#fffdf8',
      ink: '#141210',
      muted: '#756f66',
      accent: '#9a7b5d',
      accentSoft: '#e6ddd0',
      line: '#d9d2c7',
      deep: '#121110',
      deepInk: '#f6f3ec',
    },
  },
  {
    id: 'coast',
    label: 'Salt & terracotta',
    palette: {
      bg: '#fbf3e7',
      surface: '#fffaf2',
      ink: '#3a2b23',
      muted: '#8a6a58',
      accent: '#b96744',
      accentSoft: '#f0d7c2',
      line: '#e4cfb9',
      deep: '#39463f',
      deepInk: '#faf3e7',
    },
  },
  {
    id: 'celestial',
    label: 'Midnight & pearl',
    palette: {
      bg: '#0e1224',
      surface: '#151b31',
      ink: '#eae7f3',
      muted: '#a6a4be',
      accent: '#cbb9e6',
      accentSoft: '#232b4a',
      line: '#2b3352',
      deep: '#080b16',
      deepInk: '#f1eef8',
    },
  },
  {
    id: 'sepia',
    label: 'Sepia & cream',
    palette: {
      bg: '#f4ecdc',
      surface: '#fbf6e9',
      ink: '#3a2f24',
      muted: '#83705a',
      accent: '#8a6a45',
      accentSoft: '#e4d4b8',
      line: '#d7c4a5',
      deep: '#3d3328',
      deepInk: '#f7efe0',
    },
  },
  {
    id: 'rose',
    label: 'Rose & plaster',
    palette: {
      bg: '#fbf2ef',
      surface: '#fffaf7',
      ink: '#3a2a2c',
      muted: '#8b6f72',
      accent: '#b57f78',
      accentSoft: '#f3ddd8',
      line: '#edd5cf',
      deep: '#4b2f33',
      deepInk: '#fff8f4',
    },
  },
];
