/**
 * Synthetic Web Audio API Sound Generator for KhelaBela
 * 100% offline, zero external audio asset dependencies.
 */

let ctx: AudioContext | null = null;
let soundEnabled = true;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      ctx = new AudioCtx();
    }
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

/**
 * Rapid soft whirr of a pen spinning on paper
 */
export function playPenSpin(durationMs = 1200) {
  if (!soundEnabled) return;
  const ac = getContext();
  if (!ac) return;

  const now = ac.currentTime;
  const duration = durationMs / 1000;

  // Create filtered noise burst sequence to mimic pen plastic rattling on notebook paper
  const bufferSize = ac.sampleRate * duration;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);

  // Generate modulated friction pulses
  for (let i = 0; i < bufferSize; i++) {
    const t = i / ac.sampleRate;
    // Decelerating frequency from 28Hz down to 4Hz
    const freq = 28 * Math.pow(1 - t / duration, 1.8);
    const pulse = Math.sin(2 * Math.PI * freq * t);
    const noise = Math.random() * 2 - 1;
    data[i] = noise * 0.25 * (pulse > 0.4 ? 1 : 0.15) * Math.pow(1 - t / duration, 0.8);
  }

  const noiseNode = ac.createBufferSource();
  noiseNode.buffer = buffer;

  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, now);
  filter.frequency.exponentialRampToValueAtTime(320, now + duration);
  filter.Q.value = 3;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

  noiseNode.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);

  noiseNode.start(now);
}

/**
 * Click of pen landing or button tap
 */
export function playPenClick() {
  if (!soundEnabled) return;
  const ac = getContext();
  if (!ac) return;
  const now = ac.currentTime;

  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(680, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

/**
 * Boundary sound: 4 runs (double high chime) or 6 runs (triad fanfare)
 */
export function playCricketBoundary(runs: 4 | 6) {
  if (!soundEnabled) return;
  const ac = getContext();
  if (!ac) return;

  const now = ac.currentTime;
  const notes = runs === 6 ? [523.25, 659.25, 783.99, 1046.5] : [587.33, 880]; // C-E-G-C or D-A
  const spacing = 0.09;

  notes.forEach((freq, idx) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * spacing);

    gain.gain.setValueAtTime(0.001, now + idx * spacing);
    gain.gain.linearRampToValueAtTime(0.2, now + idx * spacing + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * spacing + 0.35);

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now + idx * spacing);
    osc.stop(now + idx * spacing + 0.4);
  });
}

/**
 * Wicket sound: low thud + umpire whistle tone
 */
export function playWicket() {
  if (!soundEnabled) return;
  const ac = getContext();
  if (!ac) return;
  const now = ac.currentTime;

  // Thud
  const osc1 = ac.createOscillator();
  const gain1 = ac.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(160, now);
  osc1.frequency.exponentialRampToValueAtTime(45, now + 0.18);
  gain1.gain.setValueAtTime(0.35, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  osc1.connect(gain1);
  gain1.connect(ac.destination);
  osc1.start(now);
  osc1.stop(now + 0.22);

  // Whistle burst
  const osc2 = ac.createOscillator();
  const gain2 = ac.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(1200, now + 0.1);
  osc2.frequency.linearRampToValueAtTime(1400, now + 0.25);
  gain2.gain.setValueAtTime(0.001, now + 0.1);
  gain2.gain.linearRampToValueAtTime(0.18, now + 0.14);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
  osc2.connect(gain2);
  gain2.connect(ac.destination);
  osc2.start(now + 0.1);
  osc2.stop(now + 0.46);
}

/**
 * Dot ball sound: gentle soft tap
 */
export function playDotBall() {
  if (!soundEnabled) return;
  const ac = getContext();
  if (!ac) return;
  const now = ac.currentTime;

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.09);
}

/**
 * Paper chit unfolding / shuffling sound
 */
export function playPaperRustle() {
  if (!soundEnabled) return;
  const ac = getContext();
  if (!ac) return;
  const now = ac.currentTime;
  const duration = 0.22;

  const bufferSize = Math.floor(ac.sampleRate * duration);
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.15;
  }

  const noise = ac.createBufferSource();
  noise.buffer = buffer;

  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1600, now);
  filter.frequency.exponentialRampToValueAtTime(900, now + duration);
  filter.Q.value = 1.8;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);

  noise.start(now);
}

/**
 * Line drawn sound in dots and boxes
 */
export function playLineDraw() {
  if (!soundEnabled) return;
  const ac = getContext();
  if (!ac) return;
  const now = ac.currentTime;

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * Box completed sound
 */
export function playBoxComplete() {
  if (!soundEnabled) return;
  const ac = getContext();
  if (!ac) return;
  const now = ac.currentTime;

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(659.25, now); // E5
  osc.frequency.setValueAtTime(880, now + 0.07); // A5

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}
