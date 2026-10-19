import type { CSSProperties } from 'react';
import type { Palette } from '@shared/types';
import type { TemplateDefinition, TemplateId } from './types';

export type CoverKind = 'seal' | 'ribbon' | 'curtain' | 'gatefold';

/**
 * Which stationery world a cover belongs to. Céleste is always a gatefold;
 * every other template follows the envelope it was art-directed around.
 */
export function coverKind(templateId: TemplateId | string): CoverKind {
  if (templateId === 'celeste') return 'gatefold';
  if (templateId === 'belgrave' || templateId === 'noir') return 'curtain';
  if (templateId === 'aurelia') return 'seal';
  return 'ribbon';
}

/** Deep covers read as the most regal in the collection grid. */
export const COVER_TONES: Record<TemplateId, 'light' | 'dark'> = {
  aurelia: 'light',
  maison: 'light',
  belgrave: 'dark',
  celeste: 'dark',
  salento: 'light',
  noir: 'dark',
  heirloom: 'light',
  miel: 'light',
};

export interface CoverTokens {
  isDark: boolean;
  bg: string;
  ink: string;
  muted: string;
  accent: string;
  accentSoft: string;
  line: string;
}

/**
 * The cover palette is derived from the template's own palette, pushed a little
 * further for the screen: deeper darks, warmer foil, quieter hairlines.
 */
export function coverTokens(template: TemplateDefinition): CoverTokens {
  const palette: Palette = template.palette;
  const isDark = COVER_TONES[template.id] === 'dark';
  if (isDark) {
    return {
      isDark,
      bg: palette.deep,
      ink: palette.deepInk,
      muted: `color-mix(in srgb, ${palette.deepInk} 66%, ${palette.deep})`,
      accent: `color-mix(in srgb, ${palette.accent} 62%, #e9d3a1)`,
      accentSoft: `color-mix(in srgb, ${palette.accent} 24%, ${palette.deep})`,
      line: `color-mix(in srgb, ${palette.accent} 46%, transparent)`,
    };
  }
  return {
    isDark,
    bg: palette.bg,
    ink: palette.ink,
    muted: palette.muted,
    accent: palette.accent,
    accentSoft: palette.accentSoft,
    line: palette.line,
  };
}

export function coverStyle(tokens: CoverTokens, script: string): CSSProperties {
  return {
    color: tokens.ink,
    background: tokens.isDark
      ? `linear-gradient(168deg, color-mix(in srgb, ${tokens.bg} 88%, #fff) 0%, ${tokens.bg} 38%, color-mix(in srgb, ${tokens.bg} 78%, #000) 100%)`
      : `linear-gradient(168deg, color-mix(in srgb, ${tokens.bg} 94%, #fff) 0%, ${tokens.bg} 44%, color-mix(in srgb, ${tokens.bg} 80%, ${tokens.accentSoft}) 100%)`,
    containerType: 'inline-size',
    '--cover-accent': tokens.accent,
    '--cover-ink': tokens.ink,
    '--cover-bg': tokens.bg,
    '--cover-script': script,
  } as CSSProperties;
}
