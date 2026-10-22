/**
 * Звук только через Web Audio: ни одного внешнего файла.
 * Контекст создаётся после первого действия пользователя.
 */
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.sfxBus = null;
    this.musicBus = null;
    this.enabled = true;
    this.ambience = null;
    this.noiseBuffer = null;
    this.lastBlip = 0;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return true;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.enabled ? 0.55 : 0;
    this.master.connect(this.ctx.destination);

    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = 0.8;
    this.sfxBus.connect(this.master);

    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = 0.32;
    this.musicBus.connect(this.master);

    const seconds = 2;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * seconds, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return true;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(enabled ? 0.55 : 0, this.ctx.currentTime, 0.05);
    }
    if (enabled) this.ensure();
  }

  tone({ freq = 440, to = null, dur = 0.15, type = 'sine', gain = 0.2, delay = 0, bus = 'sfx' }) {
    if (!this.enabled || !this.ensure()) return;
    const ctx = this.ctx;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), start + dur);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), start + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(amp);
    amp.connect(bus === 'music' ? this.musicBus : this.sfxBus);
    osc.start(start);
    osc.stop(start + dur + 0.03);
  }

  noise({ dur = 0.2, gain = 0.15, delay = 0, filter = 1200, type = 'lowpass', sweep = null }) {
    if (!this.enabled || !this.ensure()) return;
    const ctx = this.ctx;
    const start = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const biquad = ctx.createBiquadFilter();
    biquad.type = type;
    biquad.frequency.setValueAtTime(filter, start);
    if (sweep) biquad.frequency.exponentialRampToValueAtTime(Math.max(80, sweep), start + dur);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(Math.max(0.0002, gain), start);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(biquad);
    biquad.connect(amp);
    amp.connect(this.sfxBus);
    src.start(start);
    src.stop(start + dur + 0.02);
  }

  click() {
    this.tone({ freq: 620, to: 480, dur: 0.06, type: 'triangle', gain: 0.12 });
  }

  hover() {
    this.tone({ freq: 880, dur: 0.035, type: 'sine', gain: 0.045 });
  }

  blip() {
    const now = performance.now();
    if (now - this.lastBlip < 45) return;
    this.lastBlip = now;
    this.tone({ freq: 520 + Math.random() * 80, dur: 0.03, type: 'square', gain: 0.025 });
  }

  dice() {
    for (let i = 0; i < 4; i += 1) {
      this.noise({ dur: 0.05, gain: 0.08, delay: i * 0.11, filter: 2400, type: 'bandpass' });
    }
  }

  hit(crit = false) {
    this.noise({ dur: crit ? 0.28 : 0.14, gain: crit ? 0.3 : 0.18, filter: crit ? 2800 : 1600, sweep: 220 });
    this.tone({ freq: crit ? 190 : 130, to: 55, dur: crit ? 0.3 : 0.18, type: 'sine', gain: 0.22 });
  }

  hurt() {
    this.noise({ dur: 0.2, gain: 0.16, filter: 700, sweep: 180 });
    this.tone({ freq: 200, to: 90, dur: 0.25, type: 'sawtooth', gain: 0.08 });
  }

  heal() {
    [0, 0.09, 0.18].forEach((delay, index) => {
      this.tone({ freq: 440 * (1 + index * 0.25), dur: 0.22, type: 'sine', gain: 0.12, delay });
    });
  }

  coin() {
    this.tone({ freq: 980, dur: 0.08, type: 'triangle', gain: 0.12 });
    this.tone({ freq: 1320, dur: 0.14, type: 'triangle', gain: 0.1, delay: 0.07 });
  }

  skill() {
    this.noise({ dur: 0.35, gain: 0.14, filter: 400, sweep: 3600, type: 'bandpass' });
    this.tone({ freq: 300, to: 800, dur: 0.3, type: 'triangle', gain: 0.08 });
  }

  door() {
    this.tone({ freq: 160, to: 95, dur: 0.42, type: 'sawtooth', gain: 0.09 });
    this.noise({ dur: 0.3, gain: 0.06, filter: 500, sweep: 200 });
  }

  victory() {
    [523, 659, 784, 1046].forEach((freq, i) => {
      this.tone({ freq, dur: 0.4, type: 'triangle', gain: 0.13, delay: i * 0.11 });
    });
  }

  defeat() {
    [392, 330, 262, 196].forEach((freq, i) => {
      this.tone({ freq, dur: 0.5, type: 'sine', gain: 0.14, delay: i * 0.15 });
    });
  }

  boss() {
    this.tone({ freq: 70, to: 50, dur: 1.2, type: 'sawtooth', gain: 0.12 });
    this.tone({ freq: 140, dur: 0.8, type: 'triangle', gain: 0.05 });
  }

  ending() {
    [261, 329, 392, 523, 659].forEach((freq, i) => {
      this.tone({ freq, dur: 1.4, type: 'sine', gain: 0.07, delay: i * 0.18, bus: 'music' });
    });
  }

  /** Тихий процедурный эмбиент, меняется по главам. */
  setAmbience(chapter = 1) {
    if (!this.ensure()) return;
    if (this.ambience && this.ambience.chapter === chapter) return;
    this.stopAmbience();
    const roots = [110, 98, 87.3, 130.8];
    const root = roots[(chapter - 1) % roots.length];
    const ctx = this.ctx;
    const group = ctx.createGain();
    group.gain.value = 0;
    group.connect(this.musicBus);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420 + chapter * 60;
    filter.Q.value = 0.6;
    filter.connect(group);

    const oscillators = [root, root * 1.5, root * 2.02].map((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = index === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = index === 0 ? 0.22 : 0.08;
      osc.connect(gain);
      gain.connect(filter);
      osc.start();
      return osc;
    });

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05 + chapter * 0.01;
    lfoGain.gain.value = 90;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    group.gain.setTargetAtTime(this.enabled ? 0.14 : 0, ctx.currentTime, 1.4);
    this.ambience = { chapter, group, oscillators, lfo };
  }

  stopAmbience() {
    if (!this.ambience || !this.ctx) return;
    const { group, oscillators, lfo } = this.ambience;
    group.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    const stopAt = this.ctx.currentTime + 1.2;
    oscillators.forEach((osc) => osc.stop(stopAt));
    lfo.stop(stopAt);
    this.ambience = null;
  }
}
