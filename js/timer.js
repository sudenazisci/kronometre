// Study Bloom - High-Precision Drift-Free Timer Engine & Exam Modes

const EXAM_PRESETS = {
  'ales-150': {
    id: 'ales-150',
    name: 'ALES Sınavı',
    shortName: 'ALES',
    durationMinutes: 150,
    questions: 100,
    subtitle: '150 Dakika (100 Soru)'
  },
  'hakim-all-130': {
    id: 'hakim-all-130',
    name: 'Hâkim & Savcı Yardımcılığı (Tüm Sınav)',
    shortName: 'Hâkim/Savcı Tüm',
    durationMinutes: 130,
    questions: 100,
    subtitle: '130 Dakika (100 Soru - Tek Oturum)'
  },
  'hakim-part1-80': {
    id: 'hakim-part1-80',
    name: 'Hâkim/Savcı 1. Oturum (Genel Yetenek/Kültür & Ortak Alan)',
    shortName: 'Hâkim/Savcı 1. Oturum',
    durationMinutes: 80,
    questions: 65,
    subtitle: '80 Dakika (Ortak Alan - 65 Soru)'
  },
  'hakim-part2-50': {
    id: 'hakim-part2-50',
    name: 'Hâkim/Savcı 2. Oturum (Alan Testi)',
    shortName: 'Hâkim/Savcı 2. Oturum',
    durationMinutes: 50,
    questions: 35,
    subtitle: '50 Dakika (Alan Testi - 35 Soru)'
  },
  'custom': {
    id: 'custom',
    name: 'Özel Sınav Süresi',
    shortName: 'Özel Süre',
    durationMinutes: 90,
    questions: null,
    subtitle: 'Kullanıcı Tanımlı'
  }
};

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
    this.mode = 'normal'; // 'normal' | 'ales' (exam)
    this.state = 'idle'; // 'idle' | 'running' | 'paused'
    
    // Normal stopwatch state
    this.normalElapsedMs = 0;
    this.normalStartTime = null;
    this.normalSessionStartClock = null;

    // Exam countdown state
    this.currentPresetId = 'ales-150';
    this.examTotalSeconds = 150 * 60; // 150 mins
    this.examRemainingMs = 150 * 60 * 1000;
    this.examStartTime = null;
    this.examSessionStartClock = null;

    this.timerInterval = null;
    this.sound = new SoundEngine();

    this.onTick = options.onTick || (() => {});
    this.onStateChange = options.onStateChange || (() => {});
    this.onAlesComplete = options.onAlesComplete || (() => {});

    // Try restoring any ongoing active session from localStorage
    this.restoreActiveSession();

    // Tab visibility change handler to recalculate instantly when waking up
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.state === 'running') {
        this.updateTick();
      }
    });

    // Save timer state periodically (every 2.5s)
    setInterval(() => {
      if (this.state === 'running' || this.state === 'paused') {
        this.persistActiveSession();
      }
    }, 2500);
  }

  setMode(newMode) {
    if (this.mode === newMode) return;
    if (this.state === 'running') {
      this.pause();
    }
    this.mode = newMode;
    this.persistActiveSession();
    this.onStateChange(this.getState());
    this.updateTick();
  }

  setExamPreset(presetId, customMinutes = null) {
    this.currentPresetId = presetId;
    let mins = 150;

    if (presetId === 'custom') {
      mins = Math.max(1, parseInt(customMinutes, 10) || 90);
      EXAM_PRESETS.custom.durationMinutes = mins;
      EXAM_PRESETS.custom.subtitle = `${mins} Dakika (Özel)`;
    } else if (EXAM_PRESETS[presetId]) {
      mins = EXAM_PRESETS[presetId].durationMinutes;
    }

    this.examTotalSeconds = mins * 60;
    if (this.state === 'idle' || this.mode === 'ales') {
      this.examRemainingMs = this.examTotalSeconds * 1000;
      this.updateTick();
    }
    this.persistActiveSession();
  }

  // Update custom preset duration
  setAlesDuration(minutes) {
    const mins = Math.max(1, parseInt(minutes, 10) || 90);
    if (EXAM_PRESETS.custom) {
      EXAM_PRESETS.custom.durationMinutes = mins;
      EXAM_PRESETS.custom.subtitle = `${mins} Dakika (Özel)`;
    }
    if (this.currentPresetId === 'custom') {
      this.setExamPreset('custom', mins);
    }
  }

  getAlesTotalSeconds() {
    return this.examTotalSeconds;
  }

  getAlesRemainingMs() {
    let remaining = this.examRemainingMs;
    if (this.state === 'running' && this.mode === 'ales' && this.examStartTime) {
      const delta = Date.now() - this.examStartTime;
      remaining = Math.max(0, remaining - delta);
    }
    return remaining;
  }

  getNormalElapsedMs() {
    let total = this.normalElapsedMs;
    if (this.state === 'running' && this.mode === 'normal' && this.normalStartTime) {
      total += (Date.now() - this.normalStartTime);
    }
    return total;
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
      this.examStartTime = now;
      if (!this.examSessionStartClock) {
        this.examSessionStartClock = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    }

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => this.updateTick(), 200);

    this.persistActiveSession();
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
      if (this.examStartTime) {
        const delta = now - this.examStartTime;
        this.examRemainingMs = Math.max(0, this.examRemainingMs - delta);
        this.examStartTime = null;
      }
    }

    this.state = 'paused';
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.persistActiveSession();
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
        examName: 'Normal Çalışma',
        note: note
      });
    }
    this.resetNormal();
  }

  // Completes and logs Exam session
  finishAlesSession(completedEarly = false, note = '') {
    const preset = EXAM_PRESETS[this.currentPresetId] || EXAM_PRESETS['ales-150'];
    const totalTargetSec = this.examTotalSeconds;
    const remainingSec = Math.floor(this.getAlesRemainingMs() / 1000);
    const durationSec = totalTargetSec - remainingSec;

    if (durationSec >= 5) {
      window.StorageManager.addSession({
        startTime: this.examSessionStartClock || new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        durationSeconds: durationSec,
        targetSeconds: totalTargetSec,
        mode: 'ales',
        examName: preset.name,
        completed: !completedEarly,
        note: note || (completedEarly ? `${preset.shortName} erken sonlandırıldı` : `${preset.shortName} süresi tamamlandı`)
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
    window.StorageManager.clearActiveTimer();
    this.updateTick();
    this.onStateChange(this.getState());
  }

  resetAles() {
    this.state = 'idle';
    this.examRemainingMs = this.examTotalSeconds * 1000;
    this.examStartTime = null;
    this.examSessionStartClock = null;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    window.StorageManager.clearActiveTimer();
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

  persistActiveSession() {
    try {
      const data = {
        mode: this.mode,
        state: this.state,
        currentPresetId: this.currentPresetId,
        normalElapsedMs: this.getNormalElapsedMs(),
        normalSessionStartClock: this.normalSessionStartClock,
        examRemainingMs: this.getAlesRemainingMs(),
        examTotalSeconds: this.examTotalSeconds,
        examSessionStartClock: this.examSessionStartClock,
        savedAt: Date.now()
      };
      window.StorageManager.saveActiveTimer(data);
    } catch (e) {}
  }

  restoreActiveSession() {
    try {
      const saved = window.StorageManager.getActiveTimer();
      if (!saved) return;

      this.mode = saved.mode || 'normal';
      this.currentPresetId = saved.currentPresetId || 'ales-150';
      if (saved.examTotalSeconds) this.examTotalSeconds = saved.examTotalSeconds;

      if (this.mode === 'normal') {
        let elapsed = saved.normalElapsedMs || 0;
        if (saved.state === 'running' && saved.savedAt) {
          elapsed += (Date.now() - saved.savedAt);
        }
        this.normalElapsedMs = elapsed;
        this.normalSessionStartClock = saved.normalSessionStartClock;
        this.state = saved.state === 'running' ? 'paused' : (saved.state || 'idle');
      } else {
        let remaining = saved.examRemainingMs !== undefined ? saved.examRemainingMs : (this.examTotalSeconds * 1000);
        if (saved.state === 'running' && saved.savedAt) {
          remaining = Math.max(0, remaining - (Date.now() - saved.savedAt));
        }
        this.examRemainingMs = remaining;
        this.examSessionStartClock = saved.examSessionStartClock;
        this.state = saved.state === 'running' ? 'paused' : (saved.state || 'idle');
      }
    } catch (e) {}
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

      // Check if Exam countdown reached 0
      if (totalSec <= 0 && this.state === 'running') {
        this.pause();
        this.sound.playCompletionChime();
        this.finishAlesSession(false, 'Süre tamamlandı');
        this.onAlesComplete();
      }

      const formatted = this.formatTime(totalSec, true);
      const totalExamSec = this.examTotalSeconds;
      const progressPercent = Math.min(100, Math.max(0, ((totalExamSec - totalSec) / totalExamSec) * 100));

      this.onTick({
        mode: 'ales',
        preset: EXAM_PRESETS[this.currentPresetId] || EXAM_PRESETS['ales-150'],
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
      presetId: this.currentPresetId,
      preset: EXAM_PRESETS[this.currentPresetId] || EXAM_PRESETS['ales-150'],
      state: this.state,
      normalElapsedSeconds: Math.floor(this.getNormalElapsedMs() / 1000),
      alesRemainingSeconds: Math.ceil(this.getAlesRemainingMs() / 1000),
      alesTotalSeconds: this.examTotalSeconds
    };
  }
}

window.EXAM_PRESETS = EXAM_PRESETS;
window.SoundEngine = SoundEngine;
window.TimerEngine = TimerEngine;
