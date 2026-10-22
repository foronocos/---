/**
 * Фоны и предметы шести новых глав.
 * Каждая сцена строится слоями: пол, свет, дальний план; фактура стен
 * и мелкий декор приходят из `decor.js` по данным комнаты.
 */

import {
  bloom,
  cobweb,
  contactShadow,
  fabricSurface,
  lampGlow,
  lightBeam,
  metalSurface,
  surfaceGrain,
} from './textures.js';
import {
  cloudSea,
  eclipseDisc,
  farCity,
  floorPlane,
  gradientFill,
  lampBulb,
  lightCone,
  metalDoor,
  pipeRun,
  roofBeams,
  starField,
  stairFlight,
  wallPlane,
  windowGlow,
} from './roomKit.js';
import { BOSS_SPRITES } from './spritesB.js';
import { drawFeather } from './sprites.js';

const rand = (seed) => {
  const x = Math.sin(seed * 45.13 + 7.7) * 43758.5453;
  return x - Math.floor(x);
};
const rnd = rand;

// ------------------------------------------------------------------- глава V

/** Подъезд: кафель, лестница, перила, лампочка на проводе. */
function drawStairsBackground(ctx, room, palette, time) {
  const w = room.width;
  const fy = room.floorY;
  wallPlane(ctx, 0, 0, w, fy, {
    kind: 'tile',
    base: palette.wall,
    deep: palette.wallDeep,
    accent: palette.floor,
    seed: 5,
    wear: 0.8,
  });

  metalDoor(ctx, 140, fy - 330, 180, 330, {
    base: '#4a3f38',
    accent: '#c9a76a',
    glow: 'rgba(255, 196, 120, 0.10)',
    label: 'КВ. 12',
  });
  lightCone(ctx, 230, fy - 300, 320, 300, 'rgba(255, 200, 140, 0.10)', 0.6);
  windowGlow(ctx, 230, fy - 240, 220, 120, 'rgba(255, 200, 140, 0.13)');

  stairFlight(ctx, w * 0.5, fy - 60, 7, {
    width: 340,
    rise: 46,
    run: 78,
    base: palette.floor,
    deep: palette.floorDeep,
    dir: 1,
  });

  // перила: наклонная труба и балясины
  ctx.save();
  ctx.strokeStyle = 'rgba(24, 26, 28, 0.9)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, fy - 140);
  ctx.lineTo(w * 0.5 + 560, fy - 140 - 322);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(220, 224, 220, 0.22)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, fy - 144);
  ctx.lineTo(w * 0.5 + 560, fy - 144 - 322);
  ctx.stroke();
  for (let i = 0; i < 9; i += 1) {
    const px = w * 0.5 + i * 62;
    const py = fy - 140 - i * 35.8;
    ctx.strokeStyle = 'rgba(30, 32, 34, 0.75)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - 92);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = '#000';
  for (let i = 0; i < 9; i += 1) {
    const px = w * 0.5 + i * 62 + 26;
    const py = fy - 140 - i * 35.8 + 6;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + 24, py - 96);
    ctx.stroke();
  }
  ctx.restore();

  lampBulb(ctx, w * 0.3, 150, time, 'rgba(255, 214, 150, 0.9)');
  lightCone(ctx, w * 0.3, 160, 420, fy - 160, 'rgba(255, 214, 160, 0.11)', 0.55);

  floorPlane(ctx, 0, fy, w, 720 - fy, {
    kind: 'tile',
    base: palette.floor,
    deep: palette.floorDeep,
    rows: 6,
    cells: 26,
    wet: 0.14,
    seed: 12,
    glossColor: 'rgba(220, 200, 160, 0.12)',
  });

  const pool = ctx.createRadialGradient(w * 0.3, fy + 20, 10, w * 0.3, fy + 20, 320);
  pool.addColorStop(0, 'rgba(255, 214, 160, 0.18)');
  pool.addColorStop(1, 'rgba(255, 214, 160, 0)');
  ctx.fillStyle = pool;
  ctx.beginPath();
  ctx.ellipse(w * 0.3, fy + 30, 320, 70, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Площадка: лифт, окно с решёткой, лампочка. */
function drawLandingBackground(ctx, room, palette, time) {
  const w = room.width;
  const fy = room.floorY;
  wallPlane(ctx, 0, 0, w, fy, {
    kind: 'plaster',
    base: palette.wall,
    deep: palette.wallDeep,
    accent: palette.floor,
    seed: 9,
    wear: 0.6,
  });

  metalDoor(ctx, w * 0.42, fy - 380, 300, 380, {
    base: '#4d565a',
    accent: '#9fb4b6',
    glow: 'rgba(150, 210, 205, 0.08)',
  });
  ctx.save();
  ctx.strokeStyle = 'rgba(10, 12, 14, 0.8)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(w * 0.42 + 150, fy - 380);
  ctx.lineTo(w * 0.42 + 150, fy);
  ctx.stroke();
  ctx.restore();
  lightCone(ctx, w * 0.42 + 150, fy - 380, 260, 380, 'rgba(180, 230, 220, 0.07)', 0.5);

  const wx = w * 0.68;
  const wy = fy - 400;
  ctx.save();
  gradientFill(ctx, wx, wy, 260, 240, [
    [0, '#101a2c'],
    [0.6, '#22304a'],
    [1, '#3c4a68'],
  ]);
  starField(ctx, wx, wy, 260, 200, 3, 0.8, 30);
  const moon = ctx.createRadialGradient(wx + 190, wy + 60, 4, wx + 190, wy + 60, 80);
  moon.addColorStop(0, 'rgba(238, 244, 255, 0.9)');
  moon.addColorStop(0.25, 'rgba(200, 220, 255, 0.25)');
  moon.addColorStop(1, 'rgba(160, 190, 255, 0)');
  ctx.fillStyle = moon;
  ctx.fillRect(wx, wy, 260, 240);
  ctx.strokeStyle = 'rgba(14, 16, 20, 0.92)';
  ctx.lineWidth = 7;
  for (let i = 1; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(wx + (260 / 4) * i, wy);
    ctx.lineTo(wx + (260 / 4) * i, wy + 240);
    ctx.stroke();
  }
  for (let i = 1; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(wx, wy + (240 / 3) * i);
    ctx.lineTo(wx + 260, wy + (240 / 3) * i);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(180, 200, 220, 0.25)';
  ctx.lineWidth = 3;
  ctx.strokeRect(wx - 6, wy - 6, 272, 252);
  ctx.restore();
  windowGlow(ctx, wx, wy, 260, 240, 'rgba(160, 200, 255, 0.16)');
  lightCone(ctx, wx + 130, wy + 240, 520, fy - wy - 200, 'rgba(170, 205, 255, 0.08)', 0.8);

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#050810';
  for (let i = 0; i < 7; i += 1) {
    ctx.fillRect(wx - 40 + i * 54 + 40, fy + 10, 16, 100);
  }
  ctx.restore();

  lampBulb(ctx, w * 0.22, 140, time, 'rgba(255, 222, 170, 0.85)');
  lightCone(ctx, w * 0.22, 150, 460, fy - 150, 'rgba(255, 220, 170, 0.10)', 0.5);

  floorPlane(ctx, 0, fy, w, 720 - fy, {
    kind: 'tile',
    base: palette.floor,
    deep: palette.floorDeep,
    rows: 6,
    cells: 24,
    wet: 0.18,
    seed: 21,
    glossColor: 'rgba(150, 200, 220, 0.14)',
  });
}

// ------------------------------------------------------------------ глава VI

/** Подвал: кирпич, трубы, лужи, холодный свет из люка. */
function drawBasementBackground(ctx, room, palette, time) {
  const w = room.width;
  const fy = room.floorY;
  wallPlane(ctx, 0, 0, w, fy, {
    kind: 'brick',
    base: palette.wall,
    deep: palette.wallDeep,
    accent: palette.floor,
    seed: 4,
    wear: 1,
  });

  const lx = w * 0.1;
  ctx.save();
  gradientFill(ctx, lx, 0, 150, 34, [
    [0, 'rgba(200, 226, 240, 0.55)'],
    [1, 'rgba(120, 160, 180, 0.12)'],
  ]);
  ctx.restore();
  lightCone(ctx, lx + 75, 30, 520, fy - 30, 'rgba(170, 210, 230, 0.10)', 0.75);

  pipeRun(ctx, { x: w * 0.42, y: 60, length: fy - 90, radius: 15, base: '#5d6a63', deep: '#222b26', time, flanges: 4, drips: true });
  pipeRun(ctx, { x: w * 0.42 + 46, y: 60, length: fy - 120, radius: 8, base: '#7a6a55', deep: '#2b2620', time: time + 1, flanges: 6, drips: false });

  ctx.save();
  ctx.fillStyle = 'rgba(10, 12, 14, 0.65)';
  ctx.fillRect(w * 0.6, 120, 150, 96);
  ctx.fillStyle = 'rgba(120, 140, 150, 0.22)';
  for (let i = 0; i < 7; i += 1) ctx.fillRect(w * 0.6 + 8, 128 + i * 13, 134, 5);
  ctx.restore();

  ctx.save();
  for (let i = 0; i < 12; i += 1) {
    const px = rand(i * 3.3) * w;
    const g = ctx.createLinearGradient(0, fy - 120, 0, fy);
    g.addColorStop(0, 'rgba(40, 60, 46, 0)');
    g.addColorStop(1, `rgba(36, 58, 44, ${0.12 + rand(i) * 0.16})`);
    ctx.fillStyle = g;
    ctx.fillRect(px, fy - 120, 40 + rand(i * 2) * 70, 120);
  }
  ctx.restore();

  cobweb(ctx, 40, 40, 190, 'rgba(210, 215, 220, 0.22)');

  floorPlane(ctx, 0, fy, w, 720 - fy, {
    kind: 'stone',
    base: palette.floor,
    deep: palette.floorDeep,
    rows: 6,
    cells: 20,
    wet: 0.34,
    seed: 33,
    glossColor: 'rgba(140, 190, 190, 0.16)',
  });

  for (let i = 0; i < 4; i += 1) {
    const px = 180 + rand(i * 3) * (w - 360);
    const py = fy + 42 + rand(i * 7) * 46;
    const rx = 90 + rand(i * 5) * 90;
    const g = ctx.createRadialGradient(px, py, 2, px, py, rx);
    g.addColorStop(0, 'rgba(150, 195, 200, 0.22)');
    g.addColorStop(0.7, 'rgba(110, 150, 160, 0.08)');
    g.addColorStop(1, 'rgba(110, 150, 160, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(px, py, rx, rx * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Котельная: топка, жар, пар, вентиль. */
function drawBoilerBackground(ctx, room, palette, time) {
  const w = room.width;
  const fy = room.floorY;
  wallPlane(ctx, 0, 0, w, fy, {
    kind: 'brick',
    base: '#4d3f39',
    deep: '#241d1c',
    accent: '#6a564a',
    seed: 7,
    wear: 1,
  });

  const flicker = 0.82 + Math.sin(time * 3.1) * 0.1 + Math.sin(time * 7.3) * 0.05;
  const fx = w * 0.66;
  const heat = ctx.createRadialGradient(fx + 120, fy - 130, 20, fx + 120, fy - 130, 460);
  heat.addColorStop(0, `rgba(255, 160, 70, ${0.34 * flicker})`);
  heat.addColorStop(0.4, `rgba(220, 90, 30, ${0.14 * flicker})`);
  heat.addColorStop(1, 'rgba(200, 80, 30, 0)');
  ctx.fillStyle = heat;
  ctx.fillRect(fx - 340, fy - 500, 900, 620);

  ctx.save();
  ctx.fillStyle = 'rgba(18, 14, 12, 0.92)';
  ctx.fillRect(fx, fy - 240, 250, 240);
  const fire = ctx.createLinearGradient(fx, fy - 120, fx, fy);
  fire.addColorStop(0, `rgba(255, 200, 90, ${0.9 * flicker})`);
  fire.addColorStop(0.5, `rgba(255, 120, 40, ${0.8 * flicker})`);
  fire.addColorStop(1, 'rgba(120, 40, 10, 0.9)');
  ctx.fillStyle = fire;
  ctx.beginPath();
  ctx.moveTo(fx + 16, fy - 10);
  ctx.quadraticCurveTo(fx + 60, fy - 150, fx + 120, fy - 40);
  ctx.quadraticCurveTo(fx + 180, fy - 170, fx + 236, fy - 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.lineWidth = 6;
  ctx.strokeRect(fx, fy - 240, 250, 240);
  ctx.restore();

  pipeRun(ctx, { x: w * 0.2, y: 70, length: w * 0.34, radius: 16, axis: 'h', base: '#6a5b4c', deep: '#241d18', time, flanges: 5, drips: false });
  pipeRun(ctx, { x: w * 0.14, y: 90, length: fy - 140, radius: 13, base: '#5a5a56', deep: '#1e1e1c', time: time + 2, flanges: 3, drips: true });

  cloudSea(ctx, 0, fy - 320, w, 300, time, { color: 'rgba(255, 240, 225, 0.10)', count: 9 });
  bloom(ctx, fx + 120, fy - 120, 320, 'rgba(255, 150, 60, 0.16)');

  ctx.save();
  ctx.strokeStyle = 'rgba(180, 160, 130, 0.5)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(w * 0.5, fy - 250, 44, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 5;
  for (let i = 0; i < 3; i += 1) {
    const a = (i / 3) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(w * 0.5 - Math.cos(a) * 44, fy - 250 - Math.sin(a) * 44);
    ctx.lineTo(w * 0.5 + Math.cos(a) * 44, fy - 250 + Math.sin(a) * 44);
    ctx.stroke();
  }
  ctx.restore();

  floorPlane(ctx, 0, fy, w, 720 - fy, {
    kind: 'stone',
    base: '#5b4f45',
    deep: '#241d19',
    rows: 6,
    cells: 22,
    wet: 0.12,
    seed: 44,
    glossColor: 'rgba(255, 170, 90, 0.14)',
  });

  surfaceGrain(ctx, 0, fy - 6, w, 26, 200, 0.2);
}

// ----------------------------------------------------------------- глава VII

/** Чердак: стропила, доски, слуховое окно, пыль в луче. */
function drawAtticBackground(ctx, room, palette, time) {
  const w = room.width;
  const fy = room.floorY;
  wallPlane(ctx, 0, 0, w, fy, {
    kind: 'wood',
    base: palette.wall,
    deep: palette.wallDeep,
    accent: palette.floor,
    seed: 11,
    wear: 0.9,
  });
  roofBeams(ctx, 0, 0, w, fy * 0.55, time, '#241c18');
  ctx.save();
  ctx.fillStyle = 'rgba(8, 7, 9, 0.55)';
  ctx.fillRect(0, fy * 0.5, w, 60);
  ctx.restore();

  const wx = w * 0.58;
  const wy = fy - 360;
  ctx.save();
  const sky = ctx.createLinearGradient(wx, wy, wx, wy + 170);
  sky.addColorStop(0, '#1b2438');
  sky.addColorStop(1, '#4a5570');
  ctx.fillStyle = sky;
  ctx.beginPath();
  ctx.moveTo(wx, wy + 170);
  ctx.lineTo(wx, wy + 70);
  ctx.quadraticCurveTo(wx + 80, wy - 20, wx + 160, wy + 70);
  ctx.lineTo(wx + 160, wy + 170);
  ctx.closePath();
  ctx.fill();
  starField(ctx, wx + 10, wy + 70, 140, 90, 3, 0.9, 26);
  ctx.strokeStyle = 'rgba(15, 12, 12, 0.95)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(wx + 80, wy + 50);
  ctx.lineTo(wx + 80, wy + 170);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(20, 16, 14, 0.9)';
  ctx.lineWidth = 6;
  ctx.strokeRect(wx - 6, wy + 58, 172, 118);
  ctx.restore();
  lightCone(ctx, wx + 80, wy + 170, 460, fy - wy - 120, 'rgba(190, 215, 255, 0.12)', 0.7);

  ctx.save();
  for (let i = 0; i < 2; i += 1) {
    const sy = fy - 250 - i * 120;
    gradientFill(ctx, w * 0.12, sy, 280, 14, [
      [0, '#6b5a44'],
      [1, '#332a22'],
    ]);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(w * 0.12, sy + 14, 280, 5);
  }
  ctx.restore();

  cobweb(ctx, w * 0.86, 60, 220, 'rgba(220, 220, 226, 0.18)');
  cobweb(ctx, w * 0.04, 90, 170, 'rgba(220, 220, 226, 0.15)');

  floorPlane(ctx, 0, fy, w, 720 - fy, {
    kind: 'board',
    base: palette.floor,
    deep: palette.floorDeep,
    rows: 5,
    cells: 30,
    wet: 0.06,
    seed: 55,
    glossColor: 'rgba(200, 220, 255, 0.1)',
  });
  surfaceGrain(ctx, 0, fy, w, 720 - fy, 300, 0.14);
}

/** Сундучный угол: теплее, ткань, пыль. */
function drawTrunksBackground(ctx, room, palette, time) {
  drawAtticBackground(ctx, room, palette, time);
  const w = room.width;
  const fy = room.floorY;
  const warm = ctx.createRadialGradient(w * 0.7, fy - 300, 30, w * 0.7, fy - 300, 620);
  warm.addColorStop(0, 'rgba(255, 198, 132, 0.22)');
  warm.addColorStop(0.5, 'rgba(255, 170, 100, 0.08)');
  warm.addColorStop(1, 'rgba(255, 170, 100, 0)');
  ctx.fillStyle = warm;
  ctx.fillRect(0, 0, w, 720);

  ctx.save();
  for (let i = 0; i < 5; i += 1) {
    const px = w * 0.18 + i * 62;
    const sway = Math.sin(time * 0.6 + i) * 4;
    const g = ctx.createLinearGradient(px, 120, px + 40, 380);
    g.addColorStop(0, ['rgba(120, 70, 80, 0.5)', 'rgba(80, 90, 120, 0.5)', 'rgba(140, 120, 90, 0.5)'][i % 3]);
    g.addColorStop(1, 'rgba(20, 16, 22, 0.2)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(px, 116);
    ctx.lineTo(px + 38, 116);
    ctx.quadraticCurveTo(px + 44 + sway, 260, px + 30 + sway, 372);
    ctx.lineTo(px + 6 + sway, 372);
    ctx.quadraticCurveTo(px - 4 + sway, 250, px, 116);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- глава VIII

/** Крыша: закатное небо, город, парапет, антенны. */
function drawRoofBackground(ctx, room, palette, time) {
  const w = room.width;
  const fy = room.floorY;

  gradientFill(ctx, 0, 0, w, fy, [
    [0, '#14142a'],
    [0.3, '#3b3054'],
    [0.62, '#7d4f63'],
    [0.85, '#c47a63'],
    [1, '#e6a374'],
  ]);
  starField(ctx, 0, 0, w, 320, 5, 0.75, 90);

  // тёплое свечение всего горизонта: работает при любой камере
  gradientFill(ctx, 0, fy - 320, w, 320, [
    [0, 'rgba(255, 170, 120, 0)'],
    [0.55, 'rgba(255, 168, 118, 0.10)'],
    [1, 'rgba(255, 190, 140, 0.22)'],
  ]);

  const sx = w * 0.78;
  const sy = fy - 90;
  const sun = ctx.createRadialGradient(sx, sy, 6, sx, sy, 420);
  sun.addColorStop(0, 'rgba(255, 214, 150, 0.55)');
  sun.addColorStop(0.25, 'rgba(255, 170, 110, 0.22)');
  sun.addColorStop(1, 'rgba(255, 150, 110, 0)');
  ctx.fillStyle = sun;
  ctx.fillRect(sx - 420, sy - 420, 840, 840);

  farCity(ctx, 0, fy - 300, w, 300, { layers: 3, color: 'rgba(30, 24, 44, 0.92)', light: '#ffd08a', seed: 13 });
  cloudSea(ctx, 0, fy - 330, w, 260, time, { color: 'rgba(255, 200, 175, 0.20)', count: 12 });

  ctx.save();
  gradientFill(ctx, 0, fy - 90, w, 92, [
    [0, '#6d5b57'],
    [0.2, '#4a3d3c'],
    [1, '#241e20'],
  ]);
  ctx.fillStyle = 'rgba(255, 200, 150, 0.14)';
  ctx.fillRect(0, fy - 90, w, 4);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, fy - 12, w, 12);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 2;
  for (let px = 0; px < w; px += 180) {
    ctx.beginPath();
    ctx.moveTo(px, fy - 90);
    ctx.lineTo(px, fy - 12);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(16, 14, 22, 0.9)';
  for (let i = 0; i < 4; i += 1) {
    const ax = w * 0.08 + i * (w * 0.22);
    const ah = 150 + rand(i) * 90;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(ax, fy - 90);
    ctx.lineTo(ax, fy - 90 - ah);
    ctx.stroke();
    ctx.lineWidth = 2;
    for (let j = 1; j < 4; j += 1) {
      ctx.beginPath();
      ctx.moveTo(ax - 26 + j * 4, fy - 90 - ah + j * 18);
      ctx.lineTo(ax + 26 - j * 4, fy - 90 - ah + j * 18);
      ctx.stroke();
    }
  }
  ctx.restore();

  floorPlane(ctx, 0, fy, w, 720 - fy, {
    kind: 'stone',
    base: '#4f4548',
    deep: '#221d22',
    rows: 5,
    cells: 18,
    wet: 0.1,
    seed: 66,
    glossColor: 'rgba(255, 180, 140, 0.14)',
  });
}

/** Антенное поле: холоднее, провода, далёкие вышки. */
function drawAntennasBackground(ctx, room, palette, time) {
  const w = room.width;
  const fy = room.floorY;

  gradientFill(ctx, 0, 0, w, fy, [
    [0, '#0b0d1c'],
    [0.35, '#1c2340'],
    [0.7, '#3a3f63'],
    [1, '#6d6a86'],
  ]);
  starField(ctx, 0, 0, w, 380, 17, 0.9, 110);

  const sx = w * 0.24;
  const sy = fy - 120;
  const moon = ctx.createRadialGradient(sx, sy, 4, sx, sy, 300);
  moon.addColorStop(0, 'rgba(220, 232, 255, 0.35)');
  moon.addColorStop(0.2, 'rgba(170, 195, 255, 0.12)');
  moon.addColorStop(1, 'rgba(140, 170, 255, 0)');
  ctx.fillStyle = moon;
  ctx.fillRect(sx - 300, sy - 300, 600, 600);

  gradientFill(ctx, 0, fy - 300, w, 300, [
    [0, 'rgba(150, 180, 255, 0)'],
    [1, 'rgba(170, 195, 255, 0.12)'],
  ]);
  farCity(ctx, 0, fy - 260, w, 260, {
    layers: 2,
    color: 'rgba(14, 16, 30, 0.9)',
    light: '#9fc2e8',
    seed: 23,
    windowChance: 0.2,
  });

  ctx.save();
  ctx.strokeStyle = 'rgba(10, 12, 20, 0.85)';
  for (let i = 0; i < 5; i += 1) {
    const tx = 120 + i * (w / 5);
    const th = 190 + rand(i * 3) * 130;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tx - 34, fy - 60);
    ctx.lineTo(tx, fy - 60 - th);
    ctx.lineTo(tx + 34, fy - 60);
    ctx.stroke();
    ctx.lineWidth = 1.6;
    for (let j = 1; j < 5; j += 1) {
      const yy = fy - 60 - (th / 5) * j;
      const half = 34 * (1 - j / 5);
      ctx.beginPath();
      ctx.moveTo(tx - half, yy);
      ctx.lineTo(tx + half, yy);
      ctx.stroke();
    }
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(10, 12, 18, 0.7)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    const yy = 90 + i * 26;
    ctx.beginPath();
    ctx.moveTo(0, yy);
    ctx.bezierCurveTo(w * 0.33, yy + 40 + Math.sin(time * 0.4 + i) * 5, w * 0.66, yy - 26, w, yy + 12);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  gradientFill(ctx, 0, fy - 46, w, 48, [
    [0, 'rgba(90, 96, 110, 0.9)'],
    [1, 'rgba(20, 22, 32, 0.95)'],
  ]);
  ctx.fillStyle = 'rgba(180, 200, 230, 0.12)';
  ctx.fillRect(0, fy - 46, w, 3);
  ctx.restore();

  floorPlane(ctx, 0, fy, w, 720 - fy, {
    kind: 'stone',
    base: '#3f4148',
    deep: '#191b22',
    rows: 5,
    cells: 16,
    wet: 0.14,
    seed: 88,
    glossColor: 'rgba(170, 200, 255, 0.14)',
  });
}

// ------------------------------------------------------------------ глава IX

/** Затмение: диск, звёзды, обрыв крыши. */
function drawEclipseBackground(ctx, room, palette, time) {
  const w = room.width;
  const fy = room.floorY;

  gradientFill(ctx, 0, 0, w, fy, [
    [0, '#03040a'],
    [0.45, '#0a0b16'],
    [0.8, '#1a1526'],
    [1, '#2b1f30'],
  ]);
  starField(ctx, 0, 0, w, fy - 60, 31, 1, 150);
  eclipseDisc(ctx, w * 0.62, fy - 340, 118, 0.9);

  gradientFill(ctx, 0, fy - 220, w, 220, [
    [0, 'rgba(120, 110, 200, 0)'],
    [1, 'rgba(130, 110, 190, 0.12)'],
  ]);
  farCity(ctx, 0, fy - 200, w, 200, {
    layers: 2,
    color: 'rgba(8, 9, 18, 0.95)',
    light: '#7f9cc8',
    seed: 41,
    windowChance: 0.12,
  });
  cloudSea(ctx, 0, fy - 260, w, 200, time, { color: 'rgba(150, 130, 210, 0.08)', count: 7 });

  ctx.save();
  gradientFill(ctx, 0, fy - 70, w, 72, [
    [0, 'rgba(38, 34, 48, 0.95)'],
    [1, 'rgba(10, 9, 14, 0.98)'],
  ]);
  ctx.fillStyle = 'rgba(170, 150, 220, 0.14)';
  ctx.fillRect(0, fy - 70, w, 3);
  ctx.restore();

  floorPlane(ctx, 0, fy, w, 720 - fy, {
    kind: 'stone',
    base: '#2c2838',
    deep: '#0f0d16',
    rows: 5,
    cells: 16,
    wet: 0.2,
    seed: 77,
    glossColor: 'rgba(170, 160, 240, 0.16)',
  });

  ctx.save();
  for (let i = 0; i < 5; i += 1) {
    const px = (rand(i * 4) * w + time * 18) % w;
    const py = 140 + rand(i * 9) * 300;
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#f4e9ce';
    ctx.beginPath();
    ctx.ellipse(px, py, 10, 3, rand(i) * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Зеркальная площадка: пол отражает небо. */
function drawMirrorRoofBackground(ctx, room, palette, time) {
  const w = room.width;
  const fy = room.floorY;

  gradientFill(ctx, 0, 0, w, fy, [
    [0, '#04050d'],
    [0.5, '#0e1122'],
    [1, '#232742'],
  ]);
  starField(ctx, 0, 0, w, fy, 53, 1, 170);
  eclipseDisc(ctx, w * 0.34, fy - 330, 96, 0.65);

  ctx.save();
  ctx.translate(0, fy * 2);
  ctx.scale(1, -1);
  gradientFill(ctx, 0, 0, w, fy, [
    [0, 'rgba(6, 8, 18, 0.2)'],
    [1, 'rgba(30, 36, 60, 0.75)'],
  ]);
  starField(ctx, 0, 0, w, fy, 53, 0.45, 120);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(160, 180, 230, 0.12)';
  ctx.lineWidth = 1.4;
  const cx = w * 0.5;
  for (let c = 0; c <= 16; c += 1) {
    const bx = (c / 16) * w;
    const tx = cx + (bx - cx) * 0.4;
    ctx.beginPath();
    ctx.moveTo(tx, fy);
    ctx.lineTo(bx, 720);
    ctx.stroke();
  }
  for (let r = 1; r <= 6; r += 1) {
    const yy = fy + (720 - fy) * Math.pow(r / 6, 1.7);
    ctx.beginPath();
    ctx.moveTo(0, yy);
    ctx.lineTo(w, yy);
    ctx.stroke();
  }
  ctx.restore();

  gradientFill(ctx, 0, fy, w, 60, [
    [0, 'rgba(200, 220, 255, 0.22)'],
    [1, 'rgba(200, 220, 255, 0)'],
  ]);

  for (let i = 0; i < 10; i += 1) {
    const px = rand(i * 7) * w;
    const pw = 30 + rand(i * 3) * 60;
    const g = ctx.createLinearGradient(0, fy, 0, 720);
    g.addColorStop(0, `rgba(170, 200, 255, ${0.10 + rand(i) * 0.06})`);
    g.addColorStop(1, 'rgba(170, 200, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(px, fy, pw, 720 - fy);
  }
}

// ------------------------------------------------------------------- глава X

/** Гнездо: рассвет, облака, прутья, яйца. */
function drawNestBackground(ctx, room, palette, time) {
  const w = room.width;
  const fy = room.floorY;

  gradientFill(ctx, 0, 0, w, fy, [
    [0, '#241f3c'],
    [0.28, '#5b3f62'],
    [0.58, '#b56a63'],
    [0.82, '#e79a6a'],
    [1, '#f6c98a'],
  ]);

  const sunX = w * 0.55;
  const sunY = fy - 150;
  const sun = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 480);
  sun.addColorStop(0, 'rgba(255, 246, 214, 0.85)');
  sun.addColorStop(0.18, 'rgba(255, 214, 150, 0.35)');
  sun.addColorStop(1, 'rgba(255, 190, 130, 0)');
  ctx.fillStyle = sun;
  ctx.fillRect(sunX - 480, sunY - 480, 960, 960);

  farCity(ctx, 0, fy - 170, w, 180, {
    layers: 2,
    color: 'rgba(74, 52, 70, 0.55)',
    light: '#ffd9a0',
    seed: 61,
    windowChance: 0.25,
  });
  cloudSea(ctx, 0, fy - 260, w, 260, time, { color: 'rgba(255, 236, 214, 0.30)', count: 16 });

  // край гнезда: прутья внахлёст
  ctx.save();
  const nestTop = fy - 26;
  gradientFill(ctx, 0, nestTop, w, 720 - nestTop, [
    [0, 'rgba(96, 66, 42, 0.96)'],
    [0.4, 'rgba(58, 40, 28, 0.98)'],
    [1, 'rgba(26, 18, 14, 1)'],
  ]);
  for (let i = 0; i < 46; i += 1) {
    const px = rand(i * 3.1) * w;
    const py = nestTop + 6 + rand(i * 7.7) * 96;
    const len = 70 + rand(i * 5.3) * 160;
    const tilt = (rand(i * 9.1) - 0.5) * 0.5;
    ctx.strokeStyle = `rgba(${120 + rand(i) * 60}, ${88 + rand(i * 2) * 40}, ${52 + rand(i * 3) * 26}, 0.55)`;
    ctx.lineWidth = 2 + rand(i * 4) * 3.4;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(tilt) * len, py + Math.sin(tilt) * len * 0.3 + 8);
    ctx.stroke();
  }
  // верхняя кромка гнезда светится от солнца
  ctx.strokeStyle = 'rgba(255, 210, 150, 0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, nestTop);
  ctx.bezierCurveTo(w * 0.3, nestTop - 16, w * 0.66, nestTop + 12, w, nestTop - 6);
  ctx.stroke();
  ctx.restore();

  bloom(ctx, w * 0.7, fy - 60, 420, 'rgba(255, 214, 150, 0.20)');
}

/** Небо перед рассветом: солнце, лучи, море облаков. */
function drawSkyDawnBackground(ctx, room, palette, time) {
  const w = room.width;
  const fy = room.floorY;

  gradientFill(ctx, 0, 0, w, fy, [
    [0, '#1b2444'],
    [0.25, '#5d4a72'],
    [0.55, '#c47a76'],
    [0.8, '#f0a86e'],
    [1, '#ffe0a8'],
  ]);

  const sunX = w * 0.62;
  const sunY = fy - 120;
  const sunCore = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 180);
  sunCore.addColorStop(0, 'rgba(255, 252, 236, 0.95)');
  sunCore.addColorStop(0.25, 'rgba(255, 226, 170, 0.6)');
  sunCore.addColorStop(1, 'rgba(255, 200, 140, 0)');
  ctx.fillStyle = sunCore;
  ctx.fillRect(sunX - 180, sunY - 180, 360, 360);

  // лучи
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i += 1) {
    const a = (i / 14) * Math.PI * 2 + Math.sin(time * 0.12 + i) * 0.02;
    const len = 520 + rand(i) * 300;
    ctx.globalAlpha = 0.05 + rand(i * 3) * 0.05;
    ctx.fillStyle = '#ffe0ae';
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(sunX + Math.cos(a - 0.03) * len, sunY + Math.sin(a - 0.03) * len);
    ctx.lineTo(sunX + Math.cos(a + 0.03) * len, sunY + Math.sin(a + 0.03) * len);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  farCity(ctx, 0, fy - 150, w, 160, {
    layers: 2,
    color: 'rgba(96, 62, 74, 0.5)',
    light: '#ffe2b0',
    seed: 71,
    windowChance: 0.3,
  });
  cloudSea(ctx, 0, fy - 240, w, 260, time, { color: 'rgba(255, 242, 222, 0.36)', count: 18 });

  // каменный алтарь-площадка
  ctx.save();
  gradientFill(ctx, 0, fy, w, 720 - fy, [
    [0, '#7a6b60'],
    [0.5, '#4a3f3c'],
    [1, '#241d20'],
  ]);
  ctx.strokeStyle = 'rgba(255, 224, 180, 0.2)';
  ctx.lineWidth = 2;
  for (let c = 0; c <= 14; c += 1) {
    const bx = (c / 14) * w;
    const tx = w * 0.5 + (bx - w * 0.5) * 0.42;
    ctx.beginPath();
    ctx.moveTo(tx, fy);
    ctx.lineTo(bx, 720);
    ctx.stroke();
  }
  ctx.restore();
  gradientFill(ctx, 0, fy, w, 70, [
    [0, 'rgba(255, 214, 160, 0.28)'],
    [1, 'rgba(255, 214, 160, 0)'],
  ]);
  bloom(ctx, sunX, sunY, 620, 'rgba(255, 226, 170, 0.22)');
}

// ------------------------------------------------------------------ предметы

function propShadow(ctx, prop, rx = 0.5) {
  contactShadow(ctx, prop.x + prop.w / 2, prop.y + prop.h - 2, prop.w * rx, Math.max(10, prop.h * 0.08), 0.36);
}

function bossProp(sprite) {
  return (ctx, prop, state, time) => {
    const mood =
      state?.player?.bosses?.[prop.bossId] === 'kill'
        ? 'dead'
        : state?.player?.bosses?.[prop.bossId] === 'spare'
          ? 'calm'
          : 'angry';
    sprite(ctx, prop.x + prop.w / 2, prop.y + prop.h, {
      scale: prop.h / 260,
      time,
      mood,
    });
  };
}

export const EXTRA_PROPS = {
  keysBoss: bossProp(BOSS_SPRITES.keys),
  boilerBoss: bossProp(BOSS_SPRITES.boiler),
  mothBoss: bossProp(BOSS_SPRITES.moth),
  ravenBoss: bossProp(BOSS_SPRITES.raven),
  shadowBoss: bossProp(BOSS_SPRITES.shadow),
  shunyaBoss: bossProp(BOSS_SPRITES.shunya),

  mailboxesProp: (ctx, prop) => {
    propShadow(ctx, prop, 0.45);
    const cols = 3;
    const rows = 2;
    const bw = prop.w / cols;
    const bh = prop.h / rows;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const x = prop.x + c * bw;
        const y = prop.y + r * bh;
        metalSurface(ctx, x + 3, y + 3, bw - 6, bh - 6, { base: '#6a7078', deep: '#343a42', rust: 0.4 });
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 3, y + 3, bw - 6, bh - 6);
        ctx.fillStyle = 'rgba(20,20,24,0.6)';
        ctx.fillRect(x + 10, y + 10, bw - 20, 6);
        ctx.fillStyle = 'rgba(240, 230, 200, 0.35)';
        ctx.font = '700 11px "Trebuchet MS", sans-serif';
        ctx.fillText(`${12 + r * cols + c}`, x + 12, y + bh * 0.62);
      }
    }
  },

  noticeProp: (ctx, prop) => {
    ctx.fillStyle = 'rgba(230, 222, 200, 0.92)';
    ctx.fillRect(prop.x, prop.y, prop.w, prop.h);
    ctx.strokeStyle = 'rgba(70, 60, 45, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(prop.x + 4, prop.y + 4, prop.w - 8, prop.h - 8);
    ctx.fillStyle = 'rgba(60, 55, 45, 0.55)';
    for (let i = 0; i < 7; i += 1) {
      ctx.fillRect(prop.x + 14, prop.y + 22 + i * 15, prop.w - 28 - (i % 3) * 22, 3);
    }
    ctx.fillStyle = 'rgba(180, 60, 50, 0.65)';
    ctx.fillRect(prop.x + 14, prop.y + 12, prop.w - 40, 6);
  },

  scooterProp: (ctx, prop) => {
    propShadow(ctx, prop, 0.45);
    ctx.strokeStyle = '#8a2f34';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(prop.x + 20, prop.y + prop.h);
    ctx.lineTo(prop.x + 34, prop.y + prop.h * 0.35);
    ctx.stroke();
    ctx.strokeStyle = '#2a2a30';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(prop.x + 34, prop.y + prop.h * 0.35);
    ctx.lineTo(prop.x + prop.w * 0.7, prop.y + prop.h * 0.35);
    ctx.stroke();
    [0.18, 0.78].forEach((k) => {
      ctx.fillStyle = '#191a1f';
      ctx.beginPath();
      ctx.arc(prop.x + prop.w * k, prop.y + prop.h, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(prop.x + prop.w * k, prop.y + prop.h, 7, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = 'rgba(120, 90, 50, 0.9)';
    ctx.fillRect(prop.x + prop.w * 0.55, prop.y + prop.h * 0.12, 46, 30);
  },

  elevatorProp: (ctx, prop, state, time) => {
    metalSurface(ctx, prop.x, prop.y, prop.w, prop.h, { base: '#7d858c', deep: '#3f454b', rust: 0.25 });
    ctx.strokeStyle = 'rgba(16,18,20,0.8)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(prop.x + prop.w / 2, prop.y);
    ctx.lineTo(prop.x + prop.w / 2, prop.y + prop.h);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(prop.x + 12, prop.y, 14, prop.h);
    // табло
    ctx.fillStyle = 'rgba(16, 20, 22, 0.9)';
    ctx.fillRect(prop.x + prop.w / 2 - 46, prop.y + 18, 92, 28);
    ctx.fillStyle = `rgba(190, 235, 220, ${0.6 + Math.sin(time * 1.4) * 0.25})`;
    ctx.font = '700 16px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('—', prop.x + prop.w / 2, prop.y + 39);
  },

  chuteProp: (ctx, prop) => {
    metalSurface(ctx, prop.x, prop.y, prop.w, prop.h, { base: '#5f666d', deep: '#2e3339', rust: 0.5 });
    ctx.fillStyle = 'rgba(10, 10, 12, 0.85)';
    ctx.beginPath();
    ctx.arc(prop.x + prop.w / 2, prop.y + prop.h * 0.3, prop.w * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(220, 220, 210, 0.2)';
    ctx.lineWidth = 3;
    ctx.stroke();
  },

  meterProp: (ctx, prop) => {
    ctx.fillStyle = '#39404a';
    ctx.fillRect(prop.x, prop.y, prop.w, prop.h);
    for (let i = 0; i < 3; i += 1) {
      const cx = prop.x + prop.w * (0.3 + i * 0.24);
      const cy = prop.y + prop.h * 0.35;
      ctx.fillStyle = 'rgba(230, 228, 210, 0.85)';
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2a2f36';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = '#a03028';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 9, cy - 9);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(prop.x + 8, prop.y + prop.h * 0.6, prop.w - 16, 10);
  },

  mushroomsProp: (ctx, prop) => {
    for (let i = 0; i < 7; i += 1) {
      const mx = prop.x + 10 + rnd(i) * (prop.w - 20);
      const mh = 10 + rnd(i * 3) * 22;
      const my = prop.y + prop.h;
      ctx.fillStyle = 'rgba(210, 205, 180, 0.8)';
      ctx.fillRect(mx - 2, my - mh, 4, mh);
      const cap = ctx.createRadialGradient(mx, my - mh, 1, mx, my - mh, 12);
      cap.addColorStop(0, 'rgba(240, 235, 210, 0.95)');
      cap.addColorStop(1, 'rgba(170, 160, 130, 0.85)');
      ctx.fillStyle = cap;
      ctx.beginPath();
      ctx.ellipse(mx, my - mh, 13, 8, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    }
  },

  puddleProp: (ctx, prop, state, time) => {
    const g = ctx.createLinearGradient(0, prop.y, 0, prop.y + prop.h);
    g.addColorStop(0, 'rgba(140, 180, 190, 0.35)');
    g.addColorStop(1, 'rgba(80, 110, 120, 0.15)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(prop.x + prop.w / 2, prop.y + prop.h / 2, prop.w / 2, prop.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // круги от капель
    for (let i = 0; i < 2; i += 1) {
      const t = (time * 0.7 + i * 0.5) % 1;
      ctx.strokeStyle = `rgba(220, 240, 245, ${0.35 * (1 - t)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(prop.x + prop.w * 0.45, prop.y + prop.h * 0.5, 10 + t * 40, 4 + t * 12, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  },

  valveProp: (ctx, prop) => {
    metalSurface(ctx, prop.x + prop.w * 0.3, prop.y, prop.w * 0.4, prop.h, { base: '#7a6a52', deep: '#3d3225', rust: 0.7 });
    const cx = prop.x + prop.w / 2;
    const cy = prop.y + prop.h * 0.32;
    ctx.strokeStyle = '#c9a55a';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, prop.w * 0.32, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * prop.w * 0.32, cy + Math.sin(a) * prop.w * 0.32);
      ctx.stroke();
    }
    ctx.fillStyle = '#4a3a28';
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
  },

  coalProp: (ctx, prop) => {
    for (let i = 0; i < 22; i += 1) {
      const px = prop.x + rnd(i) * prop.w;
      const py = prop.y + prop.h - rnd(i * 3) * prop.h;
      ctx.fillStyle = `rgba(${22 + rnd(i) * 16}, ${22 + rnd(i * 5) * 14}, ${24 + rnd(i * 7) * 16}, 0.95)`;
      ctx.beginPath();
      ctx.arc(px, py, 5 + rnd(i * 11) * 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.arc(px - 2, py - 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  skylightProp: (ctx, prop, state, time) => {
    const sky = ctx.createLinearGradient(0, prop.y, 0, prop.y + prop.h);
    sky.addColorStop(0, '#32405f');
    sky.addColorStop(1, '#7d8ba4');
    ctx.fillStyle = sky;
    ctx.beginPath();
    ctx.moveTo(prop.x, prop.y + prop.h);
    ctx.lineTo(prop.x + 30, prop.y);
    ctx.lineTo(prop.x + prop.w - 30, prop.y);
    ctx.lineTo(prop.x + prop.w, prop.y + prop.h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2a2118';
    ctx.lineWidth = 12;
    ctx.stroke();
    // блик на стекле
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.moveTo(prop.x + 40, prop.y + prop.h);
    ctx.lineTo(prop.x + 80, prop.y);
    ctx.lineTo(prop.x + 110, prop.y);
    ctx.lineTo(prop.x + 70, prop.y + prop.h);
    ctx.closePath();
    ctx.fill();
    lightBeam(ctx, prop.x + prop.w * 0.4, prop.y + prop.h, prop.w * 0.3, 300, 'rgba(200, 215, 255, 0.09)', 0.15);
  },

  toyBoxProp: (ctx, prop) => {
    propShadow(ctx, prop, 0.45);
    ctx.fillStyle = '#7a5636';
    ctx.fillRect(prop.x, prop.y, prop.w, prop.h);
    ctx.fillStyle = 'rgba(255,230,190,0.08)';
    ctx.fillRect(prop.x, prop.y, prop.w, 8);
    ctx.strokeStyle = 'rgba(30,18,8,0.6)';
    ctx.lineWidth = 3;
    ctx.strokeRect(prop.x, prop.y, prop.w, prop.h);
    for (let i = 0; i < 5; i += 1) {
      ctx.fillStyle = ['#b8734a', '#7a8ab0', '#b0a05a', '#8a6aa0', '#9a5a5a'][i];
      ctx.beginPath();
      ctx.arc(prop.x + 24 + i * 30, prop.y + 18, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  clothesProp: (ctx, prop) => {
    ctx.strokeStyle = 'rgba(210, 200, 180, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(prop.x, prop.y);
    ctx.quadraticCurveTo(prop.x + prop.w / 2, prop.y + 20, prop.x + prop.w, prop.y);
    ctx.stroke();
    for (let i = 0; i < 4; i += 1) {
      const cx = prop.x + 30 + i * (prop.w / 4.4);
      const hh = prop.h * (0.5 + i * 0.1);
      const g = ctx.createLinearGradient(cx, prop.y, cx + 40, prop.y + hh);
      g.addColorStop(0, ['#5a5468', '#6a5c48', '#4a5e5a', '#6a4a4a'][i]);
      g.addColorStop(1, 'rgba(30, 28, 34, 0.9)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx, prop.y + 8);
      ctx.lineTo(cx + 34, prop.y + 8);
      ctx.lineTo(cx + 44, prop.y + hh);
      ctx.lineTo(cx - 10, prop.y + hh);
      ctx.closePath();
      ctx.fill();
    }
  },

  chestProp: (ctx, prop) => {
    propShadow(ctx, prop, 0.55);
    const g = ctx.createLinearGradient(prop.x, prop.y, prop.x, prop.y + prop.h);
    g.addColorStop(0, '#6a4a2e');
    g.addColorStop(1, '#40281a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(prop.x, prop.y + prop.h * 0.28, prop.w, prop.h * 0.72, 8);
    ctx.fill();
    ctx.fillStyle = '#553a22';
    ctx.beginPath();
    ctx.ellipse(prop.x + prop.w / 2, prop.y + prop.h * 0.3, prop.w / 2, prop.h * 0.2, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9a55a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(prop.x + prop.w / 2, prop.y + prop.h * 0.34);
    ctx.lineTo(prop.x + prop.w / 2, prop.y + prop.h * 0.62);
    ctx.stroke();
    ctx.fillStyle = '#e0c27a';
    ctx.fillRect(prop.x + prop.w / 2 - 12, prop.y + prop.h * 0.55, 24, 18);
  },

  gramophoneProp: (ctx, prop, state, time) => {
    propShadow(ctx, prop, 0.5);
    ctx.fillStyle = '#4a3524';
    ctx.fillRect(prop.x + prop.w * 0.15, prop.y + prop.h * 0.45, prop.w * 0.7, prop.h * 0.55);
    ctx.fillStyle = '#8a6a3a';
    ctx.beginPath();
    ctx.ellipse(prop.x + prop.w * 0.5, prop.y + prop.h * 0.45, prop.w * 0.32, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    const horn = ctx.createLinearGradient(prop.x, prop.y, prop.x + prop.w, prop.y + prop.h * 0.4);
    horn.addColorStop(0, 'rgba(200, 160, 90, 0.95)');
    horn.addColorStop(1, 'rgba(120, 90, 45, 0.95)');
    ctx.fillStyle = horn;
    ctx.beginPath();
    ctx.moveTo(prop.x + prop.w * 0.52, prop.y + prop.h * 0.42);
    ctx.quadraticCurveTo(prop.x + prop.w * 0.95, prop.y + prop.h * 0.02, prop.x + prop.w, prop.y + prop.h * 0.32);
    ctx.quadraticCurveTo(prop.x + prop.w * 0.78, prop.y + prop.h * 0.28, prop.x + prop.w * 0.52, prop.y + prop.h * 0.48);
    ctx.closePath();
    ctx.fill();
    // «музыка» — плывущие ноты
    const t = (time || 0) % 4;
    ctx.globalAlpha = 0.35 * (1 - t / 4);
    ctx.fillStyle = '#e8d9a8';
    ctx.font = '600 18px Georgia, serif';
    ctx.fillText('♪', prop.x + prop.w * 0.9 + t * 12, prop.y + prop.h * 0.2 - t * 16);
    ctx.globalAlpha = 1;
  },

  clotheslineProp: (ctx, prop, state, time) => {
    ctx.strokeStyle = 'rgba(230, 230, 220, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(prop.x, prop.y + 10);
    ctx.quadraticCurveTo(prop.x + prop.w / 2, prop.y + 60, prop.x + prop.w, prop.y + 14);
    ctx.stroke();
    for (let i = 0; i < 4; i += 1) {
      const px = prop.x + 40 + i * (prop.w / 4.4);
      const py = prop.y + 22 + Math.sin((i / 4) * Math.PI) * 26;
      const swing = Math.sin((time || 0) * 1.2 + i) * 3;
      ctx.fillStyle = ['rgba(190,180,200,0.85)', 'rgba(200,170,150,0.85)', 'rgba(150,175,190,0.85)', 'rgba(190,190,160,0.85)'][i];
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(swing * 0.01);
      ctx.fillRect(0, 0, 38, 66 + i * 8);
      ctx.restore();
    }
  },

  dishProp: (ctx, prop, state, time) => {
    ctx.strokeStyle = '#4a4a52';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(prop.x + prop.w * 0.35, prop.y + prop.h);
    ctx.lineTo(prop.x + prop.w * 0.55, prop.y + prop.h * 0.4);
    ctx.stroke();
    const dish = ctx.createLinearGradient(prop.x, prop.y, prop.x + prop.w, prop.y + prop.h);
    dish.addColorStop(0, 'rgba(220, 224, 232, 0.75)');
    dish.addColorStop(0.6, 'rgba(160, 168, 180, 0.7)');
    dish.addColorStop(1, 'rgba(100, 108, 120, 0.75)');
    ctx.fillStyle = dish;
    ctx.beginPath();
    ctx.ellipse(prop.x + prop.w * 0.52, prop.y + prop.h * 0.32, prop.w * 0.44, prop.h * 0.24, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90, 96, 108, 0.9)';
    ctx.lineWidth = 3;
    ctx.stroke();
    // блик
    ctx.fillStyle = `rgba(255,255,255,${0.18 + Math.sin((time || 0) * 0.7) * 0.06})`;
    ctx.beginPath();
    ctx.ellipse(prop.x + prop.w * 0.45, prop.y + prop.h * 0.25, prop.w * 0.2, prop.h * 0.07, -0.45, 0, Math.PI * 2);
    ctx.fill();
  },

  pigeonsProp: (ctx, prop, state, time) => {
    for (let i = 0; i < 4; i += 1) {
      const px = prop.x + 16 + i * (prop.w / 4.6);
      const py = prop.y + prop.h * 0.6 + Math.sin((time || 0) * 1.6 + i) * 3;
      const body = ctx.createLinearGradient(px, py - 20, px, py + 10);
      body.addColorStop(0, '#b9bcc4');
      body.addColorStop(1, '#7d828e');
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(px, py, 13, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + 10, py - 10, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(120, 160, 180, 0.5)';
      ctx.beginPath();
      ctx.ellipse(px - 4, py - 2, 7, 4, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  nestProp: (ctx, prop) => {
    propShadow(ctx, prop, 0.5);
    ctx.strokeStyle = 'rgba(70, 52, 34, 0.9)';
    for (let i = 0; i < 18; i += 1) {
      const a = rnd(i) * Math.PI * 2;
      ctx.lineWidth = 2 + rnd(i * 3) * 3;
      ctx.beginPath();
      ctx.moveTo(prop.x + prop.w / 2 + Math.cos(a) * prop.w * 0.42, prop.y + prop.h * 0.6 + Math.sin(a) * prop.h * 0.3);
      ctx.lineTo(prop.x + prop.w / 2 + Math.cos(a + 1) * prop.w * 0.46, prop.y + prop.h * 0.6 + Math.sin(a + 1) * prop.h * 0.34);
      ctx.stroke();
    }
    // блестящее
    ctx.fillStyle = 'rgba(255, 226, 150, 0.8)';
    ctx.fillRect(prop.x + prop.w * 0.4, prop.y + prop.h * 0.5, 8, 8);
    ctx.fillStyle = 'rgba(180, 220, 240, 0.7)';
    ctx.fillRect(prop.x + prop.w * 0.6, prop.y + prop.h * 0.55, 6, 6);
  },

  featherPileProp: (ctx, prop) => {
    for (let i = 0; i < 14; i += 1) {
      const px = prop.x + rnd(i) * prop.w;
      const py = prop.y + prop.h - rnd(i * 3) * prop.h * 0.6;
      ctx.strokeStyle = `rgba(${16 + rnd(i) * 24}, ${14 + rnd(i) * 20}, ${22 + rnd(i) * 24}, 0.9)`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px + 8, py - 12, px + 2, py - 22);
      ctx.stroke();
    }
  },

  starWellProp: (ctx, prop, state, time) => {
    const g = ctx.createRadialGradient(prop.x + prop.w / 2, prop.y + prop.h / 2, 4, prop.x + prop.w / 2, prop.y + prop.h / 2, prop.w * 0.6);
    g.addColorStop(0, 'rgba(10, 8, 20, 1)');
    g.addColorStop(0.55, 'rgba(40, 32, 80, 0.7)');
    g.addColorStop(1, 'rgba(40, 32, 80, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(prop.x + prop.w / 2, prop.y + prop.h / 2, prop.w * 0.6, prop.h * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 16; i += 1) {
      const a = (i / 16) * Math.PI * 2 + (time || 0) * 0.1;
      const r = prop.w * (0.16 + rnd(i) * 0.4);
      ctx.fillStyle = `rgba(200, 200, 255, ${0.25 + rnd(i * 3) * 0.5})`;
      ctx.fillRect(prop.x + prop.w / 2 + Math.cos(a) * r, prop.y + prop.h / 2 + Math.sin(a) * r * 0.7, 2, 2);
    }
  },

  mirrorProp: (ctx, prop, state, time) => {
    const g = ctx.createLinearGradient(prop.x, prop.y, prop.x + prop.w, prop.y + prop.h);
    g.addColorStop(0, 'rgba(120, 140, 190, 0.55)');
    g.addColorStop(0.45, 'rgba(40, 48, 74, 0.75)');
    g.addColorStop(1, 'rgba(150, 170, 210, 0.5)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(prop.x, prop.y, prop.w, prop.h, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(30, 24, 20, 0.9)';
    ctx.lineWidth = 10;
    ctx.stroke();
    // движущийся блик
    const bx = prop.x + ((time || 0) * 40) % prop.w;
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath();
    ctx.moveTo(bx, prop.y + 10);
    ctx.lineTo(bx + 50, prop.y + 10);
    ctx.lineTo(bx + 10, prop.y + prop.h - 10);
    ctx.lineTo(bx - 40, prop.y + prop.h - 10);
    ctx.closePath();
    ctx.fill();
  },

  shardProp: (ctx, prop, state, time) => {
    propShadow(ctx, prop, 0.4);
    ctx.fillStyle = 'rgba(190, 210, 245, 0.35)';
    ctx.beginPath();
    ctx.moveTo(prop.x, prop.y + prop.h);
    ctx.lineTo(prop.x + prop.w * 0.35, prop.y);
    ctx.lineTo(prop.x + prop.w * 0.7, prop.y + prop.h * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 240, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  },

  nestEggsProp: (ctx, prop) => {
    propShadow(ctx, prop, 0.5);
    ctx.strokeStyle = 'rgba(80, 60, 40, 0.85)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i += 1) {
      ctx.beginPath();
      ctx.ellipse(prop.x + prop.w / 2, prop.y + prop.h * 0.8, prop.w * (0.3 + i * 0.04), 14, 0, 0, Math.PI);
      ctx.stroke();
    }
    for (let i = 0; i < 3; i += 1) {
      const ex = prop.x + prop.w * (0.3 + i * 0.2);
      const eg = ctx.createRadialGradient(ex - 4, prop.y + prop.h * 0.5, 2, ex, prop.y + prop.h * 0.55, 24);
      eg.addColorStop(0, '#f4ecd8');
      eg.addColorStop(1, '#b8a888');
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.ellipse(ex, prop.y + prop.h * 0.55, 15, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  altarProp: (ctx, prop, state, time) => {
    propShadow(ctx, prop, 0.55);
    const g = ctx.createLinearGradient(0, prop.y, 0, prop.y + prop.h);
    g.addColorStop(0, 'rgba(255, 240, 210, 0.9)');
    g.addColorStop(1, 'rgba(200, 170, 120, 0.8)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(prop.x + prop.w / 2, prop.y + prop.h * 0.55, prop.w * 0.5, prop.h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    // сам осколок парит
    const float = Math.sin((time || 0) * 1.2) * 5;
    drawFeather(ctx, prop.x + prop.w / 2, prop.y + prop.h * 0.4 + float, { scale: 1.1, time, glow: true });
    lampGlow(ctx, prop.x + prop.w / 2, prop.y + prop.h * 0.45, 160, 'rgba(255, 220, 150, 0.22)');
  },
};

export const BACKGROUNDS_ACT2 = {
  stairs: drawStairsBackground,
  landing: drawLandingBackground,
  basement: drawBasementBackground,
  boiler: drawBoilerBackground,
  attic: drawAtticBackground,
  trunks: drawTrunksBackground,
  roof: drawRoofBackground,
  antennas: drawAntennasBackground,
  eclipse: drawEclipseBackground,
  mirrorRoof: drawMirrorRoofBackground,
  nest: drawNestBackground,
  skyDawn: drawSkyDawnBackground,
};
