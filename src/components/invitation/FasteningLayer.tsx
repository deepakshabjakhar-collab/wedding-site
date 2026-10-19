import { motion } from 'framer-motion';

/**
 * The fastening as a real object.
 *
 * Each template's bow / seal / band was extracted from its own cover
 * photograph (OpenCV GrabCut, scripts in git history) into a transparent
 * PNG that sits in perfect register over the matching “released” cover —
 * the same scene with the fastening gone. Because the pieces are the
 * photograph, they can do what a photograph alone cannot: the loops fold
 * in, the tails slip away, the seal cracks in two, the band slides off.
 * What is revealed underneath is not a patch — it is the cover itself,
 * already untied.
 */

export type FasteningType = 'bow' | 'bow-seal' | 'seal' | 'band-seal' | 'curtain';

export interface FasteningConfig {
  type: FasteningType;
  /** crop box of fastening.png inside the cover image, fractions */
  box: [number, number, number, number];
  /** knot / seal centre inside that box, % */
  knot: [number, number];
}

export const FASTENING_CONFIG: Record<string, FasteningConfig> = {
  aurelia: { type: 'bow-seal', box: [0.1, 0.27, 0.96, 0.73], knot: [47.7, 28.3] },
  maison: { type: 'bow', box: [0.27, 0.33, 0.66, 0.76], knot: [51, 23] },
  belgrave: { type: 'curtain', box: [0, 0, 1, 1], knot: [50, 50] },
  celeste: { type: 'bow', box: [0.24, 0.15, 1.0, 0.5], knot: [48.7, 28.6] },
  salento: { type: 'bow', box: [0.33, 0.27, 0.86, 0.68], knot: [43, 41] },
  noir: { type: 'band-seal', box: [0.19, 0.255, 0.76, 0.375], knot: [50, 50] },
  heirloom: { type: 'seal', box: [0.36, 0.26, 0.68, 0.54], knot: [47, 36] },
  miel: { type: 'bow', box: [0.33, 0.19, 0.85, 0.6], knot: [48, 41] },
};

export const FASTEN_MS: Record<FasteningType, number> = {
  'bow': 2000,
  'bow-seal': 2200,
  'seal': 1700,
  'band-seal': 1900,
  'curtain': 2500,
};

const EASE_SILK = [0.22, 0.61, 0.36, 1] as const;

function Piece({
  src,
  clip,
  released,
  origin,
  closed = { opacity: 1, x: '0%', y: '0%', rotate: 0, scale: 1 },
  open,
  delay = 0,
  duration = 1.05,
}: {
  src: string;
  clip: string;
  released: boolean;
  origin: string;
  closed?: Record<string, number | string>;
  open: Record<string, number | string>;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0"
      style={{ clipPath: clip, transformOrigin: origin, willChange: 'transform, opacity' }}
      initial={false}
      animate={released ? open : closed}
      transition={{ duration, delay: released ? delay : 0, ease: EASE_SILK }}
    >
      <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full" />
    </motion.div>
  );
}

const inset = (t: number, r: number, b: number, l: number) => `inset(${t}% ${r}% ${b}% ${l}%)`;

export function FasteningLayer({
  templateId,
  released,
}: {
  templateId: string;
  released: boolean;
}) {
  const config = FASTENING_CONFIG[templateId] ?? FASTENING_CONFIG.aurelia;
  if (config.type === 'curtain') return null;
  const [x0, y0, x1, y1] = config.box;
  const [kx, ky] = config.knot;
  const knotOrigin = `${kx}% ${ky}%`;

  const boxStyle: React.CSSProperties = {
    left: `${x0 * 100}%`,
    top: `${y0 * 100}%`,
    width: `${(x1 - x0) * 100}%`,
    height: `${(y1 - y0) * 100}%`,
  };

  if (config.type === 'band-seal') {
    return (
      <>
        <div className="absolute" style={boxStyle}>
          <Piece src="/fastenings/noir-band.png" clip={inset(0, 50, 0, 0)} released={released} origin="100% 50%"
            open={{ x: '-92%', opacity: 0.85 }} delay={0.65} duration={1.0} />
          <Piece src="/fastenings/noir-band.png" clip={inset(0, 0, 0, 50)} released={released} origin="0% 50%"
            open={{ x: '92%', opacity: 0.85 }} delay={0.65} duration={1.0} />
        </div>
        <div className="absolute" style={{ left: '43.5%', top: '26.5%', width: '13%', height: '10%' }}>
          <Piece src="/fastenings/noir-seal.png" clip={inset(0, 50, 0, 0)} released={released} origin="100% 50%"
            open={{ x: '-38%', y: '30%', rotate: -18, opacity: 0 }} duration={0.85} />
          <Piece src="/fastenings/noir-seal.png" clip={inset(0, 0, 0, 50)} released={released} origin="0% 50%"
            open={{ x: '38%', y: '30%', rotate: 18, opacity: 0 }} duration={0.85} />
        </div>
      </>
    );
  }

  const src = `/fastenings/${templateId}.png`;
  const sealFirst = config.type === 'bow-seal' ? 0.5 : 0;

  return (
    <div className="absolute" style={boxStyle}>
      {(config.type === 'seal' || config.type === 'bow-seal') && (
        <>
          {/* the seal cracks: two photographic halves part along the fault */}
          <Piece src={src} clip={inset(Math.max(0, ky - 17), 100 - kx, Math.max(0, 83 - ky), Math.max(0, kx - 17))} released={released} origin={knotOrigin}
            open={{ x: '-5%', y: '6%', rotate: -15, opacity: 0 }} duration={0.85} />
          <Piece src={src} clip={inset(Math.max(0, ky - 17), Math.max(0, 83 - kx), Math.max(0, 83 - ky), kx)} released={released} origin={knotOrigin}
            open={{ x: '5%', y: '6%', rotate: 15, opacity: 0 }} duration={0.85} />
        </>
      )}

      {config.type === 'seal' && (
        <Piece src={src} clip={inset(ky + 13, 0, 0, 0)} released={released} origin={knotOrigin}
          open={{ y: '36%', opacity: 0 }} delay={0.3} duration={0.95} />
      )}

      {(config.type === 'bow' || config.type === 'bow-seal') && (
        <>
          <Piece src={src} clip={inset(0, 50, 100 - ky - 6, 0)} released={released} origin={knotOrigin}
            open={{ scale: 0.45, rotate: -26, x: '-5%', y: '7%', opacity: 0 }} delay={sealFirst} duration={1.0} />
          <Piece src={src} clip={inset(0, 0, 100 - ky - 6, 50)} released={released} origin={knotOrigin}
            open={{ scale: 0.45, rotate: 26, x: '5%', y: '7%', opacity: 0 }} delay={sealFirst} duration={1.0} />
          <Piece src={src} clip={inset(ky + 4, 50, 0, 0)} released={released} origin={knotOrigin}
            open={{ y: '38%', x: '-7%', rotate: 13, opacity: 0 }} delay={sealFirst + 0.3} duration={1.1} />
          <Piece src={src} clip={inset(ky + 4, 0, 0, 50)} released={released} origin={knotOrigin}
            open={{ y: '38%', x: '7%', rotate: -13, opacity: 0 }} delay={sealFirst + 0.3} duration={1.1} />
          <Piece src={src} clip={`circle(11% at ${kx}% ${ky}%)`} released={released} origin={knotOrigin}
            open={{ scale: 0.5, y: '22%', opacity: 0 }} delay={sealFirst + 0.55} duration={0.75} />
        </>
      )}
    </div>
  );
}
