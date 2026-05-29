class SoundService {
  private ctx: AudioContext | null = null;
  private muted: boolean = localStorage.getItem('prode_mute_sounds') === 'true';

  private initCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMute(mute: boolean) {
    this.muted = mute;
    localStorage.setItem('prode_mute_sounds', String(mute));
  }

  playWhistle() {
    if (this.muted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;

      const playPip = (startOffset: number, duration: number) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1100, now + startOffset);
        osc1.frequency.linearRampToValueAtTime(1050, now + startOffset + duration);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1200, now + startOffset);
        osc2.frequency.linearRampToValueAtTime(1150, now + startOffset + duration);

        gainNode.gain.setValueAtTime(0, now + startOffset);
        gainNode.gain.linearRampToValueAtTime(0.2, now + startOffset + 0.02);
        gainNode.gain.linearRampToValueAtTime(0.2, now + startOffset + duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + startOffset + duration);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now + startOffset);
        osc2.start(now + startOffset);

        osc1.stop(now + startOffset + duration);
        osc2.stop(now + startOffset + duration);
      };

      playPip(0, 0.12);
      playPip(0.18, 0.3);
    } catch (e) {
      console.warn('Sound play failed', e);
    }
  }

  playGoal() {
    if (this.muted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const duration = 2.0;

      // Generar ruido blanco para simular tribuna
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(350, now);
      filter.Q.setValueAtTime(1.0, now);
      filter.frequency.exponentialRampToValueAtTime(700, now + 0.4);
      filter.frequency.linearRampToValueAtTime(250, now + duration);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.4, now + 0.25);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.8);
      gainNode.gain.exponentialRampToValueAtTime(0.005, now + duration);

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);

      // Pitido de silbato largo de fondo al gritar gol
      const osc = ctx.createOscillator();
      const whistleGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.linearRampToValueAtTime(950, now + 0.6);
      
      whistleGain.gain.setValueAtTime(0, now);
      whistleGain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      whistleGain.gain.linearRampToValueAtTime(0.12, now + 0.5);
      whistleGain.gain.linearRampToValueAtTime(0, now + 0.6);
      
      osc.connect(whistleGain);
      whistleGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);

    } catch (e) {
      console.warn('Sound play failed', e);
    }
  }

  playAchievement() {
    if (this.muted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.value = freq;

        const start = now + idx * 0.1;
        const dur = 0.25;

        gainNode.gain.setValueAtTime(0, start);
        gainNode.gain.linearRampToValueAtTime(0.15, start + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.005, start + dur);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    } catch (e) {
      console.warn('Sound play failed', e);
    }
  }
}

export const soundService = new SoundService();
export default soundService;
