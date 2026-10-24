// Original, deterministic synthesized cues. No source recordings are modified.
const fs = require('node:fs');
const path = require('node:path');
const rate = 24000, tau = Math.PI * 2;
const directory = path.join(__dirname, 'assets/rocket-game-assets/rocketier-audio/generated');
fs.mkdirSync(directory, { recursive: true });
const sine = (frequency, t) => Math.sin(tau * frequency * t);
function bell(t, frequency, length = .23) {
  if (t < 0 || t > length) return 0;
  return Math.min(1, t / .006) * Math.pow(1 - t / length, 2) * (sine(frequency, t) + .18 * sine(frequency * 2, t));
}
function write(name, duration, sample) {
  const count = Math.round(rate * duration), data = new Float32Array(count);
  let seed = 2026, filtered = 0, peak = 0;
  for (let i = 0; i < count; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    filtered += .16 * ((seed / 4294967296 * 2 - 1) - filtered);
    const t = i / rate;
    const fade = Math.min(1, t / .012, (duration - t) / .025);
    data[i] = sample(t, filtered) * Math.max(0, fade);
    peak = Math.max(peak, Math.abs(data[i]));
  }
  const gain = peak ? .65 / peak : 1, buffer = Buffer.alloc(44 + count * 2);
  buffer.write('RIFF'); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24); buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34); buffer.write('data', 36);
  buffer.writeUInt32LE(count * 2, 40);
  for (let i = 0; i < count; i++) buffer.writeInt16LE(Math.round(data[i] * gain * 32767), 44 + i * 2);
  fs.writeFileSync(path.join(directory, name), buffer);
  console.log(`${name}: ${duration}s, ${(buffer.length / 1024).toFixed(0)} KB`);
}
write('formula-reveal.wav', .72, t => [659.25, 880, 1174.66].reduce((sum, f, i) => sum + .36 * bell(t - i * .13, f, .4), 0));
write('nose-open.wav', .65, (t, noise) => {
  const envelope = Math.sin(Math.PI * t / .65);
  return envelope * (.28 * noise + .1 * Math.sin(tau * (180 * t + 240 * t * t))) + .2 * bell(t - .48, 1046.5, .16);
});
write('nose-close.wav', .6, (t, noise) => {
  const envelope = Math.sin(Math.PI * t / .6);
  return envelope * (.28 * noise + .09 * Math.sin(tau * (420 * t - 220 * t * t))) + .3 * bell(t - .43, 164.8, .16);
});
write('number-count.wav', 1.52, t => {
  const step = Math.floor(t / .065), local = t - step * .065;
  return .25 * bell(local, 740 * Math.pow(2, (step % 5) / 12), .032) * (1 - .3 * t / 1.52);
});
write('route-glide.wav', 2.6, (t, noise) => {
  const envelope = Math.pow(Math.sin(Math.PI * t / 2.6), .7);
  const step = Math.floor(t / .23), local = t - step * .23;
  const frequency = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25][step % 6];
  return envelope * (.2 * bell(local, frequency, .2) + .025 * noise)
    + .12 * bell(t - 2.27, 1046.5, .3);
});
write('rocket-zoom.wav', 1.9, (t, noise) => {
  const envelope = Math.pow(Math.sin(Math.PI * t / 1.9), 1.4);
  const sweep = Math.sin(tau * (160 * t + 280 * t * t - 65 * t * t * t));
  return envelope * (.5 * noise + .045 * sweep) + .14 * bell(t - 1.65, 392, .23);
});
