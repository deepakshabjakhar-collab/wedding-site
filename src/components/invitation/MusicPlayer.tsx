import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { formatAudioTime, type AudioPlayer } from '@/lib/useAudioPlayer';

export function MusicPlayer({
  player,
  title,
  artist,
  embedded,
}: {
  player: AudioPlayer;
  title: string;
  artist: string;
  embedded?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;
    const onPointer = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setExpanded(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setExpanded(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [expanded]);

  const progress = player.duration ? Math.min(100, (player.time / player.duration) * 100) : 0;

  return (
    <div
      ref={ref}
      className={`inv-music ${embedded ? '!absolute' : ''}`}
      style={{ bottom: '1rem', right: '1rem' }}
    >
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-[calc(100%+0.65rem)] right-0 w-[17rem] rounded-2xl border border-[var(--inv-accent)]/25 bg-[var(--inv-deep)]/95 p-4 text-[var(--inv-deep-ink)] shadow-2xl backdrop-blur-md"
          >
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.22em] opacity-55">
              The soundtrack
            </p>
            <p className="mt-1 truncate font-[var(--inv-display)] text-lg leading-tight">{title}</p>
            <p className="truncate text-[0.65rem] opacity-60">{artist || 'The Vellum Ensemble'}</p>

            <div className="mt-3">
              <input
                type="range"
                min={0}
                max={player.duration || 0}
                step={0.1}
                value={Math.min(player.time, player.duration || 0)}
                onChange={(event) => player.seek(Number(event.target.value))}
                disabled={!player.duration}
                className="w-full"
                aria-label="Playback position"
                aria-valuetext={`${formatAudioTime(player.time)} of ${formatAudioTime(player.duration)}`}
                style={{
                  background: `linear-gradient(90deg, var(--inv-accent) ${progress}%, color-mix(in srgb, var(--inv-deep-ink) 22%, transparent) ${progress}%)`,
                }}
              />
              <div className="mt-1 flex justify-between text-[0.58rem] tabular-nums opacity-55">
                <span>{formatAudioTime(player.time)}</span>
                <span>{formatAudioTime(player.duration)}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => player.setMuted(!player.muted)}
                className="text-[var(--inv-deep-ink)]/70 transition hover:text-[var(--inv-deep-ink)]"
                aria-label={player.muted ? 'Unmute music' : 'Mute music'}
              >
                {player.muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={player.muted ? 0 : player.volume}
                onChange={(event) => player.setVolume(Number(event.target.value))}
                className="w-full"
                aria-label="Volume"
                style={{
                  background: `linear-gradient(90deg, var(--inv-accent) ${(player.muted ? 0 : player.volume) * 100}%, color-mix(in srgb, var(--inv-deep-ink) 22%, transparent) ${(player.muted ? 0 : player.volume) * 100}%)`,
                }}
              />
            </div>

            {player.error && (
              <p className="mt-3 text-[0.68rem] leading-snug text-[#f0b4a1]" role="alert">
                {player.error}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => void player.toggle()}
        className="!h-9 !w-9 flex-none"
        aria-label={player.playing ? 'Pause soundtrack' : 'Play soundtrack'}
      >
        {player.playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
      </button>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="!h-auto !w-auto min-w-0 max-w-[10rem] rounded-none px-1 text-left"
        aria-expanded={expanded}
        aria-label="Soundtrack details"
      >
        <span className="block truncate text-[0.62rem] font-semibold uppercase tracking-[0.14em]">
          {title || 'Our soundtrack'}
        </span>
        <span className="mt-1 flex h-0.5 w-full overflow-hidden rounded-full bg-white/20" aria-hidden="true">
          <span
            className="block h-full rounded-full bg-[var(--inv-accent)] transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </span>
      </button>

      {player.playing && (
        <span className="mr-1 flex h-4 items-end gap-[2px]" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="eq-bar w-[2px] rounded-full bg-[var(--inv-accent)]"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </span>
      )}

      <button
        type="button"
        onClick={() => player.setMuted(!player.muted)}
        className="!h-8 !w-8"
        aria-label={player.muted ? 'Unmute soundtrack' : 'Mute soundtrack'}
      >
        {player.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
    </div>
  );
}
