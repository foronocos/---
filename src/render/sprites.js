import { clamp } from '../core/util.js';

const OUTLINE = '#3a2818';
const CREAM = '#f6e7c1';

function shade(hex, amount) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = clamp(((num >> 16) & 255) + amount, 0, 255);
  const g = clamp(((num >> 8) & 255) + amount, 0, 255);
  const b = clamp((num & 255) + amount, 0, 255);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Чики — жёлтая корелла. Рисуется кодом по частям: хвост, лапы, тело,
 * крыло, голова, хохолок. Точка (x, y) — под лапами.
 */
export function drawChiki(ctx, x, y, options = {}) {
  const {
    scale = 1,
    facing = 1,
    time = 0,
    pose = 'idle',
    classId = 'knight',
    alpha = 1,
    blink = false,
  } = options;

  const bob = pose === 'walk' ? Math.abs(Math.sin(time * 9)) * -3 : Math.sin(time * 3.1) * 1.6;
  const lunge = pose === 'attack' ? Math.sin(time * 26) * 7 : 0;
  const tilt = pose === 'hurt' ? -0.12 : pose === 'attack' ? 0.1 : 0;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x + lunge * facing, y);
  ctx.scale(facing * scale, scale);
  ctx.rotate(tilt);
  ctx.translate(0, bob);

  // хвост
  ctx.fillStyle = '#c99a3c';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-12, -78);
  ctx.quadraticCurveTo(-64, -88, -86, -46);
  ctx.quadraticCurveTo(-58, -58, -24, -50);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e8bd63';
  ctx.beginPath();
  ctx.moveTo(-18, -70);
  ctx.quadraticCurveTo(-58, -78, -76, -50);
  ctx.quadraticCurveTo(-50, -62, -22, -56);
  ctx.closePath();
  ctx.fill();

  // лапы
  ctx.strokeStyle = '#8d6a45';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const legShift = pose === 'walk' ? Math.sin(time * 12) * 5 : 0;
  ctx.beginPath();
  ctx.moveTo(-8, -30);
  ctx.lineTo(-8 + legShift, -4);
  ctx.lineTo(0 + legShift, 0);
  ctx.moveTo(10, -30);
  ctx.lineTo(10 - legShift, -4);
  ctx.lineTo(18 - legShift, 0);
  ctx.stroke();

  // тело
  const bodyGrad = ctx.createLinearGradient(-30, -120, 30, -30);
  bodyGrad.addColorStop(0, '#ffe08a');
  bodyGrad.addColorStop(0.55, '#f0c75e');
  bodyGrad.addColorStop(1, '#d6a23f');
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, -70, 33, 46, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // светлое брюшко
  ctx.fillStyle = '#ffeab8';
  ctx.beginPath();
  ctx.ellipse(6, -58, 18, 27, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // крыло
  ctx.save();
  ctx.translate(4, -84);
  ctx.rotate(-0.22 + Math.sin(time * 2.3) * 0.03);
  ctx.fillStyle = classId === 'shadow' ? '#8a6d3e' : '#d9a94b';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 6, 17, 30, 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#b07f2d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-4, 10);
  ctx.quadraticCurveTo(4, 24, 2, 33);
  ctx.moveTo(-10, 6);
  ctx.quadraticCurveTo(-4, 16, -6, 26);
  ctx.stroke();
  if (classId === 'knight') {
    ctx.fillStyle = '#f0c75e';
    ctx.strokeStyle = '#8a6a24';
    ctx.beginPath();
    ctx.moveTo(-12, 4);
    ctx.lineTo(12, 4);
    ctx.lineTo(4, 16);
    ctx.lineTo(-4, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  if (classId === 'mage') {
    ctx.fillStyle = '#8fd3a8';
    ctx.beginPath();
    ctx.arc(8, 18, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  if (classId === 'shadow') {
    ctx.strokeStyle = '#b58be0';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 16, 11, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  ctx.restore();

  // голова
  ctx.fillStyle = '#f7d26d';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(4, -121, 27, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // хохолок
  ctx.fillStyle = '#f0c75e';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  const crestSway = Math.sin(time * 2.4) * 0.06;
  [
    { x: -2, h: 40, w: 8, a: -0.18 },
    { x: 8, h: 50, w: 9, a: 0.04 },
    { x: 17, h: 36, w: 7, a: 0.24 },
  ].forEach((crest) => {
    ctx.save();
    ctx.translate(crest.x, -140);
    ctx.rotate(crest.a + crestSway);
    ctx.beginPath();
    ctx.moveTo(-crest.w / 2, 0);
    ctx.quadraticCurveTo(-crest.w / 3, -crest.h * 0.6, 0, -crest.h);
    ctx.quadraticCurveTo(crest.w / 2, -crest.h * 0.5, crest.w / 2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });

  // щека
  ctx.fillStyle = '#e8835a';
  ctx.beginPath();
  ctx.arc(20, -114, 9, 0, Math.PI * 2);
  ctx.fill();

  // клюв
  ctx.fillStyle = '#8d8f96';
  ctx.strokeStyle = '#4c4f57';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(26, -127);
  ctx.quadraticCurveTo(45, -119, 27, -108);
  ctx.quadraticCurveTo(30, -117, 26, -127);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#6f727a';
  ctx.beginPath();
  ctx.moveTo(28, -110);
  ctx.quadraticCurveTo(34, -108, 33, -104);
  ctx.quadraticCurveTo(27, -106, 28, -110);
  ctx.fill();

  // глаз
  if (!blink) {
    ctx.fillStyle = '#2b1d12';
    ctx.beginPath();
    ctx.arc(16, -128, 4.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff6dc';
    ctx.beginPath();
    ctx.arc(17.5, -129.5, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(58, 40, 24, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(15, -124, 3, 0.15, Math.PI - 0.4);
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#2b1d12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(11, -128);
    ctx.quadraticCurveTo(16, -124, 21, -128);
    ctx.stroke();
  }

  ctx.restore();
}

/** Голова Чики для портрета (в локальных координатах вокруг 0,0). */
export function drawChikiHead(ctx, scale = 1, time = 0) {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.fillStyle = '#f0c75e';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 6, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  const sway = Math.sin(time * 2) * 0.06;
  [
    { x: -12, h: 52, a: -0.25 },
    { x: 0, h: 64, a: 0 },
    { x: 12, h: 50, a: 0.25 },
  ].forEach((crest) => {
    ctx.save();
    ctx.translate(crest.x, -18);
    ctx.rotate(crest.a + sway);
    ctx.fillStyle = '#f0c75e';
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.quadraticCurveTo(-3, -crest.h * 0.65, 0, -crest.h);
    ctx.quadraticCurveTo(4, -crest.h * 0.5, 6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
  ctx.fillStyle = '#e8835a';
  ctx.beginPath();
  ctx.arc(18, 16, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b1d12';
  ctx.beginPath();
  ctx.arc(12, 2, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff6dc';
  ctx.beginPath();
  ctx.arc(14, 0, 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8d8f96';
  ctx.beginPath();
  ctx.moveTo(30, 2);
  ctx.quadraticCurveTo(52, 14, 30, 26);
  ctx.quadraticCurveTo(34, 12, 30, 2);
  ctx.fill();
  ctx.restore();
}

export function drawCat(ctx, x, y, options = {}) {
  const { scale = 1, time = 0, mood = 'sleep', facing = 1, alpha = 1 } = options;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(facing * scale, scale);

  const breathe = Math.sin(time * 1.6) * 2;
  // хвост
  ctx.strokeStyle = '#6e6a78';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-52, -32);
  ctx.quadraticCurveTo(-108, -28, -92, -70);
  ctx.stroke();
  ctx.strokeStyle = '#8b8798';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-52, -32);
  ctx.quadraticCurveTo(-106, -30, -92, -68);
  ctx.stroke();

  // тело
  const bodyGrad = ctx.createLinearGradient(0, -160, 0, -10);
  bodyGrad.addColorStop(0, '#9a94a6');
  bodyGrad.addColorStop(0.6, '#7c7688');
  bodyGrad.addColorStop(1, '#615c6c');
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#34303f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(-8, -62 + breathe * 0.3, 62, 56, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // полоски
  ctx.strokeStyle = 'rgba(52, 48, 63, 0.55)';
  ctx.lineWidth = 5;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(-8, -66, 40 - i * 9, -2.5, -0.9);
    ctx.stroke();
  }

  // лапы
  ctx.fillStyle = '#8f8999';
  ctx.beginPath();
  ctx.ellipse(-38, -16, 17, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(22, -14, 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // голова
  const headY = -134 + breathe;
  ctx.fillStyle = '#8b8597';
  ctx.strokeStyle = '#34303f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(20, headY, 42, 38, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // уши
  [[-2, 0.2], [42, -0.15]].forEach(([ex, tilt]) => {
    ctx.save();
    ctx.translate(20 + ex, headY - 28);
    ctx.rotate(tilt);
    ctx.fillStyle = '#8b8597';
    ctx.beginPath();
    ctx.moveTo(-14, 10);
    ctx.lineTo(0, -26);
    ctx.lineTo(16, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c39a9a';
    ctx.beginPath();
    ctx.moveTo(-7, 6);
    ctx.lineTo(0, -16);
    ctx.lineTo(8, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // морда
  ctx.fillStyle = '#a9a3b3';
  ctx.beginPath();
  ctx.ellipse(24, headY + 14, 24, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  // нос
  ctx.fillStyle = '#d79c9c';
  ctx.beginPath();
  ctx.moveTo(30, headY + 6);
  ctx.lineTo(38, headY + 6);
  ctx.lineTo(34, headY + 13);
  ctx.closePath();
  ctx.fill();

  // глаза
  ctx.strokeStyle = '#2b2733';
  ctx.lineWidth = 3;
  if (mood === 'sleep') {
    ctx.beginPath();
    ctx.arc(8, headY, 8, 0.15, Math.PI - 0.15);
    ctx.arc(36, headY, 8, 0.15, Math.PI - 0.15);
    ctx.stroke();
  } else {
    ctx.fillStyle = mood === 'angry' ? '#e8d36a' : '#cfe0a8';
    ctx.beginPath();
    ctx.ellipse(8, headY, 7, 9, 0, 0, Math.PI * 2);
    ctx.ellipse(36, headY, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#201c26';
    ctx.beginPath();
    ctx.ellipse(9, headY + 1, 3, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(37, headY + 1, 3, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // усы
  ctx.strokeStyle = 'rgba(240, 232, 210, 0.65)';
  ctx.lineWidth = 1.4;
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(36, headY + 12 + i * 3);
      ctx.quadraticCurveTo(58, headY + 4 + i * 6 + side * 2, 74, headY + (i - 1) * 9);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawVacuum(ctx, x, y, options = {}) {
  const { scale = 1, time = 0, angry = false, alpha = 1 } = options;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // шланг
  ctx.strokeStyle = '#4b4a52';
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(42, -74);
  ctx.bezierCurveTo(100, -120, 126, -40, 78, -22);
  ctx.bezierCurveTo(50, -10, 34, -34, 52, -48);
  ctx.stroke();
  ctx.strokeStyle = '#6b6a74';
  ctx.lineWidth = 15;
  ctx.beginPath();
  ctx.moveTo(42, -74);
  ctx.bezierCurveTo(100, -120, 126, -40, 78, -22);
  ctx.bezierCurveTo(50, -10, 34, -34, 52, -48);
  ctx.stroke();
  // насадка
  ctx.fillStyle = '#3c3b44';
  ctx.beginPath();
  ctx.ellipse(76, -22, 18, 12, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // колеса
  ctx.fillStyle = '#2e2d34';
  ctx.beginPath();
  ctx.arc(-40, -12, 16, 0, Math.PI * 2);
  ctx.arc(40, -12, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#77747e';
  ctx.beginPath();
  ctx.arc(-40, -12, 7, 0, Math.PI * 2);
  ctx.arc(40, -12, 7, 0, Math.PI * 2);
  ctx.fill();

  // корпус
  const body = ctx.createLinearGradient(-60, -180, 60, -20);
  body.addColorStop(0, angry ? '#8a6a5e' : '#7c8fa0');
  body.addColorStop(0.5, angry ? '#6d5148' : '#5d7080');
  body.addColorStop(1, '#3f4a55');
  ctx.fillStyle = body;
  ctx.strokeStyle = '#262c33';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, -88, 62, 82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // мешок
  ctx.fillStyle = angry ? '#8d7a5f' : '#9c8f74';
  ctx.beginPath();
  ctx.ellipse(-46, -76, 30, 40, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60, 48, 32, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-44, -76, 22, 0.4, 2.6);
  ctx.stroke();

  // глаз
  ctx.fillStyle = '#f1e6c8';
  ctx.beginPath();
  ctx.ellipse(8, -118, 25, 21, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#262c33';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = angry ? '#d26052' : '#3b4b3c';
  const look = Math.sin(time * 1.4) * 4;
  ctx.beginPath();
  ctx.arc(10 + look, -118, angry ? 9 : 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a1e';
  ctx.beginPath();
  ctx.arc(12 + look, -118, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // рот-решётка
  ctx.fillStyle = '#2b3036';
  ctx.beginPath();
  ctx.ellipse(4, -72, 32, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = -3; i <= 3; i += 1) {
    ctx.strokeStyle = '#6d7680';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(4 + i * 8, -86);
    ctx.lineTo(4 + i * 8, -58);
    ctx.stroke();
  }

  // кнопки
  ctx.fillStyle = '#c96a55';
  ctx.beginPath();
  ctx.arc(38, -150, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d8c27a';
  ctx.beginPath();
  ctx.arc(22, -156, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawPasta(ctx, x, y, options = {}) {
  const { scale = 1, time = 0, alpha = 1 } = options;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const bob = Math.sin(time * 2) * 2;

  // ноги-спагетти
  ctx.strokeStyle = '#e8c06a';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 22, -46);
    ctx.bezierCurveTo(side * 34, -32, side * 16, -20, side * 26, -2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(side * 26, -2);
    ctx.lineTo(side * 38, 0);
    ctx.stroke();
  }

  // кастрюля-тело
  const pot = ctx.createLinearGradient(-60, -180, 60, -40);
  pot.addColorStop(0, '#a9b2b8');
  pot.addColorStop(0.45, '#7e888f');
  pot.addColorStop(1, '#59636a');
  ctx.fillStyle = pot;
  ctx.strokeStyle = '#2e363c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-58, -164);
  ctx.lineTo(58, -164);
  ctx.lineTo(48, -44);
  ctx.quadraticCurveTo(0, -26, -48, -44);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // ручки
  ctx.strokeStyle = '#4c565d';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(-64, -120, 18, 1.4, 4.2);
  ctx.arc(64, -120, 18, -1.1, 1.6);
  ctx.stroke();

  // фартук
  ctx.fillStyle = '#e8ddc0';
  ctx.beginPath();
  ctx.moveTo(-20, -140);
  ctx.lineTo(20, -140);
  ctx.lineTo(26, -56);
  ctx.quadraticCurveTo(0, -42, -24, -56);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b03f38';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-14, -140);
  ctx.lineTo(-14, -100);
  ctx.moveTo(14, -140);
  ctx.lineTo(14, -100);
  ctx.stroke();

  // лицо
  ctx.fillStyle = '#f0dfb6';
  ctx.beginPath();
  ctx.ellipse(0, -190 + bob, 40, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3a2818';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // глаза-макаронины
  ctx.fillStyle = '#3b2f20';
  ctx.beginPath();
  ctx.arc(-14, -196 + bob, 4, 0, Math.PI * 2);
  ctx.arc(14, -196 + bob, 4, 0, Math.PI * 2);
  ctx.fill();
  // усы
  ctx.strokeStyle = '#8f7a52';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-22, -180 + bob);
  ctx.quadraticCurveTo(-38, -176 + bob, -46, -184 + bob);
  ctx.moveTo(-22, -176 + bob);
  ctx.quadraticCurveTo(-38, -170 + bob, -48, -172 + bob);
  ctx.moveTo(22, -180 + bob);
  ctx.quadraticCurveTo(38, -176 + bob, 46, -184 + bob);
  ctx.stroke();

  // дуршлаг-шлем
  ctx.fillStyle = '#9aa3aa';
  ctx.strokeStyle = '#2e363c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -208 + bob, 42, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#c3cbd0';
  for (let i = -3; i <= 3; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      ctx.beginPath();
      ctx.arc(i * 10, -228 + j * 10 + bob, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.strokeStyle = '#4c565d';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, -208 + bob, 44, Math.PI + 0.3, -0.3);
  ctx.stroke();

  // венчик
  ctx.save();
  ctx.translate(54, -120);
  ctx.rotate(-0.35 + Math.sin(time * 1.7) * 0.05);
  ctx.strokeStyle = '#3f464c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -46);
  ctx.stroke();
  ctx.strokeStyle = '#8d969d';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse(0, -58, 10, 22, (i * Math.PI) / 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
}

export function drawRoach(ctx, x, y, options = {}) {
  const { scale = 1, time = 0, alpha = 1 } = options;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const bob = Math.sin(time * 3) * 1.5;

  // лапки
  ctx.strokeStyle = '#5e3c22';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-8, -18 - i * 6);
    ctx.lineTo(-22, -10 - i * 5);
    ctx.moveTo(8, -18 - i * 6);
    ctx.lineTo(22, -10 - i * 5);
    ctx.stroke();
  }

  // тело
  const body = ctx.createLinearGradient(-16, -60, 16, 0);
  body.addColorStop(0, '#8d5c34');
  body.addColorStop(1, '#4d301c');
  ctx.fillStyle = body;
  ctx.strokeStyle = '#2b1a0e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -26 + bob, 17, 27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // голова
  ctx.fillStyle = '#6d472a';
  ctx.beginPath();
  ctx.arc(0, -56 + bob, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // усики
  ctx.strokeStyle = '#3a2414';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-6, -64 + bob);
  ctx.quadraticCurveTo(-24, -82 + bob, -30, -72 + bob);
  ctx.moveTo(6, -64 + bob);
  ctx.quadraticCurveTo(24, -82 + bob, 30, -72 + bob);
  ctx.stroke();

  // глаза
  ctx.fillStyle = '#f0d68a';
  ctx.beginPath();
  ctx.arc(-5, -58 + bob, 2.4, 0, Math.PI * 2);
  ctx.arc(5, -58 + bob, 2.4, 0, Math.PI * 2);
  ctx.fill();

  // галстук из фольги
  ctx.fillStyle = '#c9ced2';
  ctx.strokeStyle = '#7e858a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -44 + bob);
  ctx.lineTo(5, -37 + bob);
  ctx.lineTo(0, -24 + bob);
  ctx.lineTo(-5, -37 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function drawPigeon(ctx, x, y, options = {}) {
  const { scale = 1, time = 0, alpha = 1 } = options;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const bob = Math.sin(time * 2.2) * 1.2;

  // лапки
  ctx.strokeStyle = '#c26b5d';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-6, -14);
  ctx.lineTo(-8, 0);
  ctx.moveTo(6, -14);
  ctx.lineTo(8, 0);
  ctx.stroke();

  // тело
  ctx.fillStyle = '#8a94a3';
  ctx.strokeStyle = '#414b58';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, -36 + bob, 22, 24, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // шея
  ctx.fillStyle = '#5f7a72';
  ctx.beginPath();
  ctx.ellipse(4, -58 + bob, 13, 15, 0.12, 0, Math.PI * 2);
  ctx.fill();

  // голова
  ctx.fillStyle = '#7f8a99';
  ctx.beginPath();
  ctx.arc(8, -72 + bob, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // клюв
  ctx.fillStyle = '#d6a15c';
  ctx.beginPath();
  ctx.moveTo(18, -74 + bob);
  ctx.lineTo(30, -70 + bob);
  ctx.lineTo(18, -66 + bob);
  ctx.closePath();
  ctx.fill();

  // глаз
  ctx.fillStyle = '#f0c75e';
  ctx.beginPath();
  ctx.arc(12, -75 + bob, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1f1c18';
  ctx.beginPath();
  ctx.arc(12.6, -75 + bob, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // крыло
  ctx.fillStyle = '#6d7886';
  ctx.strokeStyle = '#414b58';
  ctx.beginPath();
  ctx.ellipse(-8, -36 + bob, 14, 20, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function drawFeather(ctx, x, y, options = {}) {
  const { scale = 1, rotation = 0, time = 0, glow = true, alpha = 1 } = options;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rotation + Math.sin(time * 2) * 0.04);
  ctx.scale(scale, scale);
  if (glow) {
    const halo = ctx.createRadialGradient(0, 0, 4, 0, 0, 60);
    halo.addColorStop(0, 'rgba(255, 226, 140, 0.55)');
    halo.addColorStop(1, 'rgba(255, 226, 140, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#f6d98a';
  ctx.strokeStyle = '#b8892c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -46);
  ctx.bezierCurveTo(22, -24, 16, 18, 0, 44);
  ctx.bezierCurveTo(-16, 18, -22, -24, 0, -46);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#c79a44';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -40);
  ctx.lineTo(0, 40);
  ctx.stroke();
  ctx.restore();
}

export function drawSeed(ctx, x, y, options = {}) {
  const { scale = 1, rotation = 0, alpha = 1 } = options;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#d9b25c';
  ctx.strokeStyle = '#7c5a22';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#a57f35';
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(0, 6);
  ctx.stroke();
  ctx.restore();
}

/** Портреты для диалогов. */
export function drawPortrait(ctx, portraitId, x, y, size, time = 0) {
  ctx.save();
  ctx.translate(x, y);
  const colors = {
    chiki: ['#3c3320', '#d9b25c'],
    cat: ['#33303d', '#8b8597'],
    vacuum: ['#2e3a42', '#6d8494'],
    pasta: ['#3a3024', '#a2abb1'],
    roach: ['#33251a', '#8d5c34'],
    pigeon: ['#2f3740', '#7f8a99'],
    note: ['#3a3427', '#d8cba6'],
    voice: ['#302a42', '#a58ad8'],
  };
  const [dark, light] = colors[portraitId] || colors.voice;
  const radius = size / 2;
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  const glow = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
  glow.addColorStop(0, `${light}55`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(240, 199, 94, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 1, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(0, size * 0.22);
  if (portraitId === 'chiki') {
    drawChikiHead(ctx, size / 90, time);
  } else if (portraitId === 'cat') {
    ctx.translate(0, size * 0.1);
    drawCat(ctx, 0, size * 0.36, { scale: size / 260, time, mood: 'awake' });
  } else if (portraitId === 'vacuum') {
    ctx.translate(0, size * 0.3);
    drawVacuum(ctx, 0, 0, { scale: size / 380, time });
  } else if (portraitId === 'pasta') {
    ctx.translate(0, size * 0.24);
    drawPasta(ctx, 0, 0, { scale: size / 480, time });
  } else if (portraitId === 'roach') {
    ctx.translate(0, size * 0.06);
    drawRoach(ctx, 0, 0, { scale: size / 140, time });
  } else if (portraitId === 'pigeon') {
    ctx.translate(0, size * 0.08);
    drawPigeon(ctx, 0, 0, { scale: size / 150, time });
  } else if (portraitId === 'note') {
    ctx.translate(-size * 0.22, -size * 0.24);
    ctx.fillStyle = '#e7dcc0';
    ctx.fillRect(0, 0, size * 0.44, size * 0.52);
    ctx.strokeStyle = '#a89a75';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.moveTo(size * 0.05, size * (0.08 + i * 0.08));
      ctx.lineTo(size * 0.38, size * (0.08 + i * 0.08));
      ctx.stroke();
    }
  } else {
    drawFeather(ctx, 0, 0, { scale: size / 110, time, glow: true });
  }
  ctx.restore();
  ctx.restore();
}
