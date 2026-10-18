/**
 * Synthesises the original Vellum soundtrack — no samples, no licensing fees.
 *  - Music: synthesised from scratch here. A Node synthesiser writes
 *    32 kHz stereo WAV straight to public/audio (no ffmpeg needed).
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const AUDIO = path.join(ROOT, 'public', 'audio');
await fs.mkdir(AUDIO, { recursive: true });


/* ------------------------------------------------------------------ */
/* Original soundtrack synthesis                                       */
/* ------------------------------------------------------------------ */

const SR = 32000;

function midi(n) {
  return 440 * Math.pow(2, (n - 69) / 12);
}

function addPluck(outL, outR, startSec, noteMidi, amp, pan, decay, brightness, detune = 0.0015) {
  const start = Math.floor(startSec * SR);
  if (start < 0) return;
  const length = Math.min(outL.length - start, Math.floor(decay * 4.5 * SR));
  if (length <= 0) return;
  const freq = midi(noteMidi);
  const harmonics = 9;
  const amps = [];
  for (let h = 1; h <= harmonics; h += 1) amps.push(1 / Math.pow(h, brightness));
  for (let i = 0; i < length; i += 1) {
    const t = i / SR;
    const env = Math.exp(-t / decay) * (1 - Math.exp(-t / 0.006));
    let sample = 0;
    for (let h = 1; h <= harmonics; h += 1) {
      const partial = freq * h * (1 + 0.0004 * h * h);
      sample += amps[h - 1] * Math.sin(2 * Math.PI * partial * t + h * 0.7);
    }
    sample += 0.03 * (Math.random() * 2 - 1) * Math.exp(-t / 0.015);
    sample *= env * amp;
    const l = Math.cos((pan + 1) * Math.PI * 0.25);
    const r = Math.sin((pan + 1) * Math.PI * 0.25);
    // A second, very slightly detuned string gives the pluck its chorused bloom.
    const sympathetic = Math.sin(2 * Math.PI * freq * (1 + detune) * t) * env * amp * 0.16;
    outL[start + i] += (sample + sympathetic) * l;
    outR[start + i] += (sample + sympathetic) * r;
  }
}

function addPad(outL, outR, startSec, endSec, notes, amp) {
  const start = Math.floor(startSec * SR);
  const end = Math.min(outL.length, Math.floor(endSec * SR));
  const length = end - start;
  if (length <= 0) return;
  notes.forEach((note, ni) => {
    const freq = midi(note);
    const pan = (ni / Math.max(1, notes.length - 1)) * 1.3 - 0.65;
    const l = Math.cos((pan + 1) * Math.PI * 0.25);
    const r = Math.sin((pan + 1) * Math.PI * 0.25);
    const detune = 1 + (ni - 1) * 0.0008;
    for (let i = 0; i < length; i += 1) {
      const t = i / SR;
      const attack = Math.min(1, t / 1.8);
      const release = Math.min(1, (length / SR - t) / 2.4);
      const env = attack * Math.max(0, release);
      const drift = 1 + 0.0016 * Math.sin(2 * Math.PI * 0.07 * t + ni);
      const sample =
        Math.sin(2 * Math.PI * freq * detune * drift * t + ni) * 0.55 +
        Math.sin(2 * Math.PI * freq * 2 * detune * t + ni * 1.4) * 0.16 +
        Math.sin(2 * Math.PI * freq * 3 * detune * t) * 0.05 +
        Math.sin(2 * Math.PI * freq * 4.01 * t) * 0.018;
      const shimmer = 1 + 0.08 * Math.sin(2 * Math.PI * 0.21 * t);
      outL[start + i] += sample * env * amp * shimmer * l;
      outR[start + i] += sample * env * amp * shimmer * r;
    }
  });
}

function addBell(outL, outR, startSec, noteMidi, amp, pan = 0) {
  const start = Math.floor(startSec * SR);
  const freq = midi(noteMidi);
  const length = Math.min(outL.length - start, SR * 6);
  const l = Math.cos((pan + 1) * Math.PI * 0.25);
  const r = Math.sin((pan + 1) * Math.PI * 0.25);
  for (let i = 0; i < length; i += 1) {
    const t = i / SR;
    const env = Math.exp(-t / 1.9) * (1 - Math.exp(-t / 0.002));
    const sample =
      Math.sin(2 * Math.PI * freq * t) * 0.72 +
      Math.sin(2 * Math.PI * freq * 2.76 * t) * 0.2 * Math.exp(-t / 0.7) +
      Math.sin(2 * Math.PI * freq * 5.4 * t) * 0.08 * Math.exp(-t / 0.35);
    outL[start + i] += sample * env * amp * l;
    outR[start + i] += sample * env * amp * r;
  }
}

function addBass(outL, outR, startSec, endSec, noteMidi, amp) {
  const start = Math.floor(startSec * SR);
  const end = Math.min(outL.length, Math.floor(endSec * SR));
  const freq = midi(noteMidi);
  for (let i = start; i < end; i += 1) {
    const t = (i - start) / SR;
    const env = Math.min(1, t / 0.08) * Math.min(1, (end - i) / SR / 0.7) * Math.exp(-t / 4);
    const sample = Math.sin(2 * Math.PI * freq * t) * 0.8 + Math.sin(2 * Math.PI * freq * 2 * t) * 0.08;
    outL[i] += sample * env * amp;
    outR[i] += sample * env * amp;
  }
}

function reverb(outL, outR, wet = 0.16) {
  const delays = [0.071, 0.113, 0.167, 0.223];
  const feedback = [0.32, 0.28, 0.24, 0.2];
  const workL = Float32Array.from(outL);
  const workR = Float32Array.from(outR);
  delays.forEach((delay, idx) => {
    const d = Math.floor(delay * SR);
    for (let i = d; i < outL.length; i += 1) {
      workL[i] += workL[i - d] * feedback[idx];
      workR[i] += workR[i - d] * feedback[idx] * 0.97;
    }
  });
  for (let i = 0; i < outL.length; i += 1) {
    outL[i] = outL[i] * (1 - wet) + workL[i] * wet * 2.4;
    outR[i] = outR[i] * (1 - wet) + workR[i] * wet * 2.4;
  }
}

function writeWav(outL, outR, seconds) {
  const frames = outL.length;
  const dataBytes = frames * 2 * 2;
  const wav = Buffer.alloc(44 + dataBytes);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(36 + dataBytes, 4);
  wav.write('WAVE', 8);
  wav.write('fmt ', 12);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(2, 22);
  wav.writeUInt32LE(SR, 24);
  wav.writeUInt32LE(SR * 4, 28);
  wav.writeUInt16LE(4, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(dataBytes, 40);

  // gentle tape-style saturation + normalise
  let peak = 0;
  for (let i = 0; i < frames; i += 1) {
    peak = Math.max(peak, Math.abs(outL[i]), Math.abs(outR[i]));
  }
  const gain = peak > 0 ? 0.82 / peak : 1;
  const fadeIn = SR * 2.2;
  const fadeOut = SR * 4;
  let offset = 44;
  for (let i = 0; i < frames; i += 1) {
    let fade = 1;
    if (i < fadeIn) fade = i / fadeIn;
    if (i > frames - fadeOut) fade = Math.max(0, (frames - i) / fadeOut);
    for (const channel of [outL, outR]) {
      let s = channel[i] * gain * fade;
      s = Math.tanh(s * 1.25) * 0.94;
      const v = Math.max(-32768, Math.min(32767, Math.round(s * 32767)));
      wav.writeInt16LE(v, offset);
      offset += 2;
    }
  }
  return wav;
}

const TRACKS = [
  {
    file: 'golden-hour',
    title: 'Golden Hour',
    seconds: 92,
    bars: 240,
    bpm: 66,
    progression: [
      [50, [62, 66, 69]],
      [45, [61, 64, 69]],
      [47, [62, 66, 71]],
      [43, [62, 67, 71]],
    ],
    arp: [0, 2, 4, 2, 1, 3, 5, 3],
    pluck: { decay: 1.35, brightness: 1.45, amp: 0.16 },
    pad: 0.055,
    bells: [74, 78, 81, 86],
  },
  {
    file: 'moonlit',
    title: 'Moonlit Vows',
    seconds: 96,
    bars: 208,
    bpm: 52,
    progression: [
      [45, [57, 60, 64]],
      [41, [57, 60, 65]],
      [48, [55, 60, 64]],
      [43, [55, 59, 62]],
    ],
    arp: [0, 2, 4, 6, 3, 1],
    pluck: { decay: 2.4, brightness: 2.25, amp: 0.12 },
    pad: 0.07,
    bells: [81, 84, 88],
  },
  {
    file: 'garden',
    title: 'In the Garden',
    seconds: 88,
    bars: 264,
    bpm: 84,
    progression: [
      [43, [55, 59, 62]],
      [50, [57, 62, 66]],
      [40, [55, 59, 64]],
      [48, [55, 60, 64]],
    ],
    arp: [0, 1, 2, 3, 4, 2, 1, 2],
    pluck: { decay: 1.05, brightness: 1.2, amp: 0.14 },
    pad: 0.04,
    bells: [79, 83, 86],
  },
  {
    file: 'first-dance',
    title: 'First Dance',
    seconds: 90,
    bars: 180,
    bpm: 60,
    beatsPerBar: 3,
    progression: [
      [48, [55, 60, 64]],
      [45, [52, 57, 60]],
      [41, [53, 57, 60]],
      [43, [55, 59, 62]],
    ],
    arp: [0, 2, 4, 2, 1, 4],
    pluck: { decay: 2.1, brightness: 2.0, amp: 0.14 },
    pad: 0.05,
    bells: [76, 79, 84],
  },
];

for (const track of TRACKS) {
  const wavPath = path.join(AUDIO, `${track.file}.wav`);
  try {
    await fs.access(wavPath);
    console.log(`· ${track.title} exists`);
    continue;
  } catch {
    /* generate */
  }
  const frames = Math.floor(track.seconds * SR);
  const outL = new Float32Array(frames);
  const outR = new Float32Array(frames);
  const beatsPerBar = track.beatsPerBar ?? 4;
  const barSeconds = (60 / track.bpm) * beatsPerBar;
  const beats = track.progression.length;

  for (let bar = 0; bar < track.bars; bar += 1) {
    const start = bar * barSeconds;
    if (start > track.seconds - 2) break;
    const [bass, chord] = track.progression[bar % beats];
    const seed = (bar * 2654435761) % 4294967296;
    const rnd = () => {
      const x = Math.sin(seed + bar * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    addBass(outL, outR, start, start + barSeconds * 1.05, bass, 0.075);
    addPad(
      outL,
      outR,
      start,
      Math.min(track.seconds, start + barSeconds * 1.02),
      chord,
      track.pad,
    );

    const step = barSeconds / track.arp.length;
    track.arp.forEach((offset, i) => {
      const note = chord[offset % chord.length] + 12 * Math.floor(offset / chord.length);
      const humanise = (rnd() - 0.5) * 0.035;
      addPluck(
        outL,
        outR,
        start + i * step + humanise,
        note,
        track.pluck.amp * (0.72 + rnd() * 0.3),
        i % 2 === 0 ? -0.35 : 0.35,
        track.pluck.decay,
        track.pluck.brightness,
      );
    });

    if (bar % 4 === 2) {
      const bell = track.bells[bar % track.bells.length] + (bar % 8 === 2 ? 12 : 0);
      addBell(outL, outR, start + step * 2, bell, 0.075, -0.25);
    }
    if (bar % 8 === 6) {
      addBell(outL, outR, start + step * 4, track.bells[(bar + 1) % track.bells.length], 0.045, 0.35);
    }
  }

  reverb(outL, outR, 0.2);
  const wav = writeWav(outL, outR, track.seconds);
  await fs.writeFile(wavPath, wav);
  {
    const stat = await fs.stat(wavPath);
    console.log(`✓ ${track.title} — ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  }
}

console.log('\nSoundtrack build complete.');
