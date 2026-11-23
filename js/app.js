// Study Bloom - Main Application Controller

document.addEventListener('DOMContentLoaded', () => {
  // 1. UI Element References
  const dom = {
    // Header & Brand
    appTitleDisplay: document.getElementById('app-title-display'),
    appSubtitleDisplay: document.getElementById('app-subtitle-display'),
    liveClockText: document.getElementById('live-clock-text'),
    liveDateText: document.getElementById('live-date-text'),
    headerTimeDate: document.getElementById('header-time-date'),
    
    // Analog Clock Elements
    miniAnalogClockWrap: document.getElementById('mini-analog-clock-wrap'),
    miniClockHour: document.getElementById('mini-clock-hour'),
    miniClockMinute: document.getElementById('mini-clock-minute'),
    miniClockSecond: document.getElementById('mini-clock-second'),
    liveClockContainer: document.getElementById('live-clock-container'),
    analogClockModal: document.getElementById('analog-clock-modal'),
    btnCloseAnalogModal: document.getElementById('btn-close-analog-modal'),
    largeClockHour: document.getElementById('large-clock-hour'),
    largeClockMinute: document.getElementById('large-clock-minute'),
    largeClockSecond: document.getElementById('large-clock-second'),
    largeClockDigitalTime: document.getElementById('large-clock-digital-time'),
    largeClockDigitalDate: document.getElementById('large-clock-digital-date'),

    // Exam Presets Bar
    examPresetsBar: document.getElementById('exam-presets-bar'),
    chipCustomDurationText: document.getElementById('chip-custom-duration-text'),

    // Prominent Stats (Büyük Görünüm)
    prominentStatsCards: document.getElementById('prominent-stats-cards'),
    prominentStatToday: document.getElementById('prominent-stat-today'),
    prominentStatTodaySessions: document.getElementById('prominent-stat-today-sessions'),
    prominentStatWeekly: document.getElementById('prominent-stat-weekly'),
    prominentStatWeeklyDays: document.getElementById('prominent-stat-weekly-days'),
    
    // Actions
    btnToggleLayout: document.getElementById('btn-toggle-layout'),
    btnOpenStats: document.getElementById('btn-open-stats'),
    btnOpenSettings: document.getElementById('btn-open-settings'),
    btnToggleFullscreen: document.getElementById('btn-toggle-fullscreen'),
    fullscreenIconExpand: document.getElementById('fullscreen-icon-expand'),
    fullscreenIconCompress: document.getElementById('fullscreen-icon-compress'),
    fullscreenBtnText: document.getElementById('fullscreen-btn-text'),
    
    // Mode tabs
    tabModeNormal: document.getElementById('tab-mode-normal'),
    tabModeAles: document.getElementById('tab-mode-ales'),
    
    // Timer stage
    timerStage: document.getElementById('timer-stage'),
    studyStatusIndicator: document.getElementById('study-status-indicator'),
    studyStatusText: document.getElementById('study-status-text'),
    alesProgressContainer: document.getElementById('ales-progress-container'),
    alesProgressFill: document.getElementById('ales-progress-fill'),
    timerDigits: document.getElementById('timer-digits'),
    timerTargetTag: document.getElementById('timer-target-tag'),
    btnStart: document.getElementById('btn-start'),
    btnStartText: document.getElementById('btn-start-text'),
    btnPause: document.getElementById('btn-pause'),
    btnReset: document.getElementById('btn-reset'),
    btnFinishAles: document.getElementById('btn-finish-ales'),
    
    // Mini stats
    miniStatsContainer: document.getElementById('mini-stats-container'),
    miniStatToday: document.getElementById('mini-stat-today'),
    miniStatOverall: document.getElementById('mini-stat-overall'),
    miniStatSessions: document.getElementById('mini-stat-sessions'),

    // Layout mode banner
    layoutModeBanner: document.getElementById('layout-mode-banner'),
    btnResetLayout: document.getElementById('btn-reset-layout'),
    btnSaveLayout: document.getElementById('btn-save-layout'),

    // Modals
    settingsModal: document.getElementById('settings-modal'),
    btnCloseSettings: document.getElementById('btn-close-settings'),
    statsModal: document.getElementById('stats-modal'),
    btnCloseStats: document.getElementById('btn-close-stats'),
    resetConfirmModal: document.getElementById('reset-confirm-modal'),
    btnDialogSaveReset: document.getElementById('btn-dialog-save-reset'),
    btnDialogDiscardReset: document.getElementById('btn-dialog-discard-reset'),
    btnDialogCancel: document.getElementById('btn-dialog-cancel'),
    alesCompleteModal: document.getElementById('ales-complete-modal'),
    btnAlesCelebrateClose: document.getElementById('btn-ales-celebrate-close'),

    // Floating exit fullscreen button
    btnFullscreenFloatingExit: document.getElementById('btn-fullscreen-floating-exit')
  };

  // 2. Initialize State and Engines
  let settings = window.StorageManager.getSettings();
  let isLayoutEditing = false;
  let activeHistoryFilter = 'all';

  const decorationsEngine = new window.DecorationsEngine('decorations-container');
  decorationsEngine.init(settings);

  // 3. Initialize Timer Engine
  const timerEngine = new window.TimerEngine({
    onTick: (data) => handleTimerTick(data),
    onStateChange: (state) => handleTimerStateChange(state),
    onAlesComplete: () => handleAlesCompletion()
  });

  // Set initial custom duration from settings
  timerEngine.setAlesDuration(settings.timerPrefs.alesDurationMinutes || 150);
  timerEngine.sound.enabled = settings.timerPrefs.soundEnabled !== false;

  // Sync initial mode and preset UI state
  if (timerEngine.mode === 'ales') {
    dom.tabModeAles.classList.add('active');
    dom.tabModeNormal.classList.remove('active');
    if (dom.examPresetsBar) dom.examPresetsBar.style.display = 'flex';
  } else {
    dom.tabModeNormal.classList.add('active');
    dom.tabModeAles.classList.remove('active');
    if (dom.examPresetsBar) dom.examPresetsBar.style.display = 'none';
  }

  // Sync preset chip active class
  document.querySelectorAll('.exam-chip-btn').forEach(btn => {
    if (btn.getAttribute('data-preset') === timerEngine.currentPresetId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Initial update
  timerEngine.updateTick();
  handleTimerStateChange(timerEngine.getState());

  // 4. Live Clock & Turkish Date System (Digital + Analog Hands)
  function updateLiveClockAndDate() {
    const now = new Date();
    
    // 24h format HH:mm:ss
    const timeStr = now.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    if (dom.liveClockText) dom.liveClockText.textContent = timeStr;

    // Date formatted: "23 Kasım 2026, Pazartesi"
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
    const dateStr = now.toLocaleDateString('tr-TR', dateOptions);
    if (dom.liveDateText) dom.liveDateText.textContent = dateStr;

    // Analog Clock Hands Rotation
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const secDeg = seconds * 6;
    const minDeg = (minutes + seconds / 60) * 6;
    const hourDeg = ((hours % 12) + minutes / 60) * 30;

    // Mini clock hands
    if (dom.miniClockHour) dom.miniClockHour.style.transform = `rotate(${hourDeg}deg)`;
    if (dom.miniClockMinute) dom.miniClockMinute.style.transform = `rotate(${minDeg}deg)`;
    if (dom.miniClockSecond) dom.miniClockSecond.style.transform = `rotate(${secDeg}deg)`;

    // Large clock hands & displays
    if (dom.largeClockHour) dom.largeClockHour.style.transform = `rotate(${hourDeg}deg)`;
    if (dom.largeClockMinute) dom.largeClockMinute.style.transform = `rotate(${minDeg}deg)`;
    if (dom.largeClockSecond) dom.largeClockSecond.style.transform = `rotate(${secDeg}deg)`;
    if (dom.largeClockDigitalTime) dom.largeClockDigitalTime.textContent = timeStr;
    if (dom.largeClockDigitalDate) dom.largeClockDigitalDate.textContent = dateStr;
  }
  setInterval(updateLiveClockAndDate, 1000);
  updateLiveClockAndDate();

  // 5. Apply Settings & Theme to CSS Custom Properties
  function applyThemeAndStyles() {
    const root = document.documentElement;
    const theme = window.THEMES[settings.currentTheme] || window.THEMES['cherry-blossom'];
    const colors = settings.customColors || theme.colors;

    // Colors
    root.style.setProperty('--bg-primary', colors.bgPrimary || theme.colors.bgPrimary);
    root.style.setProperty('--bg-secondary', colors.bgSecondary || theme.colors.bgSecondary);
    root.style.setProperty('--bg-card', colors.bgCard || theme.colors.bgCard);
    root.style.setProperty('--text-primary', colors.textPrimary || theme.colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary || theme.colors.textSecondary);
    root.style.setProperty('--text-muted', colors.textMuted || theme.colors.textMuted || '#a3a3a3');
    root.style.setProperty('--timer-color', colors.timerColor || theme.colors.timerColor);
    root.style.setProperty('--accent-color', colors.accentColor || theme.colors.accentColor);
    root.style.setProperty('--accent-hover', colors.accentHover || theme.colors.accentHover || colors.accentColor);
    root.style.setProperty('--btn-bg', colors.btnBg || theme.colors.btnBg);
    root.style.setProperty('--btn-text', colors.btnText || theme.colors.btnText);
    root.style.setProperty('--deco-color-1', colors.decoColor1 || theme.colors.decoColor1);
    root.style.setProperty('--deco-color-2', colors.decoColor2 || theme.colors.decoColor2);
    root.style.setProperty('--border-color', colors.borderColor || theme.colors.borderColor);

    // Fonts
    root.style.setProperty('--font-main', settings.fontFamily || theme.fontFamily);
    root.style.setProperty('--font-timer', settings.timerFontFamily || theme.timerFontFamily);

    // Font Sizes
    const sizes = settings.fontSizes || {};
    if (sizes.timer) root.style.setProperty('--timer-size', `${sizes.timer}px`);
    if (sizes.timerFullscreen) root.style.setProperty('--timer-fullscreen-size', `${sizes.timerFullscreen}px`);
    if (sizes.clock) root.style.setProperty('--clock-size', `${sizes.clock}px`);
    if (sizes.date) root.style.setProperty('--date-size', `${sizes.date}px`);
    if (sizes.title) root.style.setProperty('--title-size', `${sizes.title}px`);
    if (sizes.quote) root.style.setProperty('--quote-size', `${sizes.quote}px`);
    if (sizes.stats) root.style.setProperty('--stats-size', `${sizes.stats}px`);
    if (sizes.buttons) root.style.setProperty('--btn-size', `${sizes.buttons}px`);

    // Titles
    if (dom.appTitleDisplay) dom.appTitleDisplay.textContent = settings.appName || '';
    if (dom.appSubtitleDisplay) dom.appSubtitleDisplay.textContent = settings.subtitle || 'Kişisel Sınav & Çalışma Alanı';

    // Element Visibilities
    const vis = settings.visibility || {};
    if (dom.headerTimeDate) dom.headerTimeDate.style.display = vis.clock ? 'flex' : 'none';
    if (dom.miniStatsContainer) dom.miniStatsContainer.style.display = vis.miniStats ? 'flex' : 'none';
    if (dom.studyStatusIndicator) dom.studyStatusIndicator.style.display = vis.studyIndicator ? 'flex' : 'none';

    // Update Decorations Engine
    decorationsEngine.update(settings);

    // Focus mode in fullscreen class
    if (settings.timerPrefs?.focusModeInFullscreen) {
      document.body.classList.add('focus-mode-active');
    } else {
      document.body.classList.remove('focus-mode-active');
    }
  }
  applyThemeAndStyles();

  // 6. Timer UI Handling & Event Callbacks
  function handleTimerTick(data) {
    if (data.mode === 'normal') {
      dom.timerDigits.textContent = data.formatted.fullStr;
      dom.alesProgressContainer.classList.remove('visible');
      dom.timerTargetTag.style.display = 'none';
    } else {
      // In Exam mode, show HH:MM:SS or MM:SS based on settings
      if (settings.timerPrefs?.showHourInAles) {
        dom.timerDigits.textContent = data.formatted.fullStr;
      } else {
        dom.timerDigits.textContent = data.formatted.minSecStr;
      }
      dom.alesProgressContainer.classList.add('visible');
      dom.alesProgressFill.style.width = `${data.progressPercent || 0}%`;
      dom.timerTargetTag.style.display = 'block';

      const preset = data.preset || window.EXAM_PRESETS[timerEngine.currentPresetId] || window.EXAM_PRESETS['ales-150'];
      dom.timerTargetTag.textContent = `${preset.name} • ${preset.subtitle}`;
    }
  }

  function handleTimerStateChange(state) {
    if (state.state === 'running') {
      dom.btnStart.style.display = 'none';
      dom.btnPause.style.display = 'inline-flex';
      dom.studyStatusIndicator.classList.add('is-running');
      const preset = window.EXAM_PRESETS[timerEngine.currentPresetId] || window.EXAM_PRESETS['ales-150'];
      dom.studyStatusText.textContent = state.mode === 'ales' ? `${preset.shortName.toUpperCase()} AKTİF` : 'ÇALIŞMA AKTİF';

      if (state.mode === 'ales') {
        dom.btnFinishAles.style.display = 'inline-flex';
      } else {
        dom.btnFinishAles.style.display = 'none';
      }
    } else if (state.state === 'paused') {
      dom.btnStart.style.display = 'inline-flex';
      dom.btnStartText.textContent = 'Devam Et';
      dom.btnPause.style.display = 'none';
      dom.studyStatusIndicator.classList.remove('is-running');
      dom.studyStatusText.textContent = 'DURAKLATILDI';
    } else {
      // idle
      dom.btnStart.style.display = 'inline-flex';
      dom.btnStartText.textContent = 'Başlat';
      dom.btnPause.style.display = 'none';
      dom.btnFinishAles.style.display = 'none';
      dom.studyStatusIndicator.classList.remove('is-running');
      dom.studyStatusText.textContent = 'HAZIR';
    }

    updateMainMiniStats();
  }

  function handleAlesCompletion() {
    const preset = window.EXAM_PRESETS[timerEngine.currentPresetId] || window.EXAM_PRESETS['ales-150'];
    const celebrateTitle = document.getElementById('ales-celebrate-title');
    const celebrateDesc = document.getElementById('ales-celebrate-desc');
    if (celebrateTitle) celebrateTitle.textContent = `Tebrikler! ${preset.shortName} Tamamlandı! 🎉`;
    if (celebrateDesc) celebrateDesc.textContent = `${preset.name} için belirlediğin ${preset.durationMinutes} dakikalık süreyi başarıyla tamamladın.`;

    dom.alesCompleteModal.classList.add('active');
    updateMainMiniStats();
    
    // Browser Notification if supported
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Study Bloom – ${preset.name} Süresi Bitti!`, {
        body: `${preset.durationMinutes} dakikalık sınav süreniz tamamlandı. Harika bir çalışma oldu!`,
        icon: "🌸"
      });
    }
  }

  // Timer Controls Click Handlers
  dom.btnStart.addEventListener('click', () => {
    // Request notification permission smoothly on first start
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    timerEngine.start();
  });

  dom.btnPause.addEventListener('click', () => {
    timerEngine.pause();
  });

  dom.btnReset.addEventListener('click', () => {
    const elapsed = timerEngine.mode === 'normal' 
      ? timerEngine.getNormalElapsedMs() 
      : (timerEngine.alesTotalSeconds * 1000 - timerEngine.getAlesRemainingMs());

    if (elapsed > 4000) { // If spent more than 4 seconds, ask before discarding
      dom.resetConfirmModal.classList.add('active');
    } else {
      timerEngine.reset();
    }
  });

  dom.btnDialogSaveReset.addEventListener('click', () => {
    if (timerEngine.mode === 'normal') {
      timerEngine.finishNormalSession('Normal Çalışma');
    } else {
      const preset = window.EXAM_PRESETS[timerEngine.currentPresetId] || window.EXAM_PRESETS['ales-150'];
      timerEngine.finishAlesSession(true, `${preset.shortName} Erken Bitirildi`);
    }
    dom.resetConfirmModal.classList.remove('active');
    updateMainMiniStats();
  });

  dom.btnDialogDiscardReset.addEventListener('click', () => {
    timerEngine.reset();
    dom.resetConfirmModal.classList.remove('active');
    updateMainMiniStats();
  });

  dom.btnDialogCancel.addEventListener('click', () => {
    dom.resetConfirmModal.classList.remove('active');
  });

  dom.btnFinishAles.addEventListener('click', () => {
    const preset = window.EXAM_PRESETS[timerEngine.currentPresetId] || window.EXAM_PRESETS['ales-150'];
    if (confirm(`${preset.name} sınav oturumunu erken bitirip çalışma geçmişine kaydetmek istiyor musunuz?`)) {
      timerEngine.pause();
      timerEngine.finishAlesSession(true, `${preset.shortName} erken bitirildi`);
      dom.alesCompleteModal.classList.add('active');
      updateMainMiniStats();
    }
  });

  dom.btnAlesCelebrateClose.addEventListener('click', () => {
    dom.alesCompleteModal.classList.remove('active');
  });

  // Mode Switch Tabs
  dom.tabModeNormal.addEventListener('click', () => {
    dom.tabModeNormal.classList.add('active');
    dom.tabModeAles.classList.remove('active');
    if (dom.examPresetsBar) dom.examPresetsBar.style.display = 'none';
    timerEngine.setMode('normal');
  });

  dom.tabModeAles.addEventListener('click', () => {
    dom.tabModeAles.classList.add('active');
    dom.tabModeNormal.classList.remove('active');
    if (dom.examPresetsBar) dom.examPresetsBar.style.display = 'flex';
    timerEngine.setMode('ales');
    const preset = window.EXAM_PRESETS[timerEngine.currentPresetId] || window.EXAM_PRESETS['ales-150'];
    dom.timerTargetTag.textContent = `${preset.name} • ${preset.subtitle}`;
  });

  // Exam Presets Bar Chips
  const examChipBtns = document.querySelectorAll('.exam-chip-btn');
  examChipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetId = btn.getAttribute('data-preset');
      examChipBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      timerEngine.setExamPreset(presetId);
      const preset = window.EXAM_PRESETS[presetId] || window.EXAM_PRESETS['ales-150'];
      dom.timerTargetTag.textContent = `${preset.name} • ${preset.subtitle}`;
    });
  });

  // Analog Clock Modal Open / Close Handlers
  if (dom.miniAnalogClockWrap) {
    dom.miniAnalogClockWrap.addEventListener('click', () => {
      if (dom.analogClockModal) dom.analogClockModal.classList.add('active');
    });
  }
  if (dom.liveClockContainer) {
    dom.liveClockContainer.addEventListener('click', () => {
      if (dom.analogClockModal) dom.analogClockModal.classList.add('active');
    });
  }
  if (dom.btnCloseAnalogModal) {
    dom.btnCloseAnalogModal.addEventListener('click', () => {
      if (dom.analogClockModal) dom.analogClockModal.classList.remove('active');
    });
  }
  if (dom.analogClockModal) {
    dom.analogClockModal.addEventListener('click', (e) => {
      if (e.target === dom.analogClockModal) {
        dom.analogClockModal.classList.remove('active');
      }
    });
  }

  // 7. Fullscreen Implementation
  function toggleFullscreen() {
    const isCurrentlyFullscreen = document.body.classList.contains('fullscreen-mode') || !!(document.fullscreenElement || document.webkitFullscreenElement);
    
    if (!isCurrentlyFullscreen) {
      document.body.classList.add('fullscreen-mode');
      if (dom.fullscreenIconExpand) dom.fullscreenIconExpand.style.display = 'none';
      if (dom.fullscreenIconCompress) dom.fullscreenIconCompress.style.display = 'block';
      if (dom.fullscreenBtnText) dom.fullscreenBtnText.textContent = 'Küçült';

      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen().catch(() => {});
      }
    } else {
      document.body.classList.remove('fullscreen-mode');
      if (dom.fullscreenIconExpand) dom.fullscreenIconExpand.style.display = 'block';
      if (dom.fullscreenIconCompress) dom.fullscreenIconCompress.style.display = 'none';
      if (dom.fullscreenBtnText) dom.fullscreenBtnText.textContent = 'Tam Ekran';

      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen().catch(() => {});
        }
      }
    }
  }

  function handleFullscreenChange() {
    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (isFull) {
      document.body.classList.add('fullscreen-mode');
      if (dom.fullscreenIconExpand) dom.fullscreenIconExpand.style.display = 'none';
      if (dom.fullscreenIconCompress) dom.fullscreenIconCompress.style.display = 'block';
      if (dom.fullscreenBtnText) dom.fullscreenBtnText.textContent = 'Küçült';
    } else {
      document.body.classList.remove('fullscreen-mode');
      if (dom.fullscreenIconExpand) dom.fullscreenIconExpand.style.display = 'block';
      if (dom.fullscreenIconCompress) dom.fullscreenIconCompress.style.display = 'none';
      if (dom.fullscreenBtnText) dom.fullscreenBtnText.textContent = 'Tam Ekran';
    }
  }

  dom.btnToggleFullscreen.addEventListener('click', toggleFullscreen);
  if (dom.btnFullscreenFloatingExit) {
    dom.btnFullscreenFloatingExit.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFullscreen();
    });
  }
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

  // 8. Statistics and History Sync
  function updateMainMiniStats() {
    const stats = window.StatsManager.getStats();
    if (dom.miniStatToday) dom.miniStatToday.textContent = stats.today.formatted;
    if (dom.miniStatOverall) dom.miniStatOverall.textContent = stats.overall.formatted;
    if (dom.miniStatSessions) dom.miniStatSessions.textContent = `${stats.today.sessionCount} oturum`;

    // Prominent big stats (Ana ekran büyük gösterim)
    if (dom.prominentStatToday) dom.prominentStatToday.textContent = stats.today.formatted;
    if (dom.prominentStatTodaySessions) dom.prominentStatTodaySessions.textContent = `${stats.today.sessionCount} oturum tamamlandı`;
    if (dom.prominentStatWeekly) dom.prominentStatWeekly.textContent = stats.weekly.formatted;
    if (dom.prominentStatWeeklyDays) dom.prominentStatWeeklyDays.textContent = `${stats.weekly.daysStudied || 0} aktif gün`;

    // Overview modal stats
    const todayBig = document.getElementById('stat-today-big');
    const todayCount = document.getElementById('stat-today-sessions-count');
    const overallBig = document.getElementById('stat-overall-big');
    const overallDays = document.getElementById('stat-overall-days-count');
    const longestDay = document.getElementById('stat-longest-day');
    const weeklyTotal = document.getElementById('stat-weekly-total-text');

    if (todayBig) todayBig.textContent = stats.today.formatted;
    if (todayCount) todayCount.textContent = `${stats.today.sessionCount} oturum tamamlandı`;
    if (overallBig) overallBig.textContent = stats.overall.formatted;
    if (overallDays) overallDays.textContent = `${stats.overall.totalDays} aktif çalışma günü • ${stats.overall.totalSessions} toplam oturum`;
    if (longestDay) longestDay.textContent = stats.weekly.longestDay;
    if (weeklyTotal) weeklyTotal.textContent = `Bu hafta toplam: ${stats.weekly.formatted}`;

    window.StatsManager.renderWeeklyBarChart('weekly-chart-box', stats.weekly);
  }
  updateMainMiniStats();

  window.addEventListener('study_history_changed', () => {
    updateMainMiniStats();
    window.StatsManager.renderHistoryList('history-list-box', activeHistoryFilter);
  });

  // 10. Modals Management (Settings & Stats)
  dom.btnOpenSettings.addEventListener('click', () => {
    populateSettingsForm();
    dom.settingsModal.classList.add('active');
  });

  dom.btnCloseSettings.addEventListener('click', () => {
    dom.settingsModal.classList.remove('active');
  });

  dom.btnOpenStats.addEventListener('click', () => {
    updateMainMiniStats();
    window.StatsManager.renderHistoryList('history-list-box', activeHistoryFilter);
    dom.statsModal.classList.add('active');
  });

  dom.btnCloseStats.addEventListener('click', () => {
    dom.statsModal.classList.remove('active');
  });

  // Settings Tabs Switching
  document.querySelectorAll('.settings-tab-link').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.settings-tab-link').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.settings-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const paneId = tab.getAttribute('data-tab');
      const pane = document.getElementById(paneId);
      if (pane) pane.classList.add('active');
    });
  });

  // Stats Modal Tabs Switching (Overview vs History)
  const tabBtnStatsOverview = document.getElementById('tab-btn-stats-overview');
  const tabBtnStatsHistory = document.getElementById('tab-btn-stats-history');
  const paneStatsOverview = document.getElementById('pane-stats-overview');
  const paneStatsHistory = document.getElementById('pane-stats-history');

  tabBtnStatsOverview.addEventListener('click', () => {
    tabBtnStatsOverview.classList.add('active');
    tabBtnStatsHistory.classList.remove('active');
    paneStatsOverview.style.display = 'block';
    paneStatsHistory.style.display = 'none';
  });

  tabBtnStatsHistory.addEventListener('click', () => {
    tabBtnStatsHistory.classList.add('active');
    tabBtnStatsOverview.classList.remove('active');
    paneStatsOverview.style.display = 'none';
    paneStatsHistory.style.display = 'block';
    window.StatsManager.renderHistoryList('history-list-box', activeHistoryFilter);
  });

  // History Filter Buttons
  document.querySelectorAll('.history-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.history-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeHistoryFilter = btn.getAttribute('data-filter');
      window.StatsManager.renderHistoryList('history-list-box', activeHistoryFilter);
    });
  });

  // Clear All History Button
  const btnClearAllHistory = document.getElementById('btn-clear-all-history');
  btnClearAllHistory.addEventListener('click', () => {
    if (confirm('Tüm çalışma geçmişini kalıcı olarak silmek istediğine emin misin? Bu işlem geri alınamaz.')) {
      window.StorageManager.clearHistory();
      updateMainMiniStats();
      window.StatsManager.renderHistoryList('history-list-box', activeHistoryFilter);
    }
  });

  // 11. Populate Settings Form Dynamic Controls
  function populateSettingsForm() {
    // 11.1 Themes Grid
    const themesGrid = document.getElementById('themes-grid');
    themesGrid.innerHTML = '';
    for (const [key, t] of Object.entries(window.THEMES)) {
      const isAct = settings.currentTheme === key;
      const card = document.createElement('div');
      card.className = `theme-card-choice ${isAct ? 'active' : ''}`;
      card.innerHTML = `
        <div class="theme-card-colors">
          <span class="theme-swatch-dot" style="background: ${t.colors.bgPrimary}"></span>
          <span class="theme-swatch-dot" style="background: ${t.colors.timerColor}"></span>
          <span class="theme-swatch-dot" style="background: ${t.colors.accentColor}"></span>
          <span class="theme-swatch-dot" style="background: ${t.colors.decoColor1}"></span>
        </div>
        <span class="theme-card-title">${t.name}</span>
      `;
      card.addEventListener('click', () => {
        settings.currentTheme = key;
        settings.customColors = { ...t.colors };
        settings.fontFamily = t.fontFamily;
        settings.timerFontFamily = t.timerFontFamily;
        settings.decorations.type = t.decoType;
        window.StorageManager.saveSettings(settings);
        applyThemeAndStyles();
        populateSettingsForm();
      });
      themesGrid.appendChild(card);
    }

    // 11.2 Ready Palettes Row
    const palettesContainer = document.getElementById('palettes-container');
    palettesContainer.innerHTML = '';
    window.COLOR_PALETTES.forEach(pal => {
      const pill = document.createElement('button');
      pill.className = 'palette-preset-pill';
      pill.innerHTML = `
        <span class="palette-swatch" style="background: ${pal.preview}"></span>
        <span>${pal.name}</span>
      `;
      pill.addEventListener('click', () => {
        settings.customColors = { ...pal.colors };
        window.StorageManager.saveSettings(settings);
        applyThemeAndStyles();
        populateColorPickers();
      });
      palettesContainer.appendChild(pill);
    });

    // 11.3 Detailed Color Pickers
    populateColorPickers();

    // 11.4 Font Selectors
    const selectMainFont = document.getElementById('select-main-font');
    const selectTimerFont = document.getElementById('select-timer-font');
    selectMainFont.innerHTML = '';
    selectTimerFont.innerHTML = '';

    window.FONTS.forEach(f => {
      const opt1 = document.createElement('option');
      opt1.value = f.family;
      opt1.textContent = f.name;
      opt1.selected = (settings.fontFamily === f.family);
      selectMainFont.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = f.family;
      opt2.textContent = f.name;
      opt2.selected = (settings.timerFontFamily === f.family);
      selectTimerFont.appendChild(opt2);
    });

    selectMainFont.onchange = () => {
      settings.fontFamily = selectMainFont.value;
      window.StorageManager.saveSettings(settings);
      applyThemeAndStyles();
    };

    selectTimerFont.onchange = () => {
      settings.timerFontFamily = selectTimerFont.value;
      window.StorageManager.saveSettings(settings);
      applyThemeAndStyles();
    };

    // 11.5 Font Sizes Sliders
    populateFontSizeControls();

    // 11.6 ALES & Timer Controls
    const inputCustomAlesMin = document.getElementById('input-custom-ales-min');
    inputCustomAlesMin.value = settings.timerPrefs.alesDurationMinutes || 150;
    inputCustomAlesMin.onchange = () => {
      const val = parseInt(inputCustomAlesMin.value, 10) || 150;
      settings.timerPrefs.alesDurationMinutes = val;
      timerEngine.setAlesDuration(val);
      window.StorageManager.saveSettings(settings);
    };

    document.querySelectorAll('.btn-ales-preset').forEach(btn => {
      btn.onclick = () => {
        const mins = parseInt(btn.getAttribute('data-minutes'), 10);
        inputCustomAlesMin.value = mins;
        settings.timerPrefs.alesDurationMinutes = mins;
        timerEngine.setAlesDuration(mins);
        window.StorageManager.saveSettings(settings);
      };
    });

    const toggleSoundChime = document.getElementById('toggle-sound-chime');
    toggleSoundChime.checked = settings.timerPrefs.soundEnabled !== false;
    toggleSoundChime.onchange = () => {
      settings.timerPrefs.soundEnabled = toggleSoundChime.checked;
      timerEngine.sound.enabled = toggleSoundChime.checked;
      window.StorageManager.saveSettings(settings);
    };

    const btnTestChime = document.getElementById('btn-test-chime');
    btnTestChime.onclick = () => {
      timerEngine.sound.initContext();
      timerEngine.sound.playCompletionChime();
    };

    const toggleFocusMode = document.getElementById('toggle-focus-mode');
    toggleFocusMode.checked = !!settings.timerPrefs.focusModeInFullscreen;
    toggleFocusMode.onchange = () => {
      settings.timerPrefs.focusModeInFullscreen = toggleFocusMode.checked;
      window.StorageManager.saveSettings(settings);
      applyThemeAndStyles();
    };

    // 11.7 Decorations Controls
    const toggleAllDeco = document.getElementById('toggle-all-decorations');
    toggleAllDeco.checked = settings.decorations.enabled !== false;
    toggleAllDeco.onchange = () => {
      settings.decorations.enabled = toggleAllDeco.checked;
      window.StorageManager.saveSettings(settings);
      applyThemeAndStyles();
    };

    const toggleDecoAnim = document.getElementById('toggle-deco-animations');
    toggleDecoAnim.checked = settings.decorations.animationsEnabled !== false;
    toggleDecoAnim.onchange = () => {
      settings.decorations.animationsEnabled = toggleDecoAnim.checked;
      window.StorageManager.saveSettings(settings);
      applyThemeAndStyles();
    };

    const sliderDecoScale = document.getElementById('slider-deco-scale');
    const labelDecoScale = document.getElementById('label-deco-scale');
    sliderDecoScale.value = Math.round((settings.decorations.sizeScale || 1.0) * 100);
    labelDecoScale.textContent = `%${sliderDecoScale.value}`;
    sliderDecoScale.oninput = () => {
      labelDecoScale.textContent = `%${sliderDecoScale.value}`;
      settings.decorations.sizeScale = sliderDecoScale.value / 100;
      window.StorageManager.saveSettings(settings);
      applyThemeAndStyles();
    };

    const sliderDecoSpeed = document.getElementById('slider-deco-speed');
    const labelDecoSpeed = document.getElementById('label-deco-speed');
    sliderDecoSpeed.value = settings.decorations.animationSpeed || 1.0;
    labelDecoSpeed.textContent = `${sliderDecoSpeed.value}x`;
    sliderDecoSpeed.oninput = () => {
      labelDecoSpeed.textContent = `${sliderDecoSpeed.value}x`;
      settings.decorations.animationSpeed = parseFloat(sliderDecoSpeed.value);
      window.StorageManager.saveSettings(settings);
      applyThemeAndStyles();
    };

    // 11.8 Layout & Visibilities
    const inputAppName = document.getElementById('input-app-name');
    inputAppName.value = settings.appName || 'Study Bloom';
    inputAppName.onchange = () => {
      settings.appName = inputAppName.value.trim() || 'Study Bloom';
      window.StorageManager.saveSettings(settings);
      applyThemeAndStyles();
    };

    const inputAppSubtitle = document.getElementById('input-app-subtitle');
    inputAppSubtitle.value = settings.subtitle || 'Kişisel Sınav & Çalışma Alanı';
    inputAppSubtitle.onchange = () => {
      settings.subtitle = inputAppSubtitle.value.trim() || 'Kişisel Sınav & Çalışma Alanı';
      window.StorageManager.saveSettings(settings);
      applyThemeAndStyles();
    };

    const toggleVisClock = document.getElementById('toggle-vis-clock');
    toggleVisClock.checked = settings.visibility.clock !== false;
    toggleVisClock.onchange = () => {
      settings.visibility.clock = toggleVisClock.checked;
      window.StorageManager.saveSettings(settings);
      applyThemeAndStyles();
    };

    const toggleVisStats = document.getElementById('toggle-vis-stats');
    toggleVisStats.checked = settings.visibility.miniStats !== false;
    toggleVisStats.onchange = () => {
      settings.visibility.miniStats = toggleVisStats.checked;
      window.StorageManager.saveSettings(settings);
      applyThemeAndStyles();
    };

    // 11.9 Keyboard Shortcuts toggle
    const toggleShortcuts = document.getElementById('toggle-enable-shortcuts');
    toggleShortcuts.checked = settings.timerPrefs.shortcutsEnabled !== false;
    toggleShortcuts.onchange = () => {
      settings.timerPrefs.shortcutsEnabled = toggleShortcuts.checked;
      window.StorageManager.saveSettings(settings);
    };
  }

  function populateColorPickers() {
    const container = document.getElementById('color-pickers-container');
    container.innerHTML = '';
    const colorFields = [
      { key: 'bgPrimary', label: 'Arka Plan Rengi' },
      { key: 'bgSecondary', label: 'İkincil Panel Rengi' },
      { key: 'bgCard', label: 'Kart Rengi' },
      { key: 'timerColor', label: 'Kronometre Rakamları' },
      { key: 'textPrimary', label: 'Ana Metin Rengi' },
      { key: 'textSecondary', label: 'İkincil Metin Rengi' },
      { key: 'accentColor', label: 'Vurgu Rengi' },
      { key: 'btnBg', label: 'Buton Rengi' },
      { key: 'btnText', label: 'Buton Yazı Rengi' },
      { key: 'decoColor1', label: 'Çiçek / Süs Rengi 1' },
      { key: 'decoColor2', label: 'Çiçek / Süs Rengi 2' },
      { key: 'borderColor', label: 'Kenarlık ve Çizgiler' }
    ];

    colorFields.forEach(({ key, label }) => {
      const val = settings.customColors[key] || '#ffffff';
      const item = document.createElement('div');
      item.className = 'color-input-item';
      item.innerHTML = `
        <span class="color-input-label">${label}</span>
        <div class="color-picker-control">
          <span class="color-hex-text">${val}</span>
          <input type="color" value="${val}" data-key="${key}">
        </div>
      `;
      const picker = item.querySelector('input[type="color"]');
      const hex = item.querySelector('.color-hex-text');
      picker.addEventListener('input', (e) => {
        hex.textContent = e.target.value;
        settings.customColors[key] = e.target.value;
        window.StorageManager.saveSettings(settings);
        applyThemeAndStyles();
      });
      container.appendChild(item);
    });
  }

  function populateFontSizeControls() {
    const container = document.getElementById('font-sizes-container');
    container.innerHTML = '';

    const controls = [
      { key: 'timer', label: 'Kronometre Rakamları (Geniş Aralık)', min: 40, max: 200, unit: 'px' },
      { key: 'timerFullscreen', label: 'Tam Ekran Kronometre Rakamları', min: 70, max: 260, unit: 'px' },
      { key: 'clock', label: 'Canlı Saat Boyutu', min: 14, max: 48, unit: 'px' },
      { key: 'date', label: 'Tarih Yazı Boyutu', min: 12, max: 28, unit: 'px' },
      { key: 'title', label: 'Uygulama Başlık Boyutu', min: 18, max: 48, unit: 'px' },
      { key: 'stats', label: 'İstatistik Yazı Boyutu', min: 12, max: 24, unit: 'px' },
      { key: 'buttons', label: 'Buton Yazı Boyutu', min: 12, max: 24, unit: 'px' }
    ];

    controls.forEach(({ key, label, min, max, unit }) => {
      const currentVal = settings.fontSizes[key] || 16;
      const row = document.createElement('div');
      row.className = 'setting-row-control';
      row.innerHTML = `
        <div class="setting-row-header">
          <span class="setting-row-label">${label}</span>
          <span class="setting-row-val" id="size-val-${key}">${currentVal}${unit}</span>
        </div>
        <div class="slider-stepper-wrap">
          <button class="btn-step btn-minus" type="button">-</button>
          <input type="range" class="range-slider" min="${min}" max="${max}" value="${currentVal}">
          <button class="btn-step btn-plus" type="button">+</button>
        </div>
      `;

      const slider = row.querySelector('.range-slider');
      const valLabel = row.querySelector(`#size-val-${key}`);
      const btnMinus = row.querySelector('.btn-minus');
      const btnPlus = row.querySelector('.btn-plus');

      const updateVal = (newVal) => {
        newVal = Math.max(min, Math.min(max, newVal));
        slider.value = newVal;
        valLabel.textContent = `${newVal}${unit}`;
        settings.fontSizes[key] = newVal;
        window.StorageManager.saveSettings(settings);
        applyThemeAndStyles();
      };

      slider.addEventListener('input', () => updateVal(parseInt(slider.value, 10)));
      btnMinus.addEventListener('click', () => updateVal(parseInt(slider.value, 10) - 2));
      btnPlus.addEventListener('click', () => updateVal(parseInt(slider.value, 10) + 2));

      container.appendChild(row);
    });
  }

  // 12. Backup, Import & Reset Defaults
  const btnExportBackup = document.getElementById('btn-export-backup');
  btnExportBackup.addEventListener('click', () => {
    window.StorageManager.exportBackup();
  });

  const btnTriggerImport = document.getElementById('btn-trigger-import');
  const inputImportBackup = document.getElementById('input-import-backup');
  btnTriggerImport.addEventListener('click', () => inputImportBackup.click());

  inputImportBackup.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = window.StorageManager.importBackup(event.target.result);
      if (res.success) {
        alert('Yedek başarıyla yüklendi! Sayfa yenileniyor.');
        window.location.reload();
      } else {
        alert('Yedek yüklenirken bir hata oluştu: ' + res.error);
      }
    };
    reader.readAsText(file);
  });

  const btnResetDefaults = document.getElementById('btn-reset-defaults');
  btnResetDefaults.addEventListener('click', () => {
    if (confirm('Tüm kişiselleştirme ve tema ayarlarını varsayılan haline döndürmek istediğine emin misin?')) {
      settings = window.StorageManager.resetToDefaults();
      applyThemeAndStyles();
      populateSettingsForm();
      alert('Ayarlar varsayılana döndürüldü.');
    }
  });

  // 13. Draggable Layout Arrangement Mode
  dom.btnToggleLayout.addEventListener('click', () => {
    toggleLayoutEditMode();
  });

  dom.btnSaveLayout.addEventListener('click', () => {
    toggleLayoutEditMode(false);
  });

  dom.btnResetLayout.addEventListener('click', () => {
    window.StorageManager.resetLayout();
    document.querySelectorAll('[data-draggable-widget]').forEach(w => {
      w.style.order = '';
    });
    alert('Yerleşim varsayılan düzene döndürüldü.');
  });

  function toggleLayoutEditMode(forceState) {
    isLayoutEditing = (forceState !== undefined) ? forceState : !isLayoutEditing;
    if (isLayoutEditing) {
      document.body.classList.add('layout-editing-mode');
      dom.layoutModeBanner.classList.add('active');
      enableWidgetDragging();
    } else {
      document.body.classList.remove('layout-editing-mode');
      dom.layoutModeBanner.classList.remove('active');
    }
  }

  function enableWidgetDragging() {
    const widgets = document.querySelectorAll('[data-draggable-widget]');
    let dragged = null;

    widgets.forEach(w => {
      w.setAttribute('draggable', 'true');
      w.ondragstart = (e) => {
        dragged = w;
        e.dataTransfer.effectAllowed = 'move';
      };
      w.ondragover = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      };
      w.ondrop = (e) => {
        e.preventDefault();
        if (dragged && dragged !== w) {
          // Swap orders
          const order1 = window.getComputedStyle(dragged).order || '0';
          const order2 = window.getComputedStyle(w).order || '0';
          dragged.style.order = order2 === '0' ? '1' : String(Number(order2) - 1);
          w.style.order = String(Number(dragged.style.order) + 1);

          // Save layout
          const layoutData = {};
          widgets.forEach((el, i) => {
            layoutData[el.getAttribute('data-draggable-widget')] = el.style.order;
          });
          window.StorageManager.saveLayout(layoutData);
        }
      };
    });
  }

  // Restore saved layout if any
  const savedLayout = window.StorageManager.getLayout();
  if (savedLayout) {
    for (const [key, order] of Object.entries(savedLayout)) {
      const el = document.querySelector(`[data-draggable-widget="${key}"]`);
      if (el) el.style.order = order;
    }
  }

  // 14. Keyboard Shortcuts Handler
  document.addEventListener('keydown', (e) => {
    if (!settings.timerPrefs?.shortcutsEnabled) return;

    // Ignore if user is currently typing in an input or textarea
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
      return;
    }

    // Space: Start / Pause
    if (e.code === 'Space') {
      e.preventDefault();
      if (timerEngine.state === 'running') {
        timerEngine.pause();
      } else {
        timerEngine.start();
      }
    }

    // R: Reset (triggers reset button)
    if (e.key.toLowerCase() === 'r') {
      e.preventDefault();
      dom.btnReset.click();
    }

    // F: Fullscreen Toggle
    if (e.key.toLowerCase() === 'f') {
      e.preventDefault();
      toggleFullscreen();
    }

    // T: Open Theme / Settings
    if (e.key.toLowerCase() === 't') {
      e.preventDefault();
      dom.btnOpenSettings.click();
    }

    // S: Open Stats
    if (e.key.toLowerCase() === 's') {
      e.preventDefault();
      dom.btnOpenStats.click();
    }

    // Escape: Close modals
    if (e.key === 'Escape') {
      dom.settingsModal.classList.remove('active');
      dom.statsModal.classList.remove('active');
      dom.resetConfirmModal.classList.remove('active');
      dom.alesCompleteModal.classList.remove('active');
      if (dom.analogClockModal) dom.analogClockModal.classList.remove('active');
      if (isLayoutEditing) toggleLayoutEditMode(false);
    }
  });

});
