/**
 * Кинематографичная постобработка: мягкий контраст, зерно, виньетка,
 * цветовая коррекция под главу и легкое «дыхание» камеры.
 * Всё — дешёвые операции (градиенты + редкие точки), чтобы телефон не грелся.
 */

import { clamp } from '../core/util.js';

const GRADE = {
  1: { tint: 'rgba(58, 34, 44, 0.16)', lift: 'rgba(240, 199, 94, 0.03)' },
  2: { tint: 'rgba(32, 44, 34, 0.18)', lift: 'rgba(201, 217, 138, 0.03)' },
  3: { tint: 'rgba(34, 46, 56, 0.15)', lift: 'rgba(232, 194, 122, 0.04)' },
  4: { tint: 'rgba(24, 30, 52, 0.2)', lift: 'rgba(240, 199, 94, 0.04)' },
  5: { tint: 'rgba(40, 48, 44, 0.16)', lift: 'rgba(216, 201, 160, 0.04)' },
  6: { tint: 'rgba(14, 30, 30, 0.22)', lift: 'rgba(143, 199, 176, 0.04)' },
  7: { tint: 'rgba(52, 36, 20, 0.18)', lift: 'rgba(224, 176, 112, 0.05)' },
  8: { tint: 'rgba(46, 30, 56, 0.18)', lift: 'rgba(240, 176, 122, 0.05)' },
  9: { tint: 'rgba(8, 8, 20, 0.34)', lift: 'rgba(154, 139, 240, 0.04)' },
  10: { tint: 'rgba(56, 30, 34, 0.12)', lift: 'rgba(255, 214, 138, 0.07)' },
};

function pseudoRandom(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{width:number,height:number,chapter:number,time:number,intensity?:number}} options
 */
export function applyPostFX(ctx, options) {
  const { width = 1280, height = 720, chapter = 1, time = 0, intensity = 1 } = options;
  const grade = GRADE[chapter] || GRADE[1];
  ctx.save();

  // 1. цветовой фильтр главы
  ctx.globalAlpha = intensity;
  ctx.fillStyle = grade.tint;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = grade.lift;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';

  // 2. виньетка с плавным затемнением по краям
  const vig = ctx.createRadialGradient(
    width * 0.5,
    height * 0.46,
    height * 0.28,
    width * 0.5,
    height * 0.5,
    height * 0.95,
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(0.65, 'rgba(0,0,0,0.12)');
  vig.addColorStop(1, 'rgba(0,0,0,0.52)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);

  // 3. зерно плёнки — редкие точки, меняющиеся во времени
  const grains = 120;
  ctx.globalAlpha = 0.05 * intensity;
  for (let i = 0; i < grains; i += 1) {
    const seed = i + Math.floor(time * 14) * 0.37;
    const x = pseudoRandom(seed) * width;
    const y = pseudoRandom(seed + 3.7) * height;
    ctx.fillStyle = pseudoRandom(seed + 1.1) > 0.5 ? '#fff' : '#000';
    ctx.fillRect(x, y, 1.4, 1.4);
  }
  ctx.globalAlpha = 1;

  // 4. лёгкая горизонтальная «растяжка» света сверху
  const haze = ctx.createLinearGradient(0, 0, 0, height * 0.45);
  haze.addColorStop(0, 'rgba(255, 245, 220, 0.05)');
  haze.addColorStop(1, 'rgba(255, 245, 220, 0)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, width, height * 0.45);

  ctx.restore();
}

/** Мягкий «дыхательный» зум камеры — эффект живой съёмки. */
export function cameraBreath(time, amount = 0.004) {
  return {
    zoom: 1 + Math.sin(time * 0.6) * amount,
    offsetX: Math.sin(time * 0.43) * 3,
    offsetY: Math.cos(time * 0.37) * 2,
  };
}

export function applyCameraBreath(ctx, { zoom, offsetX, offsetY }, width = 1280, height = 720) {
  ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
  ctx.scale(zoom, zoom);
  ctx.translate(-width / 2, -height / 2);
}

/**
 * Волшебная пыль в воздухе: медленно всплывающие точки, ловящие свет.
 * Используется во всех комнатах как «глубина» сцены.
 */
export class Atmosphere {
  constructor(width, floorY, options = {}) {
    this.width = width;
    this.floorY = floorY;
    this.kind = options.kind || 'dust';
    this.count = options.count || 46;
    this.seed = options.seed || 1;
    this.items = [];
    for (let i = 0; i < this.count; i += 1) this.items.push(this.spawn(i, true));
  }

  spawn(i, spread = false) {
    const r = (n) => pseudoRandom(i * 7.3 + n * 3.1 + this.seed);
    const kinds = {
      dust: { size: [1, 3], speed: [4, 14], color: 'rgba(240, 230, 200, 0.5)' },
      drip: { size: [2, 4], speed: [18, 46], color: 'rgba(170, 210, 220, 0.55)' },
      steam: { size: [16, 40], speed: [10, 26], color: 'rgba(220, 220, 225, 0.12)' },
      moth: { size: [3, 6], speed: [14, 30], color: 'rgba(232, 214, 170, 0.6)' },
      wind: { size: [1, 3], speed: [40, 90], color: 'rgba(230, 240, 255, 0.35)' },
      star: { size: [1, 2.4], speed: [0, 0], color: 'rgba(220, 225, 255, 0.7)' },
      feather: { size: [4, 8], speed: [8, 20], color: 'rgba(240, 200, 120, 0.55)' },
    };
    const conf = kinds[this.kind] || kinds.dust;
    return {
      x: r(1) * this.width,
      y: spread ? r(2) * (this.floorY - 40) : -10,
      size: conf.size[0] + r(3) * (conf.size[1] - conf.size[0]),
      vy: -(conf.speed[0] + r(4) * (conf.speed[1] - conf.speed[0])) * (this.kind === 'drip' ? -1 : 1),
      vx: (r(5) - 0.5) * 12,
      phase: r(6) * Math.PI * 2,
      color: conf.color,
      kind: this.kind,
    };
  }

  update(dt, time) {
    this.time = time;
    for (let i = 0; i < this.items.length; i += 1) {
      const p = this.items[i];
      p.y += p.vy * dt;
      p.x += (p.vx + Math.sin(time * 0.7 + p.phase) * 6) * dt;
      const bottom = p.kind === 'drip' ? this.floorY + 40 : this.floorY - 60;
      const top = p.kind === 'drip' ? -20 : -40;
      if (p.kind === 'drip') {
        if (p.y > bottom) this.items[i] = this.spawn(i + Math.floor(time));
      } else if (p.y < top) {
        this.items[i] = this.spawn(i + Math.floor(time));
      }
      if (p.x < -20) p.x = this.width + 10;
      if (p.x > this.width + 20) p.x = -10;
    }
  }

  draw(ctx, cameraX = 0, viewWidth = 1280) {
    ctx.save();
    for (const p of this.items) {
      const sx = p.x - cameraX;
      if (sx < -40 || sx > viewWidth + 40) continue;
      if (p.kind === 'steam') {
        const g = ctx.createRadialGradient(sx, p.y, 1, sx, p.y, p.size);
        g.addColorStop(0, p.color);
        g.addColorStop(1, 'rgba(220,220,225,0)');
        ctx.fillStyle = g;
        ctx.fillRect(sx - p.size, p.y - p.size, p.size * 2, p.size * 2);
      } else if (p.kind === 'star') {
        const twinkle = 0.35 + Math.abs(Math.sin((this.time || 0) * 0.8 + p.phase)) * 0.65;
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = p.color;
        ctx.fillRect(sx, p.y, p.size, p.size);
        ctx.globalAlpha = 1;
      } else if (p.kind === 'moth') {
        const flap = Math.sin((this.time || 0) * 9 + p.phase);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(sx - p.size * 0.6, p.y, p.size * 0.9, p.size * Math.abs(flap) * 0.7 + 0.6, 0.4, 0, Math.PI * 2);
        ctx.ellipse(sx + p.size * 0.6, p.y, p.size * 0.9, p.size * Math.abs(flap) * 0.7 + 0.6, -0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'feather') {
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(sx, p.y);
        ctx.quadraticCurveTo(sx + 6, p.y - p.size, sx + 2, p.y - p.size * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = clamp(0.6 + Math.sin((this.time || 0) + p.phase) * 0.35, 0.1, 1);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
  }
}
