/**
 * Engraved ornament for the stationery covers.
 *
 * Everything here is drawn on a rectilinear grid — keylines, squares, diamonds
 * and foliate corners — apart from the circular wax seals and monograms, which
 * are always allowed. The ornaments are deliberately hairline-thin: they should
 * read as foil stamped into paper, never as clip-art.
 */

interface OrnamentProps {
  className?: string;
}

/** A gilded acanthus corner. Rotate / mirror it with CSS transforms. */
export function RoyalCorner({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeLinecap="round">
        <path d="M2 118V30C2 14 14 2 30 2h88" strokeWidth="1" />
        <path d="M9.5 118V34C9.5 20.4 20.4 9.5 34 9.5h84" strokeWidth="0.7" opacity="0.55" />
        <path d="M21 98V44c0-12.7 10.3-23 23-23h54" strokeWidth="0.7" opacity="0.95" />
        <path d="M31 69V52c0-11.6 9.4-21 21-21h17" strokeWidth="0.8" opacity="0.8" />
        <path
          d="M31 69c0-13 7-23 19-28 7-3 13-3 18-1"
          strokeWidth="0.9"
          opacity="0.9"
        />
        <path d="M36 63c-4-9-2-18 5-23 6-4 13-3 17 2 4 6 2 12-4 14-5 2-9-1-9-5" strokeWidth="0.9" opacity="0.95" />
        <path d="M52 51c1 5 5 8 10 8 2 0 4-1 6-2" strokeWidth="0.7" opacity="0.7" />
        <path d="M41 82c-6-2-11-1-15 3M25 91c-5 0-9 2-12 6" strokeWidth="0.7" opacity="0.6" />
        <path d="M82 41c2 6 1 11-3 15M91 25c0 5 2 9 6 12" strokeWidth="0.7" opacity="0.6" />
      </g>
      <g fill="currentColor">
        <circle cx="21" cy="21" r="2.6" />
        <circle cx="104" cy="9.5" r="1.4" opacity="0.75" />
        <circle cx="9.5" cy="88" r="1.4" opacity="0.75" />
        <path d="M45 39l4 4-4 4-4-4z" opacity="0.8" />
      </g>
    </svg>
  );
}

/**
 * A laurel ring, drawn as two engraved branches. Meant to be wrapped around a
 * script monogram: place an absolutely-centred span of text over it.
 */
export function LaurelCrest({ className }: OrnamentProps) {
  const leaf = (angle: number, tilt: number, side: 1 | -1) => (
    <g key={`${side}-${angle}`} transform={`rotate(${angle} 70 70)`}>
      <ellipse
        cx="70"
        cy={side === 1 ? 18.5 : 18.5}
        rx="2.5"
        ry="6.1"
        transform={`rotate(${tilt * side} 70 18.5)`}
      />
    </g>
  );
  const leftAngles = [148, 159, 170, 181, 192, 203, 214, 225, 236];
  const rightAngles = [32, 21, 10, -1, -12, -23, -34, -45, -56];
  return (
    <svg viewBox="0 0 140 140" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeLinecap="round">
        <circle cx="70" cy="70" r="65" strokeWidth="0.7" opacity="0.45" />
        <circle cx="70" cy="70" r="60.5" strokeWidth="0.5" opacity="0.35" />
        <path
          d="M70 130c-20-1-35-11-43-27M70 130c20-1 35-11 43-27"
          strokeWidth="1"
          opacity="0.7"
        />
      </g>
      <g fill="currentColor" opacity="0.9">
        {leftAngles.map((a) => leaf(a, 32, 1))}
        {rightAngles.map((a) => leaf(a, 32, -1))}
        <circle cx="26" cy="52" r="1.5" />
        <circle cx="104" cy="88" r="1.5" />
      </g>
    </svg>
  );
}

/** Hairline rule with a diamond at its heart. */
export function DiamondRule({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 160 12" fill="none" className={className} aria-hidden="true">
      <path d="M2 6h60M98 6h60" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
      <path d="M80 1.5l4.5 4.5L80 10.5 75.5 6z" stroke="currentColor" strokeWidth="0.9" />
      <path d="M68 6h4M88 6h4" stroke="currentColor" strokeWidth="1" />
      <circle cx="80" cy="6" r="1.1" fill="currentColor" />
    </svg>
  );
}

/** A small four-point star, used as a spacer and on the celestial covers. */
export function StarMark({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2c.9 5.3 4.7 9.1 10 10-5.3.9-9.1 4.7-10 10-.9-5.3-4.7-9.1-10-10 5.3-.9 9.1-4.7 10-10Z"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

/**
 * A theatrical valance with a straight fringe and two tassels. Used above the
 * curtain gate; deliberately not arched.
 */
export function ValanceFringe({ className }: OrnamentProps) {
  return (
    <svg viewBox="0 0 400 36" className={className} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id="valance-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="4" fill="url(#valance-gold)" />
      <g stroke="url(#valance-gold)" strokeWidth="1">
        {Array.from({ length: 80 }).map((_, i) => (
          <path key={i} d={`M${i * 5 + 2.5} 5v${i % 2 ? 9 : 7}`} opacity="0.75" />
        ))}
      </g>
      <g fill="currentColor">
        <path d="M12 10h6v10l-3 6-3-6z" opacity="0.85" />
        <path d="M382 10h6v10l-3 6-3-6z" opacity="0.85" />
      </g>
    </svg>
  );
}
