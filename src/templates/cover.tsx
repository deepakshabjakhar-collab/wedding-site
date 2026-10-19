import type { CSSProperties } from 'react';
import type { Palette } from '@shared/types';
import type { TemplateDefinition, TemplateId } from './types';
import { GoldBow, TemplateArt, TemplateMark, WaxSeal } from './art';
import { LaurelCrest, RoyalCorner, StarMark } from './ornaments';

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

function crest(kind: CoverKind, monogram: string, tokens: CoverTokens) {
  if (kind === 'seal') {
    return (
      <WaxSeal
        monogram={monogram}
        className="h-[20cqw] w-[20cqw] drop-shadow-[0_6px_10px_rgba(30,16,8,0.28)]"
      />
    );
  }
  const ringStyle: CSSProperties = {
    borderColor: `color-mix(in srgb, ${tokens.accent} 55%, transparent)`,
    color: tokens.accent,
    background: tokens.isDark
      ? 'rgba(0,0,0,0.22)'
      : 'color-mix(in srgb, var(--cover-bg) 70%, #fff)',
    boxShadow: tokens.isDark
      ? 'inset 0 0 0 3px rgba(0,0,0,0.22)'
      : 'inset 0 0 0 3px color-mix(in srgb, var(--cover-bg) 60%, #fff)',
  };
  return (
    <span className="relative grid h-[21cqw] w-[21cqw] place-items-center rounded-full border" style={ringStyle}>
      {kind === 'gatefold' ? (
        <StarMark className="absolute inset-[12%] h-[76%] w-[76%] opacity-40" />
      ) : (
        <LaurelCrest className="absolute inset-[6%] h-[88%] w-[88%] opacity-65" />
      )}
      <span
        className="relative"
        style={{
          fontFamily: 'var(--cover-script, var(--font-script))',
          fontSize: 'clamp(16px, 7.4cqw, 27px)',
          lineHeight: 1,
          paddingTop: '0.1em',
          color: tokens.accent,
        }}
      >
        {monogram}
      </span>
    </span>
  );
}

/**
 * A finished piece of stationery: the plate used on the collection cards and
 * wherever a template needs to be shown as an invitation rather than a swatch.
 */
export function TemplateCover({
  template,
  coupleA,
  coupleB,
  monogram,
  dateLabel,
  locationLabel,
  eyebrow,
  cta,
}: {
  template: TemplateDefinition;
  coupleA: string;
  coupleB: string;
  monogram: string;
  dateLabel: string;
  locationLabel: string;
  eyebrow?: string;
  cta?: string;
}) {
  const tokens = coverTokens(template);
  const kind = coverKind(template.id);
  const upper = template.cover.namesCase === 'upper';
  const showBow = kind === 'ribbon';

  return (
    <div className="relative h-full w-full overflow-hidden" style={coverStyle(tokens, template.script)}>
      {/* engraved scene */}
      <div className="pointer-events-none absolute inset-0" style={{ color: tokens.accent }}>
        <TemplateArt
          templateId={template.id}
          className={`h-full w-full ${tokens.isDark ? 'opacity-[0.34]' : 'opacity-[0.2]'}`}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(78% 46% at 50% 8%, color-mix(in srgb, ${tokens.accent} 16%, transparent), transparent 62%)`,
        }}
      />
      <div className="cover-damask pointer-events-none absolute inset-0" style={{ color: tokens.accent }} />
      {/* the table / paper edge */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow: tokens.isDark
            ? 'inset 0 0 46px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)'
            : 'inset 0 0 38px rgba(70,48,24,0.10), inset 0 1px 0 rgba(255,255,255,0.5)',
        }}
      />

      {/* theatre drapes, for the curtain templates */}
      {kind === 'curtain' &&
        (['left', 'right'] as const).map((side) => (
          <div
            key={side}
            className="pointer-events-none absolute inset-y-0 w-[3.6%]"
            style={{
              [side]: 0,
              background:
                'repeating-linear-gradient(90deg, rgba(0,0,0,0.38) 0 2px, rgba(255,255,255,0.07) 2px 5px, transparent 5px 11px), linear-gradient(90deg, #0b0908, color-mix(in srgb, var(--inv-deep, #201812) 82%, #b9905a) 60%, #0b0908)',
              boxShadow: side === 'left' ? '6px 0 14px -8px rgba(0,0,0,0.7)' : '-6px 0 14px -8px rgba(0,0,0,0.7)',
            }}
          />
        ))}

      {/* the gatefold spine */}
      {kind === 'gatefold' && (
        <>
          <div
            className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
            style={{
              background: `linear-gradient(180deg, transparent, ${tokens.accent} 18%, ${tokens.accent} 82%, transparent)`,
              opacity: 0.35,
            }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2"
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.28), transparent 45%)' }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2"
            style={{ background: 'linear-gradient(270deg, rgba(0,0,0,0.28), transparent 45%)' }}
          />
        </>
      )}

      {/* double keyline + gilded corners */}
      <div
        className="pointer-events-none absolute inset-[3.2%] border"
        style={{ borderColor: `color-mix(in srgb, ${tokens.accent} 52%, transparent)` }}
      />
      <div
        className="pointer-events-none absolute inset-[4.8%] border"
        style={{ borderColor: `color-mix(in srgb, ${tokens.accent} 24%, transparent)` }}
      />
      <div className="pointer-events-none absolute inset-[3.2%]" style={{ color: tokens.accent }}>
        <RoyalCorner className="absolute left-[-1px] top-[-1px] h-[9cqw] w-[9cqw] opacity-80" />
        <RoyalCorner className="absolute right-[-1px] top-[-1px] h-[9cqw] w-[9cqw] -scale-x-100 opacity-80" />
        <RoyalCorner className="absolute bottom-[-1px] left-[-1px] h-[9cqw] w-[9cqw] -scale-y-100 opacity-80" />
        <RoyalCorner className="absolute bottom-[-1px] right-[-1px] h-[9cqw] w-[9cqw] -scale-100 opacity-80" />
      </div>

      {/* a sheen that travels across the paper on hover */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 -translate-x-[150%] skew-x-[-14deg] bg-white/25 blur-lg transition-transform duration-[1400ms] ease-out group-hover:translate-x-[300%]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full flex-col items-center px-[9.5%] py-[7.2%] text-center">
        <div className="flex flex-col items-center">
          <span
            className="text-[clamp(7px,2.5cqw,10px)] font-medium uppercase"
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              letterSpacing: '0.3em',
              color: tokens.muted,
            }}
          >
            {eyebrow ?? template.descriptor}
          </span>
          <span
            className="mt-[2.2cqw] h-px w-[14%]"
            style={{ background: `color-mix(in srgb, ${tokens.accent} 65%, transparent)` }}
          />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div style={{ color: `color-mix(in srgb, #7b2938 84%, ${tokens.accent})` }}>{crest(kind, monogram, tokens)}</div>
          <p
            className={`mt-[4.4cqw] leading-[0.98] ${upper ? 'uppercase' : ''}`}
            style={{
              fontFamily: template.display,
              fontSize: upper ? 'clamp(17px, 6.9cqw, 26px)' : 'clamp(22px, 9.1cqw, 35px)',
              letterSpacing: template.cover.namesCase === 'upper' ? '0.05em' : template.cover.tracking,
              color: tokens.ink,
              textWrap: 'balance',
            }}
          >
            {coupleA}
            <span
              className="mx-[2cqw] inline-block align-middle"
              style={{
                fontFamily: template.script,
                fontSize: '0.8em',
                color: tokens.accent,
                letterSpacing: 0,
              }}
            >
              &amp;
            </span>
            {coupleB}
          </p>
          <span
            className="mt-[3.4cqw] flex w-[46%] items-center justify-center gap-[2.4cqw]"
            style={{ color: tokens.accent }}
            aria-hidden
          >
            <span className="h-px flex-1 bg-current opacity-60" />
            <span className="size-[1.1cqw] rotate-45 border border-current" />
            <span className="h-px flex-1 bg-current opacity-60" />
          </span>
          <p
            className="mt-[2.8cqw] max-w-[94%] font-medium uppercase"
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              fontSize: 'clamp(6.5px, 2.56cqw, 9px)',
              letterSpacing: '0.22em',
              color: tokens.muted,
            }}
          >
            {dateLabel}
            <span className="mx-[1.4cqw] opacity-50">·</span>
            {locationLabel}
          </p>
        </div>

        <div className="flex flex-col items-center gap-[2cqw]">
          {showBow ? (
            <span style={{ color: tokens.accent }}>
              <GoldBow className="h-[8cqw] w-[11cqw] drop-shadow-[0_4px_6px_rgba(50,32,12,0.28)]" />
            </span>
          ) : (
            <TemplateMark templateId={template.id} className="h-[4.4cqw] w-[19cqw] opacity-70" />
          )}
          <span
            className="text-[clamp(6px,2.2cqw,8px)] uppercase tracking-[0.3em] transition-opacity duration-500 group-hover:opacity-0"
            style={{ fontFamily: "'Cinzel', Georgia, serif", color: tokens.muted, opacity: 0.75 }}
          >
            {kind === 'curtain' ? 'Pull the curtain' : kind === 'gatefold' ? 'Open the gatefold' : kind === 'ribbon' ? 'Untie the silk' : 'Break the seal'}
          </span>
          {cta && (
            <span
              className="pointer-events-none absolute bottom-[6.2%] inline-flex translate-y-2 items-center gap-1.5 rounded-full border px-4 py-2 text-[0.52rem] font-medium uppercase opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
              style={{
                fontFamily: "'Cinzel', Georgia, serif",
                letterSpacing: '0.22em',
                borderColor: `color-mix(in srgb, ${tokens.accent} 60%, transparent)`,
                color: tokens.ink,
                background: tokens.isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.62)',
                backdropFilter: 'blur(4px)',
              }}
            >
              {cta}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
