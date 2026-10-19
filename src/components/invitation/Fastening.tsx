import { motion } from 'framer-motion';

/**
 * The fastening, rebuilt as live pieces of the cover photograph itself.
 *
 * Every cover photo has its fastening painted in — a bow, a wax seal, a pair
 * of theatre curtains. A painted bow cannot untie, so the gate rebuilds it:
 * each piece below is a full copy of the same photograph, clipped to just the
 * loop / tail / band / seal / drape it represents, stacked over a "released"
 * cover whose fastening has been softly erased. Because the pieces *are* the
 * photograph, they sit in perfect register — until Act I, when the bow
 * genuinely unties, the seal genuinely cracks, the tiebacks genuinely drop.
 * Only when the fastening is undone does Act II part the cover.
 */

export type FasteningKind = 'bow' | 'bow-seal' | 'seal' | 'seal-band' | 'curtain';

export interface FasteningSpec {
  kind: FasteningKind;
  /** knot / seal centre, % of the cover image */
  cx: number;
  cy: number;
  /** bow span, % of image width */
  bowW: number;
  /** where the tails end, % of image height */
  tailTo: number;
  /** a ribbon band runs behind the bow at cy */
  band: boolean;
  /** seal radius, % of image width (seal kinds) */
  sealR: number;
}

/** What actually fastens each photographed cover (the registry's `envelope`
 *  describes the art direction, not the photograph — the photograph wins). */
export const FASTENING: Record<string, FasteningSpec> = {
  aurelia:  { kind: 'bow-seal',  cx: 51, cy: 40, bowW: 74, tailTo: 68, band: true,  sealR: 6.5 },
  maison:   { kind: 'bow',       cx: 47, cy: 43, bowW: 54, tailTo: 73, band: false, sealR: 0 },
  belgrave: { kind: 'curtain',   cx: 50, cy: 62, bowW: 0,  tailTo: 0,  band: false, sealR: 0 },
  celeste:  { kind: 'bow',       cx: 61, cy: 25, bowW: 82, tailTo: 47, band: true,  sealR: 0 },
  salento:  { kind: 'bow',       cx: 56, cy: 44, bowW: 60, tailTo: 67, band: true,  sealR: 0 },
  noir:     { kind: 'seal-band', cx: 50, cy: 33, bowW: 0,  tailTo: 0,  band: true,  sealR: 6 },
  heirloom: { kind: 'seal',      cx: 51, cy: 36, bowW: 0,  tailTo: 48, band: false, sealR: 7 },
  miel:     { kind: 'bow',       cx: 58, cy: 36, bowW: 56, tailTo: 69, band: false, sealR: 0 },
};

export const FASTEN_MS: Record<FasteningKind, number> = {
  'bow': 1750,
  'bow-seal': 2000,
  'seal': 1350,
  'seal-band': 1600,
  'curtain': 1050,
};

const EASE_SILK = [0.22, 0.61, 0.36, 1] as const;

/** One clipped copy of the cover photograph. */
function Piece({
  src,
  clip,
  released,
  closed,
  open,
  origin,
  delay = 0,
  duration = 1,
  z = 30,
}: {
  src: string;
  clip: string;
  released: boolean;
  closed: Record<string, number | string>;
  open: Record<string, number | string>;
  origin?: string;
  delay?: number;
  duration?: number;
  z?: number;
}) {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0"
      style={{ clipPath: clip, transformOrigin: origin ?? '50% 50%', zIndex: z, willChange: 'transform, opacity' }}
      initial={false}
      animate={released ? open : closed}
      transition={{ duration, delay: released ? delay : 0, ease: EASE_SILK }}
    >
      <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
    </motion.div>
  );
}

const poly = (pts: [number, number][]) => `polygon(${pts.map(([x, y]) => `${x}% ${y}%`).join(', ')})`;

/** Softly erase the fastening from the cover underneath the live pieces:
 *  the same photograph, blurred hard and muted, visible only where the
 *  fastening sits — so when the pieces leave, the cover reads as released,
 *  not as a bow with a ghost. */
export function ReleasedCover({ src, spec, tint }: { src: string; spec: FasteningSpec; tint: string }) {
  if (spec.kind === 'curtain') {
    // The drapes themselves are the cover; beneath them is only the glow
    // of the stage. Keep the photographed floor and backdrop.
    return <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />;
  }
  const bowPatch =
    spec.kind === 'seal'
      ? `circle(${spec.sealR * 1.9}% at ${spec.cx}% ${spec.cy + 4}%)`
      : `ellipse(${spec.bowW * 0.58}% ${(spec.tailTo - spec.cy) * 0.95}% at ${spec.cx}% ${(spec.cy + spec.tailTo) / 2}%)`;
  return (
    <>
      <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0" style={{ clipPath: bowPatch }}>
        <img
          src={src}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full scale-[1.04] object-cover"
          style={{ filter: 'blur(30px) saturate(0.55) brightness(1.06)' }}
        />
        <div className="absolute inset-0" style={{ background: tint, opacity: 0.5 }} />
      </div>
      {spec.band && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ clipPath: `polygon(4% ${spec.cy - 5}%, 96% ${spec.cy - 5}%, 96% ${spec.cy + 5}%, 4% ${spec.cy + 5}%)` }}
        >
          <img
            src={src}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full scale-[1.04] object-cover"
            style={{ filter: 'blur(30px) saturate(0.55) brightness(1.06)' }}
          />
          <div className="absolute inset-0" style={{ background: tint, opacity: 0.5 }} />
        </div>
      )}
    </>
  );
}

/** Act I — the fastening undoes itself. Rendered over the released cover. */
export function FasteningPieces({ src, spec, released }: { src: string; spec: FasteningSpec; released: boolean }) {
  const { cx, cy, bowW, tailTo, sealR } = spec;
  const pieces: React.ReactNode[] = [];

  if (spec.kind === 'curtain') {
    // The gold ropes are cut first; the tassels drop.
    pieces.push(
      <Piece key="rope-l" src={src} released={released} z={32}
        clip={poly([[0, 26], [30, 62], [33, 66], [27, 68], [0, 34]])}
        closed={{ opacity: 1, y: '0%' }} open={{ opacity: 0, y: '26%', rotate: -4 }} origin="30% 60%" duration={0.7} />,
      <Piece key="rope-r" src={src} released={released} z={32}
        clip={poly([[100, 26], [70, 62], [67, 66], [73, 68], [100, 34]])}
        closed={{ opacity: 1, y: '0%' }} open={{ opacity: 0, y: '26%', rotate: 4 }} origin="70% 60%" duration={0.7} />,
      <Piece key="tassel-l" src={src} released={released} z={33}
        clip={`circle(9% at 28% 74%)`}
        closed={{ opacity: 1, y: '0%' }} open={{ opacity: 0, y: '34%' }} delay={0.12} duration={0.75} />,
      <Piece key="tassel-r" src={src} released={released} z={33}
        clip={`circle(9% at 72% 74%)`}
        closed={{ opacity: 1, y: '0%' }} open={{ opacity: 0, y: '34%' }} delay={0.12} duration={0.75} />,
    );
    return <>{pieces}</>;
  }

  if (spec.band) {
    const h = spec.kind === 'seal-band' ? 5.5 : 4.6;
    pieces.push(
      <Piece key="band-l" src={src} released={released} z={28}
        clip={poly([[2, cy - h], [cx - 1, cy - h], [cx - 1, cy + h], [2, cy + h]])}
        closed={{ x: '0%' }} open={{ x: '-96%' }} delay={spec.kind === 'seal-band' ? 0.55 : 0.85} duration={0.95} />,
      <Piece key="band-r" src={src} released={released} z={28}
        clip={poly([[cx + 1, cy - h], [98, cy - h], [98, cy + h], [cx + 1, cy + h]])}
        closed={{ x: '0%' }} open={{ x: '96%' }} delay={spec.kind === 'seal-band' ? 0.55 : 0.85} duration={0.95} />,
    );
  }

  if (spec.kind === 'seal' || spec.kind === 'seal-band' || spec.kind === 'bow-seal') {
    const r = sealR;
    pieces.push(
      <Piece key="seal-l" src={src} released={released} z={34}
        clip={poly([[cx - r * 1.5, cy - r * 1.9], [cx + 0.4, cy - r * 1.9], [cx - 0.4, cy + r * 1.9], [cx - r * 1.5, cy + r * 1.9]])}
        closed={{ opacity: 1, x: '0%', y: '0%', rotate: 0 }}
        open={{ opacity: 0, x: '-7%', y: '9%', rotate: -16 }} origin={`${cx}% ${cy}%`} duration={0.8} />,
      <Piece key="seal-r" src={src} released={released} z={34}
        clip={poly([[cx - 0.4, cy - r * 1.9], [cx + r * 1.5, cy - r * 1.9], [cx + r * 1.5, cy + r * 1.9], [cx + 0.4, cy + r * 1.9]])}
        closed={{ opacity: 1, x: '0%', y: '0%', rotate: 0 }}
        open={{ opacity: 0, x: '7%', y: '9%', rotate: 16 }} origin={`${cx}% ${cy}%`} duration={0.8} />,
    );
    if (spec.kind === 'seal') {
      // Heirloom's little ribbon tails fall away under the broken seal.
      pieces.push(
        <Piece key="seal-tails" src={src} released={released} z={33}
          clip={poly([[cx - r * 1.1, cy + r * 1.2], [cx + r * 1.1, cy + r * 1.2], [cx + r * 0.9, tailTo], [cx, tailTo - 3], [cx - r * 0.9, tailTo]])}
          closed={{ opacity: 1, y: '0%' }} open={{ opacity: 0, y: '22%' }} delay={0.25} duration={0.8} />,
      );
    }
  }

  if (spec.kind === 'bow' || spec.kind === 'bow-seal') {
    const half = bowW / 2;
    const loopH = Math.max(9, (tailTo - cy) * 0.42);
    const sealDelay = spec.kind === 'bow-seal' ? 0.45 : 0;
    pieces.push(
      <Piece key="loop-l" src={src} released={released} z={31}
        clip={poly([[cx - half, cy + 1], [cx - half * 0.92, cy - loopH], [cx - half * 0.34, cy - loopH * 1.05], [cx - 1.5, cy - 2], [cx - 1.5, cy + 2.5]])}
        closed={{ opacity: 1, scale: 1, rotate: 0, x: '0%', y: '0%' }}
        open={{ opacity: 0, scale: 0.45, rotate: -32, x: '-6%', y: '7%' }}
        origin={`${cx}% ${cy}%`} delay={sealDelay} duration={0.95} />,
      <Piece key="loop-r" src={src} released={released} z={31}
        clip={poly([[cx + half, cy + 1], [cx + half * 0.92, cy - loopH], [cx + half * 0.34, cy - loopH * 1.05], [cx + 1.5, cy - 2], [cx + 1.5, cy + 2.5]])}
        closed={{ opacity: 1, scale: 1, rotate: 0, x: '0%', y: '0%' }}
        open={{ opacity: 0, scale: 0.45, rotate: 32, x: '6%', y: '7%' }}
        origin={`${cx}% ${cy}%`} delay={sealDelay} duration={0.95} />,
      <Piece key="tail-l" src={src} released={released} z={30}
        clip={poly([[cx - half * 0.72, cy + 1], [cx - 1.2, cy + 1], [cx - 2.5, tailTo - 2], [cx - half * 0.5, tailTo]])}
        closed={{ opacity: 1, x: '0%', y: '0%', rotate: 0 }}
        open={{ opacity: 0, x: '-9%', y: '30%', rotate: 18 }}
        origin={`${cx}% ${cy}%`} delay={sealDelay + 0.28} duration={1.05} />,
      <Piece key="tail-r" src={src} released={released} z={30}
        clip={poly([[cx + 1.2, cy + 1], [cx + half * 0.72, cy + 1], [cx + half * 0.5, tailTo], [cx + 2.5, tailTo - 2]])}
        closed={{ opacity: 1, x: '0%', y: '0%', rotate: 0 }}
        open={{ opacity: 0, x: '9%', y: '30%', rotate: -18 }}
        origin={`${cx}% ${cy}%`} delay={sealDelay + 0.28} duration={1.05} />,
      <Piece key="knot" src={src} released={released} z={35}
        clip={`circle(${Math.max(3.2, bowW * 0.075)}% at ${cx}% ${cy}%)`}
        closed={{ opacity: 1, scale: 1, y: '0%' }}
        open={{ opacity: 0, scale: 0.55, y: '26%' }}
        origin={`${cx}% ${cy}%`} delay={sealDelay + 0.5} duration={0.7} />,
    );
  }

  return <>{pieces}</>;
}

/** Act II geometry for the cover itself, once the fastening is undone. */
export const CURTAIN_CLIPS = {
  // Overlapping at the centre on purpose: while closed there is no gap for
  // the letter to peek through; the photograph's own glowing card shows
  // through the overlap, exactly as it does in the picture.
  left: 'polygon(0% 0%, 58% 0%, 46% 100%, 0% 100%)',
  right: 'polygon(42% 0%, 100% 0%, 100% 100%, 54% 100%)',
};
