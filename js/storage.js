// Study Bloom - LocalStorage and State Persistence Management

const STORAGE_KEYS = {
  SETTINGS: 'study_bloom_settings',
  HISTORY: 'study_bloom_history',
  QUOTES: 'study_bloom_quotes',
  LAYOUT: 'study_bloom_layout',
  ACTIVE_TIMER: 'study_bloom_active_timer'
};

const DEFAULT_SETTINGS = {
  appName: 'Kronometre',
  subtitle: '',
  currentTheme: 'cherry-blossom',
  fontFamily: "'Quicksand', sans-serif",
  timerFontFamily: "'Space Mono', monospace",
  
  // Custom Color overrides (null when using theme defaults)
  customColors: {
    bgPrimary: '#fdf6f7',
    bgSecondary: '#faeef1',
    bgCard: '#ffffff',
    textPrimary: '#4a3b43',
    textSecondary: '#7a6571',
    timerColor: '#a84c6a',
    accentColor: '#d87093',
    btnBg: '#d87093',
    btnText: '#ffffff',
    decoColor1: '#f8b4c4',
    decoColor2: '#e58c9f',
    borderColor: '#f2d6dc'
  },
  
  // Font sizes in px / rem
  fontSizes: {
    timer: 88, // px
    timerFullscreen: 128, // px
    clock: 22,
    date: 15,
    title: 28,
    quote: 16,
    stats: 15,
    buttons: 16
  },
  
  // Clock Customization Preferences
  clockPrefs: {
    enlargedType: 'analog', // 'analog' | 'digital'
    analogDialStyle: 'numbers', // 'numbers' | 'roman' | 'minimal'
    showSeconds: true,
    digitalFormat24h: true,
    digitalFont: "'Space Mono', monospace"
  },
  
  // Decorations config
  decorations: {
    enabled: true,
    type: 'cherry', // 'cherry', 'daisy', 'butterfly', 'strawberry', 'tulip', 'botanical', 'stars', 'clouds', 'books', 'all'
    density: 'normal', // 'light', 'normal', 'lush'
    animationsEnabled: true,
    animationSpeed: 1.0, // multiplier
    sizeScale: 1.0,
    activeElements: {
      cherry: true,
      daisy: true,
      butterfly: true,
      leaves: true,
      stars: true,
      clouds: true,
      strawberries: true,
      hearts: true,
      books: true
    }
  },
  
  // Timer & ALES preferences
  timerPrefs: {
    soundEnabled: true,
    volume: 0.7,
    autoFullscreenInAles: false,
    focusModeInFullscreen: false,
    alesDurationMinutes: 150,
    showHourInAles: true,
    studyIndicator: true,
    shortcutsEnabled: true
  },
  
  // Element visibility
  visibility: {
    header: true,
    clock: true,
    date: true,
    quotes: true,
    miniStats: true,
    decorations: true,
    studyIndicator: true
  }
};

const DEFAULT_QUOTES = [
  "Bugün kendin için bir şey yapıyorsun.",
  "Bir soru daha, bir adım daha.",
  "Küçük adımlar da ilerlemedir.",
  "Sessizce çalış, sonuçlar konuşsun.",
  "Her dakika geleceğine yatırım.",
  "Şu an yaptığın şey gelecekteki sana bir hediye.",
  "Zorluklar, başarının değerini artırır.",
  "Büyük başarılar, her gün tekrarlanan küçük disiplinlerden doğar.",
  "Sakin ol, derin nefes al ve devam et.",
  "Emek verilen hiçbir şey boşa gitmez."
];

class StorageManager {
  static getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      const parsed = JSON.parse(data);
      // Deep merge with defaults to ensure all keys exist
      // Clean up legacy ALES subtitle & ensure appName
      const appName = (!parsed.appName || parsed.appName === 'Study Bloom') ? 'Kronometre' : parsed.appName;
      const subtitle = (parsed.subtitle === 'ALES Çalışma Alanı' || parsed.subtitle === 'Kişisel Sınav & Çalışma Alanı') ? '' : (parsed.subtitle || '');

      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        appName,
        subtitle,
        clockPrefs: { ...DEFAULT_SETTINGS.clockPrefs, ...(parsed.clockPrefs || {}) },
        customColors: { ...DEFAULT_SETTINGS.customColors, ...(parsed.customColors || {}) },
        fontSizes: { ...DEFAULT_SETTINGS.fontSizes, ...(parsed.fontSizes || {}) },
        decorations: { 
          ...DEFAULT_SETTINGS.decorations, 
          ...(parsed.decorations || {}),
          activeElements: { ...DEFAULT_SETTINGS.decorations.activeElements, ...(parsed.decorations?.activeElements || {}) }
        },
        timerPrefs: { ...DEFAULT_SETTINGS.timerPrefs, ...(parsed.timerPrefs || {}) },
        visibility: { ...DEFAULT_SETTINGS.visibility, ...(parsed.visibility || {}) }
      };
    } catch (e) {
      console.error('Error reading settings from localStorage:', e);
      return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }
  }

  static saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage:', e);
    }
  }

  static getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading history from localStorage:', e);
      return [];
    }
  }

  static saveHistory(history) {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Error saving history to localStorage:', e);
    }
  }

  static addSession(session) {
    const history = this.getHistory();
    const newSession = {
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('tr-TR'),
      startTime: session.startTime,
      endTime: session.endTime || new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      durationSeconds: session.durationSeconds,
      mode: session.mode, // 'normal' | 'ales'
      targetSeconds: session.targetSeconds || null,
      completed: session.completed !== undefined ? session.completed : true,
      note: session.note || ''
    };
    history.unshift(newSession);
    this.saveHistory(history);
    return newSession;
  }

  static updateSessionNote(sessionId, note) {
    const history = this.getHistory();
    const idx = history.findIndex(s => s.id === sessionId);
    if (idx !== -1) {
      history[idx].note = note;
      this.saveHistory(history);
      return true;
    }
    return false;
  }

  static deleteSession(sessionId) {
    let history = this.getHistory();
    history = history.filter(s => s.id !== sessionId);
    this.saveHistory(history);
    return history;
  }

  static clearHistory() {
    this.saveHistory([]);
  }

  static getQuotes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUOTES);
      return data ? JSON.parse(data) : [...DEFAULT_QUOTES];
    } catch (e) {
      return [...DEFAULT_QUOTES];
    }
  }

  static saveQuotes(quotes) {
    try {
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    } catch (e) {
      console.error('Error saving quotes:', e);
    }
  }

  static getLayout() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAYOUT);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  static saveLayout(layout) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAYOUT, JSON.stringify(layout));
    } catch (e) {
      console.error('Error saving layout:', e);
    }
  }

  static resetLayout() {
    localStorage.removeItem(STORAGE_KEYS.LAYOUT);
  }

  static resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.LAYOUT);
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }

  static saveActiveTimer(state) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TIMER, JSON.stringify(state));
    } catch (e) {}
  }

  static getActiveTimer() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_TIMER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  static clearActiveTimer() {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
    } catch (e) {}
  }

  static exportBackup() {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      history: this.getHistory(),
      quotes: this.getQuotes(),
      layout: this.getLayout()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study_bloom_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) this.saveSettings(data.settings);
      if (data.history) this.saveHistory(data.history);
      if (data.quotes) this.saveQuotes(data.quotes);
      if (data.layout) this.saveLayout(data.layout);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

window.StorageManager = StorageManager;
window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
