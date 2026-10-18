import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import type { InvitationData } from '@shared/types';
import { getTemplate } from '@/templates/registry';
import { playOpeningSound, type OpeningSoundHandle } from '@/lib/openingSound';

const EASE_SILK = [0.22, 0.61, 0.36, 1] as const;
const EASE_DOOR = [0.65, 0, 0.2, 1] as const;
const EASE_EXPAND = [0.76, 0, 0.24, 1] as const;

/** Cover artwork is 768 x 1376. */
const CARD_RATIO = 768 / 1376;

export function EnvelopeGate({
  data,
  templateId,
  guestName,
  onOpen,
  onIntent,
  embedded,
}: {
  data: InvitationData;
  templateId: string;
  guestName?: string;
  onOpen: () => void;
  onIntent?: () => void;
  embedded?: boolean;
}) {
  const reduce = useReducedMotion();
  const template = getTemplate(templateId);
  const { gate, hero, gateBg, gateInk } = template.art;
  const upper = template.cover.namesCase === 'upper';

  const [phase, setPhase] = useState(0);
  const [coverScale, setCoverScale] = useState(1);
  const gateRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  const sound = useRef<OpeningSoundHandle | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const focusTimer = window.setTimeout(() => buttonRef.current?.focus({ preventScroll: true }), 250);
    return () => {
      window.clearTimeout(focusTimer);
      timers.current.forEach((id) => window.clearTimeout(id));
      sound.current?.release(400);
    };
  }, []);

  const open = () => {
    if (started.current) return;
    started.current = true;

    // Both of these must happen inside the original gesture.
    onIntent?.();
    if (!reduce) sound.current = playOpeningSound();

    if (reduce) {
      onOpen();
      return;
    }

    const gateBox = gateRef.current?.getBoundingClientRect();
    const cardBox = cardRef.current?.getBoundingClientRect();
    if (gateBox && cardBox) {
      setCoverScale(Math.max(gateBox.width / cardBox.width, gateBox.height / cardBox.height) * 1.03);
    }

    const schedule: [number, number][] = [
      [60, 1], // the card lifts and catches the light
      [1600, 2], // the gatefold swings open
      [5000, 3], // the scene steps forward and fills the screen
    ];
    schedule.forEach(([delay, next]) => {
      timers.current.push(window.setTimeout(() => setPhase(next), delay));
    });
    timers.current.push(window.setTimeout(onOpen, 7000));
  };

  const lifted = phase >= 1;
  const doorsOpen = phase >= 2;
  const expanding = phase >= 3;

  const names = `${data.coupleA} & ${data.coupleB}`;

  return (
    <div
      ref={gateRef}
      className={`inv-gate inv-gate-${templateId} ${embedded ? 'inv-gate-embedded' : ''}`}
      style={{ background: gateBg, color: gateInk }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 38%, color-mix(in srgb, ${gateInk} 10%, transparent), transparent 62%)`,
        }}
      />

      {!reduce && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${(i * 41 + 7) % 100}%`,
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                background: gateInk,
              }}
              initial={{ y: '104vh', opacity: 0 }}
              animate={{ y: '-6vh', opacity: [0, 0.35, 0] }}
              transition={{ duration: 12 + (i % 5) * 2, delay: (i % 6) * 0.9, repeat: Infinity, ease: 'linear' }}
            />
          ))}
        </div>
      )}

      {!embedded && (
        <motion.button
          type="button"
          onClick={open}
          className="absolute right-4 top-4 z-30 rounded-full border px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] transition hover:opacity-100 sm:right-6 sm:top-6"
          style={{ borderColor: `color-mix(in srgb, ${gateInk} 35%, transparent)`, color: gateInk, opacity: 0.75, fontFamily: 'var(--inv-body)' }}
          animate={{ opacity: started.current ? 0 : 0.75 }}
        >
          Skip
        </motion.button>
      )}

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 py-6">
        <motion.p
          className="mb-4 min-h-[1.25rem] text-center text-[0.74rem] font-semibold uppercase tracking-[0.34em]"
          style={{ fontFamily: 'var(--inv-body)', color: gateInk }}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: lifted ? 0 : 0.8, y: 0 }}
          transition={{ duration: 0.8, delay: lifted ? 0 : 0.3, ease: EASE_SILK }}
        >
          {guestName && data.settings.showGuestName ? `For ${guestName}` : 'You are invited'}
        </motion.p>

        <motion.div
          ref={cardRef}
          className="relative"
          style={{
            width: embedded ? 'auto' : `min(90vw, calc(min(76svh, 52rem) * ${CARD_RATIO}))`,
            height: embedded ? '76%' : undefined,
            aspectRatio: '768 / 1376',
            perspective: '1800px',
            containerType: 'inline-size',
          }}
          initial={reduce ? false : { opacity: 0, y: 26, scale: 0.97 }}
          animate={
            expanding
              ? { opacity: 1, y: 0, scale: coverScale }
              : { opacity: 1, y: 0, scale: lifted ? 1.03 : 1 }
          }
          transition={
            expanding
              ? { duration: 1.9, ease: EASE_EXPAND }
              : { duration: lifted ? 1.4 : 1.2, ease: EASE_SILK }
          }
        >
          <div
            className="absolute inset-0 transition-shadow duration-[1400ms]"
            style={{
              boxShadow: lifted && !expanding ? '0 70px 120px -50px rgba(0,0,0,0.6)' : '0 40px 80px -50px rgba(0,0,0,0.4)',
            }}
            aria-hidden="true"
          />

          {/* the scene inside, waiting behind the doors */}
          <motion.div
            className="absolute inset-0 z-[1] overflow-hidden"
            initial={false}
            animate={{ filter: doorsOpen ? 'brightness(1)' : 'brightness(0.45)' }}
            transition={{ duration: 2.6, ease: EASE_SILK }}
          >
            <img src={hero} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/45" />
            <motion.div
              className="absolute inset-x-0 top-[33%] flex flex-col items-center px-[8%] text-center text-[#fdf7ea]"
              initial={false}
              animate={{ opacity: doorsOpen && !expanding ? 1 : 0, y: doorsOpen && !expanding ? 0 : 14 }}
              transition={{ duration: expanding ? 0.5 : 1.4, delay: doorsOpen && !expanding ? 1.3 : 0, ease: EASE_SILK }}
            >
              <span
                className={`block leading-[0.98] ${upper ? 'uppercase' : ''}`}
                style={{
                  fontFamily: 'var(--inv-display)',
                  fontSize: '13cqw',
                  letterSpacing: template.cover.tracking,
                  textShadow: '0 2px 26px rgba(0,0,0,0.4)',
                }}
              >
                {data.coupleA}
              </span>
              <span
                className="block leading-none"
                style={{ fontFamily: 'var(--inv-display)', fontStyle: 'italic', fontSize: '9cqw', margin: '1.2cqw 0' }}
              >
                &amp;
              </span>
              <span
                className={`block leading-[0.98] ${upper ? 'uppercase' : ''}`}
                style={{
                  fontFamily: 'var(--inv-display)',
                  fontSize: '13cqw',
                  letterSpacing: template.cover.tracking,
                  textShadow: '0 2px 26px rgba(0,0,0,0.4)',
                }}
              >
                {data.coupleB}
              </span>
            </motion.div>
          </motion.div>

          {/* the two leaves of the gatefold */}
          {(['left', 'right'] as const).map((side) => (
            <motion.div
              key={side}
              className="absolute inset-y-0 z-[3] w-1/2"
              style={{
                [side]: 0,
                transformOrigin: side === 'left' ? 'left center' : 'right center',
                backgroundImage: `url(${gate})`,
                backgroundSize: '200% 100%',
                backgroundPosition: side === 'left' ? '0% 0%' : '100% 0%',
                backfaceVisibility: 'hidden',
                willChange: 'transform',
              }}
              initial={false}
              animate={{
                rotateY: doorsOpen ? (side === 'left' ? -118 : 118) : 0,
                opacity: expanding ? 0 : 1,
              }}
              transition={{
                rotateY: { duration: 3.2, ease: EASE_DOOR },
                opacity: { duration: 0.6 },
              }}
            >
              <motion.div
                className="absolute inset-0 bg-black"
                initial={false}
                animate={{ opacity: doorsOpen ? 0.55 : 0 }}
                transition={{ duration: 2.4, ease: EASE_SILK }}
              />
            </motion.div>
          ))}

          {/* light travelling across the paper before it opens */}
          {!reduce && (
            <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden" aria-hidden="true">
              <motion.div
                className="absolute inset-y-0 w-[55%]"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 0%, rgba(255,244,214,0.0) 20%, rgba(255,244,214,0.55) 50%, rgba(255,244,214,0) 80%, transparent 100%)',
                  mixBlendMode: 'soft-light',
                }}
                initial={{ x: '-120%' }}
                animate={{ x: lifted ? '260%' : '-120%', opacity: doorsOpen ? 0 : 1 }}
                transition={{ x: { duration: 1.6, ease: EASE_SILK }, opacity: { duration: 0.3 } }}
              />
            </div>
          )}

          {/* the name card tucked under the ribbon */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[8.5%] z-[5] -translate-x-1/2 whitespace-nowrap text-center shadow-[0_10px_24px_-14px_rgba(40,26,12,0.7)]"
            style={{
              width: '60%',
              padding: '2.4cqw 3cqw',
              background: 'color-mix(in srgb, var(--inv-surface) 96%, #fff)',
              color: 'var(--inv-ink)',
              border: '1px solid color-mix(in srgb, var(--inv-accent) 35%, transparent)',
            }}
            initial={false}
            animate={{ opacity: lifted ? 0 : 1, y: lifted ? -10 : 0 }}
            transition={{ duration: 0.9, ease: EASE_SILK }}
          >
            <span
              className="block leading-none"
              style={{ fontFamily: 'var(--inv-script)', fontSize: names.length > 18 ? '6.2cqw' : '7.6cqw' }}
            >
              {names}
            </span>
          </motion.div>

          <button
            ref={buttonRef}
            type="button"
            onClick={open}
            aria-label="Open the invitation"
            className="absolute inset-0 z-[6] cursor-pointer rounded-sm"
          />
        </motion.div>

        <motion.div
          className="mt-5 flex min-h-[3rem] flex-col items-center gap-2 text-center"
          initial={false}
          animate={{ opacity: lifted ? 0 : 1 }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="text-[0.8rem] font-semibold uppercase tracking-[0.44em]"
            style={{ fontFamily: 'var(--inv-body)', color: gateInk }}
          >
            Tap to open
          </span>
          {data.music.enabled && (
            <span
              className="flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--inv-body)', color: gateInk, opacity: 0.6 }}
            >
              <Music2 size={12} aria-hidden /> Music begins as it opens
            </span>
          )}
        </motion.div>
      </div>
    </div>
  );
}
