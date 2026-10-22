/**
 * Строительные блоки фонов: перспективный пол, стены с фактурой, трубы,
 * световые конусы, силуэты города, облака и звёзды.
 *
 * Всё рисуется кодом и слоями: сначала плоскость, потом фактура, потом свет,
 * потом затенение по краям. Так сцена читается объёмной даже без картинок.
 */

import {
  bloom,
  brickSurface,
  contactShadow,
  plankFloor,
  surfaceGrain,
  tileSurface,
  wallpaperSurface,
} from './textures.js';

const rand = (seed) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function gradientFill(ctx, x, y, w, h, stops, horizontal = false) {
  const g = horizontal ? ctx.createLinearGradient(x, y, x + w, y) : ctx.createLinearGradient(x, y, x, y + h);
  stops.forEach(([pos, color]) => g.addColorStop(pos, color));
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  return g;
}

// --------------------------------------------------------------------- стены

/**
 * Стена с фактурой, карнизом, плинтусом и угловым затенением.
 * kind: 'brick' | 'tile' | 'plaster' | 'wood'
 */
export function wallPlane(ctx, x, y, w, h, opts = {}) {
  const {
    kind = 'plaster',
    base = '#4b4a52',
    deep = '#2c2b33',
    accent = '#6a6872',
    seed = 1,
    cornice = true,
    baseboard = true,
    wear = 0.5,
  } = opts;

  if (kind === 'brick') {
    brickSurface(ctx, x, y, w, h, { base: deep, brick: base, mortar: '#1d1c21', brickH: 26 });
  } else if (kind === 'tile') {
    tileSurface(ctx, x, y, w, h, { tile: 96, base, deep, grout: '#22242a' });
  } else if (kind === 'wood') {
    plankFloor(ctx, x, y, w, h, { base, deep, boardH: 74 });
  } else {
    wallpaperSurface(ctx, x, y, w, h, { base, deep, accent });
  }

  // вертикальные потёки и выцветшие пятна
  ctx.save();
  for (let i = 0; i < 9; i += 1) {
    const px = x + rand(seed + i) * w;
    const pw = 24 + rand(seed + i * 2) * 90;
    const ph = h * (0.25 + rand(seed + i * 3) * 0.6);
    const g = ctx.createLinearGradient(px, y, px, y + ph);
    g.addColorStop(0, `rgba(6, 6, 10, ${0.1 * wear})`);
    g.addColorStop(1, 'rgba(6, 6, 10, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(px, y, pw, ph);
  }
  // общая глубина: темнее сверху и по краям
  gradientFill(ctx, x, y, w, h, [
    [0, 'rgba(0,0,0,0.42)'],
    [0.28, 'rgba(0,0,0,0.05)'],
    [0.75, 'rgba(0,0,0,0.02)'],
    [1, 'rgba(0,0,0,0.34)'],
  ]);
  ctx.restore();

  if (cornice) {
    ctx.save();
    ctx.fillStyle = 'rgba(10,10,14,0.5)';
    ctx.fillRect(x, y, w, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(x, y + 10, w, 3);
    ctx.restore();
  }
  if (baseboard) {
    const bh = 22;
    ctx.save();
    const g = ctx.createLinearGradient(0, y + h - bh, 0, y + h);
    g.addColorStop(0, accent);
    g.addColorStop(0.35, deep);
    g.addColorStop(1, 'rgba(8,8,12,0.95)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y + h - bh, w, bh);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x, y + h - bh - 4, w, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(x, y + h - bh, w, 2);
    ctx.restore();
  }
}

// ---------------------------------------------------------------------- пол

/**
 * Пол в перспективе: плитка или доски сходятся к точке схода,
 * ближе к камере шаг шире. Плюс влажный блеск и контактное затенение у стены.
 */
export function floorPlane(ctx, x, y, w, h, opts = {}) {
  const {
    kind = 'tile',
    base = '#5b5750',
    deep = '#2b2823',
    rows = 7,
    cells = 18,
    wet = 0.25,
    seed = 3,
    vanish = 0.5,
    glossColor = 'rgba(180, 200, 220, 0.1)',
  } = opts;

  gradientFill(ctx, x, y, w, h, [
    [0, deep],
    [0.35, base],
    [1, deep],
  ]);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // фактура поверхности
  surfaceGrain(ctx, x, y, w, h, 320, kind === 'stone' ? 0.16 : 0.09);

  // швы между досками/плитами по перспективе
  const cx = x + w * vanish;
  ctx.strokeStyle = 'rgba(10, 9, 12, 0.55)';
  ctx.lineWidth = 2;
  for (let c = 0; c <= cells; c += 1) {
    const t = c / cells;
    const bx = x + t * w;
    const tx = cx + (bx - cx) * 0.34;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(tx, y);
    ctx.lineTo(bx, y + h);
    ctx.stroke();
  }
  // поперечные швы: чем дальше, тем плотнее
  for (let r = 1; r <= rows; r += 1) {
    const t = Math.pow(r / rows, 1.85);
    const yy = y + h * t;
    ctx.globalAlpha = 0.36 * (1 - t * 0.45);
    ctx.lineWidth = 1 + t * 1.6;
    ctx.beginPath();
    ctx.moveTo(x, yy);
    ctx.lineTo(x + w, yy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // светлая полоса ближе к камере — пол «ловит» свет
  gradientFill(ctx, x, y + h * 0.55, w, h * 0.45, [
    [0, 'rgba(255,255,255,0)'],
    [1, 'rgba(255,255,255,0.05)'],
  ]);

  // влажные отблески
  for (let i = 0; i < 7; i += 1) {
    const px = x + rand(seed + i) * w;
    const py = y + h * (0.25 + rand(seed + i * 2) * 0.7);
    const rx = 60 + rand(seed + i * 3) * 140;
    const ry = 8 + rand(seed + i * 4) * 14;
    const g = ctx.createRadialGradient(px, py, 2, px, py, rx);
    g.addColorStop(0, glossColor.replace(/[\d.]+\)$/, `${wet})`));
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // отражение стен у линии пола
  gradientFill(ctx, x, y, w, 26, [
    [0, 'rgba(255,255,255,0.06)'],
    [1, 'rgba(255,255,255,0)'],
  ]);
  ctx.restore();

  // контактное затенение у стены
  gradientFill(ctx, x, y, w, 90, [
    [0, 'rgba(0,0,0,0.55)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
}

// --------------------------------------------------------------------- трубы

export function pipeRun(ctx, opts = {}) {
  const {
    x,
    y,
    length = 400,
    radius = 16,
    axis = 'v',
    base = '#6f7378',
    deep = '#2c2f33',
    time = 0,
    flanges = 4,
    drips = true,
  } = opts;
  ctx.save();
  ctx.translate(x, y);
  if (axis === 'h') {
    ctx.rotate(Math.PI / 2);
  }
  const g = ctx.createLinearGradient(-radius, 0, radius, 0);
  g.addColorStop(0, deep);
  g.addColorStop(0.18, base);
  g.addColorStop(0.42, '#c9cbc4');
  g.addColorStop(0.56, base);
  g.addColorStop(1, deep);
  ctx.fillStyle = g;
  ctx.fillRect(-radius, 0, radius * 2, length);

  // фланцы
  for (let i = 0; i <= flanges; i += 1) {
    const py = (length / flanges) * i;
    ctx.fillStyle = 'rgba(12,12,16,0.55)';
    ctx.fillRect(-radius - 5, py - 3, radius * 2 + 10, 7);
    ctx.fillStyle = 'rgba(255,255,255,0.13)';
    ctx.fillRect(-radius - 5, py - 3, radius * 2 + 10, 2);
  }

  // конденсат: капли стекают и падают
  if (drips) {
    for (let i = 0; i < 6; i += 1) {
      const t = (time * 0.22 + rand(i) * 1.7) % 1;
      const py = t * length;
      const px = radius * (rand(i * 3) > 0.5 ? 0.55 : -0.55);
      ctx.fillStyle = 'rgba(200, 226, 235, 0.5)';
      ctx.beginPath();
      ctx.ellipse(px, py, 2.4, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------------- свет

/** Конус света с шумом и мягкой границей. */
export function lightCone(ctx, x, y, w, h, color = 'rgba(200, 220, 255, 0.1)', spread = 0.5) {
  ctx.save();
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, color);
  g.addColorStop(0.65, color.replace(/[\d.]+\)$/, `${(parseFloat(color.match(/[\d.]+\)$/)?.[0]) || 0.1) * 0.45})`));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.16, y);
  ctx.lineTo(x + w * 0.16, y);
  ctx.lineTo(x + w * spread, y + h);
  ctx.lineTo(x - w * spread, y + h);
  ctx.closePath();
  ctx.fill();
  // пылинки внутри луча
  for (let i = 0; i < 16; i += 1) {
    const t = rand(i * 2.3);
    const py = y + t * h;
    const px = x + (rand(i * 5.1) - 0.5) * w * (0.3 + t * spread * 1.4);
    ctx.fillStyle = `rgba(255,255,255,${0.05 + rand(i) * 0.12})`;
    ctx.fillRect(px, py, 1.6, 1.6);
  }
  ctx.restore();
}

export function lampBulb(ctx, x, y, time, color = 'rgba(255, 216, 150, 0.9)') {
  const sway = Math.sin(time * 0.9) * 2;
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x + sway, y - 12);
  ctx.stroke();
  ctx.fillStyle = '#16151a';
  ctx.fillRect(x + sway - 7, y - 14, 14, 12);
  const g = ctx.createRadialGradient(x + sway, y, 2, x + sway, y, 26);
  g.addColorStop(0, '#fff6dc');
  g.addColorStop(0.5, color);
  g.addColorStop(1, 'rgba(255, 210, 140, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x + sway, y, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  bloom(ctx, x + sway, y, 180, 'rgba(255, 210, 150, 0.12)');
}

/** Тёплое/холодное свечение от окна: прямоугольник с мягким краем. */
export function windowGlow(ctx, x, y, w, h, color = 'rgba(150, 190, 240, 0.12)') {
  ctx.save();
  const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 8, x + w / 2, y + h / 2, Math.max(w, h));
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - w * 0.4, y - h * 0.4, w * 1.8, h * 1.8);
  ctx.restore();
}

// -------------------------------------------------------------------- дальние планы

/** Город: несколько слоёв силуэтов с окнами. */
export function farCity(ctx, x, y, w, h, opts = {}) {
  const { layers = 3, color = 'rgba(12, 12, 22, 0.85)', light = '#ffd08a', seed = 7, windowChance = 0.35 } = opts;
  for (let l = 0; l < layers; l += 1) {
    const depth = (l + 1) / layers;
    const baseY = y + h * (1 - depth * 0.5);
    const bh = h * (0.35 + depth * 0.35);
    ctx.save();
    ctx.fillStyle = l === layers - 1 ? color : color.replace(/[\d.]+\)$/, `${0.35 + depth * 0.4})`);
    let px = x;
    let guard = 0;
    while (px < x + w && guard < 80) {
      guard += 1;
      const bw = 30 + rand(seed + l * 17 + guard) * 90 * depth;
      const hh = bh * (0.45 + rand(seed + l * 31 + guard * 3) * 0.75);
      ctx.fillRect(px, baseY - hh, bw, hh + 40);
      // окна
      if (l === layers - 1) {
        for (let wy = baseY - hh + 14; wy < baseY - 8; wy += 22) {
          for (let wx = px + 8; wx < px + bw - 10; wx += 16) {
            if (rand(wx * 0.7 + wy) < windowChance) {
              ctx.fillStyle = light;
              ctx.globalAlpha = 0.25 + rand(wx + wy) * 0.5;
              ctx.fillRect(wx, wy, 5, 7);
              ctx.globalAlpha = 1;
              ctx.fillStyle = l === layers - 1 ? color : color.replace(/[\d.]+\)$/, `${0.35 + depth * 0.4})`);
            }
          }
        }
      }
      px += bw + 6 + rand(guard) * 18;
    }
    ctx.restore();
  }
}

export function cloudSea(ctx, x, y, w, h, time = 0, opts = {}) {
  const { color = 'rgba(255, 236, 214, 0.22)', count = 14 } = opts;
  ctx.save();
  for (let i = 0; i < count; i += 1) {
    const drift = Math.sin(time * 0.12 + i * 0.8) * 26 + time * 4;
    const px = x + ((rand(i * 3.7) * w + drift) % w);
    const py = y + rand(i * 5.9) * h;
    const rx = 80 + rand(i * 2.1) * 180;
    const ry = rx * (0.28 + rand(i * 4.4) * 0.2);
    const g = ctx.createRadialGradient(px, py, 4, px, py, rx);
    g.addColorStop(0, color);
    g.addColorStop(0.6, color.replace(/[\d.]+\)$/, '0.08)'));
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function starField(ctx, x, y, w, h, seed = 11, alpha = 1, count = 90) {
  ctx.save();
  for (let i = 0; i < count; i += 1) {
    const px = x + rand(seed + i) * w;
    const py = y + rand(seed + i * 2.7) * h;
    const s = 0.7 + rand(seed + i * 3.3) * 1.8;
    const a = (0.18 + rand(seed + i * 5.1) * 0.6) * alpha;
    ctx.fillStyle = `rgba(226, 232, 255, ${a})`;
    ctx.fillRect(px, py, s, s);
  }
  ctx.restore();
}

/** Диск затмения: тёмный круг с огненным ободком. */
export function eclipseDisc(ctx, x, y, r, glow = 0.6) {
  ctx.save();
  const halo = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 2.4);
  halo.addColorStop(0, `rgba(255, 190, 120, ${0.5 * glow})`);
  halo.addColorStop(0.35, `rgba(220, 120, 90, ${0.16 * glow})`);
  halo.addColorStop(1, 'rgba(120, 80, 140, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0a0910';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(255, 214, 160, ${0.75 * glow})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, r + 2, 0, Math.PI * 2);
  ctx.stroke();

  // протуберанцы
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2;
    const len = r * (0.06 + rand(i) * 0.16);
    ctx.strokeStyle = `rgba(255, 170, 120, ${0.2 + rand(i * 3) * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(a) * (r + len), y + Math.sin(a) * (r + len));
    ctx.stroke();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ строения

/** Балки/стропила под скатом крыши. */
export function roofBeams(ctx, x, y, w, h, time = 0, color = '#241c18') {
  ctx.save();
  // скат
  gradientFill(ctx, x, y, w, h * 0.5, [
    [0, 'rgba(10,9,12,0.95)'],
    [1, 'rgba(28,22,20,0.85)'],
  ]);
  for (let i = 0; i < 6; i += 1) {
    const by = y + 12 + i * (h * 0.09);
    ctx.fillStyle = color;
    ctx.fillRect(x, by, w, 14 - i);
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    ctx.fillRect(x, by, w, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x, by + 12 - i, w, 3);
  }
  // свисающая пыль и паутина-нити
  for (let i = 0; i < 10; i += 1) {
    const px = x + rand(i * 4.1) * w;
    ctx.strokeStyle = 'rgba(220, 220, 230, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, y + h * 0.12);
    ctx.quadraticCurveTo(px + Math.sin(time * 0.4 + i) * 6, y + h * 0.3, px + 2, y + h * 0.42);
    ctx.stroke();
  }
  ctx.restore();
}

/** Металлическая дверь/люк с ручкой и подсветкой. */
export function metalDoor(ctx, x, y, w, h, opts = {}) {
  const { base = '#3c4348', accent = '#8fa1a8', glow = null, label = null } = opts;
  ctx.save();
  gradientFill(ctx, x, y, w, h, [
    [0, 'rgba(255,255,255,0.08)'],
    [0.15, base],
    [0.85, '#20262a'],
    [1, '#121619'],
  ]);
  ctx.strokeStyle = 'rgba(8,10,12,0.9)';
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
  // ручка
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x + w - 18, y + h * 0.52, 5, 0, Math.PI * 2);
  ctx.fill();
  if (glow) {
    const g = ctx.createLinearGradient(x, y + h, x, y + h * 0.4);
    g.addColorStop(0, glow);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y + h * 0.4, w, h * 0.6);
  }
  if (label) {
    ctx.save();
    ctx.fillStyle = 'rgba(230, 220, 200, 0.5)';
    ctx.font = '600 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + 22);
    ctx.restore();
  }
  ctx.restore();
  contactShadow(ctx, x + w / 2, y + h + 2, w * 0.6, 10, 0.4);
}

/** Перспективная лестница: ступени уходят вверх-вправо. */
export function stairFlight(ctx, x, y, steps, opts = {}) {
  const { width = 420, rise = 46, run = 70, base = '#6a655c', deep = '#232021', dir = 1 } = opts;
  ctx.save();
  for (let i = 0; i < steps; i += 1) {
    const sx = x + dir * i * run;
    const sy = y - i * rise;
    // подступенок
    gradientFill(ctx, sx, sy, width, rise + 6, [
      [0, deep],
      [1, 'rgba(10,10,12,0.9)'],
    ]);
    // проступь
    gradientFill(ctx, sx, sy, width, 12, [
      [0, 'rgba(255,255,255,0.12)'],
      [1, base],
    ]);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(sx, sy + 12, width, 4);
  }
  ctx.restore();
}
