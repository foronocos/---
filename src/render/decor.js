/**
 * Слой декора: всё, что не является интерактивным предметом.
 * Данные лежат в описании комнаты (`room.decor`), здесь — только рисование.
 * Примитивы намеренно детальные: тени, блики, фактура, мелкие детали.
 */

import {
  brickSurface,
  cobweb,
  contactShadow,
  fabricSurface,
  lampGlow,
  lightBeam,
  metalSurface,
  plankFloor,
  surfaceGrain,
  tileSurface,
} from './textures.js';

const rnd = (seed) => {
  const x = Math.sin(seed * 78.233 + 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

function box(ctx, x, y, w, h, fill, edge = 'rgba(0,0,0,0.35)', top = null) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  if (top) {
    ctx.fillStyle = top;
    ctx.fillRect(x, y, w, Math.max(2, h * 0.08));
  }
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
}

// --------------------------------------------------------------- примитивы

const ART = {};

ART.wallTiles = (ctx, d) => {
  tileSurface(ctx, d.x, d.y, d.w, d.h, { tile: 86, base: '#7b8478', deep: '#4e574f' });
  surfaceGrain(ctx, d.x, d.y, d.w, d.h, 260, 0.04);
  // потёки по кафелю
  for (let i = 0; i < 9; i += 1) {
    const sx = d.x + rnd(i * 3.7) * d.w;
    const sy = d.y + rnd(i * 5.1) * d.h * 0.6;
    const g = ctx.createLinearGradient(sx, sy, sx, sy + 90);
    g.addColorStop(0, 'rgba(30, 40, 34, 0.22)');
    g.addColorStop(1, 'rgba(30, 40, 34, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(sx, sy, 3 + rnd(i) * 6, 90);
  }
};

ART.brickWall = (ctx, d) => {
  brickSurface(ctx, d.x, d.y, d.w, d.h);
  surfaceGrain(ctx, d.x, d.y, d.w, d.h, 220, 0.05);
};

ART.pipes = (ctx, d) => {
  metalSurface(ctx, d.x, d.y, d.w, d.h, { base: '#6f6a5c', deep: '#3a372f', rust: 0.6 });
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  for (let y = d.y + 40; y < d.y + d.h; y += 90) {
    ctx.beginPath();
    ctx.moveTo(d.x - 4, y);
    ctx.lineTo(d.x + d.w + 4, y);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(d.x + d.w * 0.18, d.y, 3, d.h);
};

ART.pipesLong = (ctx, d) => {
  metalSurface(ctx, d.x, d.y, d.w, d.h, { base: '#7c7362', deep: '#443d33', rust: 0.5 });
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 2;
  for (let x = d.x + 120; x < d.x + d.w; x += 240) {
    ctx.beginPath();
    ctx.moveTo(x, d.y - 3);
    ctx.lineTo(x, d.y + d.h + 3);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.09)';
  ctx.fillRect(d.x, d.y + 3, d.w, 2);
};

ART.pipesFront = ART.pipes;

ART.valves = (ctx, d) => {
  const cx = d.x + d.w / 2;
  const cy = d.y + d.h / 2;
  ctx.save();
  ctx.strokeStyle = '#8b7a5c';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, d.w * 0.42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#caa76a';
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * d.w * 0.42, cy + Math.sin(a) * d.w * 0.42);
    ctx.stroke();
  }
  ctx.fillStyle = '#5b4a35';
  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

ART.bulb = (ctx, d, time) => {
  const cx = d.x + d.w / 2;
  ctx.strokeStyle = 'rgba(20,20,20,0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, d.y);
  ctx.lineTo(cx, d.y + d.h - 18);
  ctx.stroke();
  const flicker = 0.75 + Math.sin((time || 0) * 11) * 0.06 + Math.sin((time || 0) * 3.3) * 0.12;
  lampGlow(ctx, cx, d.y + d.h, 150 * flicker, 'rgba(255, 214, 150, 0.22)');
  ctx.fillStyle = `rgba(255, 236, 190, ${0.85 * flicker})`;
  ctx.beginPath();
  ctx.ellipse(cx, d.y + d.h, 11, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(70,60,40,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
};

ART.lamp = ART.bulb;

ART.railing = (ctx, d) => {
  ctx.save();
  ctx.strokeStyle = 'rgba(48, 50, 52, 0.9)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(d.x, d.y + 20);
  ctx.lineTo(d.x + d.w, d.y + 10);
  ctx.stroke();
  for (let i = 0; i <= 8; i += 1) {
    const px = d.x + (d.w / 8) * i;
    const py = d.y + 20 - (i / 8) * 10;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, d.y + d.h);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(200, 210, 215, 0.18)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(d.x + 2, d.y + 16);
  ctx.lineTo(d.x + d.w, d.y + 6);
  ctx.stroke();
  ctx.restore();
};

ART.railingFront = ART.railing;

ART.stairsUp = (ctx, d) => {
  ctx.save();
  for (let i = 0; i < 9; i += 1) {
    const stepW = d.w;
    const stepH = d.h / 9;
    const y = d.y + i * stepH;
    const shade = 0.55 + i * 0.04;
    ctx.fillStyle = `rgba(${Math.round(90 * shade)}, ${Math.round(84 * shade)}, ${Math.round(74 * shade)}, 0.95)`;
    ctx.fillRect(d.x, y, stepW - i * 12, stepH + 1);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(d.x, y, stepW - i * 12, 3);
  }
  ctx.restore();
};

ART.graffiti = (ctx, d) => {
  ctx.save();
  ctx.strokeStyle = 'rgba(200, 120, 160, 0.5)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(d.x, d.y + d.h * 0.7);
  ctx.bezierCurveTo(d.x + d.w * 0.25, d.y + d.h * 0.1, d.x + d.w * 0.5, d.y + d.h * 0.9, d.x + d.w * 0.75, d.y + d.h * 0.35);
  ctx.bezierCurveTo(d.x + d.w * 0.85, d.y + d.h * 0.15, d.x + d.w * 0.95, d.y + d.h * 0.4, d.x + d.w, d.y + d.h * 0.3);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(230, 210, 120, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(d.x + d.w * 0.55, d.y + d.h * 0.45, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

ART.meterBox = (ctx, d) => {
  box(ctx, d.x, d.y, d.w, d.h, '#3c4147', 'rgba(0,0,0,0.5)', 'rgba(255,255,255,0.08)');
  ctx.fillStyle = 'rgba(30, 34, 38, 0.9)';
  ctx.fillRect(d.x + 12, d.y + 14, d.w - 24, d.h * 0.42);
  ctx.fillStyle = 'rgba(220, 220, 200, 0.12)';
  ctx.fillRect(d.x + 16, d.y + 18, d.w - 32, 10);
  ctx.strokeStyle = 'rgba(200,200,190,0.25)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(d.x + 16 + i * 22, d.y + d.h * 0.7);
    ctx.lineTo(d.x + 16 + i * 22, d.y + d.h - 16);
    ctx.stroke();
  }
};

ART.window = (ctx, d, time, palette) => {
  const night = ctx.createLinearGradient(0, d.y, 0, d.y + d.h);
  night.addColorStop(0, '#141b2c');
  night.addColorStop(1, '#2a3148');
  ctx.fillStyle = night;
  ctx.fillRect(d.x, d.y, d.w, d.h);
  // город за стеклом
  ctx.fillStyle = 'rgba(10, 14, 24, 0.9)';
  for (let i = 0; i < 6; i += 1) {
    const bw = d.w / 7;
    const bh = d.h * (0.2 + rnd(i) * 0.35);
    ctx.fillRect(d.x + i * (d.w / 6), d.y + d.h - bh, bw, bh);
  }
  // огоньки
  for (let i = 0; i < 14; i += 1) {
    ctx.fillStyle = `rgba(255, 210, 140, ${0.25 + rnd(i * 3) * 0.4})`;
    ctx.fillRect(d.x + 6 + rnd(i) * (d.w - 12), d.y + d.h * 0.4 + rnd(i * 5) * (d.h * 0.5), 2, 2);
  }
  // рама и блик
  ctx.strokeStyle = '#2a2320';
  ctx.lineWidth = 10;
  ctx.strokeRect(d.x, d.y, d.w, d.h);
  ctx.beginPath();
  ctx.moveTo(d.x + d.w / 2, d.y);
  ctx.lineTo(d.x + d.w / 2, d.y + d.h);
  ctx.moveTo(d.x, d.y + d.h / 2);
  ctx.lineTo(d.x + d.w, d.y + d.h / 2);
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = 'rgba(220, 235, 255, 0.08)';
  ctx.beginPath();
  ctx.moveTo(d.x + 8, d.y + d.h);
  ctx.lineTo(d.x + d.w * 0.55, d.y);
  ctx.lineTo(d.x + d.w * 0.8, d.y);
  ctx.lineTo(d.x + 8 + d.w * 0.25, d.y + d.h);
  ctx.closePath();
  ctx.fill();
};

ART.wires = (ctx, d) => {
  ctx.save();
  for (let i = 0; i < 3; i += 1) {
    ctx.strokeStyle = `rgba(18, 18, 20, ${0.5 - i * 0.1})`;
    ctx.lineWidth = 2 - i * 0.4;
    ctx.beginPath();
    ctx.moveTo(d.x, d.y + i * 16);
    const mid = d.x + d.w / 2;
    ctx.quadraticCurveTo(mid, d.y + i * 16 + 20, d.x + d.w, d.y + i * 16 + 4);
    ctx.stroke();
  }
  ctx.restore();
};

ART.boots = (ctx, d) => {
  ctx.fillStyle = 'rgba(30, 28, 26, 0.85)';
  ctx.beginPath();
  ctx.roundRect(d.x, d.y + 14, d.w * 0.42, d.h - 14, 6);
  ctx.roundRect(d.x + d.w * 0.5, d.y + 20, d.w * 0.42, d.h - 20, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(d.x + 4, d.y + 18, d.w * 0.3, 3);
};

ART.cobweb = (ctx, d) => cobweb(ctx, d.x, d.y, d.w, d.h, d.alpha ?? 0.22);

ART.doorRows = (ctx, d) => {
  for (let i = 0; i < 2; i += 1) {
    const dx = d.x + i * (d.w / 2 + 10);
    box(ctx, dx, d.y, d.w / 2 - 10, d.h, '#4a3a30', 'rgba(0,0,0,0.5)', 'rgba(255,255,255,0.05)');
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(dx + 12, d.y + 16, d.w / 2 - 34, d.h * 0.32);
    ctx.strokeRect(dx + 12, d.y + d.h * 0.44, d.w / 2 - 34, d.h * 0.42);
    ctx.fillStyle = '#c9a55a';
    ctx.beginPath();
    ctx.arc(dx + d.w / 2 - 22, d.y + d.h * 0.52, 4, 0, Math.PI * 2);
    ctx.fill();
  }
};

ART.elevator = (ctx, d, time) => {
  metalSurface(ctx, d.x, d.y, d.w, d.h, { base: '#7d858c', deep: '#464c52', rust: 0.2 });
  ctx.strokeStyle = 'rgba(20,22,24,0.7)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(d.x + d.w / 2, d.y);
  ctx.lineTo(d.x + d.w / 2, d.y + d.h);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.fillRect(d.x + 10, d.y, 12, d.h);
  lampGlow(ctx, d.x + d.w / 2, d.y + 30, 90, 'rgba(160, 200, 190, 0.14)');
  ctx.fillStyle = `rgba(190, 230, 220, ${0.5 + Math.sin((time || 0) * 1.6) * 0.2})`;
  ctx.fillRect(d.x + d.w / 2 - 14, d.y + 14, 28, 5);
};

ART.plant = (ctx, d, time) => {
  contactShadow(ctx, d.x + d.w / 2, d.y + d.h - 4, d.w * 0.4, 12, 0.3);
  ctx.fillStyle = '#6a4a34';
  ctx.beginPath();
  ctx.moveTo(d.x + d.w * 0.2, d.y + d.h * 0.55);
  ctx.lineTo(d.x + d.w * 0.8, d.y + d.h * 0.55);
  ctx.lineTo(d.x + d.w * 0.7, d.y + d.h);
  ctx.lineTo(d.x + d.w * 0.3, d.y + d.h);
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i < 9; i += 1) {
    const a = -Math.PI / 2 + (i - 4) * 0.28 + Math.sin((time || 0) * 0.8 + i) * 0.04;
    const len = d.h * (0.4 + rnd(i) * 0.3);
    const bx = d.x + d.w / 2;
    const by = d.y + d.h * 0.55;
    ctx.strokeStyle = `rgba(${40 + rnd(i) * 40}, ${90 + rnd(i) * 50}, ${50 + rnd(i) * 30}, 0.9)`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx + Math.cos(a) * len * 0.6, by + Math.sin(a) * len * 0.7, bx + Math.cos(a) * len, by + Math.sin(a) * len);
    ctx.stroke();
  }
};

ART.puddle = (ctx, d) => {
  const g = ctx.createRadialGradient(d.x + d.w / 2, d.y + d.h / 2, 2, d.x + d.w / 2, d.y + d.h / 2, d.w / 2);
  g.addColorStop(0, 'rgba(120, 160, 170, 0.35)');
  g.addColorStop(1, 'rgba(60, 90, 100, 0.05)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(d.x + d.w / 2, d.y + d.h / 2, d.w / 2, d.h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(220, 240, 245, 0.18)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(d.x + d.w * 0.42, d.y + d.h * 0.44, d.w * 0.16, d.h * 0.12, 0.2, 0, Math.PI * 2);
  ctx.stroke();
};

ART.rainPuddle = ART.puddle;

ART.numbers = (ctx, d) => {
  ctx.fillStyle = 'rgba(230, 225, 205, 0.75)';
  ctx.font = '700 26px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('12', d.x + d.w / 2, d.y + d.h * 0.7);
};

ART.bike = (ctx, d) => {
  ctx.save();
  ctx.strokeStyle = 'rgba(28, 26, 24, 0.9)';
  ctx.lineWidth = 5;
  [0.25, 0.75].forEach((k) => {
    ctx.beginPath();
    ctx.arc(d.x + d.w * k, d.y + d.h * 0.72, d.h * 0.24, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.moveTo(d.x + d.w * 0.25, d.y + d.h * 0.72);
  ctx.lineTo(d.x + d.w * 0.45, d.y + d.h * 0.35);
  ctx.lineTo(d.x + d.w * 0.72, d.y + d.h * 0.36);
  ctx.lineTo(d.x + d.w * 0.75, d.y + d.h * 0.72);
  ctx.moveTo(d.x + d.w * 0.45, d.y + d.h * 0.35);
  ctx.lineTo(d.x + d.w * 0.62, d.y + d.h * 0.72);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(200, 60, 60, 0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(d.x + d.w * 0.6, d.y + d.h * 0.3);
  ctx.lineTo(d.x + d.w * 0.8, d.y + d.h * 0.28);
  ctx.stroke();
  ctx.restore();
};

ART.shelves = (ctx, d) => {
  ctx.fillStyle = '#3f3428';
  for (let i = 0; i < 3; i += 1) ctx.fillRect(d.x, d.y + (d.h / 3) * i + 20, d.w, 9);
  for (let i = 0; i < 9; i += 1) {
    const bx = d.x + 8 + rnd(i) * (d.w - 30);
    const by = d.y + 4 + Math.floor(rnd(i * 3) * 3) * (d.h / 3);
    const bh = 18 + rnd(i * 5) * 16;
    ctx.fillStyle = ['#7a5a3a', '#5a6a4a', '#6a4a5a', '#7a7040'][i % 4];
    ctx.fillRect(bx, by + 14, 12, bh);
  }
};

ART.mushrooms = (ctx, d) => {
  for (let i = 0; i < 5; i += 1) {
    const mx = d.x + 12 + rnd(i) * (d.w - 24);
    const my = d.y + d.h - 6 - rnd(i * 3) * 10;
    const r = 5 + rnd(i * 7) * 6;
    ctx.fillStyle = 'rgba(180, 170, 140, 0.75)';
    ctx.fillRect(mx - 1.5, my - r, 3, r);
    ctx.fillStyle = 'rgba(200, 190, 150, 0.8)';
    ctx.beginPath();
    ctx.ellipse(mx, my - r, r * 1.4, r * 0.8, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  }
};

ART.crates = (ctx, d) => {
  for (let i = 0; i < 2; i += 1) {
    const bx = d.x + i * (d.w * 0.5);
    const bh = d.h * (0.7 + i * 0.2);
    box(ctx, bx, d.y + d.h - bh, d.w * 0.48, bh, '#6b4f33', 'rgba(20,12,6,0.6)', 'rgba(255,230,190,0.08)');
    ctx.strokeStyle = 'rgba(40, 26, 14, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx + 4, d.y + d.h - bh * 0.5);
    ctx.lineTo(bx + d.w * 0.44, d.y + d.h - bh * 0.5);
    ctx.stroke();
  }
};

ART.coalPile = (ctx, d) => {
  for (let i = 0; i < 26; i += 1) {
    const px = d.x + rnd(i) * d.w;
    const py = d.y + d.h - rnd(i * 3) * d.h * 0.7;
    ctx.fillStyle = `rgba(${20 + rnd(i * 7) * 20}, ${20 + rnd(i * 5) * 18}, ${22 + rnd(i * 9) * 20}, 0.95)`;
    ctx.beginPath();
    ctx.arc(px, py, 4 + rnd(i * 11) * 7, 0, Math.PI * 2);
    ctx.fill();
  }
};

ART.boilerTank = (ctx, d, time) => {
  metalSurface(ctx, d.x, d.y, d.w, d.h, { base: '#7b6a54', deep: '#3e3428', rust: 0.9 });
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.arc(d.x + d.w / 2, d.y + 18, d.w * 0.46, Math.PI, Math.PI * 2);
  ctx.fill();
  const glow = 0.5 + Math.sin((time || 0) * 1.4) * 0.2;
  ctx.fillStyle = `rgba(255, 140, 60, ${0.35 * glow})`;
  ctx.beginPath();
  ctx.roundRect(d.x + d.w * 0.28, d.y + d.h * 0.62, d.w * 0.44, d.h * 0.22, 10);
  ctx.fill();
  lampGlow(ctx, d.x + d.w / 2, d.y + d.h * 0.72, 120, 'rgba(255, 130, 50, 0.16)');
};

ART.gauge = (ctx, d) => {
  ctx.fillStyle = '#d8d0b8';
  ctx.beginPath();
  ctx.arc(d.x + d.w / 2, d.y + d.h / 2, d.w * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a3a28';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = '#a33';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(d.x + d.w / 2, d.y + d.h / 2);
  ctx.lineTo(d.x + d.w * 0.72, d.y + d.h * 0.3);
  ctx.stroke();
};

ART.steamCloud = (ctx, d, time) => {
  ctx.save();
  ctx.globalAlpha = (d.alpha ?? 0.3);
  for (let i = 0; i < 5; i += 1) {
    const px = d.x + d.w * 0.5 + Math.sin((time || 0) * 0.7 + i) * 26;
    const py = d.y + d.h * 0.5 - ((time || 0) * 18 + i * 34) % (d.h * 0.6);
    const g = ctx.createRadialGradient(px, py, 2, px, py, d.w * 0.4);
    g.addColorStop(0, 'rgba(240, 240, 235, 0.35)');
    g.addColorStop(1, 'rgba(240, 240, 235, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py, d.w * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

ART.roofBeams = (ctx, d) => {
  ctx.fillStyle = '#2c2118';
  for (let i = 0; i < 6; i += 1) {
    const x = d.x + i * (d.w / 5);
    ctx.save();
    ctx.translate(x, d.y);
    ctx.rotate(0.06);
    ctx.fillStyle = 'rgba(64, 46, 30, 0.95)';
    ctx.fillRect(0, 0, 54, d.h);
    ctx.fillStyle = 'rgba(255, 230, 190, 0.05)';
    ctx.fillRect(6, 0, 8, d.h);
    ctx.restore();
  }
  // скаты крыши
  ctx.strokeStyle = 'rgba(40, 30, 20, 0.9)';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(d.x, d.y + 40);
  ctx.lineTo(d.x + d.w / 2, d.y - 60);
  ctx.lineTo(d.x + d.w, d.y + 40);
  ctx.stroke();
  ctx.fillStyle = 'rgba(20, 15, 10, 0.55)';
  ctx.fillRect(d.x, d.y, d.w, 60);
};

ART.beamFront = (ctx, d) => {
  ctx.fillStyle = 'rgba(46, 33, 22, 0.95)';
  ctx.fillRect(d.x, d.y, d.w, d.h);
  ctx.fillStyle = 'rgba(255, 226, 180, 0.06)';
  ctx.fillRect(d.x + 8, d.y, 10, d.h);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(d.x + d.w - 14, d.y, 14, d.h);
};

ART.skylight = (ctx, d, time) => {
  const sky = ctx.createLinearGradient(0, d.y, 0, d.y + d.h);
  sky.addColorStop(0, '#2b3550');
  sky.addColorStop(1, '#5f6b80');
  ctx.fillStyle = sky;
  ctx.beginPath();
  ctx.moveTo(d.x, d.y + d.h);
  ctx.lineTo(d.x + d.w * 0.18, d.y);
  ctx.lineTo(d.x + d.w * 0.82, d.y);
  ctx.lineTo(d.x + d.w, d.y + d.h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2a2118';
  ctx.lineWidth = 10;
  ctx.stroke();
  lightBeam(ctx, d.x + d.w * 0.3, d.y + d.h, d.w * 0.4, 340, 'rgba(200, 215, 255, 0.10)', 0.2);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.beginPath();
  ctx.moveTo(d.x + d.w * 0.3, d.y + d.h);
  ctx.lineTo(d.x + d.w * 0.4, d.y);
  ctx.lineTo(d.x + d.w * 0.5, d.y);
  ctx.lineTo(d.x + d.w * 0.42, d.y + d.h);
  ctx.closePath();
  ctx.fill();
};

ART.boxPile = (ctx, d) => {
  for (let i = 0; i < 4; i += 1) {
    const bw = d.w * (0.45 + rnd(i) * 0.3);
    const bh = d.h * (0.28 + rnd(i * 3) * 0.25);
    const bx = d.x + rnd(i * 5) * (d.w - bw);
    const by = d.y + d.h - bh - (i > 1 ? bh * 0.9 : 0);
    box(ctx, bx, by, bw, bh, '#8a7248', 'rgba(40,26,12,0.55)', 'rgba(255,236,200,0.12)');
    ctx.strokeStyle = 'rgba(240, 230, 210, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx + bw / 2, by);
    ctx.lineTo(bx + bw / 2, by + bh);
    ctx.stroke();
  }
};

ART.chestStack = (ctx, d) => {
  for (let i = 0; i < 2; i += 1) {
    const ch = d.h * 0.48;
    const cy = d.y + d.h - ch - i * ch * 0.95;
    box(ctx, d.x + i * 10, cy, d.w - i * 20, ch, '#5a3f2a', 'rgba(24,14,6,0.7)', 'rgba(255,220,170,0.1)');
    ctx.fillStyle = '#c9a55a';
    ctx.fillRect(d.x + i * 10 + (d.w - i * 20) / 2 - 8, cy + ch * 0.4, 16, ch * 0.22);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(d.x + i * 10, cy + ch * 0.35);
    ctx.lineTo(d.x + i * 10 + d.w - i * 20, cy + ch * 0.35);
    ctx.stroke();
  }
};

ART.gramophoneStand = (ctx, d) => {
  box(ctx, d.x + d.w * 0.2, d.y + d.h * 0.45, d.w * 0.6, d.h * 0.55, '#4a3524', 'rgba(0,0,0,0.5)');
  ctx.fillStyle = '#8a6a3a';
  ctx.beginPath();
  ctx.ellipse(d.x + d.w * 0.5, d.y + d.h * 0.45, d.w * 0.3, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b08c50';
  ctx.beginPath();
  ctx.moveTo(d.x + d.w * 0.55, d.y + d.h * 0.42);
  ctx.quadraticCurveTo(d.x + d.w * 0.9, d.y + d.h * 0.2, d.x + d.w * 0.95, d.y + d.h * 0.42);
  ctx.quadraticCurveTo(d.x + d.w * 0.8, d.y + d.h * 0.4, d.x + d.w * 0.55, d.y + d.h * 0.46);
  ctx.closePath();
  ctx.fill();
};

ART.fabrics = (ctx, d) => {
  fabricSurface(ctx, d.x, d.y, d.w, d.h, { base: '#6a5a62', deep: '#4a3d45' });
  for (let i = 0; i < 4; i += 1) {
    ctx.fillStyle = `rgba(${150 + i * 10}, ${120 + i * 8}, ${130}, 0.25)`;
    ctx.fillRect(d.x + i * 18, d.y + 10 + i * 14, d.w - i * 36, 12);
  }
};

ART.fabricFront = ART.fabrics;
ART.dustSheet = ART.fabrics;

ART.mannequin = (ctx, d) => {
  contactShadow(ctx, d.x + d.w / 2, d.y + d.h, d.w * 0.5, 16, 0.3);
  ctx.fillStyle = 'rgba(210, 200, 180, 0.5)';
  ctx.beginPath();
  ctx.ellipse(d.x + d.w / 2, d.y + d.h * 0.22, d.w * 0.16, d.h * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(d.x + d.w * 0.3, d.y + d.h * 0.35);
  ctx.quadraticCurveTo(d.x + d.w * 0.5, d.y + d.h * 0.3, d.x + d.w * 0.7, d.y + d.h * 0.35);
  ctx.lineTo(d.x + d.w * 0.62, d.y + d.h * 0.8);
  ctx.lineTo(d.x + d.w * 0.38, d.y + d.h * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4a3a2a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(d.x + d.w * 0.5, d.y + d.h * 0.8);
  ctx.lineTo(d.x + d.w * 0.5, d.y + d.h);
  ctx.stroke();
};

ART.oldChair = (ctx, d) => {
  box(ctx, d.x + d.w * 0.2, d.y, d.w * 0.6, d.h * 0.5, 'rgba(96, 70, 46, 0.9)', 'rgba(0,0,0,0.4)');
  box(ctx, d.x, d.y + d.h * 0.5, d.w, d.h * 0.18, 'rgba(110, 82, 54, 0.9)', 'rgba(0,0,0,0.4)');
  ctx.strokeStyle = 'rgba(70, 50, 32, 0.9)';
  ctx.lineWidth = 5;
  [[0.15, 0.68], [0.85, 0.68]].forEach(([k]) => {
    ctx.beginPath();
    ctx.moveTo(d.x + d.w * k, d.y + d.h * 0.66);
    ctx.lineTo(d.x + d.w * k, d.y + d.h);
    ctx.stroke();
  });
};

ART.hangingClothes = (ctx, d) => {
  ctx.strokeStyle = 'rgba(210, 200, 180, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(d.x, d.y);
  ctx.quadraticCurveTo(d.x + d.w / 2, d.y + 16, d.x + d.w, d.y);
  ctx.stroke();
  for (let i = 0; i < 4; i += 1) {
    const cx = d.x + 24 + i * (d.w / 4.4);
    const hh = d.h * (0.5 + rnd(i) * 0.3);
    ctx.fillStyle = ['rgba(70,60,76,0.9)', 'rgba(90,80,60,0.9)', 'rgba(60,72,70,0.9)', 'rgba(80,60,60,0.9)'][i];
    ctx.beginPath();
    ctx.moveTo(cx, d.y + 6);
    ctx.lineTo(cx + 26, d.y + 6);
    ctx.lineTo(cx + 34, d.y + hh);
    ctx.lineTo(cx - 8, d.y + hh);
    ctx.closePath();
    ctx.fill();
  }
};

ART.toys = (ctx, d) => {
  for (let i = 0; i < 7; i += 1) {
    const px = d.x + rnd(i) * d.w;
    const py = d.y + d.h - rnd(i * 3) * d.h * 0.6;
    ctx.fillStyle = ['#b8734a', '#7a8ab0', '#b0a05a', '#8a6aa0'][i % 4];
    ctx.beginPath();
    ctx.arc(px, py, 5 + rnd(i * 5) * 5, 0, Math.PI * 2);
    ctx.fill();
  }
};

ART.mothSwarm = (ctx, d, time) => {
  for (let i = 0; i < 12; i += 1) {
    const px = d.x + rnd(i) * d.w + Math.sin((time || 0) * 0.9 + i) * 12;
    const py = d.y + rnd(i * 3) * d.h + Math.cos((time || 0) * 0.7 + i) * 10;
    ctx.fillStyle = 'rgba(226, 214, 180, 0.35)';
    ctx.beginPath();
    ctx.ellipse(px, py, 5, 3, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
};

ART.roofSky = (ctx, d) => {
  const sky = ctx.createLinearGradient(0, d.y, 0, d.y + d.h);
  sky.addColorStop(0, '#1b1a33');
  sky.addColorStop(0.45, '#463a5c');
  sky.addColorStop(0.75, '#8d5f63');
  sky.addColorStop(1, '#c98a62');
  ctx.fillStyle = sky;
  ctx.fillRect(d.x, d.y, d.w, d.h);
  for (let i = 0; i < 40; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.1 + rnd(i) * 0.5})`;
    ctx.fillRect(d.x + rnd(i * 3) * d.w, d.y + rnd(i * 7) * d.h * 0.5, 1.6, 1.6);
  }
};

ART.voidSky = (ctx, d) => {
  const sky = ctx.createLinearGradient(0, d.y, 0, d.y + d.h);
  sky.addColorStop(0, '#05060d');
  sky.addColorStop(0.6, '#101227');
  sky.addColorStop(1, '#1d1b33');
  ctx.fillStyle = sky;
  ctx.fillRect(d.x, d.y, d.w, d.h);
};

ART.dawnSky = (ctx, d) => {
  const sky = ctx.createLinearGradient(0, d.y, 0, d.y + d.h);
  sky.addColorStop(0, '#2a2440');
  sky.addColorStop(0.35, '#6a4a6a');
  sky.addColorStop(0.62, '#d4816a');
  sky.addColorStop(0.85, '#f3b06a');
  sky.addColorStop(1, '#ffd79a');
  ctx.fillStyle = sky;
  ctx.fillRect(d.x, d.y, d.w, d.h);
};

ART.cityline = (ctx, d) => {
  ctx.save();
  for (let i = 0; i < 26; i += 1) {
    const bw = d.w / 26;
    const bh = d.h * (0.15 + rnd(i) * 0.55);
    ctx.fillStyle = `rgba(${18 + rnd(i) * 14}, ${20 + rnd(i) * 14}, ${34 + rnd(i) * 20}, 0.95)`;
    ctx.fillRect(d.x + i * bw, d.y + d.h - bh, bw - 2, bh);
    for (let w = 0; w < 4; w += 1) {
      if (rnd(i * 7 + w) > 0.55) {
        ctx.fillStyle = `rgba(255, 200, 130, ${0.2 + rnd(i + w) * 0.5})`;
        ctx.fillRect(d.x + i * bw + 4 + (w % 2) * 12, d.y + d.h - bh + 12 + Math.floor(w / 2) * 18, 4, 6);
      }
    }
  }
  ctx.restore();
};

ART.citylineFar = (ctx, d) => {
  ctx.save();
  ctx.globalAlpha = 0.5;
  ART.cityline(ctx, d);
  ctx.restore();
};

ART.roofSurface = (ctx, d) => {
  ctx.fillStyle = '#3a3a44';
  ctx.fillRect(d.x, d.y, d.w, d.h);
  ctx.strokeStyle = 'rgba(20,20,26,0.5)';
  ctx.lineWidth = 2;
  for (let x = d.x; x < d.x + d.w; x += 90) {
    ctx.beginPath();
    ctx.moveTo(x, d.y);
    ctx.lineTo(x - 30, d.y + d.h);
    ctx.stroke();
  }
  for (let i = 0; i < 8; i += 1) {
    const y = d.y + (d.h / 8) * i;
    ctx.strokeStyle = 'rgba(20,20,26,0.25)';
    ctx.beginPath();
    ctx.moveTo(d.x, y);
    ctx.lineTo(d.x + d.w, y + 2);
    ctx.stroke();
  }
  surfaceGrain(ctx, d.x, d.y, d.w, d.h, 200, 0.05);
};

ART.chimney = (ctx, d) => {
  brickSurface(ctx, d.x, d.y, d.w, d.h, { base: '#5a4640', brick: '#6a4c42', mortar: '#7a6a5e' });
  ctx.fillStyle = 'rgba(20, 16, 14, 0.9)';
  ctx.fillRect(d.x - 8, d.y - 12, d.w + 16, 16);
  ART.steamCloud(ctx, { x: d.x + d.w * 0.2, y: d.y - 60, w: d.w * 0.6, h: 120, alpha: 0.12 }, 0);
};

ART.clothesline = (ctx, d) => {
  ctx.strokeStyle = 'rgba(230, 230, 220, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(d.x, d.y + 20);
  ctx.quadraticCurveTo(d.x + d.w / 2, d.y + 70, d.x + d.w, d.y + 24);
  ctx.stroke();
  for (let i = 0; i < 4; i += 1) {
    const px = d.x + 40 + i * (d.w / 4.4);
    const py = d.y + 30 + Math.sin((i / 4) * Math.PI) * 30;
    ctx.fillStyle = ['rgba(190,180,200,0.7)', 'rgba(200,170,150,0.7)', 'rgba(150,175,190,0.7)', 'rgba(190,190,160,0.7)'][i];
    ctx.fillRect(px, py, 34, 60 + i * 8);
  }
};

ART.satellite = (ctx, d, time = 0) => {
  const cx = d.x + d.w * 0.55;
  const cy = d.y + d.h * 0.32;
  const rx = d.w * 0.4;
  const ry = d.h * 0.26;

  // тень на полу
  contactShadow(ctx, d.x + d.w * 0.42, d.y + d.h - 4, d.w * 0.32, d.h * 0.05, 0.4);

  // стойка и растяжки
  ctx.strokeStyle = 'rgba(48, 50, 58, 0.95)';
  ctx.lineWidth = d.w * 0.035;
  ctx.beginPath();
  ctx.moveTo(d.x + d.w * 0.42, d.y + d.h);
  ctx.lineTo(cx - 6, cy + ry * 0.4);
  ctx.stroke();
  ctx.lineWidth = d.w * 0.014;
  ctx.strokeStyle = 'rgba(70, 72, 82, 0.85)';
  ctx.beginPath();
  ctx.moveTo(d.x + d.w * 0.18, d.y + d.h);
  ctx.lineTo(cx - 10, cy);
  ctx.moveTo(d.x + d.w * 0.66, d.y + d.h);
  ctx.lineTo(cx + 4, cy + ry * 0.5);
  ctx.stroke();

  // тарелка: вогнутая поверхность
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.42);
  const dish = ctx.createLinearGradient(-rx, -ry, rx, ry);
  dish.addColorStop(0, 'rgba(226, 230, 238, 0.95)');
  dish.addColorStop(0.45, 'rgba(176, 184, 196, 0.9)');
  dish.addColorStop(0.75, 'rgba(120, 128, 142, 0.92)');
  dish.addColorStop(1, 'rgba(72, 78, 92, 0.95)');
  ctx.fillStyle = dish;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // внутренние рёбра
  ctx.strokeStyle = 'rgba(96, 104, 118, 0.5)';
  ctx.lineWidth = 1.4;
  for (let i = 1; i <= 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * (i / 5), ry * (i / 5), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * rx, Math.sin(a) * ry);
    ctx.stroke();
  }

  // обод
  ctx.strokeStyle = 'rgba(232, 236, 244, 0.6)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  // конвертер на ножке
  ctx.strokeStyle = 'rgba(60, 64, 74, 0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(rx * 0.55, -ry * 0.5);
  ctx.stroke();
  ctx.fillStyle = '#2c3038';
  ctx.fillRect(rx * 0.5, -ry * 0.62, 9, 7);

  // блик
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.beginPath();
  ctx.ellipse(-rx * 0.25, -ry * 0.35, rx * 0.34, ry * 0.2, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

ART.dishBig = ART.satellite;

ART.stairBox = (ctx, d) => {
  // кирпичная будка выхода на крышу
  brickSurface(ctx, d.x, d.y, d.w, d.h, {
    base: '#3c3438',
    brick: '#4c4146',
    mortar: '#6a5e5e',
  });
  // светотень объёма
  const shade = ctx.createLinearGradient(d.x, 0, d.x + d.w, 0);
  shade.addColorStop(0, 'rgba(255,255,255,0.06)');
  shade.addColorStop(0.55, 'rgba(0,0,0,0.18)');
  shade.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = shade;
  ctx.fillRect(d.x, d.y, d.w, d.h);

  // плита сверху
  ctx.fillStyle = '#20191c';
  ctx.fillRect(d.x - 10, d.y - 14, d.w + 20, 16);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(d.x - 10, d.y - 14, d.w + 20, 3);

  // дверь с тёплым светом из щели
  const dw = d.w * 0.46;
  const dh = d.h * 0.6;
  const dx = d.x + d.w * 0.27;
  const dy = d.y + d.h - dh;
  const metal = ctx.createLinearGradient(dx, dy, dx + dw, dy);
  metal.addColorStop(0, '#4a4d52');
  metal.addColorStop(0.4, '#393c42');
  metal.addColorStop(1, '#26282d');
  ctx.fillStyle = metal;
  ctx.fillRect(dx, dy, dw, dh);
  ctx.strokeStyle = 'rgba(10, 10, 12, 0.8)';
  ctx.lineWidth = 2;
  ctx.strokeRect(dx, dy, dw, dh);
  ctx.fillStyle = 'rgba(255, 200, 130, 0.5)';
  ctx.fillRect(dx + 3, dy + dh - 4, dw - 6, 3);
  ctx.fillStyle = '#b9a888';
  ctx.beginPath();
  ctx.arc(dx + dw - 8, dy + dh * 0.55, 2.6, 0, Math.PI * 2);
  ctx.fill();

  contactShadow(ctx, d.x + d.w / 2, d.y + d.h - 2, d.w * 0.5, 12, 0.45);
};

ART.pigeons = (ctx, d, time) => {
  for (let i = 0; i < 5; i += 1) {
    const px = d.x + 12 + i * (d.w / 6);
    const py = d.y + d.h * 0.5 + Math.sin((time || 0) * 2 + i) * 2;
    ctx.fillStyle = 'rgba(150, 150, 160, 0.9)';
    ctx.beginPath();
    ctx.ellipse(px, py, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 8, py - 7, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(60,60,70,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px - 4, py + 7);
    ctx.lineTo(px - 4, py + 14);
    ctx.moveTo(px + 4, py + 7);
    ctx.lineTo(px + 4, py + 14);
    ctx.stroke();
  }
};

ART.parapet = (ctx, d) => {
  ctx.fillStyle = 'rgba(58, 56, 64, 0.98)';
  ctx.fillRect(d.x, d.y, d.w, d.h);
  ctx.fillStyle = 'rgba(255, 235, 210, 0.06)';
  ctx.fillRect(d.x, d.y, d.w, 8);
  ctx.strokeStyle = 'rgba(20,20,24,0.45)';
  ctx.lineWidth = 2;
  for (let x = d.x; x < d.x + d.w; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, d.y);
    ctx.lineTo(x, d.y + d.h);
    ctx.stroke();
  }
  surfaceGrain(ctx, d.x, d.y, d.w, d.h, 160, 0.04);
};

ART.antennaForest = (ctx, d) => {
  for (let i = 0; i < 6; i += 1) {
    const px = d.x + rnd(i) * d.w;
    const hh = d.h * (0.5 + rnd(i * 3) * 0.5);
    const top = d.y + d.h - hh;
    ctx.strokeStyle = 'rgba(60, 62, 70, 0.95)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(px, d.y + d.h);
    ctx.lineTo(px, top);
    ctx.stroke();
    for (let k = 0; k < 4; k += 1) {
      const yy = top + 14 + k * (hh / 6);
      ctx.beginPath();
      ctx.moveTo(px - 26 + k * 4, yy);
      ctx.lineTo(px + 26 - k * 4, yy);
      ctx.stroke();
    }
  }
};

ART.antennaFront = (ctx, d) => ART.antennaForest(ctx, { ...d, w: d.w * 0.4 });

ART.stars = (ctx, d, time) => {
  for (let i = 0; i < 90; i += 1) {
    const px = d.x + rnd(i) * d.w;
    const py = d.y + rnd(i * 3) * d.h;
    const tw = 0.3 + Math.abs(Math.sin((time || 0) * 0.7 + i)) * 0.7;
    ctx.fillStyle = `rgba(220, 225, 255, ${tw * 0.8})`;
    ctx.fillRect(px, py, 1.8, 1.8);
  }
};

ART.blackSun = (ctx, d, time) => {
  const g = ctx.createRadialGradient(d.x + d.w / 2, d.y + d.h / 2, d.w * 0.3, d.x + d.w / 2, d.y + d.h / 2, d.w * 0.7);
  g.addColorStop(0, 'rgba(0,0,0,0.95)');
  g.addColorStop(0.75, 'rgba(40, 30, 70, 0.6)');
  g.addColorStop(1, 'rgba(40, 30, 70, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(d.x + d.w / 2, d.y + d.h / 2, d.w * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#05050a';
  ctx.beginPath();
  ctx.arc(d.x + d.w / 2, d.y + d.h / 2, d.w * 0.34, 0, Math.PI * 2);
  ctx.fill();
  const ring = 0.4 + Math.sin((time || 0) * 0.8) * 0.2;
  ctx.strokeStyle = `rgba(190, 170, 255, ${ring})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(d.x + d.w / 2, d.y + d.h / 2, d.w * 0.36, 0, Math.PI * 2);
  ctx.stroke();
};

ART.shadowTrees = (ctx, d) => {
  for (let i = 0; i < 5; i += 1) {
    const px = d.x + rnd(i) * d.w;
    const hh = d.h * (0.4 + rnd(i * 3) * 0.6);
    ctx.strokeStyle = 'rgba(6, 6, 12, 0.9)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(px, d.y + d.h);
    ctx.lineTo(px, d.y + d.h - hh);
    ctx.stroke();
    ctx.lineWidth = 4;
    for (let k = 0; k < 4; k += 1) {
      ctx.beginPath();
      ctx.moveTo(px, d.y + d.h - hh * (0.4 + k * 0.15));
      ctx.lineTo(px + (k % 2 ? -1 : 1) * (20 + rnd(i + k) * 30), d.y + d.h - hh * (0.6 + k * 0.12));
      ctx.stroke();
    }
  }
};

ART.mirrorShards = (ctx, d) => {
  for (let i = 0; i < 7; i += 1) {
    const px = d.x + rnd(i) * d.w;
    const py = d.y + rnd(i * 3) * d.h;
    const s = 16 + rnd(i * 5) * 34;
    ctx.fillStyle = `rgba(200, 215, 255, ${0.1 + rnd(i) * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + s, py + s * 0.4);
    ctx.lineTo(px + s * 0.5, py + s);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 240, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
};

ART.mirrorShardFront = (ctx, d) => {
  ctx.fillStyle = 'rgba(180, 200, 240, 0.14)';
  ctx.beginPath();
  ctx.moveTo(d.x, d.y + d.h);
  ctx.lineTo(d.x + d.w * 0.6, d.y);
  ctx.lineTo(d.x + d.w, d.y + d.h * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(220, 235, 255, 0.3)';
  ctx.stroke();
};

ART.mirrorFloor = (ctx, d) => {
  const g = ctx.createLinearGradient(0, d.y, 0, d.y + d.h);
  g.addColorStop(0, 'rgba(30, 34, 52, 0.95)');
  g.addColorStop(1, 'rgba(12, 14, 26, 0.98)');
  ctx.fillStyle = g;
  ctx.fillRect(d.x, d.y, d.w, d.h);
  for (let i = 0; i < 12; i += 1) {
    ctx.fillStyle = 'rgba(160, 190, 240, 0.05)';
    ctx.fillRect(d.x + rnd(i) * d.w, d.y, 30 + rnd(i * 3) * 70, d.h);
  }
};

ART.mirrorWall = (ctx, d) => {
  const g = ctx.createLinearGradient(d.x, d.y, d.x + d.w, d.y + d.h);
  g.addColorStop(0, 'rgba(60, 70, 100, 0.55)');
  g.addColorStop(0.5, 'rgba(20, 24, 40, 0.75)');
  g.addColorStop(1, 'rgba(70, 80, 110, 0.45)');
  ctx.fillStyle = g;
  ctx.fillRect(d.x, d.y, d.w, d.h);
  ctx.strokeStyle = 'rgba(220, 230, 255, 0.12)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(d.x + (d.w / 5) * i, d.y);
    ctx.lineTo(d.x + (d.w / 5) * i + 24, d.y + d.h);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(30, 34, 52, 0.9)';
  ctx.lineWidth = 8;
  ctx.strokeRect(d.x, d.y, d.w, d.h);
};

ART.featherPile = (ctx, d) => {
  for (let i = 0; i < 16; i += 1) {
    const px = d.x + rnd(i) * d.w;
    const py = d.y + d.h - rnd(i * 3) * d.h * 0.6;
    ctx.strokeStyle = `rgba(${14 + rnd(i) * 20}, ${14 + rnd(i) * 20}, ${20 + rnd(i) * 26}, 0.9)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + 8, py - 10, px + 4, py - 18);
    ctx.stroke();
  }
};

ART.featherFront = (ctx, d, time) => {
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.rotate(Math.sin((time || 0) * 0.6) * 0.2);
  ctx.strokeStyle = 'rgba(240, 220, 170, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, d.h);
  ctx.quadraticCurveTo(10, d.h * 0.5, 0, 0);
  ctx.stroke();
  ctx.restore();
};

ART.fogBank = (ctx, d) => {
  const g = ctx.createLinearGradient(0, d.y, 0, d.y + d.h);
  g.addColorStop(0, 'rgba(120, 130, 170, 0)');
  g.addColorStop(0.6, 'rgba(120, 130, 170, 0.12)');
  g.addColorStop(1, 'rgba(120, 130, 170, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(d.x, d.y, d.w, d.h);
};

ART.cloudSea = (ctx, d, time) => {
  const g = ctx.createLinearGradient(0, d.y, 0, d.y + d.h);
  g.addColorStop(0, 'rgba(255, 190, 150, 0.15)');
  g.addColorStop(1, 'rgba(255, 235, 200, 0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(d.x, d.y, d.w, d.h);
  for (let i = 0; i < 14; i += 1) {
    const px = d.x + rnd(i) * d.w + Math.sin((time || 0) * 0.15 + i) * 14;
    const py = d.y + d.h * (0.2 + rnd(i * 3) * 0.7);
    const rad = 40 + rnd(i * 5) * 90;
    const cg = ctx.createRadialGradient(px, py, 4, px, py, rad);
    cg.addColorStop(0, 'rgba(255, 246, 228, 0.55)');
    cg.addColorStop(1, 'rgba(255, 246, 228, 0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fill();
  }
};

ART.giantNest = (ctx, d) => {
  ctx.save();
  ctx.strokeStyle = 'rgba(70, 52, 34, 0.95)';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.ellipse(d.x + d.w / 2, d.y + d.h * 0.55, d.w * 0.48, d.h * 0.42, 0, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 26; i += 1) {
    const a = rnd(i) * Math.PI * 2;
    const r1 = d.w * (0.3 + rnd(i * 3) * 0.2);
    const r2 = d.w * (0.36 + rnd(i * 5) * 0.16);
    ctx.strokeStyle = `rgba(${60 + rnd(i) * 40}, ${44 + rnd(i) * 30}, ${28 + rnd(i) * 20}, 0.85)`;
    ctx.lineWidth = 2 + rnd(i * 7) * 4;
    ctx.beginPath();
    ctx.moveTo(d.x + d.w / 2 + Math.cos(a) * r1, d.y + d.h * 0.55 + Math.sin(a) * r1 * 0.5);
    ctx.lineTo(d.x + d.w / 2 + Math.cos(a + 0.4) * r2, d.y + d.h * 0.55 + Math.sin(a + 0.4) * r2 * 0.5);
    ctx.stroke();
  }
  // золотые нити
  for (let i = 0; i < 8; i += 1) {
    ctx.strokeStyle = 'rgba(255, 210, 130, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(d.x + rnd(i) * d.w, d.y + rnd(i * 3) * d.h);
    ctx.quadraticCurveTo(d.x + d.w * 0.5, d.y + d.h * 0.5, d.x + rnd(i * 5) * d.w, d.y + rnd(i * 7) * d.h);
    ctx.stroke();
  }
  ctx.restore();
};

ART.nestTwigs = (ctx, d) => {
  for (let i = 0; i < 30; i += 1) {
    const px = d.x + rnd(i) * d.w;
    const py = d.y + rnd(i * 3) * d.h;
    ctx.strokeStyle = `rgba(${50 + rnd(i) * 40}, ${38 + rnd(i) * 30}, ${24 + rnd(i) * 20}, 0.8)`;
    ctx.lineWidth = 2 + rnd(i * 5) * 3;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + 20 + rnd(i * 7) * 30, py + 4);
    ctx.stroke();
  }
};

ART.goldThreads = (ctx, d) => {
  for (let i = 0; i < 14; i += 1) {
    ctx.strokeStyle = `rgba(255, 214, 138, ${0.06 + rnd(i) * 0.12})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(d.x + rnd(i) * d.w, d.y);
    ctx.bezierCurveTo(
      d.x + rnd(i * 3) * d.w,
      d.y + d.h * 0.4,
      d.x + rnd(i * 5) * d.w,
      d.y + d.h * 0.7,
      d.x + rnd(i * 7) * d.w,
      d.y + d.h,
    );
    ctx.stroke();
  }
};

ART.floatingFeathers = (ctx, d, time) => {
  for (let i = 0; i < 12; i += 1) {
    const px = d.x + rnd(i) * d.w + Math.sin((time || 0) * 0.4 + i) * 20;
    const py = d.y + ((rnd(i * 3) * d.h + (time || 0) * 8) % d.h);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.sin((time || 0) * 0.5 + i) * 0.5);
    ctx.strokeStyle = 'rgba(255, 220, 150, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(8, -8, 4, -16);
    ctx.stroke();
    ctx.restore();
  }
};

ART.sunRays = (ctx, d, time) => {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i += 1) {
    const a = -0.6 + i * 0.18 + Math.sin((time || 0) * 0.2) * 0.02;
    const g = ctx.createLinearGradient(d.x, d.y, d.x + Math.cos(a) * d.w, d.y + Math.sin(a) * d.h);
    g.addColorStop(0, 'rgba(255, 220, 160, 0.16)');
    g.addColorStop(1, 'rgba(255, 220, 160, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x + Math.cos(a) * d.w, d.y + Math.sin(a) * d.h);
    ctx.lineTo(d.x + Math.cos(a + 0.06) * d.w, d.y + Math.sin(a + 0.06) * d.h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
};

ART.sunRising = (ctx, d, time) => {
  const glow = ctx.createRadialGradient(d.x + d.w / 2, d.y + d.h * 0.55, 10, d.x + d.w / 2, d.y + d.h * 0.55, d.w * 0.9);
  glow.addColorStop(0, 'rgba(255, 240, 200, 0.8)');
  glow.addColorStop(0.35, 'rgba(255, 190, 120, 0.3)');
  glow.addColorStop(1, 'rgba(255, 190, 120, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(d.x - d.w, d.y - d.h, d.w * 3, d.h * 3);
  ctx.fillStyle = '#fff3d0';
  ctx.beginPath();
  ctx.arc(d.x + d.w / 2, d.y + d.h * 0.62, d.w * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ART.sunRays(ctx, { x: d.x + d.w / 2, y: d.y + d.h * 0.62, w: d.w, h: d.h }, time);
};

ART.dawnGlow = (ctx, d) => {
  const g = ctx.createRadialGradient(d.x + d.w * 0.62, d.y + d.h * 0.55, 20, d.x + d.w * 0.62, d.y + d.h * 0.55, d.w * 0.6);
  g.addColorStop(0, 'rgba(255, 220, 160, 0.22)');
  g.addColorStop(1, 'rgba(255, 220, 160, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(d.x, d.y, d.w, d.h);
};

// ------------------------------------------------------------------ отрисовка

export function drawDecorItem(ctx, item, time = 0, palette = null) {
  const painter = ART[item.art];
  if (!painter) return;
  ctx.save();
  if (item.alpha !== undefined) ctx.globalAlpha *= item.alpha;
  painter(ctx, item, time, palette);
  ctx.restore();
}

/** Задний план комнаты: всё, что рисуется до предметов. */
export function drawBackDecor(ctx, room, time) {
  const items = room.decor?.back || [];
  for (const item of items) drawDecorItem(ctx, item, time);
}

/**
 * Передний план: рисуется в экранных координатах поверх сцены,
 * со своим параллаксом — так появляется глубина кадра.
 */
export function drawFrontDecor(ctx, room, cameraX, viewWidth, time) {
  const items = room.decor?.front || [];
  if (!items.length) return;
  for (const item of items) {
    const factor = item.parallax ?? 1.15;
    const x = item.x - cameraX * factor;
    if (x + item.w < -120 || x > viewWidth + 120) continue;
    ctx.save();
    if (item.alpha !== undefined) ctx.globalAlpha *= item.alpha;
    // Передний план не должен закрывать Чики: если предмет попадает
    // в полосу, где он ходит, рисуем только его нижнюю часть.
    const walkBand = item.y < room.floorY - 30 && item.y + item.h > room.floorY + 10;
    if (walkBand && !item.overlay) {
      ctx.beginPath();
      ctx.rect(x - 4, room.floorY - 18, item.w + 8, 720 - room.floorY + 18);
      ctx.clip();
    }
    drawDecorItem(ctx, { ...item, x }, time);
    ctx.restore();
  }
}

export const DECOR_ARTS = ART;
