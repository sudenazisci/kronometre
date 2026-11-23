// Study Bloom - Statistics, Weekly Charts & History Management

class StatsManager {
  static formatDuration(totalSeconds, format = 'long') {
    const sec = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    if (format === 'short') {
      if (h > 0) return `${h} sa ${m} dk`;
      if (m > 0) return `${m} dk ${s} sn`;
      return `${s} sn`;
    }

    if (format === 'clock') {
      const pad = (n) => String(n).padStart(2, '0');
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    // Long format: "2 saat 15 dakika"
    const parts = [];
    if (h > 0) parts.push(`${h} saat`);
    if (m > 0) parts.push(`${m} dakika`);
    if (s > 0 && h === 0) parts.push(`${s} saniye`);
    if (parts.length === 0) return '0 saniye';
    return parts.join(' ');
  }

  static getStats() {
    const history = window.StorageManager.getHistory();
    const todayStr = new Date().toLocaleDateString('tr-TR');

    let todaySeconds = 0;
    let todaySessionsCount = 0;
    let lastSessionDuration = 0;

    let overallSeconds = 0;
    const uniqueDays = new Set();

    history.forEach((session, index) => {
      const dur = session.durationSeconds || 0;
      overallSeconds += dur;

      if (session.dateStr) {
        uniqueDays.add(session.dateStr);
      }

      if (session.dateStr === todayStr) {
        todaySeconds += dur;
        todaySessionsCount++;
        if (todaySessionsCount === 1) {
          lastSessionDuration = dur;
        }
      }
    });

    if (lastSessionDuration === 0 && history.length > 0) {
      lastSessionDuration = history[0].durationSeconds || 0;
    }

    // Calculate weekly data (last 7 days including today)
    const weeklyDays = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString('tr-TR');
      const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' });

      // sum duration for this day
      let daySeconds = 0;
      let dayCount = 0;
      history.forEach(s => {
        if (s.dateStr === dateStr) {
          daySeconds += (s.durationSeconds || 0);
          dayCount++;
        }
      });

      weeklyDays.push({
        dateStr,
        dayName,
        seconds: daySeconds,
        sessionCount: dayCount,
        isToday: dateStr === todayStr
      });
    }

    let weeklyTotalSeconds = 0;
    let maxDaySeconds = 0;
    let longestDayName = '-';

    weeklyDays.forEach(day => {
      weeklyTotalSeconds += day.seconds;
      if (day.seconds > maxDaySeconds) {
        maxDaySeconds = day.seconds;
        longestDayName = `${day.dayName} (${this.formatDuration(day.seconds, 'short')})`;
      }
    });

    return {
      today: {
        totalSeconds: todaySeconds,
        formatted: this.formatDuration(todaySeconds, 'short'),
        clockFormatted: this.formatDuration(todaySeconds, 'clock'),
        sessionCount: todaySessionsCount,
        lastSessionFormatted: this.formatDuration(lastSessionDuration, 'short')
      },
      overall: {
        totalSeconds: overallSeconds,
        formatted: this.formatDuration(overallSeconds, 'short'),
        clockFormatted: this.formatDuration(overallSeconds, 'clock'),
        totalSessions: history.length,
        totalDays: uniqueDays.size
      },
      weekly: {
        days: weeklyDays,
        totalSeconds: weeklyTotalSeconds,
        formatted: this.formatDuration(weeklyTotalSeconds, 'short'),
        maxDaySeconds,
        longestDay: longestDayName
      }
    };
  }

  static renderWeeklyBarChart(containerId, weeklyData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const maxSec = Math.max(weeklyData.maxDaySeconds, 3600); // at least 1 hour baseline

    let barsHtml = `
      <div class="weekly-chart-wrapper">
        <div class="chart-bars-container">
    `;

    weeklyData.days.forEach(day => {
      const heightPercent = Math.max(8, Math.round((day.seconds / maxSec) * 100));
      const durLabel = day.seconds > 0 ? this.formatDuration(day.seconds, 'short') : '0 dk';

      barsHtml += `
        <div class="chart-bar-col ${day.isToday ? 'today-col' : ''}">
          <div class="bar-value-tooltip">${durLabel}</div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="height: ${heightPercent}%;"></div>
          </div>
          <span class="bar-label-day">${day.dayName}</span>
          ${day.isToday ? '<span class="today-indicator-dot"></span>' : ''}
        </div>
      `;
    });

    barsHtml += `
        </div>
      </div>
    `;

    container.innerHTML = barsHtml;
  }

  static renderHistoryList(containerId, filter = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;

    let history = window.StorageManager.getHistory();
    if (filter === 'normal') history = history.filter(s => s.mode === 'normal');
    if (filter === 'ales') history = history.filter(s => s.mode === 'ales');

    if (history.length === 0) {
      container.innerHTML = `
        <div class="empty-history-state">
          <div class="empty-icon">🌸</div>
          <p class="empty-title">Henüz kayıtlı bir çalışma oturumu yok</p>
          <p class="empty-desc">Kronometreyi çalıştırıp sıfırladığında veya ALES oturumunu tamamladığında çalışmaların burada listelenecek.</p>
        </div>
      `;
      return;
    }

    // Group by date
    const groups = {};
    history.forEach(item => {
      const d = item.dateStr || 'Bilinmeyen Tarih';
      if (!groups[d]) groups[d] = [];
      groups[d].push(item);
    });

    let html = '<div class="history-groups">';
    for (const [date, items] of Object.entries(groups)) {
      const dayTotalSec = items.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
      html += `
        <div class="history-day-group">
          <div class="history-day-header">
            <span class="history-day-date">📅 ${date}</span>
            <span class="history-day-total">Toplam: <strong>${this.formatDuration(dayTotalSec, 'short')}</strong> (${items.length} oturum)</span>
          </div>
          <div class="history-session-list">
      `;

      items.forEach(session => {
        const isExam = session.mode === 'ales' || session.mode === 'exam';
        const examTitle = session.examName || 'Sınav Denemesi';
        const modeBadge = isExam 
          ? `<span class="session-badge ales-badge">🎯 ${examTitle} (${session.completed ? 'Tamamlandı' : 'Erken Bitti'})</span>`
          : `<span class="session-badge normal-badge">⏱️ Normal Çalışma</span>`;

        html += `
          <div class="history-session-card" data-id="${session.id}">
            <div class="session-header-row">
              <div class="session-mode-time">
                ${modeBadge}
                <span class="session-time-range">${session.startTime || ''} - ${session.endTime || ''}</span>
              </div>
              <div class="session-duration-action">
                <span class="session-duration-tag">${this.formatDuration(session.durationSeconds, 'short')}</span>
                <button class="btn-icon-danger btn-delete-session" title="Oturumu Sil" data-id="${session.id}">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div class="session-note-row">
              <input type="text" class="session-note-input" placeholder="Oturum notu ekle (ör. Matematik Sayılar testi)..." value="${session.note || ''}" data-id="${session.id}">
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    }
    html += '</div>';

    container.innerHTML = html;

    // Attach listeners for note editing
    container.querySelectorAll('.session-note-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        window.StorageManager.updateSessionNote(id, e.target.value.trim());
      });
    });

    // Attach listeners for deleting
    container.querySelectorAll('.btn-delete-session').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        if (confirm('Bu çalışma oturumunu silmek istediğine emin misin?')) {
          window.StorageManager.deleteSession(id);
          this.renderHistoryList(containerId, filter);
          // Trigger custom event so main stats update
          window.dispatchEvent(new CustomEvent('study_history_changed'));
        }
      });
    });
  }
}

window.StatsManager = StatsManager;
