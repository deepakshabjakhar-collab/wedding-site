/**
 * A bespoke opening sound, synthesised in the browser — no audio file to
 * download and nothing sampled from anyone else's recording.
 *
 * Three layers, exactly as a stationer would imagine them:
 *   1. the crack of a wax seal   — a short filtered noise burst with a thump
 *   2. paper drawn from an envelope — a slow noise sweep through a low-pass
 *   3. a harp-like arpeggio      — soft, inharmonic-ish plucks with a tail
 *
 * Everything hangs off one shared AudioContext and is safely no-ops when the
 * browser refuses to resume audio (for example before a user gesture).
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  return ctx;
}

function bus(audio: AudioContext): GainNode {
  if (!master) {
    master = audio.createGain();
    master.gain.value = 0.0001;
    master.connect(audio.destination);
  }
  return master;
}

function noiseBuffer(audio: AudioContext, seconds = 2): AudioBuffer {
  const length = Math.max(1, Math.floor(audio.sampleRate * seconds));
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    // A little smoothing takes the hiss off and leaves a paper-like texture.
    last = last * 0.35 + white * 0.65;
    data[i] = last;
  }
  return buffer;
}

function crack(audio: AudioContext, output: AudioNode, at: number) {
  const source = audio.createBufferSource();
  source.buffer = noiseBuffer(audio, 0.4);

  const band = audio.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 1850;
  band.Q.value = 0.9;

  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.5, at + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);

  source.connect(band).connect(gain).connect(output);
  source.start(at);
  source.stop(at + 0.4);

  // The low thump that gives the crack its weight.
  const thump = audio.createOscillator();
  thump.type = 'triangle';
  thump.frequency.setValueAtTime(190, at);
  thump.frequency.exponentialRampToValueAtTime(70, at + 0.22);
  const thumpGain = audio.createGain();
  thumpGain.gain.setValueAtTime(0.0001, at);
  thumpGain.gain.exponentialRampToValueAtTime(0.28, at + 0.01);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);
  thump.connect(thumpGain).connect(output);
  thump.start(at);
  thump.stop(at + 0.34);
}

function paper(audio: AudioContext, output: AudioNode, at: number, duration: number) {
  const source = audio.createBufferSource();
  source.buffer = noiseBuffer(audio, duration + 0.4);
  source.playbackRate.value = 0.85;

  const sweep = audio.createBiquadFilter();
  sweep.type = 'lowpass';
  sweep.frequency.setValueAtTime(900, at);
  sweep.frequency.linearRampToValueAtTime(3200, at + duration * 0.7);
  sweep.frequency.linearRampToValueAtTime(1200, at + duration);

  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(0.14, at + duration * 0.35);
  gain.gain.linearRampToValueAtTime(0.0001, at + duration);

  source.connect(sweep).connect(gain).connect(output);
  source.start(at);
  source.stop(at + duration + 0.05);
}

function pluck(audio: AudioContext, output: AudioNode, note: number, at: number, level: number) {
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(level, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.9);
  gain.connect(output);

  // Two soft partials per note: a bell-like body and a gentle upper shimmer.
  for (const [ratio, mix, type] of [
    [1, 1, 'sine'],
    [2.01, 0.28, 'sine'],
    [3.98, 0.12, 'triangle'],
  ] as const) {
    const osc = audio.createOscillator();
    osc.type = type;
    osc.frequency.value = note * ratio;
    const partial = audio.createGain();
    partial.gain.value = mix;
    osc.connect(partial).connect(gain);
    osc.start(at);
    osc.stop(at + 2);
  }
}

/** Silk ribbon drawn loose — an ascending breath of filtered noise. */
function silk(audio: AudioContext, output: AudioNode, at: number, duration = 1.4) {
  const source = audio.createBufferSource();
  source.buffer = noiseBuffer(audio, duration + 0.4);
  source.playbackRate.value = 1.1;

  const band = audio.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = 1.4;
  band.frequency.setValueAtTime(1100, at);
  band.frequency.exponentialRampToValueAtTime(4600, at + duration * 0.75);
  band.frequency.exponentialRampToValueAtTime(2200, at + duration);

  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(0.16, at + duration * 0.4);
  gain.gain.linearRampToValueAtTime(0.0001, at + duration);

  source.connect(band).connect(gain).connect(output);
  source.start(at);
  source.stop(at + duration + 0.05);
}

/** Heavy curtains parting — a low, slow sweep with a soft swell beneath. */
function drape(audio: AudioContext, output: AudioNode, at: number, duration = 2.2) {
  const source = audio.createBufferSource();
  source.buffer = noiseBuffer(audio, duration + 0.4);
  source.playbackRate.value = 0.6;

  const sweep = audio.createBiquadFilter();
  sweep.type = 'lowpass';
  sweep.frequency.setValueAtTime(320, at);
  sweep.frequency.linearRampToValueAtTime(980, at + duration * 0.6);
  sweep.frequency.linearRampToValueAtTime(420, at + duration);

  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(0.2, at + duration * 0.45);
  gain.gain.linearRampToValueAtTime(0.0001, at + duration);

  source.connect(sweep).connect(gain).connect(output);
  source.start(at);
  source.stop(at + duration + 0.05);

  const swell = audio.createOscillator();
  swell.type = 'sine';
  swell.frequency.setValueAtTime(96, at);
  swell.frequency.linearRampToValueAtTime(64, at + duration);
  const swellGain = audio.createGain();
  swellGain.gain.setValueAtTime(0.0001, at);
  swellGain.gain.linearRampToValueAtTime(0.1, at + duration * 0.5);
  swellGain.gain.linearRampToValueAtTime(0.0001, at + duration);
  swell.connect(swellGain).connect(output);
  swell.start(at);
  swell.stop(at + duration + 0.05);
}

/** Starlight unfurling — high, slow chimes for the celestial gatefold. */
function starfall(audio: AudioContext, output: AudioNode, at: number) {
  const notes = [1567.98, 2093, 1760, 2637.02, 1975.53];
  notes.forEach((note, index) => pluck(audio, output, note, at + index * 0.34, 0.07));
}

export interface OpeningSoundHandle {
  /** Fade the whole opening sound out over `ms`. */
  release: (ms?: number) => void;
}

/**
 * Play the opening. Call this directly from a click/tap handler so the audio
 * context is allowed to resume.
 */
export function playOpeningSound(): OpeningSoundHandle | null {
  const audio = context();
  if (!audio) return null;
  if (audio.state === 'suspended') void audio.resume();

  const out = bus(audio);
  const now = audio.currentTime + 0.01;

  out.gain.cancelScheduledValues(now);
  out.gain.setValueAtTime(0.0001, now);
  out.gain.exponentialRampToValueAtTime(0.9, now + 0.05);

  crack(audio, out, now);
  paper(audio, out, now + 0.18, 0.85);

  // D major, rising: the harp answers the crack.
  const notes = [587.33, 880, 1108.73, 1466.83];
  notes.forEach((note, index) => pluck(audio, out, note, now + 0.42 + index * 0.13, 0.16));

  return {
    release(ms = 700) {
      const at = audio.currentTime;
      out.gain.cancelScheduledValues(at);
      out.gain.setValueAtTime(Math.max(0.0001, out.gain.value), at);
      out.gain.exponentialRampToValueAtTime(0.0001, at + ms / 1000);
    },
  };
}

/**
 * The full cinematic opening, scored across roughly eleven seconds to match
 * the gate choreography: the lift, the breaking of the fastening, the letter
 * drawn out, the reveal, and a warm resolution as the invitation lands.
 * Call directly from the tap handler so the AudioContext may resume.
 */
export function playCinematicOpening(
  kind: 'seal' | 'ribbon' | 'curtain' | 'celeste' = 'seal',
): OpeningSoundHandle | null {
  const audio = context();
  if (!audio) return null;
  if (audio.state === 'suspended') void audio.resume();

  const out = bus(audio);
  const now = audio.currentTime + 0.01;

  out.gain.cancelScheduledValues(now);
  out.gain.setValueAtTime(0.0001, now);
  out.gain.exponentialRampToValueAtTime(0.9, now + 0.06);

  // Act I — the fastening gives way, and nothing else moves yet.
  if (kind === 'ribbon') {
    silk(audio, out, now + 0.1, 1.5);
    paper(audio, out, now + 0.7, 0.6);
  } else if (kind === 'curtain') {
    paper(audio, out, now + 0.08, 0.4);
    drape(audio, out, now + 0.9, 2.1);
  } else if (kind === 'celeste') {
    crack(audio, out, now + 0.1);
    silk(audio, out, now + 0.5, 1.2);
    starfall(audio, out, now + 0.8);
  } else {
    crack(audio, out, now + 0.1);
    paper(audio, out, now + 0.35, 0.7);
  }

  // Act II — the cover parts / the letter is drawn into the light.
  paper(audio, out, now + 1.75, 1.5);

  // Act III — the reveal: a rising D-major answer, wider and quicker.
  const ascent = [587.33, 739.99, 880, 1108.73, 1318.51, 1466.83];
  ascent.forEach((note, index) => pluck(audio, out, note, now + 3.1 + index * 0.12, 0.13));

  // Act IV — resolution as the invitation lands.
  const resolve = [293.66, 587.33, 880, 1174.66];
  resolve.forEach((note, index) => pluck(audio, out, note, now + 4.0 + index * 0.07, 0.09));
  pluck(audio, out, 1760, now + 4.6, 0.05);

  return {
    release(ms = 700) {
      const at = audio.currentTime;
      out.gain.cancelScheduledValues(at);
      out.gain.setValueAtTime(Math.max(0.0001, out.gain.value), at);
      out.gain.exponentialRampToValueAtTime(0.0001, at + ms / 1000);
    },
  };
}

/** A single quiet chime, used for smaller confirmations. */
export function playChime(): void {
  const audio = context();
  if (!audio) return;
  if (audio.state === 'suspended') void audio.resume();
  const out = bus(audio);
  const now = audio.currentTime + 0.01;
  const restore = out.gain.value;
  out.gain.setValueAtTime(Math.max(restore, 0.55), now);
  pluck(audio, out, 1046.5, now, 0.12);
  pluck(audio, out, 1567.98, now + 0.1, 0.09);
}
