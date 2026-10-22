export const LOGICAL_W = 1280;
export const LOGICAL_H = 720;

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const lerp = (a, b, t) => a + (b - a) * t;

export const approach = (current, target, rate) => {
  if (current < target) return Math.min(target, current + rate);
  if (current > target) return Math.max(target, current - rate);
  return target;
};

export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
export const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const rand = (min = 0, max = 1) => min + Math.random() * (max - min);
export const randInt = (min, max) => Math.floor(rand(min, max + 1));
export const pick = (list) => list[Math.floor(Math.random() * list.length)];
export const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/** Детерминированный генератор для боя и повторяемых проверок. */
export class RNG {
  constructor(seed = Date.now()) {
    this.seed = seed >>> 0;
  }

  next() {
    this.seed = (this.seed + 0x6d2b79f5) >>> 0;
    let t = this.seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(maxExclusive) {
    return Math.floor(this.next() * maxExclusive);
  }

  d6() {
    return 1 + this.int(6);
  }

  getState() {
    return this.seed;
  }

  setState(seed) {
    this.seed = seed >>> 0;
  }
}

export function wrapText(ctx, text, maxWidth) {
  const paragraphs = String(text).split('\n');
  const lines = [];
  for (const paragraph of paragraphs) {
    if (paragraph === '') {
      lines.push('');
      continue;
    }
    const words = paragraph.split(/\s+/);
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

/** Обрезает строку по ширине, добавляя многоточие. */
export function ellipsize(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let low = 0;
  let high = text.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (ctx.measureText(`${text.slice(0, mid)}…`).width <= maxWidth) low = mid;
    else high = mid - 1;
  }
  return `${text.slice(0, Math.max(1, low)).trimEnd()}…`;
}

/** Подбирает размер шрифта так, чтобы строка влезла в maxWidth. */
export function fitFontSize(ctx, text, maxWidth, size, minSize = 10, fontTemplate = (value) => `${value}px sans-serif`) {
  let current = size;
  while (current > minSize) {
    ctx.font = fontTemplate(current);
    if (ctx.measureText(text).width <= maxWidth) return current;
    current -= 0.5;
  }
  return minSize;
}

export function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/** Осветляет (amount > 0) или затемняет (amount < 0) hex-цвет на долю amount. */
export function shade(hex, amount) {
  const clean = hex.replace('#', '');
  const value = clean.length === 3
    ? clean.split('').map((ch) => ch + ch).join('')
    : clean;
  const num = parseInt(value, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const mix = (channel) =>
    Math.max(0, Math.min(255, Math.round(amount >= 0 ? channel + (255 - channel) * amount : channel * (1 + amount))));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function formatNumber(value) {
  return String(Math.max(0, Math.round(value)));
}

export function pluralize(value, one, few, many) {
  const n = Math.abs(value) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return many;
  if (n1 > 1 && n1 < 5) return few;
  if (n1 === 1) return one;
  return many;
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** Плавное появление текста по символам. */
export function typedText(text, progress) {
  const count = Math.floor(text.length * progress);
  return text.slice(0, count);
}

export function shuffleBag(list, rng) {
  const bag = [...list];
  return () => {
    if (bag.length === 0) bag.push(...list);
    const index = rng ? rng.int(bag.length) : Math.floor(Math.random() * bag.length);
    return bag.splice(index, 1)[0];
  };
}
