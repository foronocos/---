import { clamp, ellipsize, roundRect, wrapText } from '../core/util.js';
import { FONT_UI, FONT_TITLE, UI as THEME } from '../render/palette.js';

const PIPS = {
  1: [[0.5, 0.5]],
  2: [
    [0.28, 0.28],
    [0.72, 0.72],
  ],
  3: [
    [0.26, 0.26],
    [0.5, 0.5],
    [0.74, 0.74],
  ],
  4: [
    [0.28, 0.28],
    [0.72, 0.28],
    [0.28, 0.72],
    [0.72, 0.72],
  ],
  5: [
    [0.28, 0.28],
    [0.72, 0.28],
    [0.5, 0.5],
    [0.28, 0.72],
    [0.72, 0.72],
  ],
  6: [
    [0.28, 0.24],
    [0.72, 0.24],
    [0.28, 0.5],
    [0.72, 0.5],
    [0.28, 0.76],
    [0.72, 0.76],
  ],
};

export class UI {
  constructor(game) {
    this.game = game;
    this.ctx = null;
    this.hoverId = null;
    this.currentHover = null;
    this.modalRect = null;
    this.inputDisabled = false;
  }

  begin(ctx) {
    this.ctx = ctx;
    this.currentHover = null;
    this.modalRect = null;
  }

  end() {
    if (this.currentHover !== this.hoverId) {
      if (this.currentHover) this.game.audio.hover();
      this.hoverId = this.currentHover;
    }
  }

  panel(x, y, w, h, options = {}) {
    const ctx = this.ctx;
    const { title = null, tone = 'dark', alpha = 0.94, border = THEME.panelEdge, radius = 14 } = options;
    ctx.save();
    ctx.globalAlpha = alpha;
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    if (tone === 'paper') {
      grad.addColorStop(0, '#efe4c8');
      grad.addColorStop(1, '#d9c9a5');
    } else if (tone === 'light') {
      grad.addColorStop(0, '#2a3044');
      grad.addColorStop(1, '#1a1e2b');
    } else {
      grad.addColorStop(0, 'rgba(26, 30, 44, 0.97)');
      grad.addColorStop(1, 'rgba(13, 16, 25, 0.97)');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    roundRect(ctx, x, y, w, h, radius);
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.18;
    ctx.strokeStyle = '#f4e9ce';
    ctx.beginPath();
    roundRect(ctx, x + 4, y + 4, w - 8, h - 8, radius - 3);
    ctx.stroke();
    ctx.restore();

    if (title) {
      ctx.save();
      ctx.font = `600 17px ${FONT_UI}`;
      ctx.fillStyle = tone === 'paper' ? '#4a3a22' : THEME.gold;
      ctx.textAlign = 'left';
      ctx.fillText(title.toUpperCase(), x + 22, y + 30);
      ctx.strokeStyle = 'rgba(240, 199, 94, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 22, y + 40);
      ctx.lineTo(x + w - 22, y + 40);
      ctx.stroke();
      ctx.restore();
    }
    this.modalRect = { x, y, w, h };
  }

  bar(x, y, w, h, value, max, options = {}) {
    const ctx = this.ctx;
    const {
      color = THEME.green,
      background = 'rgba(8, 10, 16, 0.75)',
      ghost = null,
      label = null,
      text = null,
      radius = 5,
    } = options;
    const ratio = clamp(value / Math.max(1, max), 0, 1);
    ctx.save();
    ctx.fillStyle = background;
    ctx.beginPath();
    roundRect(ctx, x, y, w, h, radius);
    ctx.fill();
    if (ghost !== null) {
      ctx.fillStyle = 'rgba(226, 100, 94, 0.45)';
      ctx.beginPath();
      roundRect(ctx, x, y, w * clamp(ghost / Math.max(1, max), 0, 1), h, radius);
      ctx.fill();
    }
    if (ratio > 0) {
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'rgba(0,0,0,0.15)');
      ctx.fillStyle = color;
      ctx.beginPath();
      roundRect(ctx, x, y, Math.max(3, w * ratio), h, radius);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath();
      roundRect(ctx, x + 2, y + 2, Math.max(2, w * ratio - 4), h * 0.32, radius);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    roundRect(ctx, x, y, w, h, radius);
    ctx.stroke();
    if (text) {
      ctx.font = `700 ${Math.min(14, h - 2)}px ${FONT_UI}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff7e2';
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 3;
      ctx.strokeText(text, x + w / 2, y + h - 4);
      ctx.fillText(text, x + w / 2, y + h - 4);
    }
    if (label) {
      ctx.font = `600 11px ${FONT_UI}`;
      ctx.fillStyle = THEME.muted;
      ctx.textAlign = 'left';
      ctx.fillText(label, x, y - 4);
    }
    ctx.restore();
  }

  button(options) {
    const ctx = this.ctx;
    const {
      id = options.label,
      x,
      y,
      w,
      h,
      label = '',
      sublabel = null,
      onClick = null,
      hotkey = null,
      variant = 'default',
      disabled = false,
      selected = false,
      icon = null,
      fontSize = 18,
      align = 'center',
    } = options;
    const inactive = this.inputDisabled;
    const hovering = !disabled && !inactive && this.game.input.isHovering(x, y, w, h);
    if (hovering) this.currentHover = id;

    const clicked =
      hovering &&
      this.game.input.peekClick() &&
      this.game.input.peekClick().x >= x &&
      this.game.input.peekClick().x <= x + w &&
      this.game.input.peekClick().y >= y &&
      this.game.input.peekClick().y <= y + h;

    ctx.save();
    const alpha = disabled ? 0.42 : 1;
    ctx.globalAlpha = alpha;
    const r = Math.min(10, h / 2);

    let fill = 'rgba(30, 35, 50, 0.92)';
    let border = 'rgba(240, 199, 94, 0.3)';
    let textColor = THEME.cream;
    if (variant === 'primary') {
      fill = hovering ? '#f7d98d' : '#e8bf62';
      border = '#fff0bd';
      textColor = '#241b0d';
    } else if (variant === 'ghost') {
      fill = hovering ? 'rgba(240, 199, 94, 0.12)' : 'rgba(255, 255, 255, 0.03)';
      border = hovering ? 'rgba(240, 199, 94, 0.55)' : 'rgba(244, 233, 206, 0.18)';
    } else if (variant === 'danger') {
      fill = hovering ? 'rgba(160, 55, 52, 0.6)' : 'rgba(90, 35, 36, 0.55)';
      border = 'rgba(226, 100, 94, 0.55)';
      textColor = '#ffd9d2';
    } else if (variant === 'success') {
      fill = hovering ? 'rgba(80, 140, 96, 0.55)' : 'rgba(45, 85, 60, 0.55)';
      border = 'rgba(121, 201, 138, 0.6)';
      textColor = '#e6ffe9';
    } else if (hovering) {
      fill = 'rgba(47, 54, 74, 0.96)';
      border = 'rgba(240, 199, 94, 0.6)';
    }

    const pressOffset = clicked ? 1.5 : 0;
    ctx.fillStyle = fill;
    ctx.beginPath();
    roundRect(ctx, x, y + pressOffset, w, h, r);
    ctx.fill();
    ctx.strokeStyle = selected ? THEME.gold : border;
    ctx.lineWidth = selected ? 2.5 : 1.4;
    ctx.beginPath();
    roundRect(ctx, x, y + pressOffset, w, h, r);
    ctx.stroke();

    if (hovering && !disabled) {
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#f4e9ce';
      ctx.beginPath();
      roundRect(ctx, x, y, w, h, r);
      ctx.fill();
      ctx.globalAlpha = alpha;
    }

    let textX = x + w / 2;
    if (align === 'left') textX = x + (icon ? 46 : 20);
    if (icon) {
      const iconX = align === 'left' ? x + 22 : x + 24;
      drawIcon(ctx, icon, iconX, y + h / 2 + pressOffset, Math.min(22, h * 0.5), textColor);
    }
    // текст никогда не вылезает за кнопку: обрезаем по доступной ширине
    const hotkeySpace = hotkey ? 30 : 0;
    const rightEdge = x + w - 14 - hotkeySpace;
    const available = Math.max(24, align === 'left' ? rightEdge - textX : w - 24);
    ctx.font = `600 ${fontSize}px ${FONT_UI}`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    const baseY = y + h / 2 + (sublabel ? -7 : 0) + pressOffset;
    ctx.fillText(ellipsize(ctx, label, available), textX, baseY);
    if (sublabel) {
      ctx.font = `400 12px ${FONT_UI}`;
      ctx.fillStyle = variant === 'primary' ? 'rgba(36, 27, 13, 0.7)' : THEME.muted;
      ctx.fillText(ellipsize(ctx, sublabel, available), textX, baseY + 19);
    }
    ctx.textBaseline = 'alphabetic';

    if (hotkey) {
      const keyX = x + w - 18;
      ctx.font = `700 11px ${FONT_UI}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = variant === 'primary' ? 'rgba(36,27,13,0.65)' : 'rgba(244, 233, 206, 0.45)';
      ctx.fillText(hotkey, keyX, baseY + 3);
    }
    ctx.restore();

    if (!disabled && !inactive && hotkey) {
      const keyCode =
        hotkey === 'Esc'
          ? 'Escape'
          : /^[0-9]$/.test(hotkey)
            ? `Digit${hotkey}`
            : hotkey.length === 1
              ? `Key${hotkey.toUpperCase()}`
              : hotkey;
      if (this.game.input.consumePressed(keyCode)) {
        this.game.audio.click();
        if (onClick) onClick();
        return true;
      }
    }

    if (clicked) {
      this.game.input.consumeClick();
      this.game.audio.click();
      if (onClick) onClick();
      return true;
    }
    return false;
  }

  keycap(x, y, label, size = 22) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(244, 233, 206, 0.1)';
    ctx.strokeStyle = 'rgba(244, 233, 206, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    roundRect(ctx, x, y, size, size, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = THEME.cream;
    ctx.font = `700 ${Math.round(size * 0.55)}px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.fillText(label, x + size / 2, y + size * 0.7);
    ctx.restore();
  }

  chip(x, y, text, options = {}) {
    const ctx = this.ctx;
    const {
      color = THEME.gold,
      bg = 'rgba(240, 199, 94, 0.12)',
      icon = null,
      fontSize = 13,
      align = 'left',
      width = null,
    } = options;
    ctx.save();
    ctx.font = `600 ${fontSize}px ${FONT_UI}`;
    const textWidth = ctx.measureText(text).width;
    const w = width || textWidth + (icon ? 34 : 20);
    const h = fontSize + 12;
    const bx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.fillStyle = bg;
    ctx.beginPath();
    roundRect(ctx, bx, y, w, h, h / 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(240, 199, 94, 0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();
    if (icon) drawIcon(ctx, icon, bx + 12, y + h / 2, 13, color);
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + (icon ? 22 : 10), y + h / 2 + 0.5);
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
    return w;
  }

  text(text, x, y, options = {}) {
    const ctx = this.ctx;
    const {
      size = 16,
      color = THEME.cream,
      align = 'left',
      font = FONT_UI,
      weight = '400',
      alpha = 1,
      maxWidth = null,
      lineHeight = size * 1.45,
      shadow = false,
    } = options;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    if (shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 8;
    }
    if (maxWidth) {
      const lines = wrapText(ctx, text, maxWidth);
      lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
      ctx.restore();
      return lines.length;
    }
    ctx.fillText(text, x, y);
    ctx.restore();
    return 1;
  }

  seedChip(x, y, count, options = {}) {
    const ctx = this.ctx;
    const w = options.w || 92;
    const h = options.h || 34;
    const bg = options.bg || 'rgba(20, 24, 34, 0.9)';
    ctx.save();
    ctx.fillStyle = bg;
    ctx.strokeStyle = 'rgba(240, 199, 94, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    roundRect(ctx, x, y, w, h, h / 2);
    ctx.fill();
    ctx.stroke();
    drawIcon(ctx, 'seed', x + 18, y + h / 2, 14, THEME.gold);
    ctx.fillStyle = THEME.gold;
    ctx.font = `700 15px ${FONT_UI}`;
    ctx.textAlign = 'left';
    ctx.fillText(String(count), x + 34, y + h / 2 + 5);
    ctx.fillStyle = THEME.muted;
    ctx.font = `400 10px ${FONT_UI}`;
    ctx.fillText('СЕМЯН', x + 56, y + h / 2 + 3);
    ctx.restore();
  }

  title(text, x, y, options = {}) {
    const ctx = this.ctx;
    const { size = 52, color = THEME.cream, align = 'center', shadow = true } = options;
    ctx.save();
    ctx.font = `700 ${size}px ${FONT_TITLE}`;
    ctx.textAlign = align;
    if (shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.75)';
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = 4;
    }
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }
}

export function drawIcon(ctx, name, x, y, size, color = '#f0c75e') {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.4, size * 0.08);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size / 2;
  switch (name) {
    case 'seed': {
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.55, s * 0.9, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(20, 14, 4, 0.45)';
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.6);
      ctx.lineTo(0, s * 0.6);
      ctx.stroke();
      break;
    }
    case 'feather': {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.9, -s * 0.3, s * 0.5, s * 0.5, 0, s);
      ctx.bezierCurveTo(-s * 0.5, s * 0.5, -s * 0.9, -s * 0.3, 0, -s);
      ctx.fill();
      break;
    }
    case 'close': {
      ctx.beginPath();
      ctx.moveTo(-s * 0.6, -s * 0.6);
      ctx.lineTo(s * 0.6, s * 0.6);
      ctx.moveTo(s * 0.6, -s * 0.6);
      ctx.lineTo(-s * 0.6, s * 0.6);
      ctx.stroke();
      break;
    }
    case 'heart': {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.7);
      ctx.bezierCurveTo(-s * 1.2, -s * 0.2, -s * 0.5, -s, 0, -s * 0.4);
      ctx.bezierCurveTo(s * 0.5, -s, s * 1.2, -s * 0.2, 0, s * 0.7);
      ctx.fill();
      break;
    }
    case 'book': {
      ctx.strokeRect(-s * 0.8, -s, s * 1.6, s * 2);
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(0, s);
      ctx.stroke();
      break;
    }
    case 'note': {
      ctx.fillRect(-s * 0.7, -s, s * 1.4, s * 2);
      ctx.strokeStyle = 'rgba(20,14,4,0.5)';
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-s * 0.45, -s * 0.4 + i * s * 0.5);
        ctx.lineTo(s * 0.45, -s * 0.4 + i * s * 0.5);
        ctx.stroke();
      }
      break;
    }
    case 'paw': {
      ctx.beginPath();
      ctx.ellipse(0, s * 0.3, s * 0.6, s * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc((i - 1) * s * 0.55, -s * 0.4, s * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'sound': {
      ctx.beginPath();
      ctx.moveTo(-s * 0.8, -s * 0.3);
      ctx.lineTo(-s * 0.3, -s * 0.3);
      ctx.lineTo(s * 0.3, -s * 0.8);
      ctx.lineTo(s * 0.3, s * 0.8);
      ctx.lineTo(-s * 0.3, s * 0.3);
      ctx.lineTo(-s * 0.8, s * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s * 0.3, 0, s * 0.6, -0.8, 0.8);
      ctx.stroke();
      break;
    }
    case 'mute': {
      ctx.beginPath();
      ctx.moveTo(-s * 0.8, -s * 0.3);
      ctx.lineTo(-s * 0.3, -s * 0.3);
      ctx.lineTo(s * 0.2, -s * 0.8);
      ctx.lineTo(s * 0.2, s * 0.8);
      ctx.lineTo(-s * 0.3, s * 0.3);
      ctx.lineTo(-s * 0.8, s * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.45, -s * 0.35);
      ctx.lineTo(s * 0.9, s * 0.35);
      ctx.moveTo(s * 0.9, -s * 0.35);
      ctx.lineTo(s * 0.45, s * 0.35);
      ctx.stroke();
      break;
    }
    case 'star': {
      ctx.beginPath();
      for (let i = 0; i < 10; i += 1) {
        const radius = i % 2 === 0 ? s : s * 0.45;
        const angle = -Math.PI / 2 + (i * Math.PI) / 5;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'gear': {
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 6; i += 1) {
        const angle = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * s * 0.6, Math.sin(angle) * s * 0.6);
        ctx.lineTo(Math.cos(angle) * s, Math.sin(angle) * s);
        ctx.stroke();
      }
      break;
    }
    case 'arrowLeft': {
      ctx.beginPath();
      ctx.moveTo(s * 0.5, -s * 0.7);
      ctx.lineTo(-s * 0.4, 0);
      ctx.lineTo(s * 0.5, s * 0.7);
      ctx.stroke();
      break;
    }
    case 'arrowRight': {
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, -s * 0.7);
      ctx.lineTo(s * 0.4, 0);
      ctx.lineTo(-s * 0.5, s * 0.7);
      ctx.stroke();
      break;
    }
    case 'eye': {
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.95, s * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'lock': {
      ctx.strokeRect(-s * 0.55, -s * 0.1, s * 1.1, s * 0.9);
      ctx.beginPath();
      ctx.arc(0, -s * 0.1, s * 0.4, Math.PI, 0);
      ctx.stroke();
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

export function drawDice(ctx, x, y, size, value, options = {}) {
  const { rolling = false, time = 0, highlight = false } = options;
  ctx.save();
  const wobble = rolling ? Math.sin(time * 30) * 0.12 : 0;
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate(wobble);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  roundRect(ctx, -size / 2 + 3, -size / 2 + 4, size, size, size * 0.16);
  ctx.fill();
  const grad = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
  grad.addColorStop(0, highlight ? '#fff4cf' : '#f4e9ce');
  grad.addColorStop(1, highlight ? '#f0c75e' : '#d8c9a5');
  ctx.fillStyle = grad;
  ctx.strokeStyle = highlight ? '#f0c75e' : '#8a6a3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  roundRect(ctx, -size / 2, -size / 2, size, size, size * 0.16);
  ctx.fill();
  ctx.stroke();
  const pipColor = '#2a1f12';
  ctx.fillStyle = pipColor;
  const pips = PIPS[value] || PIPS[6];
  const pipRadius = size * 0.075;
  for (const [px, py] of pips) {
    ctx.beginPath();
    ctx.arc(-size / 2 + px * size, -size / 2 + py * size, pipRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawPanelIconButton(ui, x, y, size, icon, onClick, options = {}) {
  return ui.button({
    id: options.id || icon,
    x,
    y,
    w: size,
    h: size,
    label: '',
    icon,
    onClick,
    variant: 'ghost',
    hotkey: options.hotkey || null,
    disabled: options.disabled,
    selected: options.selected,
  });
}
