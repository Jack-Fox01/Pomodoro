/**
 * Generates the app's sound effects as .wav files.
 *
 * These are the exact tones the HTML prototype synthesised at runtime with
 * the Web Audio API — we render the same oscillators and envelopes offline
 * so the phone can just play the files.
 *
 * Run with:  node scripts/generate-sounds.js
 * Output:    assets/sounds/*.wav  (mono, 44.1 kHz, 16-bit PCM)
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

/** One oscillator note. `freqEnd` turns it into a linear sweep. */
function note(freq, when, dur, type = 'sine', vol = 0.2, freqEnd = null) {
  return { freq, when, dur, type, vol, freqEnd };
}

/** Waveform shapes, matching the Web Audio oscillator types. */
function wave(type, phase) {
  const turn = phase % 1;
  switch (type) {
    case 'square':
      return Math.sin(2 * Math.PI * phase) >= 0 ? 1 : -1;
    case 'sawtooth':
      return 2 * (turn - Math.floor(turn + 0.5));
    case 'triangle':
      return 2 * Math.abs(2 * (turn - Math.floor(turn + 0.5))) - 1;
    case 'sine':
    default:
      return Math.sin(2 * Math.PI * phase);
  }
}

/** Renders a list of notes into a mono Float32 buffer. */
function render(notes) {
  const length = Math.max(...notes.map((n) => n.when + n.dur + 0.05));
  const frames = Math.ceil(length * SAMPLE_RATE);
  const out = new Float32Array(frames);

  for (const n of notes) {
    const start = Math.floor(n.when * SAMPLE_RATE);
    const count = Math.ceil(n.dur * SAMPLE_RATE);
    const end = n.freqEnd;

    let phase = 0;

    for (let i = 0; i < count; i++) {
      const t = i / SAMPLE_RATE;
      const progress = i / count;
      const freq = end === null ? n.freq : n.freq + (end - n.freq) * progress;

      phase += freq / SAMPLE_RATE;

      // Same envelope as the prototype: quick exponential attack over 20 ms,
      // then an exponential decay to near-silence across the note.
      let gain;
      if (t < 0.02) {
        gain = 0.0001 * Math.pow(n.vol / 0.0001, t / 0.02);
      } else {
        const k = (t - 0.02) / Math.max(0.0001, n.dur - 0.02);
        gain = n.vol * Math.pow(0.0001 / n.vol, k);
      }

      out[start + i] += wave(n.type, phase) * gain;
    }
  }

  // Safety clamp only — no normalising, so a click stays quieter than a fanfare.
  for (let i = 0; i < frames; i++) {
    out[i] = Math.max(-1, Math.min(1, out[i]));
  }

  return out;
}

/** Minimal 16-bit PCM mono WAV writer. */
function toWav(samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(Math.round(samples[i] * 32767), 44 + i * 2);
  }

  return buffer;
}

const SOUNDS = {
  // UI taps. Not in the prototype — added for button feedback.
  click: [note(900, 0, 0.05, 'triangle', 0.07)],
  tap: [note(620, 0, 0.06, 'sine', 0.09)],

  // Session finished.
  chime: [note(660, 0, 0.4), note(880, 0.16, 0.5)],

  // Correct answer, to-do completed.
  ding: [note(1046.5, 0, 0.22, 'sine', 0.16), note(1568, 0.05, 0.22, 'sine', 0.1)],

  // Wrong answer.
  buzz: [note(180, 0, 0.26, 'sawtooth', 0.12)],

  // Hitting the boss.
  hit: [note(200, 0, 0.07, 'square', 0.16), note(120, 0.04, 0.09, 'square', 0.14)],

  // Challenge beaten / streak / celebration.
  triumph: [
    note(523.25, 0, 0.3, 'triangle', 0.2),
    note(659.25, 0.12, 0.3, 'triangle', 0.2),
    note(783.99, 0.24, 0.3, 'triangle', 0.2),
    note(1046.5, 0.36, 0.3, 'triangle', 0.2),
    note(1318.5, 0.52, 0.6, 'triangle', 0.18),
    note(1046.5, 0.52, 0.65, 'sine', 0.14),
  ],

  // A to-do item vanishing off the list.
  swoosh: [note(1250, 0, 0.24, 'triangle', 0.09, 320)],

  // Something being cleared away.
  clear: [note(700, 0, 0.18, 'triangle', 0.11, 900), note(1100, 0.08, 0.2, 'sine', 0.08, 1400)],
};

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const [name, notes] of Object.entries(SOUNDS)) {
  const wav = toWav(render(notes));
  const file = path.join(OUT_DIR, `${name}.wav`);
  fs.writeFileSync(file, wav);
  console.log(`${name}.wav  ${(wav.length / 1024).toFixed(1)} KB`);
}

console.log(`\nWrote ${Object.keys(SOUNDS).length} sounds to assets/sounds/`);
