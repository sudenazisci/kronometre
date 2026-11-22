// Study Bloom - High-Precision Drift-Free Timer Engine & Audio Chimes

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
    this.volume = 0.7;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playCompletionChime() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const masterGain = this.audioCtx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(this.audioCtx.destination);

      // Harmonious soothing chord: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const notes = [
        { freq: 523.25, time: 0, dur: 2.5 },
        { freq: 659.25, time: 0.18, dur: 2.3 },
        { freq: 783.99, time: 0.36, dur: 2.2 },
        { freq: 1046.50, time: 0.54, dur: 3.0 }
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        // Gentle envelope: fast attack, smooth exponential decay
        noteGain.gain.setValueAtTime(0.0001, now + time);
        noteGain.gain.exponentialRampToValueAtTime(0.35, now + time + 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    } catch (e) {
      console.warn('Audio chime playback issue:', e);
    }
  }

  playSoftClick() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(this.volume * 0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }
}

class TimerEngine {
  constructor(options = {}) {
    this.mode = 'normal'; // 'normal' | 'ales'
    this.state = 'idle'; // 'idle' | 'running' | 'paused'
    
    // Normal stopwatch state
    this.normalElapsedMs = 0;
    this.normalStartTime = null;
    this.normalSessionStartClock = null;

    // ALES countdown state
    this.alesTotalSeconds = 150 * 60; // 150 mins
    this.alesRemainingMs = 150 * 60 * 1000;
    this.alesStartTime = null;
    this.alesSessionStartClock = null;

    this.timerInterval = null;
    this.sound = new SoundEngine();

    this.onTick = options.onTick || (() => {});
    this.onStateChange = options.onStateChange || (() => {});
    this.onAlesComplete = options.onAlesComplete || (() => {});

    // Tab visibility change handler to recalculate instantly when waking up
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.state === 'running') {
        this.updateTick();
      }
    });
  }

  setMode(newMode) {
    if (this.mode === newMode) return;
    if (this.state === 'running') {
      this.pause();
    }
    this.mode = newMode;
    this.onStateChange(this.getState());
    this.updateTick();
  }

  setAlesDuration(minutes) {
    const mins = Math.max(1, parseInt(minutes, 10) || 150);
    this.alesTotalSeconds = mins * 60;
    if (this.state === 'idle' || this.mode === 'ales') {
      this.alesRemainingMs = this.alesTotalSeconds * 1000;
      this.updateTick();
    }
  }

  start() {
    this.sound.initContext();
    this.sound.playSoftClick();

    const now = Date.now();
    this.state = 'running';

    if (this.mode === 'normal') {
      this.normalStartTime = now;
      if (!this.normalSessionStartClock) {
        this.normalSessionStartClock = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    } else {
      this.alesStartTime = now;
      if (!this.alesSessionStartClock) {
        this.alesSessionStartClock = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    }

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => this.updateTick(), 200);

    this.updateTick();
    this.onStateChange(this.getState());
  }

  pause() {
    this.sound.playSoftClick();
    if (this.state !== 'running') return;

    const now = Date.now();
    if (this.mode === 'normal') {
      if (this.normalStartTime) {
        this.normalElapsedMs += (now - this.normalStartTime);
        this.normalStartTime = null;
      }
    } else {
      if (this.alesStartTime) {
        const delta = now - this.alesStartTime;
        this.alesRemainingMs = Math.max(0, this.alesRemainingMs - delta);
        this.alesStartTime = null;
      }
    }

    this.state = 'paused';
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.updateTick();
    this.onStateChange(this.getState());
  }

  resume() {
    this.start();
  }

  // Completes and logs current normal session
  finishNormalSession(note = '') {
    const durationSec = Math.floor(this.getNormalElapsedMs() / 1000);
    if (durationSec >= 3) { // Ignore accidental clicks under 3 seconds
      window.StorageManager.addSession({
        startTime: this.normalSessionStartClock || new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        durationSeconds: durationSec,
        mode: 'normal',
        note: note
      });
    }
    this.resetNormal();
  }

  // Completes and logs ALES session
  finishAlesSession(completedEarly = false, note = '') {
    const totalTargetSec = this.alesTotalSeconds;
    const remainingSec = Math.floor(this.getAlesRemainingMs() / 1000);
    const durationSec = totalTargetSec - remainingSec;

    if (durationSec >= 10) {
      window.StorageManager.addSession({
        startTime: this.alesSessionStartClock || new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        durationSeconds: durationSec,
        targetSeconds: totalTargetSec,
        mode: 'ales',
        completed: !completedEarly,
        note: note || (completedEarly ? 'Erken sonlandırıldı' : 'Süre tamamlandı')
      });
    }
    this.resetAles();
  }

  resetNormal() {
    this.state = 'idle';
    this.normalElapsedMs = 0;
    this.normalStartTime = null;
    this.normalSessionStartClock = null;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.updateTick();
    this.onStateChange(this.getState());
  }

  resetAles() {
    this.state = 'idle';
    this.alesRemainingMs = this.alesTotalSeconds * 1000;
    this.alesStartTime = null;
    this.alesSessionStartClock = null;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.updateTick();
    this.onStateChange(this.getState());
  }

  reset() {
    this.sound.playSoftClick();
    if (this.mode === 'normal') {
      this.resetNormal();
    } else {
      this.resetAles();
    }
  }

  getNormalElapsedMs() {
    let total = this.normalElapsedMs;
    if (this.state === 'running' && this.mode === 'normal' && this.normalStartTime) {
      total += (Date.now() - this.normalStartTime);
    }
    return total;
  }

  getAlesRemainingMs() {
    let remaining = this.alesRemainingMs;
    if (this.state === 'running' && this.mode === 'ales' && this.alesStartTime) {
      const delta = Date.now() - this.alesStartTime;
      remaining = Math.max(0, remaining - delta);
    }
    return remaining;
  }

  updateTick() {
    if (this.mode === 'normal') {
      const elapsedMs = this.getNormalElapsedMs();
      const totalSec = Math.floor(elapsedMs / 1000);
      const formatted = this.formatTime(totalSec, true);
      this.onTick({
        mode: 'normal',
        formatted: formatted,
        totalSeconds: totalSec,
        hours: formatted.hours,
        minutes: formatted.minutes,
        seconds: formatted.seconds,
        state: this.state
      });
    } else {
      const remainingMs = this.getAlesRemainingMs();
      const totalSec = Math.ceil(remainingMs / 1000);

      // Check if ALES countdown reached 0
      if (totalSec <= 0 && this.state === 'running') {
        this.pause();
        this.sound.playCompletionChime();
        this.finishAlesSession(false, 'Süre tamamlandı');
        this.onAlesComplete();
      }

      const formatted = this.formatTime(totalSec, true);
      const totalAlesSec = this.alesTotalSeconds;
      const progressPercent = Math.min(100, Math.max(0, ((totalAlesSec - totalSec) / totalAlesSec) * 100));

      this.onTick({
        mode: 'ales',
        formatted: formatted,
        totalSeconds: totalSec,
        hours: formatted.hours,
        minutes: formatted.minutes,
        seconds: formatted.seconds,
        progressPercent: progressPercent,
        state: this.state
      });
    }
  }

  formatTime(totalSeconds, returnObject = false) {
    const sec = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    const pad = (n) => String(n).padStart(2, '0');
    const hours = pad(h);
    const minutes = pad(m);
    const seconds = pad(s);

    const fullStr = `${hours}:${minutes}:${seconds}`;

    if (returnObject) {
      return {
        hours,
        minutes,
        seconds,
        fullStr,
        minSecStr: `${pad(Math.floor(sec / 60))}:${seconds}`
      };
    }
    return fullStr;
  }

  getState() {
    return {
      mode: this.mode,
      state: this.state,
      normalElapsedSeconds: Math.floor(this.getNormalElapsedMs() / 1000),
      alesRemainingSeconds: Math.ceil(this.getAlesRemainingMs() / 1000),
      alesTotalSeconds: this.alesTotalSeconds
    };
  }
}

window.SoundEngine = SoundEngine;
window.TimerEngine = TimerEngine;
