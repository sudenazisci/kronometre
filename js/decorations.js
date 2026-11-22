// Study Bloom - Elegant Botanical Vectors & Static Corner Elements

const DECORATION_SVGS = {
  cherryBlossom: `
    <svg viewBox="0 0 100 100" class="deco-svg cherry-blossom">
      <path d="M50 20 C42 5 28 8 32 24 C36 32 46 36 50 48 C54 36 64 32 68 24 C72 8 58 5 50 20 Z" fill="var(--deco-color-1, #f8b9c8)" opacity="0.85"/>
      <path d="M78 48 C93 42 92 28 76 32 C68 36 64 46 52 50 C64 54 68 64 76 68 C92 72 93 58 78 48 Z" fill="var(--deco-color-2, #eb93a8)" opacity="0.8"/>
      <path d="M50 80 C58 95 72 92 68 76 C64 68 54 64 50 52 C46 64 36 68 32 76 C28 92 42 95 50 80 Z" fill="var(--deco-color-1, #f8b9c8)" opacity="0.85"/>
      <path d="M22 52 C7 58 8 72 24 68 C32 64 36 54 48 50 C36 46 32 36 24 32 C8 28 7 42 22 52 Z" fill="var(--deco-color-2, #eb93a8)" opacity="0.8"/>
      <circle cx="50" cy="50" r="8" fill="#fff5ea" />
      <circle cx="50" cy="50" r="4" fill="var(--accent-color, #e06f8b)" />
    </svg>`,

  daisy: `
    <svg viewBox="0 0 100 100" class="deco-svg daisy">
      <g fill="#ffffff" stroke="var(--border-color, #e8e2cd)" stroke-width="1.2">
        <ellipse cx="50" cy="18" rx="8" ry="16" />
        <ellipse cx="50" cy="82" rx="8" ry="16" />
        <ellipse cx="18" cy="50" rx="16" ry="8" />
        <ellipse cx="82" cy="50" rx="16" ry="8" />
        <ellipse cx="27" cy="27" rx="8" ry="16" transform="rotate(-45 27 27)" />
        <ellipse cx="73" cy="27" rx="8" ry="16" transform="rotate(45 73 27)" />
        <ellipse cx="27" cy="73" rx="8" ry="16" transform="rotate(45 27 73)" />
        <ellipse cx="73" cy="73" rx="8" ry="16" transform="rotate(-45 73 73)" />
      </g>
      <circle cx="50" cy="50" r="13" fill="var(--deco-color-1, #f5d365)" />
      <circle cx="50" cy="50" r="9" fill="var(--accent-color, #e5a924)" />
    </svg>`,

  butterfly: `
    <svg viewBox="0 0 100 90" class="deco-svg butterfly">
      <g class="wings">
        <path d="M48 45 C35 15 10 10 5 30 C0 50 25 65 47 48 Z" fill="var(--deco-color-1, #a5b4fc)" opacity="0.85"/>
        <path d="M47 50 C32 55 15 65 20 78 C25 88 40 80 48 56 Z" fill="var(--deco-color-2, #c4b5fd)" opacity="0.8"/>
        <path d="M52 45 C65 15 90 10 95 30 C100 50 75 65 53 48 Z" fill="var(--deco-color-1, #a5b4fc)" opacity="0.85"/>
        <path d="M53 50 C68 55 85 65 80 78 C75 88 60 80 52 56 Z" fill="var(--deco-color-2, #c4b5fd)" opacity="0.8"/>
      </g>
      <ellipse cx="50" cy="52" rx="2.5" ry="16" fill="var(--text-primary, #333b5a)" opacity="0.75"/>
      <path d="M49 36 Q42 24 37 26" stroke="var(--text-primary, #333b5a)" stroke-width="1.2" fill="none"/>
      <path d="M51 36 Q58 24 63 26" stroke="var(--text-primary, #333b5a)" stroke-width="1.2" fill="none"/>
    </svg>`,

  leafBranch: `
    <svg viewBox="0 0 100 120" class="deco-svg leaf-branch">
      <path d="M15 110 Q45 65 85 15" stroke="var(--deco-color-2, #8fae7a)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M38 78 C28 65 28 50 46 62 C46 75 40 78 38 78 Z" fill="var(--deco-color-1, #8ebf9f)" opacity="0.85"/>
      <path d="M40 78 C53 65 63 65 50 75 C43 78 40 78 40 78 Z" fill="var(--deco-color-2, #8fae7a)" opacity="0.85"/>
      <path d="M58 48 C48 35 48 20 66 32 C66 45 60 48 58 48 Z" fill="var(--deco-color-1, #8ebf9f)" opacity="0.85"/>
      <path d="M60 48 C73 35 83 35 70 45 C63 48 60 48 60 48 Z" fill="var(--deco-color-2, #8fae7a)" opacity="0.85"/>
      <path d="M85 15 C77 5 67 8 77 20 C83 20 85 15 85 15 Z" fill="var(--deco-color-1, #8ebf9f)" opacity="0.9"/>
    </svg>`,

  strawberry: `
    <svg viewBox="0 0 80 90" class="deco-svg strawberry">
      <path d="M40 85 C15 70 8 38 25 22 C32 15 48 15 55 22 C72 38 65 70 40 85 Z" fill="var(--deco-color-1, #ff7675)"/>
      <g fill="#fef08a" opacity="0.8">
        <circle cx="30" cy="35" r="1.5"/><circle cx="50" cy="35" r="1.5"/><circle cx="40" cy="45" r="1.5"/>
        <circle cx="26" cy="52" r="1.5"/><circle cx="54" cy="52" r="1.5"/><circle cx="40" cy="62" r="1.5"/>
      </g>
      <path d="M40 20 C32 5 22 15 28 22 C34 22 38 20 40 20 C42 20 46 22 52 22 C58 15 48 5 40 20 Z" fill="var(--deco-color-2, #55efc4)"/>
    </svg>`,

  tulip: `
    <svg viewBox="0 0 80 100" class="deco-svg tulip">
      <path d="M40 95 L40 45" stroke="var(--deco-color-2, #8fae7a)" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M40 70 Q60 55 58 40 Q45 55 40 70 Z" fill="var(--deco-color-2, #8fae7a)" opacity="0.8"/>
      <path d="M40 15 C20 20 18 45 40 48 C62 45 60 20 40 15 Z" fill="var(--deco-color-1, #d8b4fe)"/>
    </svg>`,

  clouds: `
    <svg viewBox="0 0 120 70" class="deco-svg cloud">
      <path d="M25 55 C12 55 5 45 10 32 C14 20 28 20 34 24 C40 10 65 8 75 20 C85 14 102 20 105 32 C115 36 115 52 100 55 Z" fill="var(--deco-color-1, #bae6fd)" opacity="0.5"/>
    </svg>`,

  star: `
    <svg viewBox="0 0 50 50" class="deco-svg star">
      <path d="M25 2 L31 17 L47 19 L35 30 L39 46 L25 37 L11 46 L15 30 L3 19 L19 17 Z" fill="var(--deco-color-1, #fbbf24)" opacity="0.75"/>
    </svg>`,

  crescentMoon: `
    <svg viewBox="0 0 60 60" class="deco-svg moon">
      <path d="M30 5 C45 5 55 18 55 32 C55 46 44 57 30 57 C22 57 15 54 10 48 C22 46 32 35 32 22 C32 14 28 8 22 5 C25 5 27 5 30 5 Z" fill="var(--deco-color-1, #fbbf24)" opacity="0.8"/>
    </svg>`,

  book: `
    <svg viewBox="0 0 80 60" class="deco-svg book">
      <path d="M40 48 C30 44 15 45 5 50 L5 18 C15 14 30 14 40 18 C50 14 65 14 75 18 L75 50 C65 45 50 44 40 48 Z" fill="var(--bg-card, #fcfaf7)" stroke="var(--deco-color-2, #8b5a2b)" stroke-width="1.8"/>
      <path d="M40 18 L40 48" stroke="var(--deco-color-2, #8b5a2b)" stroke-width="1.8"/>
    </svg>`
};

class DecorationsEngine {
  constructor(containerId = 'decorations-container') {
    this.container = document.getElementById(containerId);
    this.settings = null;
  }

  init(settings) {
    this.settings = settings;
    this.render();
  }

  update(settings) {
    this.settings = settings;
    this.render();
  }

  render() {
    if (!this.container) {
      this.container = document.getElementById('decorations-container');
      if (!this.container) return;
    }

    const deco = this.settings?.decorations || {};
    if (!deco.enabled) {
      this.container.innerHTML = '';
      return;
    }

    const themeId = this.settings?.currentTheme || 'cherry-blossom';
    const theme = window.THEMES[themeId] || window.THEMES['cherry-blossom'];
    const decoType = deco.type === 'theme-default' || !deco.type ? (theme.decoType || 'cherry') : deco.type;

    if (decoType === 'none') {
      this.container.innerHTML = '';
      return;
    }

    const scale = deco.sizeScale || 1.0;
    document.documentElement.style.setProperty('--deco-scale-mult', `${scale}`);

    let html = '';
    // Pure, static, chic corner flourishes
    html += this.getCornerDecorations(decoType);
    this.container.innerHTML = html;
  }

  getCornerDecorations(type) {
    let leftCorner = '';
    let rightCorner = '';

    switch (type) {
      case 'cherry':
        leftCorner = `
          <div class="corner-branch top-left">
            ${DECORATION_SVGS.leafBranch}
            <div class="blossom-cluster">${DECORATION_SVGS.cherryBlossom}</div>
          </div>`;
        rightCorner = `
          <div class="corner-branch top-right">
            ${DECORATION_SVGS.leafBranch}
            <div class="blossom-cluster">${DECORATION_SVGS.cherryBlossom}</div>
          </div>`;
        break;

      case 'daisy':
        leftCorner = `
          <div class="corner-branch top-left">
            <div class="blossom-cluster">${DECORATION_SVGS.daisy}</div>
          </div>`;
        rightCorner = `
          <div class="corner-branch top-right">
            <div class="blossom-cluster">${DECORATION_SVGS.daisy}</div>
          </div>`;
        break;

      case 'butterfly':
        leftCorner = `
          <div class="corner-branch top-left">
            ${DECORATION_SVGS.butterfly}
          </div>`;
        rightCorner = `
          <div class="corner-branch top-right">
            ${DECORATION_SVGS.butterfly}
          </div>`;
        break;

      case 'strawberry':
        leftCorner = `
          <div class="corner-branch top-left">
            <div class="blossom-cluster">${DECORATION_SVGS.strawberry}</div>
          </div>`;
        rightCorner = `
          <div class="corner-branch top-right">
            <div class="blossom-cluster">${DECORATION_SVGS.strawberry}</div>
          </div>`;
        break;

      case 'tulip':
        leftCorner = `
          <div class="corner-branch bottom-left">
            <div class="blossom-cluster">${DECORATION_SVGS.tulip}</div>
          </div>`;
        rightCorner = `
          <div class="corner-branch bottom-right">
            <div class="blossom-cluster">${DECORATION_SVGS.tulip}</div>
          </div>`;
        break;

      case 'botanical':
        leftCorner = `
          <div class="corner-branch top-left">
            ${DECORATION_SVGS.leafBranch}
          </div>`;
        rightCorner = `
          <div class="corner-branch top-right">
            ${DECORATION_SVGS.leafBranch}
          </div>`;
        break;

      case 'stars':
        leftCorner = `
          <div class="corner-branch top-left">
            ${DECORATION_SVGS.crescentMoon}
          </div>`;
        rightCorner = `
          <div class="corner-branch top-right">
            ${DECORATION_SVGS.star}
          </div>`;
        break;

      case 'clouds':
        leftCorner = `
          <div class="corner-branch top-left">
            ${DECORATION_SVGS.clouds}
          </div>`;
        rightCorner = `
          <div class="corner-branch top-right">
            ${DECORATION_SVGS.clouds}
          </div>`;
        break;

      case 'books':
        leftCorner = `
          <div class="corner-branch bottom-left">
            <div class="blossom-cluster">${DECORATION_SVGS.book}</div>
          </div>`;
        rightCorner = `
          <div class="corner-branch top-right">
            <div class="blossom-cluster">${DECORATION_SVGS.book}</div>
          </div>`;
        break;
    }

    return leftCorner + rightCorner;
  }
}

window.DecorationsEngine = DecorationsEngine;
window.DECORATION_SVGS = DECORATION_SVGS;
