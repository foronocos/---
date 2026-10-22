/**
 * Процедурные поверхности и свет.
 *
 * Всё рисуется кодом: никаких картинок. Тяжёлые поверхности собираются
 * в маленький тайл и размножаются через CanvasPattern — это дешево и на телефоне.
 * Если canvas-контекст недоступен (headless-тесты), функции аккуратно
 * откатываются на плоскую заливку.
 */

const patternCache = new Map();

function canMakeCanvas() {
  return (
    typeof document !== 'undefined' &&
    typeof document.createElement === 'function' &&
    typeof window !== 'undefined'
  );
}

/** Возвращает CanvasPattern для тайла или null, если паттерны недоступны. */
export function tilePattern(ctx, key, size, painter) {
  if (!ctx || typeof ctx.createPattern !== 'function') return null;
  if (patternCache.has(key)) {
    const cached = patternCache.get(key);
    return cached || null;
  }
  if (!canMakeCanvas()) {
    patternCache.set(key, null);
    return null;
  }
  try {
    const tile = document.createElement('canvas');
    tile.width = size;
    tile.height = size;
    const tctx = tile.getContext('2d');
    if (!tctx) {
      patternCache.set(key, null);
      return null;
    }
    painter(tctx, size);
    const pattern = ctx.createPattern(tile, 'repeat');
    patternCache.set(key, pattern || null);
    return pattern || null;
  } catch {
    patternCache.set(key, null);
    return null;
  }
}

export function clearPatternCache() {
  patternCache.clear();
}

const rand = (seed) => {
  const x = Math.sin(seed * 91.7 + 41.3) * 43758.5453;
  return x - Math.floor(x);
};

function fillPattern(ctx, pattern, x, y, w, h, fallback, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(x, y, w, h);
  } else {
    ctx.fillStyle = fallback;
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

// ------------------------------------------------------------------ поверхности

/** Обои: вертикальные полосы, ромбы и лёгкая неровность краски. */
export function wallpaperSurface(ctx, x, y, w, h, opts = {}) {
  const { base = '#4c3b49', deep = '#392c38', accent = 'rgba(244, 233, 206, 0.05)' } = opts;
  const grad = ctx.createLinearGradient(0, y, 0, y + h);
  grad.addColorStop(0, deep);
  grad.addColorStop(0.55, base);
  grad.addColorStop(1, deep);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  const pattern = tilePattern(ctx, `wall-${base}-${deep}`, 256, (t) => {
    t.fillStyle = base;
    t.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 220; i += 1) {
      const px = rand(i) * 256;
      const py = rand(i + 0.7) * 256;
      const a = 0.02 + rand(i + 1.3) * 0.05;
      t.fillStyle = rand(i + 2) > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a * 1.4})`;
      t.fillRect(px, py, 1 + rand(i + 3) * 2, 1 + rand(i + 4) * 2);
    }
    t.globalAlpha = 0.16;
    t.fillStyle = '#000';
    for (let sx = 0; sx < 256; sx += 32) t.fillRect(sx, 0, 2, 256);
    t.globalAlpha = 0.1;
    t.fillStyle = '#f4e9ce';
    for (let sx = 16; sx < 256; sx += 32) {
      for (let sy = 24; sy < 256; sy += 48) {
        t.beginPath();
        t.moveTo(sx, sy - 7);
        t.lineTo(sx + 7, sy);
        t.lineTo(sx, sy + 7);
        t.lineTo(sx - 7, sy);
        t.closePath();
        t.fill();
      }
    }
  });
  fillPattern(ctx, pattern, x, y, w, h, base, 1);

  // потёртости и подтёки
  ctx.save();
  for (let i = 0; i < 14; i += 1) {
    const sx = x + rand(i * 3.1) * w;
    const sy = y + rand(i * 5.7) * h * 0.8;
    const sw = 20 + rand(i * 2.3) * 90;
    const sh = 40 + rand(i * 7.2) * 160;
    const stain = ctx.createLinearGradient(sx, sy, sx, sy + sh);
    stain.addColorStop(0, 'rgba(12, 9, 16, 0.10)');
    stain.addColorStop(1, 'rgba(12, 9, 16, 0)');
    ctx.fillStyle = stain;
    ctx.fillRect(sx, sy, sw, sh);
  }
  ctx.restore();

  // верхняя тень и плинтус
  const top = ctx.createLinearGradient(0, y, 0, y + 130);
  top.addColorStop(0, 'rgba(4, 5, 9, 0.7)');
  top.addColorStop(1, 'rgba(4, 5, 9, 0)');
  ctx.fillStyle = top;
  ctx.fillRect(x, y, w, 130);
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(x, y + h - 3, w, 2);
  ctx.globalAlpha = 1;
}

/** Кирпичная кладка с неровным раствором и сыростью. */
export function brickSurface(ctx, x, y, w, h, opts = {}) {
  const { base = '#3a3230', brick = '#4b3b36', mortar = '#5b514a' } = opts;
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  const pattern = tilePattern(ctx, `brick-${base}-${brick}`, 128, (t) => {
    t.fillStyle = mortar;
    t.fillRect(0, 0, 128, 128);
    const bw = 58;
    const bh = 26;
    for (let row = 0; row < 5; row += 1) {
      const offset = row % 2 ? -bw / 2 : 0;
      for (let col = -1; col < 4; col += 1) {
        const bx = col * bw + offset + 3;
        const by = row * bh + 3;
        const shade = 0.75 + rand(row * 7 + col) * 0.5;
        const r = Math.round(75 * shade);
        const g = Math.round(59 * shade);
        const b = Math.round(54 * shade);
        t.fillStyle = `rgb(${r}, ${g}, ${b})`;
        t.fillRect(bx, by, bw - 6, bh - 6);
        t.fillStyle = `rgba(255,255,255,${0.03 + rand(row + col * 3) * 0.05})`;
        t.fillRect(bx, by, bw - 6, 2);
        t.fillStyle = `rgba(0,0,0,${0.08 + rand(row * 3 + col) * 0.1})`;
        t.fillRect(bx, by + bh - 8, bw - 6, 2);
      }
    }
  });
  fillPattern(ctx, pattern, x, y, w, h, brick);
  // влажные пятна
  ctx.save();
  for (let i = 0; i < 10; i += 1) {
    const sx = x + rand(i * 4.4) * w;
    const sy = y + h * (0.35 + rand(i * 2.2) * 0.6);
    const rad = 40 + rand(i * 8.1) * 130;
    const wet = ctx.createRadialGradient(sx, sy, 2, sx, sy, rad);
    wet.addColorStop(0, 'rgba(20, 40, 34, 0.22)');
    wet.addColorStop(1, 'rgba(20, 40, 34, 0)');
    ctx.fillStyle = wet;
    ctx.fillRect(sx - rad, sy - rad, rad * 2, rad * 2);
  }
  ctx.restore();
}

/** Кафель: швы, блики и лёгкие сколы. */
export function tileSurface(ctx, x, y, w, h, opts = {}) {
  const { tile = 74, base = '#6a726d', deep = '#454c49' } = opts;
  ctx.fillStyle = deep;
  ctx.fillRect(x, y, w, h);
  for (let ty = y; ty < y + h; ty += tile) {
    for (let tx = x; tx < x + w; tx += tile) {
      const even = (Math.round((tx - x) / tile) + Math.round((ty - y) / tile)) % 2 === 0;
      const g = ctx.createLinearGradient(tx, ty, tx + tile, ty + tile);
      g.addColorStop(0, even ? base : deep);
      g.addColorStop(1, even ? deep : base);
      ctx.fillStyle = g;
      ctx.fillRect(tx + 2, ty + 2, tile - 4, tile - 4);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(tx + 4, ty + 4, tile - 8, 3);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(tx + 4, ty + tile - 8, tile - 8, 3);
    }
  }
}

/** Дощатый пол: доски с волокнами, стыками и натёртым блеском. */
export function plankFloor(ctx, x, y, w, h, opts = {}) {
  const { base = '#6a4b3c', deep = '#4a3329', plank = 96 } = opts;
  const grad = ctx.createLinearGradient(0, y, 0, y + h);
  grad.addColorStop(0, base);
  grad.addColorStop(1, deep);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  ctx.save();
  for (let px = x; px < x + w; px += plank) {
    const shade = 0.85 + rand(px) * 0.3;
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = shade > 1 ? '#8a6349' : '#3c2a20';
    ctx.fillRect(px, y, plank - 3, h);
    ctx.globalAlpha = 1;
    // волокна
    for (let g = 0; g < 9; g += 1) {
      const gy = y + rand(px + g) * h;
      ctx.strokeStyle = `rgba(30, 20, 14, ${0.06 + rand(px + g * 2) * 0.08})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 6, gy);
      ctx.bezierCurveTo(px + plank * 0.3, gy + 4, px + plank * 0.6, gy - 5, px + plank - 8, gy + 2);
      ctx.stroke();
    }
    // стык
    ctx.strokeStyle = 'rgba(16, 10, 7, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(px, y + h);
    ctx.stroke();
  }
  // швы между рядами и перспектива
  for (let i = 1; i < 6; i += 1) {
    const ly = y + (h / 6) * i;
    ctx.strokeStyle = 'rgba(18, 11, 8, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, ly);
    ctx.lineTo(x + w, ly + 3);
    ctx.stroke();
  }
  // отблеск лака
  const sheen = ctx.createLinearGradient(x, y, x, y + h);
  sheen.addColorStop(0, 'rgba(255, 240, 210, 0.10)');
  sheen.addColorStop(0.35, 'rgba(255, 240, 210, 0.02)');
  sheen.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
  ctx.fillStyle = sheen;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** Металл: вертикальные блики, царапины, ржавые потёки. */
export function metalSurface(ctx, x, y, w, h, opts = {}) {
  const { base = '#6d7680', deep = '#3c434b', rust = 0.35 } = opts;
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, deep);
  grad.addColorStop(0.28, base);
  grad.addColorStop(0.5, '#8d959e');
  grad.addColorStop(0.72, base);
  grad.addColorStop(1, deep);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  ctx.save();
  for (let i = 0; i < 22; i += 1) {
    const sx = x + rand(i * 2.7) * w;
    const sy = y + rand(i * 5.1) * h;
    ctx.strokeStyle = `rgba(255,255,255,${0.03 + rand(i) * 0.06})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + (rand(i * 3) - 0.5) * 20, sy + 10 + rand(i * 7) * 40);
    ctx.stroke();
  }
  for (let i = 0; i < 6 * rust; i += 1) {
    const sx = x + rand(i * 9.1) * w;
    const sy = y + rand(i * 4.3) * h * 0.5;
    const rh = 20 + rand(i * 6.6) * (h * 0.6);
    const rg = ctx.createLinearGradient(sx, sy, sx, sy + rh);
    rg.addColorStop(0, 'rgba(122, 68, 34, 0.5)');
    rg.addColorStop(1, 'rgba(122, 68, 34, 0)');
    ctx.fillStyle = rg;
    ctx.fillRect(sx, sy, 3 + rand(i) * 5, rh);
  }
  ctx.restore();
}

/** Ткань, шерсть, пыльные чехлы. */
export function fabricSurface(ctx, x, y, w, h, opts = {}) {
  const { base = '#6b5a63', deep = '#4a3d45', weave = 6 } = opts;
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = deep;
  ctx.lineWidth = 1;
  for (let i = x; i < x + w; i += weave) {
    ctx.beginPath();
    ctx.moveTo(i, y);
    ctx.lineTo(i, y + h);
    ctx.stroke();
  }
  for (let j = y; j < y + h; j += weave) {
    ctx.beginPath();
    ctx.moveTo(x, j);
    ctx.lineTo(x + w, j);
    ctx.stroke();
  }
  ctx.restore();
  const light = ctx.createLinearGradient(x, y, x + w * 0.6, y + h);
  light.addColorStop(0, 'rgba(255,255,255,0.07)');
  light.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = light;
  ctx.fillRect(x, y, w, h);
}

// ------------------------------------------------------------------------ свет

/** Мягкая тень-эллипс под объектом (контактная тень). */
export function contactShadow(ctx, x, y, rx, ry, alpha = 0.35) {
  const g = ctx.createRadialGradient(x, y, 1, x, y, Math.max(rx, ry));
  g.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
  g.addColorStop(0.6, `rgba(0, 0, 0, ${alpha * 0.45})`);
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, Math.max(0.12, ry / Math.max(1, rx)));
  ctx.translate(-x, -y);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(rx, ry), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Объёмный луч света из окна/лампы. */
export function lightBeam(ctx, x, y, w, h, color = 'rgba(255, 235, 190, 0.08)', tilt = 0.25) {
  ctx.save();
  const g = ctx.createLinearGradient(x, y, x + w * tilt, y + h);
  g.addColorStop(0, color);
  g.addColorStop(0.5, color.replace(/[\d.]+\)$/, '0.04)'));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w + w * tilt, y + h);
  ctx.lineTo(x - w * 0.2 + w * tilt, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Источник света с ореолом и теплом на поверхности. */
export function lampGlow(ctx, x, y, radius, color = 'rgba(255, 206, 128, 0.25)') {
  const g = ctx.createRadialGradient(x, y, 2, x, y, radius);
  g.addColorStop(0, color);
  g.addColorStop(0.35, color.replace(/[\d.]+\)$/, '0.09)'));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Отражение в мокром полу/луже: сжатое и полупрозрачное. */
export function wetReflection(ctx, drawThing, x, y, w, h, alpha = 0.18) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(0, y * 2);
  ctx.scale(1, -1);
  ctx.beginPath();
  ctx.rect(x, y - h, w, h + 2);
  ctx.clip();
  drawThing();
  ctx.restore();
}

/** Мягкое размытие-подсветка (дешёвый bloom). */
export function bloom(ctx, x, y, radius, color = 'rgba(255,220,160,0.18)') {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color);
  g.addColorStop(0.5, color.replace(/[\d.]+\)$/, '0.05)'));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

/** Крупное зерно поверхности (пыль, штукатурка). */
export function surfaceGrain(ctx, x, y, w, h, density = 160, alpha = 0.05) {
  ctx.save();
  for (let i = 0; i < density; i += 1) {
    const px = x + rand(i * 3.3 + x) * w;
    const py = y + rand(i * 5.7 + y) * h;
    const a = alpha * (0.4 + rand(i * 9.1));
    ctx.fillStyle = rand(i * 2.2) > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    ctx.fillRect(px, py, 1.6, 1.6);
  }
  ctx.restore();
}

/** Паутина: радиальные нити и провисающие дуги. */
export function cobweb(ctx, x, y, w, h, alpha = 0.22) {
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;
  ctx.save();
  ctx.strokeStyle = `rgba(226, 226, 220, ${alpha})`;
  ctx.lineWidth = 1;
  const spokes = 7;
  for (let i = 0; i < spokes; i += 1) {
    const a = (i / spokes) * Math.PI * 2 + 0.3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * w * 0.5, cy + Math.sin(a) * h * 0.5);
    ctx.stroke();
  }
  for (let ring = 1; ring <= 3; ring += 1) {
    const r = (ring / 4) * Math.min(w, h) * 0.5;
    ctx.beginPath();
    for (let i = 0; i <= spokes; i += 1) {
      const a = (i / spokes) * Math.PI * 2 + 0.3;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r * (h / w);
      if (i === 0) ctx.moveTo(px, py);
      else {
        const pa = ((i - 0.5) / spokes) * Math.PI * 2 + 0.3;
        ctx.quadraticCurveTo(
          cx + Math.cos(pa) * r * 0.94,
          cy + Math.sin(pa) * r * 0.94 * (h / w) + 6,
          px,
          py,
        );
      }
    }
    ctx.stroke();
  }
  ctx.restore();
}
