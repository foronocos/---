/**
 * Web Audio Synthesizer for Cosmic Phenomena
 * Zero external libraries, zero network lag, runs locally in the browser
 */

class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private activeVoices: Map<string, {
    oscillators: OscillatorNode[];
    gains: GainNode[];
    filters: BiquadFilterNode[];
    intervalId?: number;
    noiseNode?: AudioBufferSourceNode;
  }> = new Map();

  private isMuted: boolean = false;
  private globalVolume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.globalVolume, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.85;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setMasterVolume(vol: number) {
    this.globalVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.globalVolume, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.globalVolume, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public isVoicePlaying(id: string): boolean {
    return this.activeVoices.has(id);
  }

  public startSound(id: string, baseFreq: number, type: string, volume: number = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // Stop if already running
    this.stopSound(id);

    const now = this.ctx.currentTime;
    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.001, now);
    voiceGain.gain.exponentialRampToValueAtTime(volume, now + 1.2);
    voiceGain.connect(this.masterGain);

    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [voiceGain];
    const filters: BiquadFilterNode[] = [];
    let intervalId: number | undefined;
    let noiseNode: AudioBufferSourceNode | undefined;

    if (type === 'pulsar') {
      // Periodic sharp high-frequency chirp and low thud
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * 2, now);
      filter.Q.setValueAtTime(4.0, now);
      filter.connect(voiceGain);
      filters.push(filter);

      const triggerPulse = () => {
        if (!this.ctx) return;
        const pulseTime = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const pGain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(baseFreq * 2, pulseTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, pulseTime + 0.08);

        pGain.gain.setValueAtTime(0.7, pulseTime);
        pGain.gain.exponentialRampToValueAtTime(0.0001, pulseTime + 0.09);

        osc.connect(pGain);
        pGain.connect(filter);

        osc.start(pulseTime);
        osc.stop(pulseTime + 0.1);
      };

      triggerPulse();
      // Period of PSR B1919+21 is ~1.337 seconds
      intervalId = window.setInterval(triggerPulse, 1337);
    } else if (type === 'schumann') {
      // 7.83 Hz binaural frequency beat with rich warm atmospheric harmonics
      const base = baseFreq; // ~125Hz
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const subOsc = this.ctx.createOscillator();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(base, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(base + 7.83, now); // Generates 7.83 Hz binaural wave

      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(base / 2, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, now);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.35, now);

      osc1.connect(filter);
      osc2.connect(filter);
      subOsc.connect(subGain);
      subGain.connect(filter);
      filter.connect(voiceGain);

      osc1.start(now);
      osc2.start(now);
      subOsc.start(now);

      oscillators.push(osc1, osc2, subOsc);
      filters.push(filter);
      gains.push(subGain);
    } else if (type === 'solar_wind') {
      // Sweeping white/pink noise buffer with slow modulated bandpass filter
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink noise approximation
        lastOut = (lastOut * 0.95) + (white * 0.05);
        data[i] = lastOut * 3.5;
      }

      noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(280, now);
      filter.Q.setValueAtTime(1.8, now);

      // Slow LFO to modulate filter frequency
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, now);
      lfoGain.gain.setValueAtTime(140, now);

      lfo.connect(filter.frequency);
      lfo.start(now);
      oscillators.push(lfo);

      noiseNode.connect(filter);
      filter.connect(voiceGain);
      noiseNode.start(now);

      filters.push(filter);
    } else if (type === 'saturn') {
      // Cassini Saturn radio eerie chorus: dual FM modulated sine waves with detuning
      const carrier = this.ctx.createOscillator();
      const modulator = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();

      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(baseFreq, now);

      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(1.2, now); // very slow whistle
      modGain.gain.setValueAtTime(45, now);

      modulator.connect(carrier.frequency);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq, now);
      filter.Q.setValueAtTime(3.5, now);

      carrier.connect(filter);
      filter.connect(voiceGain);

      modulator.start(now);
      carrier.start(now);

      oscillators.push(carrier, modulator);
      gains.push(modGain);
      filters.push(filter);
    } else if (type === 'cmb') {
      // Cosmic Microwave Background: very soft uniform background static + deep hum
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.18;
      }

      noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(55, now); // Deep 55Hz foundation
      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.2, now);

      noiseNode.connect(filter);
      subOsc.connect(subGain);
      subGain.connect(filter);
      filter.connect(voiceGain);

      noiseNode.start(now);
      subOsc.start(now);

      oscillators.push(subOsc);
      filters.push(filter);
      gains.push(subGain);
    }

    this.activeVoices.set(id, {
      oscillators,
      gains,
      filters,
      intervalId,
      noiseNode
    });
  }

  public stopSound(id: string) {
    const voice = this.activeVoices.get(id);
    if (!voice || !this.ctx) return;

    if (voice.intervalId !== undefined) {
      clearInterval(voice.intervalId);
    }

    const now = this.ctx.currentTime;
    const masterVoiceGain = voice.gains[0];
    if (masterVoiceGain) {
      masterVoiceGain.gain.setTargetAtTime(0.0001, now, 0.4);
    }

    setTimeout(() => {
      voice.oscillators.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch { /* ignore */ }
      });
      if (voice.noiseNode) {
        try { voice.noiseNode.stop(); voice.noiseNode.disconnect(); } catch { /* ignore */ }
      }
      voice.filters.forEach(f => f.disconnect());
      voice.gains.forEach(g => g.disconnect());
      this.activeVoices.delete(id);
    }, 600);
  }

  public stopAll() {
    Array.from(this.activeVoices.keys()).forEach(id => this.stopSound(id));
  }
}

export const audioEngine = new CosmicAudioEngine();
