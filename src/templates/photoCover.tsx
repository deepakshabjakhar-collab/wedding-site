import type { CSSProperties } from 'react';
import type { TemplateDefinition, TemplateId } from './types';
import { COVER_TONES, coverTokens } from './cover';

/** The art-directed photograph is the cover. */
export function coverPhoto(id: TemplateId | string): string {
  return `/covers/${id}.jpg`;
}

/**
 * Where the type can breathe on each photograph. `card` sets the script line on
 * the blank face of the printed piece; `floor` sets it in the empty foreground.
 */
const LAYOUT: Record<TemplateId, { taglineOnCard: boolean; taglineTop: string }> = {
  aurelia: { taglineOnCard: true, taglineTop: '25%' },
  maison: { taglineOnCard: false, taglineTop: '' },
  belgrave: { taglineOnCard: false, taglineTop: '' },
  celeste: { taglineOnCard: true, taglineTop: '24.5%' },
  salento: { taglineOnCard: false, taglineTop: '' },
  noir: { taglineOnCard: true, taglineTop: '24%' },
  heirloom: { taglineOnCard: true, taglineTop: '24.5%' },
  miel: { taglineOnCard: false, taglineTop: '' },
};

/**
 * A photographic cover, framed like a print: the plate is the hero, a hairline
 * sits inside the trim, and the type lives in the light the picture leaves
 * empty. Used on the collection cards, the preview stage and the home cover.
 */
export function PhotoCover({
  template,
  className,
  showLabel = true,
  showTagline = true,
  labelSize = 'clamp(9px, 2.9cqw, 12px)',
  taglineSize = 'clamp(19px, 5.9cqw, 30px)',
  inset = '4.2%',
}: {
  template: TemplateDefinition;
  className?: string;
  showLabel?: boolean;
  showTagline?: boolean;
  labelSize?: string;
  taglineSize?: string;
  inset?: string;
}) {
  const dark = COVER_TONES[template.id] === 'dark';
  const tokens = coverTokens(template);
  const layout = LAYOUT[template.id];
  const lightInk = '#f7f1e4';
  const ink = dark ? lightInk : tokens.ink;

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className ?? ''}`}
      style={{
        background: tokens.bg,
        color: ink,
        containerType: 'inline-size',
        '--cover-accent': tokens.accent,
      } as CSSProperties}
    >
      <img
        src={coverPhoto(template.id)}
        alt={`${template.name} cover — ${template.descriptor}`}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: 'center' }}
        draggable={false}
      />

      {/* a whisper of vignette, so the print sits in light */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: dark
            ? 'radial-gradient(124% 84% at 50% 38%, transparent 52%, rgba(0,0,0,0.5) 100%)'
            : 'radial-gradient(124% 84% at 50% 36%, transparent 56%, rgba(44,30,14,0.2) 100%)',
        }}
      />

      {/* the cover's own hairline, inside the trim */}
      <div
        className="pointer-events-none absolute border"
        style={{
          inset,
          borderColor: dark ? 'rgba(233,211,161,0.32)' : 'rgba(160,124,74,0.3)',
        }}
      />

      {/* printed on the card's blank face … */}
      {showTagline && layout.taglineOnCard && (
        <p
          className="absolute inset-x-[19%] text-center leading-[1.16]"
          style={{
            top: layout.taglineTop,
            fontFamily: template.script,
            fontSize: taglineSize,
            color: dark ? lightInk : '#33271a',
          }}
        >
          {template.tagline}
        </p>
      )}

      {/* … or set in the light below the photograph, never over the bow */}
      {(!layout.taglineOnCard || showLabel) && (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
            style={{
              background: dark
                ? 'linear-gradient(180deg, rgba(6,5,4,0) 0%, rgba(6,5,4,0.34) 46%, rgba(6,5,4,0.7) 100%)'
                : 'linear-gradient(180deg, rgba(255,251,243,0) 0%, rgba(255,251,243,0.4) 42%, rgba(255,251,243,0.78) 100%)',
            }}
          />
          <div className="absolute inset-x-0 bottom-[6.2%] flex flex-col items-center gap-[2.4cqw] px-[10%] text-center">
            {showTagline && !layout.taglineOnCard && (
              <p
                className="leading-[1.12]"
                style={{
                  fontFamily: template.script,
                  fontSize: taglineSize,
                  color: dark ? 'rgba(245,234,211,0.95)' : '#3a2c1c',
                  textShadow: dark ? '0 1px 14px rgba(0,0,0,0.8)' : '0 1px 12px rgba(255,252,244,0.55)',
                }}
              >
                {template.tagline}
              </p>
            )}
            {showLabel && (
              <>
                <span
                  className="mt-[1cqw] h-px w-[13%]"
                  style={{ background: dark ? 'rgba(233,211,161,0.6)' : 'rgba(150,112,62,0.55)' }}
                />
                <span
                  className="uppercase"
                  style={{
                    fontFamily: "'Cinzel', Georgia, serif",
                    fontSize: labelSize,
                    letterSpacing: '0.44em',
                    paddingLeft: '0.44em',
                    color: dark ? 'rgba(247,241,228,0.9)' : 'rgba(48,37,24,0.86)',
                    textShadow: dark ? '0 1px 10px rgba(0,0,0,0.6)' : '0 1px 10px rgba(255,252,244,0.5)',
                  }}
                >
                  {template.name}
                </span>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
