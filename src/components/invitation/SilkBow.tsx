import { useId } from 'react';
import { motion } from 'framer-motion';

export interface SilkTones {
  light: string;
  mid: string;
  dark: string;
}

const EASE_SILK = [0.22, 0.61, 0.36, 1] as const;

/**
 * A silk bow, drawn as silk — folded loops, falling tails, a wrapped knot —
 * that genuinely unties: the knot loosens first, the loops collapse into
 * the tails, and the tails slip away. One continuous, quiet motion.
 */
export function SilkBow({
  tones,
  untied,
  className,
}: {
  tones: SilkTones;
  untied: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const silk = `silk-${uid}`;
  const anim = (open: Record<string, number>, delay: number, duration = 1.05) => ({
    initial: false as const,
    animate: untied ? open : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 },
    transition: { duration, delay: untied ? delay : 0, ease: EASE_SILK },
  });

  return (
    <svg viewBox="0 0 220 170" className={className} aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={silk} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={tones.light} />
          <stop offset="0.52" stopColor={tones.mid} />
          <stop offset="1" stopColor={tones.dark} />
        </linearGradient>
        <linearGradient id={`${silk}-v`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tones.light} />
          <stop offset="0.55" stopColor={tones.mid} />
          <stop offset="1" stopColor={tones.dark} />
        </linearGradient>
      </defs>

      {/* tails — they slip down and away last */}
      <motion.g {...anim({ opacity: 0, y: 34, rotate: 14, x: -8 }, 0.42, 1.15)} style={{ transformBox: 'fill-box', transformOrigin: '85% 0%' }}>
        <path d="M104 84 C92 112 82 132 62 152 L88 156 C100 132 106 106 108 88 Z" fill={`url(#${silk}-v)`} />
        <path d="M104 84 C92 112 82 132 62 152" fill="none" stroke={tones.dark} strokeOpacity="0.35" strokeWidth="1" />
        <path d="M96 92 C88 112 80 128 70 140" fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="2" />
      </motion.g>
      <motion.g {...anim({ opacity: 0, y: 34, rotate: -14, x: 8 }, 0.42, 1.15)} style={{ transformBox: 'fill-box', transformOrigin: '15% 0%' }}>
        <path d="M116 84 C128 112 138 132 158 152 L132 156 C120 132 114 106 112 88 Z" fill={`url(#${silk}-v)`} />
        <path d="M116 84 C128 112 138 132 158 152" fill="none" stroke={tones.dark} strokeOpacity="0.35" strokeWidth="1" />
        <path d="M124 92 C132 112 140 128 150 140" fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="2" />
      </motion.g>

      {/* loops — they fold in toward the knot and vanish into it */}
      <motion.g {...anim({ opacity: 0, scale: 0.25, rotate: -18, x: 10 }, 0.12, 0.95)} style={{ transformBox: 'fill-box', transformOrigin: '100% 60%' }}>
        <path d="M108 74 C62 22 14 26 20 58 C25 86 74 92 108 80 Z" fill={`url(#${silk})`} />
        <path d="M108 74 C62 22 14 26 20 58" fill="none" stroke={tones.dark} strokeOpacity="0.4" strokeWidth="1" />
        <path d="M96 66 C66 36 38 34 34 52 C58 44 80 50 96 66 Z" fill="#fff" opacity="0.2" />
        <path d="M100 76 C74 58 48 54 30 60" fill="none" stroke={tones.dark} strokeOpacity="0.25" strokeWidth="1.2" />
      </motion.g>
      <motion.g {...anim({ opacity: 0, scale: 0.22, rotate: 18, x: -10 }, 0.56, 1.1)} style={{ transformBox: 'fill-box', transformOrigin: '0% 60%' }}>
        <path d="M112 74 C158 22 206 26 200 58 C195 86 146 92 112 80 Z" fill={`url(#${silk})`} />
        <path d="M112 74 C158 22 206 26 200 58" fill="none" stroke={tones.dark} strokeOpacity="0.4" strokeWidth="1" />
        <path d="M124 66 C154 36 182 34 186 52 C162 44 140 50 124 66 Z" fill="#fff" opacity="0.2" />
        <path d="M120 76 C146 58 172 54 190 60" fill="none" stroke={tones.dark} strokeOpacity="0.25" strokeWidth="1.2" />
      </motion.g>

      {/* the knot — loosens, then drops away */}
      <motion.g {...anim({ opacity: 0, scale: 0.6, y: 16 }, 0.55, 0.8)} style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}>
        <rect x="97" y="62" width="26" height="24" rx="7" fill={`url(#${silk}-v)`} />
        <rect x="97" y="62" width="26" height="24" rx="7" fill="none" stroke={tones.dark} strokeOpacity="0.45" />
        <rect x="103" y="66" width="5" height="16" rx="2.5" fill="#fff" opacity="0.35" />
      </motion.g>
    </svg>
  );
}

/** The ribbon band the bow is tied over — two halves that slide off the card. */
export function RibbonBand({
  tones,
  released,
  delay = 0.7,
}: {
  tones: SilkTones;
  released: boolean;
  delay?: number;
}) {
  const half = (side: 'left' | 'right') => ({
    initial: false as const,
    animate: released ? { x: side === 'left' ? '-106%' : '106%', opacity: 0.9 } : { x: '0%', opacity: 1 },
    transition: { duration: 0.95, delay: released ? delay : 0, ease: EASE_SILK },
  });
  const bg = (dir: string) =>
    `linear-gradient(${dir}, ${tones.dark} 0%, ${tones.mid} 38%, ${tones.light} 50%, ${tones.mid} 64%, ${tones.dark} 100%)`;
  return (
    <>
      <motion.div
        aria-hidden="true"
        className="absolute top-[46%] left-0 h-[8%] w-[50.4%]"
        style={{ background: bg('180deg'), boxShadow: '0 6px 14px -6px rgba(30,20,8,0.45)', zIndex: 22 }}
        {...half('left')}
      />
      <motion.div
        aria-hidden="true"
        className="absolute top-[46%] right-0 h-[8%] w-[50.4%]"
        style={{ background: bg('180deg'), boxShadow: '0 6px 14px -6px rgba(30,20,8,0.45)', zIndex: 22 }}
        {...half('right')}
      />
      <motion.div
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-[46%] w-[8%]"
        style={{ background: bg('90deg'), opacity: 0.55, zIndex: 21 }}
        initial={false}
        animate={released ? { opacity: 0 } : { opacity: 0.55 }}
        transition={{ duration: 0.7, delay: released ? delay : 0, ease: EASE_SILK }}
      />
    </>
  );
}
