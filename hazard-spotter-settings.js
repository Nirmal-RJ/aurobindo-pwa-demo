/**
 * Settings and Sound Management Module
 * Manages grid layout configuration (Rows x Columns), Background Music (BGM) with
 * smart audio ducking, high-priority Web Audio FX, and LocalStorage persistence.
 */

class SettingsManager {
  constructor() {
    this.STORAGE_KEY = 'aurobindo_hazard_settings_v1';
    this.defaultSettings = {
      rows: 3,
      cols: 3,
      soundEnabled: true,
      bgmEnabled: true,
      bgmVolume: 25, // Subtle default ambient level (25%)
      autoAdvance: false,
      devMode: false,
      demoMode: false
    };
    this.settings = this.loadSettings();
    this.audioCtx = null;
    this.bgm = null;
    this.hasUserInteracted = false;
    this.isDucked = false;

    this.initAudioContext();
    this.initBGM();
  }

  loadSettings() {
    try {
      // Clear legacy storage key if present from previous builds
      if (localStorage.getItem('find_mistake_settings')) {
        localStorage.removeItem('find_mistake_settings');
      }
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...this.defaultSettings, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
    }
    return { ...this.defaultSettings };
  }

  saveSettings() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to write to localStorage:', e);
    }
  }

  get rows() {
    return parseInt(this.settings.rows, 10) || 3;
  }

  set rows(val) {
    this.settings.rows = Math.max(1, Math.min(8, parseInt(val, 10) || 3));
    this.saveSettings();
  }

  get cols() {
    return parseInt(this.settings.cols, 10) || 3;
  }

  set cols(val) {
    this.settings.cols = Math.max(1, Math.min(8, parseInt(val, 10) || 3));
    this.saveSettings();
  }

  get totalCells() {
    return this.rows * this.cols;
  }

  get soundEnabled() {
    return !!this.settings.soundEnabled;
  }

  set soundEnabled(val) {
    this.settings.soundEnabled = !!val;
    this.saveSettings();
  }

  get bgmEnabled() {
    return this.settings.bgmEnabled !== false;
  }

  set bgmEnabled(val) {
    this.settings.bgmEnabled = !!val;
    this.saveSettings();
    if (this.settings.bgmEnabled) {
      if (this.hasUserInteracted) {
        this.playBGM();
      }
    } else {
      this.pauseBGM();
    }
  }

  get bgmVolume() {
    const v = parseInt(this.settings.bgmVolume, 10);
    return isNaN(v) ? 25 : Math.max(0, Math.min(100, v));
  }

  set bgmVolume(val) {
    const v = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
    this.settings.bgmVolume = v;
    this.saveSettings();
    this.applyEffectiveBGMVolume();
  }

  get devMode() {
    return this.settings.devMode !== false;
  }

  set devMode(val) {
    this.settings.devMode = !!val;
    this.saveSettings();
  }

  get demoMode() {
    return this.settings.demoMode !== false;
  }

  set demoMode(val) {
    this.settings.demoMode = !!val;
    this.saveSettings();
  }

  /* ==========================================================================
     Background Music (BGM) Engine with Smart Audio Ducking
     ========================================================================== */
  initBGM() {
    try {
      this.bgm = new Audio('assets/find-the-mistake-interactive/audios/bgm.mp3');
      this.bgm.loop = true;
      this.applyEffectiveBGMVolume();
      this.bgm.preload = 'auto';
    } catch (e) {
      console.warn('Could not initialize BGM audio:', e);
    }

    const onFirstUserAction = () => {
      this.hasUserInteracted = true;
      if (this.bgmEnabled) {
        this.playBGM();
      }
      window.removeEventListener('pointerdown', onFirstUserAction);
      window.removeEventListener('click', onFirstUserAction);
      window.removeEventListener('keydown', onFirstUserAction);
      window.removeEventListener('touchstart', onFirstUserAction);
    };

    window.addEventListener('pointerdown', onFirstUserAction, { once: true });
    window.addEventListener('click', onFirstUserAction, { once: true });
    window.addEventListener('keydown', onFirstUserAction, { once: true });
    window.addEventListener('touchstart', onFirstUserAction, { once: true });
  }

  applyEffectiveBGMVolume() {
    if (!this.bgm) return;
    const baseRatio = this.bgmVolume / 100;
    // When ducked (during video playback), BGM drops down to 18% of user volume so video audio shines!
    const effective = this.isDucked ? (baseRatio * 0.18) : (baseRatio * 0.75);
    this.bgm.volume = Math.max(0, Math.min(1, effective));
  }

  duckBGM(shouldDuck = true) {
    this.isDucked = !!shouldDuck;
    this.applyEffectiveBGMVolume();
  }

  playBGM() {
    if (!this.bgm || !this.bgmEnabled) return;
    this.applyEffectiveBGMVolume();
    const p = this.bgm.play();
    if (p !== undefined) {
      p.catch((err) => {
        console.log('BGM waiting for user interaction:', err.message);
      });
    }
  }

  pauseBGM() {
    if (this.bgm) {
      this.bgm.pause();
    }
  }

  /* ==========================================================================
     High-Priority Web Audio API Synthesizer (Punchy & Clear SFX)
     ========================================================================== */
  initAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      const unlockAudio = () => {
        if (!this.audioCtx) {
          this.audioCtx = new AudioContextClass();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('click', unlockAudio, { once: true });
      window.addEventListener('touchstart', unlockAudio, { once: true });
    }
  }

  playBeep(freq = 440, duration = 0.1, type = 'sine', gainLevel = 0.35) {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainLevel, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  playClick() {
    this.playBeep(700, 0.05, 'triangle', 0.32);
  }

  playPauseAlert() {
    if (!this.soundEnabled) return;
    this.playBeep(580, 0.14, 'sine', 0.40);
    setTimeout(() => this.playBeep(880, 0.20, 'sine', 0.40), 120);
  }

  playSuccess() {
    if (!this.soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 0.25, 'sine', 0.35), idx * 85);
    });
  }

  playFailure() {
    if (!this.soundEnabled) return;
    const notes = [440, 370, 311];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 0.25, 'sawtooth', 0.35), idx * 110);
    });
  }

  playTick(urgent = false) {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      if (urgent) {
        // High-contrast urgent countdown warning blip (Dual frequency punch with louder resonance)
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(1050, now);
        osc1.frequency.exponentialRampToValueAtTime(750, now + 0.08);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(525, now);
        osc2.frequency.exponentialRampToValueAtTime(375, now + 0.08);

        gain.gain.setValueAtTime(0.65, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.08);
        osc2.stop(now + 0.08);
      } else {
        // Crisp, prominent tactical clock tick
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.055);

        gain.gain.setValueAtTime(0.50, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.055);
      }
    } catch (e) {
      console.warn('Timer sound error:', e);
    }
  }

  playTimeoutAlert() {
    if (!this.soundEnabled) return;
    const notes = [320, 240, 180];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 0.28, 'sawtooth', 0.40), idx * 120);
    });
  }
}

// Global settings instance
window.gameSettings = new SettingsManager();
