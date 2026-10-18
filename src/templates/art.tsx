import { useId } from 'react';
import type { TemplateId } from './types';

interface ArtProps {
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Aurelia — a Roman keyline frame (rectilinear, no arches)            */
/* ------------------------------------------------------------------ */

export function AureliaArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 600 800" className={className} aria-hidden="true" fill="none">
      <defs>
        <radialGradient id="aurelia-glow" cx="50%" cy="34%" r="56%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="600" height="800" fill="url(#aurelia-glow)" />
      {/* double keyline frame */}
      <g stroke="currentColor" opacity="0.55">
        <rect x="52" y="36" width="496" height="728" strokeWidth="1" />
        <rect x="68" y="52" width="464" height="696" strokeWidth="0.6" opacity="0.8" />
      </g>
      {/* dentil rows, top and bottom */}
      <g stroke="currentColor" strokeWidth="1" opacity="0.4">
        {Array.from({ length: 25 }).map((_, i) => (
          <g key={i}>
            <path d={`M${104 + i * 16.5} 62v10`} />
            <path d={`M${104 + i * 16.5} 728v10`} />
          </g>
        ))}
      </g>
      {/* corner palmettes */}
      {[
        'translate(68 52)',
        'translate(532 52) scale(-1 1)',
        'translate(68 748) scale(1 -1)',
        'translate(532 748) scale(-1 -1)',
      ].map((transform) => (
        <g key={transform} transform={transform} stroke="currentColor" strokeWidth="0.9" opacity="0.6">
          <path d="M0 34V10Q0 0 10 0h24" />
          <path d="M10 34V16q0-6 6-6h18" opacity="0.6" />
          <path d="M17 17l6 6-6 6-6-6Z" />
          <circle cx="17" cy="23" r="1.4" fill="currentColor" stroke="none" />
        </g>
      ))}
      {/* inscription medallion */}
      <g transform="translate(300 108)" stroke="currentColor" opacity="0.6">
        <path d="M-196 0h160M36 0h160" strokeWidth="0.7" />
        <path d="M0-14l14 14-14 14-14-14Z" strokeWidth="0.9" />
        <circle r="2.4" fill="currentColor" stroke="none" />
        <path d="M-28 0h8M20 0h8" strokeWidth="1" />
      </g>
      {/* cypress sprigs, drawn straight */}
      <g stroke="currentColor" strokeWidth="0.9" opacity="0.55" strokeLinecap="round">
        <path d="M150 700V560M150 560l-14-18M150 560l14-18M150 596l-12-14M150 596l12-14M150 632l-12-14M150 632l12-14M150 668l-10-12M150 668l10-12" />
        <path d="M450 700V560M450 560l-14-18M450 560l14-18M450 596l-12-14M450 596l12-14M450 632l-12-14M450 632l12-14M450 668l-10-12M450 668l10-12" />
      </g>
      <g transform="translate(300 690)" stroke="currentColor" strokeWidth="0.8" opacity="0.5">
        <path d="M-60 0h120" />
        <path d="M0-8l8 8-8 8-8-8Z" />
      </g>
      <g fill="currentColor" opacity="0.38">
        <circle cx="300" cy="34" r="2.4" />
        <circle cx="132" cy="654" r="1.7" />
        <circle cx="468" cy="654" r="1.7" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Maison — pressed watercolour garden                                 */
/* ------------------------------------------------------------------ */

export function MaisonArt({ className }: ArtProps) {
  const uid = useId().replace(/:/g, '');
  const blur = `wc-${uid}`;
  return (
    <svg viewBox="0 0 800 900" className={className} aria-hidden="true" fill="none">
      <defs>
        <filter id={blur} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <linearGradient id={`leaf-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93a189" />
          <stop offset="100%" stopColor="#5f7259" />
        </linearGradient>
      </defs>

      <g opacity="0.5" filter={`url(#${blur})`}>
        <ellipse cx="180" cy="270" rx="96" ry="72" fill="var(--inv-accent)" opacity="0.35" />
        <ellipse cx="592" cy="200" rx="112" ry="82" fill="var(--inv-accent)" opacity="0.28" />
        <ellipse cx="700" cy="470" rx="88" ry="110" fill="#93a189" opacity="0.32" />
        <ellipse cx="110" cy="610" rx="100" ry="78" fill="#93a189" opacity="0.28" />
        <ellipse cx="400" cy="820" rx="150" ry="60" fill="var(--inv-accent)" opacity="0.18" />
      </g>

      <g stroke={`url(#leaf-${uid})`} strokeWidth="1.4" opacity="0.75" strokeLinecap="round">
        <path d="M120 830c60-120 84-250 62-380M690 850c-58-140-62-268-8-392M400 790c-10-86 14-150 66-206" />
      </g>

      {/* eucalyptus leaves */}
      <g fill={`url(#leaf-${uid})`} opacity="0.82">
        {[
          [146, 690, -28],
          [176, 636, 24],
          [186, 576, -22],
          [176, 514, 30],
          [150, 462, -18],
          [662, 700, 24],
          [646, 640, -26],
          [664, 580, 20],
          [686, 520, -22],
          [694, 462, 26],
        ].map(([x, y, rot], i) => (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="26"
            ry="10"
            transform={`rotate(${rot} ${x} ${y})`}
          />
        ))}
      </g>

      {/* roses */}
      <g opacity="0.95">
        <g transform="translate(172 300)">
          <circle r="58" fill="var(--inv-accent-soft)" opacity="0.55" />
          <circle r="46" fill="var(--inv-accent)" opacity="0.34" />
          <path
            d="M-30-12c14-24 44-30 62-10s6 48-18 54-44-10-44-22 12-22 26-22 26 10 24 22"
            stroke="#fffaf3"
            strokeOpacity="0.55"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M-16-2c8-12 24-14 32-4s2 24-10 26-20-6-20-12"
            stroke="#fffaf3"
            strokeOpacity="0.5"
            strokeWidth="1.6"
            fill="none"
          />
        </g>
        <g transform="translate(620 236) scale(0.9)">
          <circle r="58" fill="var(--inv-accent-soft)" opacity="0.5" />
          <circle r="46" fill="var(--inv-accent)" opacity="0.3" />
          <path
            d="M-30-12c14-24 44-30 62-10s6 48-18 54-44-10-44-22 12-22 26-22 26 10 24 22"
            stroke="#fffaf3"
            strokeOpacity="0.5"
            strokeWidth="2"
            fill="none"
          />
        </g>
        <g transform="translate(706 496) scale(0.62)">
          <circle r="58" fill="var(--inv-accent-soft)" opacity="0.55" />
          <circle r="46" fill="var(--inv-accent)" opacity="0.32" />
          <path
            d="M-30-12c14-24 44-30 62-10s6 48-18 54-44-10-44-22 12-22 26-22 26 10 24 22"
            stroke="#fffaf3"
            strokeOpacity="0.55"
            strokeWidth="2"
            fill="none"
          />
        </g>
      </g>

      {/* small blossoms & buds */}
      <g>
        {[
          [300, 760, 9],
          [330, 728, 6],
          [270, 724, 5],
          [520, 790, 8],
          [552, 756, 5],
          [96, 496, 6],
          [730, 632, 5],
        ].map(([x, y, r], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle r={r} fill="var(--inv-accent)" opacity="0.55" />
            <circle r={r * 0.45} fill="#f5ebdd" opacity="0.9" />
          </g>
        ))}
      </g>

      <g stroke="var(--inv-accent)" strokeWidth="1" opacity="0.45" strokeLinecap="round">
        <path d="M262 792c8-20 20-34 36-42M490 782c-10-18-14-36-10-54" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Belgrave — a Georgian door with pediment (no fanlight dome)         */
/* ------------------------------------------------------------------ */

export function BelgraveArt({ className }: ArtProps) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 700 900" className={className} aria-hidden="true" fill="none">
      <defs>
        <radialGradient id={`belgrave-glow-${uid}`} cx="50%" cy="30%" r="62%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="700" height="900" fill={`url(#belgrave-glow-${uid})`} />

      {/* the door surround */}
      <g stroke="currentColor" strokeWidth="1" opacity="0.55">
        <path d="M180 862V352h340v510" />
        <path d="M200 862V370h300v492" strokeWidth="0.6" opacity="0.75" />
        <path d="M164 352h372" />
        <path d="M154 340h392" strokeWidth="0.6" opacity="0.6" />
      </g>

      {/* rectangular transom window with muntin grid */}
      <g transform="translate(350 252)" stroke="currentColor" fill="none">
        <rect x="-118" y="-56" width="236" height="96" strokeWidth="1.1" opacity="0.7" />
        <rect x="-106" y="-44" width="212" height="72" strokeWidth="0.55" opacity="0.55" />
        <path d="M-36-56v96M36-56v96M-118-8h236" strokeWidth="0.65" opacity="0.55" />
        <path d="M-118 52h236" strokeWidth="0.8" opacity="0.6" />
        <circle r="3" fill="currentColor" opacity="0.4" stroke="none" />
      </g>

      {/* triangular pediment with dentils and keystone */}
      <g transform="translate(350 176)" stroke="currentColor" opacity="0.65">
        <path d="M-168 0L0-72 168 0" strokeWidth="1" fill="none" />
        <path d="M-168 0h336" strokeWidth="1.1" />
        <path d="M-150-8L0-66l150 58" strokeWidth="0.5" opacity="0.6" />
        {Array.from({ length: 13 }).map((_, i) => (
          <path key={i} d={`M${-144 + i * 24} 0v10`} strokeWidth="0.9" opacity="0.55" />
        ))}
        <g transform="translate(0 -72)">
          <rect x="-9" y="-16" width="18" height="22" strokeWidth="0.9" fill="none" />
          <path d="M-5-16v22M5-16v22" strokeWidth="0.45" opacity="0.6" />
          <circle cy="-22" r="2.4" fill="currentColor" stroke="none" opacity="0.7" />
        </g>
      </g>

      {/* door panels */}
      <g stroke="currentColor" strokeWidth="0.7" opacity="0.45">
        <rect x="236" y="420" width="90" height="150" />
        <rect x="374" y="420" width="90" height="150" />
        <rect x="236" y="592" width="90" height="150" />
        <rect x="374" y="592" width="90" height="150" />
        <circle cx="350" cy="586" r="5" opacity="0.7" />
        <circle cx="350" cy="586" r="1.6" fill="currentColor" stroke="none" />
      </g>

      {/* pilasters */}
      <g stroke="currentColor" strokeWidth="0.7" opacity="0.45">
        {[206, 476].map((x) => (
          <g key={x}>
            <path d={`M${x} 392v410`} />
            <path d={`M${x + 18} 392v410`} opacity="0.7" />
            <path d={`M${x - 6} 392h30M${x - 6} 806h30`} opacity="0.8" />
            {Array.from({ length: 9 }).map((_, i) => (
              <path key={i} d={`M${x} ${430 + i * 40}h18`} opacity="0.35" />
            ))}
          </g>
        ))}
      </g>

      {/* laurel, drawn either side of the door */}
      <g stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.5">
        <path d="M128 800c-26-58-26-128 4-196" />
        <path d="M572 800c26-58 26-128-4-196" />
        {Array.from({ length: 9 }).map((_, i) => {
          const y = 760 - i * 22;
          return (
            <g key={i}>
              <path d={`M${128 + Math.sin(i / 2) * 6} ${y}c-16-4-24-14-26-27`} />
              <path d={`M${572 - Math.sin(i / 2) * 6} ${y}c16-4 24-14 26-27`} />
            </g>
          );
        })}
      </g>

      {/* lamp glow */}
      <g transform="translate(350 690)" opacity="0.4">
        <circle r="46" fill="currentColor" opacity="0.05" />
        <circle r="26" stroke="currentColor" strokeWidth="0.6" />
        <path d="M-12 0h24M0-12v24" stroke="currentColor" strokeWidth="0.5" />
      </g>

      {/* fine stars of dust */}
      <g fill="currentColor" opacity="0.3">
        {[
          [110, 250],
          [592, 282],
          [156, 470],
          [548, 520],
          [102, 660],
          [612, 690],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.5" />
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Céleste — a quiet constellation                                     */
/* ------------------------------------------------------------------ */

const STARS: [number, number, number, number][] = [
  [82, 120, 1.3, 0.5],
  [160, 70, 0.8, 0.4],
  [240, 148, 1.6, 0.6],
  [330, 60, 1, 0.35],
  [430, 130, 1.8, 0.65],
  [520, 72, 1.2, 0.45],
  [612, 160, 1.5, 0.55],
  [702, 88, 1, 0.4],
  [80, 310, 1, 0.4],
  [180, 400, 1.2, 0.45],
  [300, 330, 0.9, 0.35],
  [520, 380, 1.4, 0.5],
  [650, 300, 1.1, 0.4],
  [730, 430, 1.6, 0.5],
  [110, 560, 1.3, 0.4],
  [240, 640, 1, 0.35],
  [620, 610, 1.2, 0.4],
  [690, 740, 1.5, 0.45],
  [90, 790, 1, 0.3],
  [330, 800, 1.4, 0.4],
];

export function CelesteArt({ className }: ArtProps) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 800 900" className={className} aria-hidden="true" fill="none">
      <defs>
        <radialGradient id={`nebula-${uid}`} cx="72%" cy="22%" r="55%">
          <stop offset="0%" stopColor="#8f7cc0" stopOpacity="0.34" />
          <stop offset="60%" stopColor="#5b5f9e" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0e1224" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`moon-glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <mask id={`moon-mask-${uid}`}>
          <rect width="800" height="900" fill="#000" />
          <circle cx="560" cy="250" r="76" fill="#fff" />
          <circle cx="594" cy="222" r="64" fill="#000" />
        </mask>
      </defs>
      <rect width="800" height="900" fill={`url(#nebula-${uid})`} />
      <circle cx="560" cy="250" r="160" fill={`url(#moon-glow-${uid})`} opacity="0.5" />
      <g mask={`url(#moon-mask-${uid})`}>
        <circle cx="560" cy="250" r="80" fill="currentColor" opacity="0.55" />
      </g>
      <g stroke="currentColor" opacity="0.34" strokeWidth="0.7">
        <circle cx="560" cy="250" r="126" strokeDasharray="1 9" opacity="0.4" />
        <ellipse cx="560" cy="250" rx="168" ry="52" transform="rotate(-18 560 250)" opacity="0.28" />
      </g>

      {/* constellation */}
      <g stroke="currentColor" strokeWidth="0.65" opacity="0.5">
        <path d="M286 476l46-28 52 12 30-36 44 20 26-44" />
        <path d="M330 556l-12-42 36-38M412 460l14 52 38 10" opacity="0.6" />
      </g>
      <g fill="currentColor">
        {[
          [286, 476, 2.4],
          [332, 448, 1.7],
          [384, 460, 2.1],
          [414, 424, 2.8],
          [458, 444, 1.7],
          [484, 400, 2.2],
          [318, 514, 1.7],
          [426, 512, 2],
        ].map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} opacity="0.85" />
            <circle cx={x} cy={y} r={r * 3.2} opacity="0.1" />
          </g>
        ))}
      </g>

      {STARS.map(([x, y, r, o], i) => (
        <g key={i} fill="currentColor" opacity={o}>
          <circle cx={x} cy={y} r={r} />
          {r > 1.4 && (
            <path
              d={`M${x} ${y - r * 4}l${r * 0.75} ${r * 3.25} ${r * 3.25} ${r * 0.75}-${r * 3.25} ${r * 0.75}-${r * 0.75} ${r * 3.25}-${r * 0.75}-${r * 3.25}-${r * 3.25}-${r * 0.75} ${r * 3.25}-${r * 0.75}Z`}
              opacity="0.5"
            />
          )}
        </g>
      ))}

      <g stroke="currentColor" strokeWidth="0.7" opacity="0.4">
        <path d="M0 812c120-40 210-24 292 18s164 52 260 8 168-62 248-24" />
        <path d="M0 846c120-40 210-24 292 18s164 52 260 8 168-62 248-24" opacity="0.5" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Salento — sun, sea and citrus in a keyline frame                    */
/* ------------------------------------------------------------------ */

export function SalentoArt({ className }: ArtProps) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 700 900" className={className} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id={`sun-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9a86f" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#d9774f" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* keyline frame with corner diamonds */}
      <g stroke="currentColor" opacity="0.55">
        <rect x="48" y="48" width="604" height="804" strokeWidth="1.1" />
        <rect x="64" y="64" width="572" height="772" strokeWidth="0.55" opacity="0.65" />
      </g>
      <g fill="currentColor" opacity="0.5">
        {[
          [48, 48],
          [652, 48],
          [48, 852],
          [652, 852],
        ].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y - 7}l7 7-7 7-7-7Z`} />
        ))}
      </g>

      {/* sun */}
      <g transform="translate(350 310)">
        <circle r="88" fill={`url(#sun-${uid})`} opacity="0.55" />
        <circle r="66" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        {Array.from({ length: 24 }).map((_, i) => (
          <path
            key={i}
            d="M0-80V-100"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.45"
            transform={`rotate(${i * 15})`}
          />
        ))}
      </g>

      {/* sea */}
      <g stroke="currentColor" strokeWidth="0.8" opacity="0.42">
        <path d="M120 560c30-14 54-14 84 0s54 14 84 0 54-14 84 0 54 14 84 0 54-14 84 0" />
        <path d="M120 588c30-14 54-14 84 0s54 14 84 0 54-14 84 0 54 14 84 0 54-14 84 0" opacity="0.75" />
        <path d="M150 616c26-12 48-12 74 0s48 12 74 0 48-12 74 0 48 12 74 0 48-12 74 0" opacity="0.5" />
      </g>

      {/* lemon branch */}
      <g transform="translate(520 178)" stroke="currentColor" strokeWidth="1" opacity="0.7">
        <path d="M0 0c36 26 48 66 42 112M18 34c-14 2-24 12-28 28M30 58c16 0 28 8 36 22M38 86c-12 6-18 16-18 30" />
        <g fill="currentColor" fillOpacity="0.16">
          <ellipse cx="-16" cy="58" rx="15" ry="26" transform="rotate(28 -16 58)" />
          <ellipse cx="70" cy="84" rx="14" ry="25" transform="rotate(-32 70 84)" />
          <ellipse cx="-8" cy="122" rx="13" ry="23" transform="rotate(18 -8 122)" />
        </g>
        <circle cx="44" cy="132" r="20" fill="currentColor" fillOpacity="0.18" />
        <circle cx="44" cy="132" r="20" stroke="currentColor" strokeWidth="0.8" />
        <path d="M44 112v40M24 132h40" strokeWidth="0.4" opacity="0.4" />
      </g>

      {/* olive sprig */}
      <g transform="translate(120 660)" stroke="currentColor" strokeWidth="0.9" opacity="0.55">
        <path d="M0 130c40-30 76-60 92-112M32 94c-16-2-28 6-34 22M52 74c18 0 30-8 36-24M70 50c-12-4-18-14-18-28" />
        <g fill="currentColor" fillOpacity="0.22">
          <ellipse cx="20" cy="106" rx="12" ry="5" transform="rotate(-24 20 106)" />
          <ellipse cx="66" cy="82" rx="12" ry="5" transform="rotate(18 66 82)" />
          <ellipse cx="78" cy="48" rx="11" ry="5" transform="rotate(-18 78 48)" />
        </g>
      </g>

      {/* tiled base */}
      <g stroke="currentColor" strokeWidth="0.7" opacity="0.35">
        <path d="M210 800h280" />
        {Array.from({ length: 9 }).map((_, i) => (
          <path
            key={i}
            d={`M${222 + i * 32} 788l8 8-8 8-8-8Z`}
            fill="currentColor"
            fillOpacity="0.1"
          />
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Noir — one calla lily                                               */
/* ------------------------------------------------------------------ */

export function NoirArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 500 800" className={className} aria-hidden="true" fill="none">
      <g stroke="currentColor" strokeWidth="0.8" opacity="0.5">
        <rect x="26" y="26" width="448" height="748" />
      </g>
      <g stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
        <path d="M252 724c4-108-6-206-28-292-18-70-46-116-78-152" />
        <path d="M236 528c26-18 44-44 52-76" strokeWidth="0.9" opacity="0.45" />
        <path d="M248 660c-36-8-64-30-82-62" strokeWidth="0.9" opacity="0.4" />
        <path
          d="M168 274c-14-50 4-102 48-132 26-18 58-22 84-10 20 10 30 30 24 50-10 34-46 58-92 72-22 7-44 14-64 20Z"
          strokeWidth="1.5"
        />
        <path d="M168 274c22-34 52-62 88-78" strokeWidth="0.8" opacity="0.5" />
        <path d="M300 132c-8 32-28 58-56 78-22 16-48 26-76 30" strokeWidth="0.8" opacity="0.35" />
        <path d="M286 140c2-24 16-42 38-52" strokeWidth="1" opacity="0.55" />
      </g>
      <g fill="currentColor" opacity="0.08">
        <path d="M168 274c-14-50 4-102 48-132 26-18 58-22 84-10-14 40-46 76-90 98-14 8-28 22-42 44Z" />
      </g>
      <g stroke="currentColor" strokeWidth="0.65" opacity="0.35" strokeLinecap="round">
        <path d="M216 732h84M226 744h64" />
      </g>
      <g fill="currentColor" opacity="0.4">
        <circle cx="352" cy="344" r="1.6" />
        <circle cx="150" cy="424" r="1.2" />
        <circle cx="348" cy="648" r="1.2" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Heirloom — engraved botanicals                                      */
/* ------------------------------------------------------------------ */

export function HeirloomArt({ className }: ArtProps) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 700 900" className={className} aria-hidden="true" fill="none">
      <defs>
        <radialGradient id={`sepia-${uid}`} cx="30%" cy="18%" r="70%">
          <stop offset="0%" stopColor="#fffdf5" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#3a2f24" stopOpacity="0.04" />
        </radialGradient>
      </defs>
      <rect width="700" height="900" fill={`url(#sepia-${uid})`} />
      <g stroke="currentColor" strokeWidth="0.9" opacity="0.55">
        <rect x="46" y="46" width="608" height="808" strokeWidth="0.6" />
        <rect x="58" y="58" width="584" height="784" strokeWidth="1" />
      </g>

      {/* engraved fern */}
      <g stroke="currentColor" strokeWidth="0.85" strokeLinecap="round" opacity="0.72">
        <path d="M182 790c52-118 78-236 70-354-6-84-30-148-64-198" />
        {Array.from({ length: 11 }).map((_, i) => {
          const y = 750 - i * 62;
          const x = 182 + (i < 5 ? i * 7 : 34 - (i - 5) * 3);
          const len = 58 - i * 3;
          return (
            <g key={i}>
              <path d={`M${x} ${y}c-${len * 0.7} -8 -${len} -22 -${len} -44`} />
              <path d={`M${x} ${y}c${len * 0.7} -8 ${len} -22 ${len} -44`} />
              <path d={`M${x - len * 0.6} ${y - 26}c-10 -6 -16 -14 -18 -24M${x + len * 0.6} ${y - 26}c10 -6 16 -14 18 -24`} strokeWidth="0.5" opacity="0.7" />
            </g>
          );
        })}
      </g>

      {/* wheat stems */}
      <g stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.55">
        <path d="M470 812c-8-120 4-228 40-324" />
        {Array.from({ length: 8 }).map((_, i) => {
          const x = 494 + i * 3;
          const y = 740 - i * 30;
          return (
            <g key={i}>
              <path d={`M${x} ${y}c-16 -4 -24 -14 -26 -28`} />
              <path d={`M${x + 6} ${y - 6}c14 -8 20 -20 18 -34`} transform="rotate(6)" />
            </g>
          );
        })}
      </g>

      {/* berry sprig */}
      <g stroke="currentColor" strokeWidth="0.8" opacity="0.6" strokeLinecap="round">
        <path d="M382 680c22-16 40-38 50-64M408 648c20-6 34-18 42-36M420 620c-4-18 2-32 18-42" />
      </g>
      <g fill="currentColor" opacity="0.3">
        {[
          [432, 616],
          [406, 648],
          [466, 570],
          [444, 590],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.4" />
        ))}
      </g>

      {/* postmark */}
      <g transform="translate(548 176)" stroke="currentColor" opacity="0.34" strokeWidth="0.7">
        <circle r="46" />
        <circle r="38" strokeDasharray="2 4" />
        <path d="M-68-14c26 6 42 20 52 44M-70 18c24-4 44 4 60 22" opacity="0.6" />
        <path d="M-18-10h38M-18 0h30M-18 10h34" opacity="0.6" />
      </g>

      <g fill="currentColor" opacity="0.4">
        <circle cx="150" cy="200" r="1.5" />
        <circle cx="520" cy="700" r="1.4" />
        <circle cx="320" cy="120" r="1.2" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Miel — hand-drawn joy in a stitched rectangular frame               */
/* ------------------------------------------------------------------ */

export function MielArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 700 900" className={className} aria-hidden="true" fill="none">
      {/* stitched rectangular border */}
      <g stroke="currentColor" strokeLinecap="round" opacity="0.6">
        <rect x="64" y="64" width="572" height="772" strokeWidth="2.2" />
        <rect
          x="80"
          y="80"
          width="540"
          height="740"
          strokeWidth="5"
          strokeDasharray="1 16"
          opacity="0.9"
        />
      </g>
      <g fill="currentColor" opacity="0.6">
        {[
          [64, 64],
          [636, 64],
          [64, 836],
          [636, 836],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" />
        ))}
      </g>

      {/* sun */}
      <g transform="translate(350 252)" stroke="#e6a23c" strokeWidth="2.4" strokeLinecap="round">
        <circle r="54" fill="#f7c873" fillOpacity="0.55" />
        {Array.from({ length: 10 }).map((_, i) => (
          <path key={i} d="M0-74v-14" transform={`rotate(${i * 36})`} />
        ))}
        <circle cx="-16" cy="-6" r="2.4" fill="#5c3a56" stroke="none" />
        <circle cx="16" cy="-6" r="2.4" fill="#5c3a56" stroke="none" />
        <path d="M-12 14c8 8 16 8 24 0" stroke="#5c3a56" strokeWidth="2" />
      </g>

      {/* chunky bouquet */}
      <g transform="translate(350 590)">
        <g stroke="#4c6b4a" strokeWidth="2.6" strokeLinecap="round">
          <path d="M0 150c-8-58-4-102 12-134M-28 150c4-56 18-98 42-128M34 150c-6-54-22-94-48-124" />
        </g>
        <g fill="#7f9a6c" stroke="#4c6b4a" strokeWidth="1.6">
          <ellipse cx="-48" cy="118" rx="16" ry="7" transform="rotate(-32 -48 118)" />
          <ellipse cx="52" cy="104" rx="16" ry="7" transform="rotate(28 52 104)" />
          <ellipse cx="-34" cy="72" rx="14" ry="6" transform="rotate(-50 -34 72)" />
        </g>
        <g>
          {[
            [0, -8, 46, '#e07a5f'],
            [-52, 22, 34, '#f2c14e'],
            [50, 26, 32, '#c98bb9'],
            [-26, -42, 28, '#f2a6a0'],
            [30, -44, 26, '#f7d9a0'],
          ].map(([x, y, r, fill], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              {Array.from({ length: 6 }).map((_, p) => (
                <ellipse
                  key={p}
                  cx="0"
                  cy={-Number(r) * 0.55}
                  rx={Number(r) * 0.42}
                  ry={Number(r) * 0.62}
                  fill={String(fill)}
                  fillOpacity="0.9"
                  stroke="#5c3a56"
                  strokeWidth="1.3"
                  transform={`rotate(${p * 60})`}
                />
              ))}
              <circle r={Number(r) * 0.24} fill="#5c3a56" />
            </g>
          ))}
        </g>
      </g>

      {/* confetti */}
      <g stroke="none">
        {[
          [168, 350, '#f2c14e'],
          [540, 370, '#e07a5f'],
          [196, 470, '#c98bb9'],
          [520, 470, '#7f9a6c'],
          [150, 640, '#f2a6a0'],
          [560, 660, '#f2c14e'],
          [250, 780, '#c98bb9'],
          [470, 790, '#e07a5f'],
        ].map(([x, y, fill], i) => (
          <circle key={i} cx={x} cy={y} r={i % 2 ? 5 : 3.4} fill={String(fill)} opacity="0.8" />
        ))}
        <path d="M188 400c8-10 18-10 24 0s-4 18-12 18" stroke="#e07a5f" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M530 570c10-8 20-4 22 6s-8 16-16 12" stroke="#5c3a56" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Exports                                                             */
/* ------------------------------------------------------------------ */

export function TemplateArt({ templateId, className }: { templateId: TemplateId; className?: string }) {
  switch (templateId) {
    case 'aurelia':
      return <AureliaArt className={className} />;
    case 'maison':
      return <MaisonArt className={className} />;
    case 'belgrave':
      return <BelgraveArt className={className} />;
    case 'celeste':
      return <CelesteArt className={className} />;
    case 'salento':
      return <SalentoArt className={className} />;
    case 'noir':
      return <NoirArt className={className} />;
    case 'heirloom':
      return <HeirloomArt className={className} />;
    case 'miel':
      return <MielArt className={className} />;
    default:
      return null;
  }
}

export function TemplateMark({ templateId, className }: { templateId: TemplateId; className?: string }) {
  const common = { className, 'aria-hidden': true as const, fill: 'none' };
  switch (templateId) {
    case 'aurelia':
      return (
        <svg viewBox="0 0 120 40" {...common}>
          <path d="M2 20h38M80 20h38" stroke="currentColor" strokeWidth="0.8" />
          <path d="M60 8l8 12-8 12-8-12Z" stroke="currentColor" strokeWidth="0.9" />
          <circle cx="60" cy="20" r="2" fill="currentColor" />
        </svg>
      );
    case 'maison':
      return (
        <svg viewBox="0 0 120 40" {...common}>
          <path d="M8 20h34M78 20h34" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
          {[46, 60, 74].map((x, i) => (
            <g key={x} transform={`translate(${x} ${20 + (i === 1 ? -3 : 0)}) scale(${i === 1 ? 1 : 0.8})`}>
              <circle r="5" fill="currentColor" opacity="0.25" />
              <circle r="2" fill="currentColor" opacity="0.7" />
              <path d="M0 5v6" stroke="currentColor" strokeWidth="0.7" />
            </g>
          ))}
        </svg>
      );
    case 'belgrave':
      return (
        <svg viewBox="0 0 120 40" {...common}>
          <path d="M6 30h24M90 30h24" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
          <g transform="translate(60 30)" stroke="currentColor" strokeWidth="0.9">
            <path d="M-22 0L0-18 22 0" fill="none" />
            <path d="M-22 0h44" strokeWidth="0.7" />
            <rect x="-7" y="-6" width="14" height="6" strokeWidth="0.7" fill="none" />
            <path d="M0-18v-4" strokeWidth="0.8" />
            <circle cy="-25" r="1.4" fill="currentColor" stroke="none" />
          </g>
        </svg>
      );
    case 'celeste':
      return (
        <svg viewBox="0 0 120 40" {...common}>
          <path d="M16 20h30M74 20h30" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
          <path d="M60 6l2.6 9.4L72 18l-9.4 2.6L60 30l-2.6-9.4L48 18l9.4-2.6Z" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="60" cy="18" r="1.4" fill="currentColor" />
        </svg>
      );
    case 'salento':
      return (
        <svg viewBox="0 0 120 40" {...common}>
          <path d="M8 20h34M78 20h34" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
          <g transform="translate(60 20)" stroke="currentColor" strokeWidth="0.8">
            <circle r="6" />
            {Array.from({ length: 8 }).map((_, i) => (
              <path key={i} d="M0-9v-4" transform={`rotate(${i * 45})`} />
            ))}
          </g>
        </svg>
      );
    case 'noir':
      return (
        <svg viewBox="0 0 120 40" {...common}>
          <path d="M6 20h44M70 20h44" stroke="currentColor" strokeWidth="0.7" />
          <path d="M60 12l4 8-4 8-4-8Z" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      );
    case 'heirloom':
      return (
        <svg viewBox="0 0 120 40" {...common}>
          <path d="M12 20h32M76 20h32" stroke="currentColor" strokeWidth="0.7" opacity="0.7" />
          <g transform="translate(60 20)" stroke="currentColor" strokeWidth="0.8">
            <path d="M0 10c0-8 4-14 10-18M0 10c0-8-4-14-10-18" />
            <path d="M2 2c4-1 6-3 7-6M-2 2c-4-1-6-3-7-6" />
            <circle cy="10" r="1.4" fill="currentColor" />
          </g>
        </svg>
      );
    case 'miel':
      return (
        <svg viewBox="0 0 120 40" {...common}>
          <path d="M14 20h28M78 20h28" stroke="currentColor" strokeWidth="1.4" strokeDasharray="1 6" strokeLinecap="round" />
          <g transform="translate(60 20)">
            {Array.from({ length: 5 }).map((_, i) => (
              <ellipse key={i} cx="0" cy="-6" rx="4" ry="6" fill="currentColor" fillOpacity="0.55" transform={`rotate(${i * 72})`} />
            ))}
            <circle r="2" fill="currentColor" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* The opening ceremony — seals, bows, corners and starfields          */
/* ------------------------------------------------------------------ */

/** A corner flourish for stationery cards: an L-shaped engraved scroll. */
export function CornerFlourish({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" className={className} aria-hidden="true">
      <path d="M2 46 C2 22 22 2 46 2" />
      <path d="M9 46 C9 26 26 9 46 9" strokeOpacity="0.55" />
      <circle cx="15" cy="15" r="1.7" fill="currentColor" stroke="none" />
      <path d="M21 21 c4 -2.5 8.5 -2 10.5 2" strokeOpacity="0.8" />
    </svg>
  );
}

/** Deterministic starfield — the same sky on every render. */
export function StarField({ className, count = 60 }: ArtProps & { count?: number }) {
  const stars = Array.from({ length: count }).map((_, i) => {
    const x = (i * 97.3 + 31.7) % 800;
    const y = (i * 57.1 + 13.3) % 600;
    const r = ((i * 7) % 3) * 0.5 + 0.6;
    const o = 0.22 + ((i * 13) % 10) / 16;
    return { x, y, r, o, sparkle: r > 1.3 };
  });
  return (
    <svg viewBox="0 0 800 600" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {stars.map((s, i) => (
        <g key={i} fill="currentColor" opacity={s.o}>
          <circle cx={s.x} cy={s.y} r={s.r} />
          {s.sparkle && (
            <path
              d={`M${s.x} ${s.y - s.r * 4}l${s.r * 0.7} ${s.r * 3.3} ${s.r * 3.3} ${s.r * 0.7}-${s.r * 3.3} ${s.r * 0.7}-${s.r * 0.7} ${s.r * 3.3}-${s.r * 0.7}-${s.r * 3.3}-${s.r * 3.3}-${s.r * 0.7} ${s.r * 3.3}-${s.r * 0.7}Z`}
              opacity="0.55"
            />
          )}
        </g>
      ))}
    </svg>
  );
}

/**
 * A wax seal stamped with the couple's monogram. When `cracked`, the two
 * halves separate along a jagged fault line.
 */
export function WaxSeal({
  monogram,
  cracked,
  className,
}: {
  monogram: string;
  cracked?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const body = `M60 9 C85 9 107 30 109 57 C111 85 90 109 61 110 C31 111 10 88 10 60 C10 33 35 9 60 9 Z`;
  const inner = `M60 21 C79 21 97 37 98 59 C99 81 82 98 61 99 C39 100 23 82 23 60 C23 38 41 21 60 21 Z`;
  const fault = `M58 10l5 14-7 12 6 13-8 12 7 13-5 12 6 12-4 12`;
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`wax-${uid}`} cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="34%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.42" />
        </radialGradient>
        <clipPath id={`wax-l-${uid}`}>
          <rect x="0" y="0" width="60" height="120" />
        </clipPath>
        <clipPath id={`wax-r-${uid}`}>
          <rect x="60" y="0" width="60" height="120" />
        </clipPath>
      </defs>
      {[`wax-l-${uid}`, `wax-r-${uid}`].map((clip, side) => (
        <g
          key={clip}
          clipPath={`url(#${clip})`}
          style={{
            transform: cracked ? (side === 0 ? 'translate(-9px, 3px) rotate(-14deg)' : 'translate(9px, 3px) rotate(14deg)') : 'none',
            transformBox: 'fill-box',
            transformOrigin: 'center',
            transition: 'transform 1.1s cubic-bezier(0.22, 0.61, 0.36, 1)',
            opacity: cracked ? 0.92 : 1,
          }}
        >
          <path d={body} fill={`url(#wax-${uid})`} style={{ color: 'inherit' }} />
          <path d={body} fill="currentColor" opacity="0.85" />
          <path d={inner} fill="none" stroke="#000" strokeOpacity="0.28" strokeWidth="1.4" />
          <path d={inner} fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="0.7" transform="translate(0 1)" />
          <text
            x="60"
            y="72"
            textAnchor="middle"
            fontSize="30"
            fill="#000"
            fillOpacity="0.42"
            style={{ fontFamily: 'var(--inv-script)' }}
          >
            {monogram}
          </text>
          <text
            x="60"
            y="70.5"
            textAnchor="middle"
            fontSize="30"
            fill="#fff"
            fillOpacity="0.32"
            style={{ fontFamily: 'var(--inv-script)' }}
          >
            {monogram}
          </text>
        </g>
      ))}
      <ellipse cx="44" cy="38" rx="20" ry="11" fill="#fff" opacity={cracked ? 0 : 0.16} transform="rotate(-18 44 38)" style={{ transition: 'opacity 0.5s' }} />
      <path
        d={fault}
        fill="none"
        stroke="#000"
        strokeOpacity="0.55"
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity={cracked ? 1 : 0}
        style={{ transition: 'opacity 0.25s' }}
      />
      <path
        d={fault}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.3"
        strokeWidth="0.8"
        strokeLinejoin="round"
        transform="translate(1.2 0)"
        opacity={cracked ? 1 : 0}
        style={{ transition: 'opacity 0.25s' }}
      />
    </svg>
  );
}

/** A gold silk bow, tied around the invitation — loosens when opened. */
export function GoldBow({ className }: ArtProps) {
  const uid = useId().replace(/:/g, '');
  const silk = `silk-${uid}`;
  return (
    <svg viewBox="0 0 120 92" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={silk} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4e2ab" />
          <stop offset="0.5" stopColor="#d5ae62" />
          <stop offset="1" stopColor="#9a7434" />
        </linearGradient>
      </defs>
      <path d="M58 44 C46 60 38 70 26 82 L44 84 C52 68 58 56 63 46 Z" fill={`url(#${silk})`} />
      <path d="M62 44 C74 60 82 70 94 82 L76 84 C68 68 62 56 57 46 Z" fill={`url(#${silk})`} />
      <path d="M60 38 C30 6 4 16 13 38 C19 55 44 52 60 41 Z" fill={`url(#${silk})`} />
      <path d="M60 38 C90 6 116 16 107 38 C101 55 76 52 60 41 Z" fill={`url(#${silk})`} />
      <path d="M60 38 C30 6 4 16 13 38" fill="none" stroke="#8a6a3c" strokeOpacity="0.4" />
      <path d="M60 38 C90 6 116 16 107 38" fill="none" stroke="#8a6a3c" strokeOpacity="0.4" />
      <path d="M60 38 C44 22 28 18 16 24 M60 38 C76 22 92 18 104 24" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.4" />
      <rect x="51" y="33" width="18" height="15" rx="5" fill={`url(#${silk})`} />
      <rect x="51" y="33" width="18" height="15" rx="5" fill="none" stroke="#8a6a3c" strokeOpacity="0.4" />
      <rect x="54" y="35.5" width="4" height="10" rx="2" fill="#fff" opacity="0.35" />
    </svg>
  );
}
