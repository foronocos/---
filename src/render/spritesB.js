/**
 * Противники Акта II. Рисуются кодом: градиенты объёма, контровой свет,
 * мягкие тени и мелкие детали фактуры — без единой внешней картинки.
 */

const rnd = (seed) => {
  const x = Math.sin(seed * 91.7 + 41.3) * 43758.5453;
  return x - Math.floor(x);
};

function shade(ctx, x, y, rx, ry, alpha = 0.35) {
  const g = ctx.createRadialGradient(x, y, 1, x, y, Math.max(rx, ry));
  g.addColorStop(0, `rgba(0,0,0,${alpha})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ry / Math.max(1, rx));
  ctx.translate(-x, -y);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(rx, ry), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function rimLight(ctx, path, color = 'rgba(255, 226, 168, 0.5)', width = 3) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke(path);
  ctx.restore();
}

/** Ключница — дух замков в виде парящей связки ключей. */
export function drawKeys(ctx, x, y, options = {}) {
  const { scale = 1, time = 0, facing = 1, alpha = 1, mood = 'idle' } = options;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(facing * scale, scale);
  shade(ctx, 0, 0, 90, 18, 0.4);

  const float = Math.sin(time * 1.7) * 8;
  // ореол
  const halo = ctx.createRadialGradient(0, -150 + float, 10, 0, -150 + float, 130);
  halo.addColorStop(0, 'rgba(255, 214, 140, 0.16)');
  halo.addColorStop(1, 'rgba(255, 214, 140, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(-140, -290, 280, 300);

  // кольцо связки
  ctx.save();
  ctx.translate(0, -180 + float);
  ctx.rotate(Math.sin(time * 0.9) * 0.12);
  ctx.strokeStyle = '#4a4a52';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.ellipse(0, 0, 46, 54, 0, 0, Math.PI * 2);
  ctx.stroke();
  const steel = ctx.createLinearGradient(-46, -54, 46, 54);
  steel.addColorStop(0, '#d8d2c0');
  steel.addColorStop(0.4, '#9a9488');
  steel.addColorStop(1, '#5c584f');
  ctx.strokeStyle = steel;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.ellipse(0, 0, 46, 54, 0, 0, Math.PI * 2);
  ctx.stroke();

  // ключи
  const keys = [
    { a: -0.5, len: 120, w: 9 },
    { a: -0.12, len: 156, w: 11 },
    { a: 0.24, len: 132, w: 9 },
    { a: 0.55, len: 98, w: 8 },
  ];
  keys.forEach((k, index) => {
    ctx.save();
    ctx.rotate(k.a + Math.sin(time * 1.1 + index) * 0.05);
    const g = ctx.createLinearGradient(0, 0, 0, k.len);
    g.addColorStop(0, '#c9c2ad');
    g.addColorStop(0.5, '#8c8676');
    g.addColorStop(1, '#5a554a');
    ctx.strokeStyle = g;
    ctx.lineWidth = k.w;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.lineTo(0, k.len);
    ctx.stroke();
    // бородка
    ctx.lineWidth = k.w * 0.8;
    ctx.beginPath();
    ctx.moveTo(0, k.len);
    ctx.lineTo(16, k.len + 8);
    ctx.moveTo(0, k.len - 16);
    ctx.lineTo(13, k.len - 10);
    ctx.stroke();
    // блик
    ctx.strokeStyle = 'rgba(255, 250, 235, 0.45)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-2, 46);
    ctx.lineTo(-2, k.len - 8);
    ctx.stroke();
    ctx.restore();
  });

  // «глаза» — два тёмных замка
  ctx.fillStyle = '#22242b';
  ctx.beginPath();
  ctx.ellipse(-16, -186 + float, 9, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(16, -186 + float, 9, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  const eyeGlow = mood === 'angry' ? 'rgba(255, 140, 120, 0.9)' : 'rgba(255, 220, 150, 0.9)';
  ctx.fillStyle = eyeGlow;
  ctx.beginPath();
  ctx.arc(-16, -186 + float, 3, 0, Math.PI * 2);
  ctx.arc(16, -186 + float, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

/** Котёл-Ворчун — ржавый бак с топкой и трубой. */
export function drawBoiler(ctx, x, y, options = {}) {
  const { scale = 1, time = 0, facing = 1, alpha = 1, mood = 'idle' } = options;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(facing * scale, scale);
  shade(ctx, 0, 0, 120, 20, 0.42);

  const pulse = 0.75 + Math.sin(time * 2.2) * 0.2;
  // корпус
  const body = ctx.createLinearGradient(-90, -220, 90, 0);
  body.addColorStop(0, '#5a4a3a');
  body.addColorStop(0.35, '#8a6f50');
  body.addColorStop(0.62, '#6b563e');
  body.addColorStop(1, '#3e3328');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(-92, -230, 184, 230, 26);
  ctx.fill();
  ctx.strokeStyle = '#2a231b';
  ctx.lineWidth = 3;
  ctx.stroke();

  // ржавые пятна
  for (let i = 0; i < 12; i += 1) {
    const px = -80 + ((i * 37) % 160);
    const py = -210 + ((i * 53) % 200);
    const r = 8 + (i % 4) * 6;
    const g = ctx.createRadialGradient(px, py, 1, px, py, r);
    g.addColorStop(0, 'rgba(122, 64, 30, 0.55)');
    g.addColorStop(1, 'rgba(122, 64, 30, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // труба
  ctx.fillStyle = '#4a3f33';
  ctx.fillRect(28, -300, 34, 80);
  ctx.fillStyle = '#6b5c48';
  ctx.fillRect(28, -300, 8, 80);

  // топка
  ctx.fillStyle = '#1a1410';
  ctx.beginPath();
  ctx.roundRect(-56, -150, 112, 92, 14);
  ctx.fill();
  const fire = ctx.createRadialGradient(0, -104, 4, 0, -104, 70);
  fire.addColorStop(0, `rgba(255, 196, 90, ${0.85 * pulse})`);
  fire.addColorStop(0.45, `rgba(230, 110, 40, ${0.55 * pulse})`);
  fire.addColorStop(1, 'rgba(140, 40, 10, 0)');
  ctx.fillStyle = fire;
  ctx.fillRect(-70, -170, 140, 130);

  // глаза-заклёпки
  ctx.fillStyle = '#f7e7c6';
  ctx.beginPath();
  ctx.ellipse(-34, -196, 12, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(34, -196, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = mood === 'angry' ? '#c03020' : '#2a2018';
  ctx.beginPath();
  ctx.arc(-34 + Math.sin(time * 0.8) * 2, -196, 5, 0, Math.PI * 2);
  ctx.arc(34 + Math.sin(time * 0.8) * 2, -196, 5, 0, Math.PI * 2);
  ctx.fill();

  // брови-заслонки
  ctx.strokeStyle = '#2a231b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-52, -216);
  ctx.lineTo(-18, mood === 'angry' ? -206 : -212);
  ctx.moveTo(52, -216);
  ctx.lineTo(18, mood === 'angry' ? -206 : -212);
  ctx.stroke();

  // манометр
  ctx.fillStyle = '#d8cfb4';
  ctx.beginPath();
  ctx.arc(0, -60, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3a2f24';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = '#b03030';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -60);
  ctx.lineTo(8, -70);
  ctx.stroke();

  // пар
  if (mood !== 'dead') {
    for (let i = 0; i < 4; i += 1) {
      const py = -300 - ((time * 40 + i * 40) % 160);
      const g = ctx.createRadialGradient(45, py, 2, 45, py, 26);
      g.addColorStop(0, `rgba(240, 240, 236, ${0.18 * (1 - (py + 300) / -160)})`);
      g.addColorStop(1, 'rgba(240, 240, 236, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(45 + Math.sin(time + i) * 8, py, 26, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Моль-Хранительница — большие пыльные крылья и мягкое тело. */
export function drawMoth(ctx, x, y, options = {}) {
  const { scale = 1, time = 0, facing = 1, alpha = 1 } = options;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(facing * scale, scale);
  shade(ctx, 0, 0, 90, 16, 0.3);

  const flap = 0.85 + Math.sin(time * 4.2) * 0.15;
  // крылья
  [-1, 1].forEach((side) => {
    ctx.save();
    ctx.scale(side, 1);
    ctx.rotate(Math.sin(time * 2.6) * 0.06);
    const wing = ctx.createLinearGradient(10, -220, 130, -40);
    wing.addColorStop(0, 'rgba(214, 196, 158, 0.95)');
    wing.addColorStop(0.55, 'rgba(170, 148, 112, 0.92)');
    wing.addColorStop(1, 'rgba(110, 94, 72, 0.9)');
    ctx.fillStyle = wing;
    ctx.beginPath();
    ctx.moveTo(8, -190);
    ctx.bezierCurveTo(70 * flap, -250, 150 * flap, -190, 120, -110);
    ctx.bezierCurveTo(100, -40, 40, -30, 6, -60);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(70, 56, 40, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // узор из «свитеров»
    ctx.strokeStyle = 'rgba(120, 90, 70, 0.45)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(48, -140, 26 + i * 14, -1.2, 1.1);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(235, 225, 200, 0.35)';
    ctx.beginPath();
    ctx.ellipse(60, -160, 12, 8, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // тело
  const body = ctx.createLinearGradient(0, -210, 0, -20);
  body.addColorStop(0, '#c9b58e');
  body.addColorStop(1, '#7a6a52');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, -110, 30, 96, 0, 0, Math.PI * 2);
  ctx.fill();

  // пушистый воротник
  for (let i = 0; i < 14; i += 1) {
    const a = (i / 14) * Math.PI * 2;
    ctx.fillStyle = 'rgba(228, 214, 184, 0.75)';
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 30, -196 + Math.sin(a) * 16, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // голова и глаза
  ctx.fillStyle = '#b9a482';
  ctx.beginPath();
  ctx.arc(0, -206, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1410';
  ctx.beginPath();
  ctx.ellipse(-10, -210, 7, 9, 0, 0, Math.PI * 2);
  ctx.ellipse(10, -210, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 230, 170, 0.85)';
  ctx.beginPath();
  ctx.arc(-10, -211, 2.4, 0, Math.PI * 2);
  ctx.arc(10, -211, 2.4, 0, Math.PI * 2);
  ctx.fill();

  // усики
  ctx.strokeStyle = 'rgba(210, 190, 150, 0.8)';
  ctx.lineWidth = 2;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * 10, -226);
    ctx.quadraticCurveTo(side * 34, -260, side * 20, -280);
    ctx.stroke();
  });

  // пыль
  for (let i = 0; i < 12; i += 1) {
    const px = -80 + ((i * 41 + time * 12) % 160);
    const py = -180 + ((i * 37 + time * 20) % 150);
    ctx.fillStyle = `rgba(230, 220, 190, ${0.12 + (i % 5) * 0.04})`;
    ctx.beginPath();
    ctx.arc(px, py, 2 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Ворон-Собиратель — тяжёлая птица с блестящей добычей. */
export function drawRaven(ctx, x, y, options = {}) {
  const { scale = 1, time = 0, facing = 1, alpha = 1 } = options;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(facing * scale, scale);
  shade(ctx, 0, 0, 100, 18, 0.42);

  // хвост
  const tail = ctx.createLinearGradient(-60, -120, -140, -20);
  tail.addColorStop(0, '#2a2c38');
  tail.addColorStop(1, '#14151c');
  ctx.fillStyle = tail;
  ctx.beginPath();
  ctx.moveTo(-30, -100);
  ctx.lineTo(-140, -60);
  ctx.lineTo(-130, -20);
  ctx.lineTo(-24, -50);
  ctx.closePath();
  ctx.fill();

  // тело
  const body = ctx.createLinearGradient(0, -230, 0, 0);
  body.addColorStop(0, '#3b3d4d');
  body.addColorStop(0.45, '#2a2c38');
  body.addColorStop(1, '#15161d');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, -110, 62, 96, 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(10, 10, 14, 0.8)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // крыло
  ctx.save();
  ctx.rotate(-0.1);
  const wing = ctx.createLinearGradient(-40, -180, -10, -40);
  wing.addColorStop(0, 'rgba(70, 74, 92, 0.95)');
  wing.addColorStop(1, 'rgba(18, 19, 26, 0.95)');
  ctx.fillStyle = wing;
  ctx.beginPath();
  ctx.ellipse(-18, -130, 34, 74, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // голова
  ctx.fillStyle = '#23252f';
  ctx.beginPath();
  ctx.arc(8, -224, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 130, 160, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // клюв
  ctx.fillStyle = '#8a8578';
  ctx.beginPath();
  ctx.moveTo(34, -228);
  ctx.lineTo(74, -216);
  ctx.lineTo(34, -206);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.moveTo(36, -224);
  ctx.lineTo(66, -217);
  ctx.lineTo(36, -212);
  ctx.closePath();
  ctx.fill();

  // глаз
  ctx.fillStyle = '#e8d9a8';
  ctx.beginPath();
  ctx.arc(20, -232, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#101014';
  ctx.beginPath();
  ctx.arc(21, -232, 3.4, 0, Math.PI * 2);
  ctx.fill();

  // блестящая добыча на шее
  ctx.fillStyle = 'rgba(255, 226, 150, 0.85)';
  ctx.beginPath();
  ctx.arc(2, -186, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 240, 200, 0.9)';
  ctx.fillRect(-20, -196, 4, 10);

  // лапы
  ctx.strokeStyle = '#6a6252';
  ctx.lineWidth = 5;
  [-18, 18].forEach((lx) => {
    ctx.beginPath();
    ctx.moveTo(lx, -22);
    ctx.lineTo(lx, 0);
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx - 10, 4);
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx + 10, 4);
    ctx.stroke();
  });
  ctx.restore();
}

/** Тень Чики — силуэт с рваными краями и светящимися глазами. */
export function drawShadowChiki(ctx, x, y, options = {}) {
  const { scale = 1, time = 0, facing = 1, alpha = 1 } = options;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(facing * scale, scale);
  shade(ctx, 0, 0, 90, 16, 0.4);

  const sway = Math.sin(time * 1.3) * 6;
  const g = ctx.createLinearGradient(0, -250, 0, 0);
  g.addColorStop(0, 'rgba(46, 32, 74, 0.95)');
  g.addColorStop(0.5, 'rgba(24, 16, 42, 0.95)');
  g.addColorStop(1, 'rgba(10, 8, 20, 0.9)');
  ctx.fillStyle = g;

  ctx.beginPath();
  ctx.ellipse(sway * 0.3, -110, 54, 92, 0, 0, Math.PI * 2);
  ctx.fill();
  // голова
  ctx.beginPath();
  ctx.arc(sway * 0.5, -214, 34, 0, Math.PI * 2);
  ctx.fill();
  // хохолок
  ctx.beginPath();
  ctx.moveTo(sway * 0.5 - 14, -240);
  ctx.quadraticCurveTo(sway * 0.5 - 4, -292, sway * 0.5 + 12, -246);
  ctx.fill();
  // рваные крылья
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-40, -150 + i * 18);
    ctx.lineTo(-40 - 34 - i * 6 + Math.sin(time * 2 + i) * 6, -160 + i * 20);
    ctx.lineTo(-38, -132 + i * 18);
    ctx.fill();
  }

  // глаза
  const glow = 0.6 + Math.sin(time * 3) * 0.2;
  ctx.fillStyle = `rgba(200, 170, 255, ${glow})`;
  ctx.beginPath();
  ctx.ellipse(-10, -220, 6, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(12, -220, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // контур
  ctx.strokeStyle = 'rgba(150, 120, 220, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(sway * 0.3, -110, 54, 92, 0, 0, Math.PI * 2);
  ctx.stroke();

  // частицы тьмы
  for (let i = 0; i < 10; i += 1) {
    const px = -60 + ((i * 53 + time * 18) % 120);
    const py = -240 + ((i * 37 + time * 26) % 220);
    ctx.fillStyle = 'rgba(120, 96, 180, 0.25)';
    ctx.fillRect(px, py, 3, 3);
  }
  ctx.restore();
}

/** Шуня — огромная ночная птица: сложенные крылья, звёздный плащ и золотое перо. */
export function drawShunya(ctx, x, y, options = {}) {
  const { scale = 1, time = 0, facing = 1, alpha = 1, mood = 'idle' } = options;
  const breathe = 1 + Math.sin(time * 1.35) * 0.012;
  const sway = Math.sin(time * 0.8) * 0.03;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(facing * scale, scale);

  const ground = ctx.createRadialGradient(0, 6, 10, 0, 6, 210);
  ground.addColorStop(0, 'rgba(0,0,0,0.55)');
  ground.addColorStop(0.6, 'rgba(0,0,0,0.28)');
  ground.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.ellipse(0, 8, 210, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  const aura = ctx.createRadialGradient(0, -190, 40, 0, -190, 300);
  aura.addColorStop(0, 'rgba(58, 44, 96, 0.35)');
  aura.addColorStop(0.55, 'rgba(30, 22, 54, 0.18)');
  aura.addColorStop(1, 'rgba(20, 16, 40, 0)');
  ctx.fillStyle = aura;
  ctx.fillRect(-320, -520, 640, 560);

  ctx.save();
  ctx.scale(1, breathe);

  // хвост
  const tail = ctx.createLinearGradient(0, -140, 0, 40);
  tail.addColorStop(0, '#221c3a');
  tail.addColorStop(1, '#0b0916');
  ctx.fillStyle = tail;
  for (let i = -2; i <= 2; i += 1) {
    const a = i * 0.16 + Math.sin(time * 0.9 + i) * 0.02;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(-16, -150);
    ctx.quadraticCurveTo(i * 26, -30, i * 34, 34);
    ctx.quadraticCurveTo(i * 20, 6, 6, -140);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // крылья
  [-1, 1].forEach((side) => {
    ctx.save();
    ctx.scale(side, 1);
    ctx.rotate(sway * side);

    const wing = ctx.createLinearGradient(20, -300, 190, 20);
    wing.addColorStop(0, 'rgba(56, 46, 88, 0.98)');
    wing.addColorStop(0.45, 'rgba(32, 25, 56, 0.98)');
    wing.addColorStop(1, 'rgba(12, 10, 24, 1)');
    ctx.fillStyle = wing;
    ctx.beginPath();
    ctx.moveTo(16, -286);
    ctx.bezierCurveTo(118, -300, 196, -196, 186, -76);
    ctx.bezierCurveTo(182, 12, 132, 40, 96, 26);
    ctx.bezierCurveTo(120, -60, 96, -170, 16, -286);
    ctx.closePath();
    ctx.fill();

    for (let row = 0; row < 4; row += 1) {
      for (let i = 0; i < 5; i += 1) {
        const bx = 44 + i * 30 + row * 3;
        const by = -250 + row * 56 + i * 8;
        const len = 66 - row * 8;
        const g = ctx.createLinearGradient(bx, by, bx + 18, by + len);
        g.addColorStop(0, `rgba(${74 - row * 8}, ${62 - row * 6}, ${116 - row * 10}, 0.9)`);
        g.addColorStop(1, 'rgba(10, 9, 20, 0.95)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + 16, by + len * 0.5, bx + 6, by + len);
        ctx.quadraticCurveTo(bx - 8, by + len * 0.55, bx, by);
        ctx.fill();
      }
    }

    for (let i = 0; i < 14; i += 1) {
      const sx = 40 + rnd(i * 3.7 + side) * 130;
      const sy = -270 + rnd(i * 5.3 + side) * 260;
      const a = 0.25 + Math.sin(time * 1.6 + i) * 0.15 + rnd(i) * 0.25;
      ctx.fillStyle = `rgba(224, 226, 255, ${a})`;
      ctx.fillRect(sx, sy, 1.8, 1.8);
    }
    ctx.restore();
  });

  // тело
  const body = ctx.createLinearGradient(-70, -280, 70, -20);
  body.addColorStop(0, '#3d3358');
  body.addColorStop(0.45, '#2a2344');
  body.addColorStop(1, '#141020');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(0, -300);
  ctx.bezierCurveTo(58, -286, 74, -180, 62, -84);
  ctx.bezierCurveTo(54, -18, 24, 2, 0, 2);
  ctx.bezierCurveTo(-24, 2, -54, -18, -62, -84);
  ctx.bezierCurveTo(-74, -180, -58, -286, 0, -300);
  ctx.closePath();
  ctx.fill();

  const chest = ctx.createRadialGradient(0, -180, 8, 0, -170, 84);
  chest.addColorStop(0, 'rgba(196, 186, 226, 0.55)');
  chest.addColorStop(0.55, 'rgba(120, 110, 168, 0.22)');
  chest.addColorStop(1, 'rgba(60, 50, 90, 0)');
  ctx.fillStyle = chest;
  ctx.beginPath();
  ctx.ellipse(0, -172, 54, 96, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 26; i += 1) {
    const px = (rnd(i * 2.1) - 0.5) * 84;
    const py = -250 + rnd(i * 3.3) * 220;
    ctx.strokeStyle = 'rgba(180, 172, 214, 0.12)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(px, py, 6 + rnd(i) * 5, 0.9, 2.2);
    ctx.stroke();
  }

  // лапы
  ctx.strokeStyle = '#1a1526';
  ctx.lineWidth = 7;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * 18, -20);
    ctx.lineTo(side * 20, 2);
    ctx.stroke();
    for (let t = -1; t <= 1; t += 1) {
      ctx.beginPath();
      ctx.moveTo(side * 20, 2);
      ctx.lineTo(side * 20 + t * 12, 8);
      ctx.stroke();
    }
  });

  // голова
  const headY = -318;
  const ruff = ctx.createLinearGradient(0, headY + 10, 0, headY + 60);
  ruff.addColorStop(0, '#3a3154');
  ruff.addColorStop(1, 'rgba(20, 16, 34, 0)');
  ctx.fillStyle = ruff;
  ctx.beginPath();
  ctx.moveTo(-46, headY + 32);
  ctx.quadraticCurveTo(0, headY + 78, 46, headY + 32);
  ctx.quadraticCurveTo(0, headY + 44, -46, headY + 32);
  ctx.fill();

  const head = ctx.createRadialGradient(-10, headY - 16, 6, 0, headY - 6, 56);
  head.addColorStop(0, '#4a3f68');
  head.addColorStop(0.65, '#2c2545');
  head.addColorStop(1, '#161226');
  ctx.fillStyle = head;
  ctx.beginPath();
  ctx.ellipse(0, headY, 42, 44, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(120, 108, 170, 0.85)';
  ctx.lineWidth = 3;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * 8, headY - 40);
    ctx.quadraticCurveTo(i * 16 + Math.sin(time * 1.4 + i) * 3, headY - 66, i * 22, headY - 78);
    ctx.stroke();
  }

  const beak = ctx.createLinearGradient(24, headY - 8, 92, headY + 16);
  beak.addColorStop(0, '#8d7f6a');
  beak.addColorStop(0.6, '#5f5445');
  beak.addColorStop(1, '#2e2820');
  ctx.fillStyle = beak;
  ctx.beginPath();
  ctx.moveTo(26, headY - 12);
  ctx.quadraticCurveTo(76, headY - 8, 94, headY + 12);
  ctx.quadraticCurveTo(66, headY + 14, 30, headY + 12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(20, 16, 12, 0.6)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(30, headY + 10);
  ctx.quadraticCurveTo(64, headY + 12, 92, headY + 12);
  ctx.stroke();

  const glow = mood === 'angry' ? 'rgba(255, 150, 110, 0.95)' : 'rgba(198, 208, 255, 0.95)';
  [-1, 1].forEach((side) => {
    const ex = side * 17;
    const ey = headY - 6;
    const blink = mood === 'idle' && Math.sin(time * 0.7 + side) > 0.985;
    ctx.save();
    if (blink) {
      ctx.strokeStyle = 'rgba(160, 168, 210, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ex - 8, ey);
      ctx.lineTo(ex + 8, ey);
      ctx.stroke();
    } else {
      const eg = ctx.createRadialGradient(ex, ey, 1, ex, ey, 16);
      eg.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      eg.addColorStop(0.35, glow);
      eg.addColorStop(1, 'rgba(120, 120, 200, 0)');
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.arc(ex, ey, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0b0814';
      ctx.beginPath();
      ctx.ellipse(ex, ey + 1, 3.4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  // золотое перо на шнурке
  const fx = 54;
  const fy2 = -150 + Math.sin(time * 1.1) * 4;
  ctx.save();
  ctx.strokeStyle = 'rgba(180, 156, 110, 0.55)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(30, headY + 44);
  ctx.quadraticCurveTo(fx - 10, -230, fx, fy2 - 26);
  ctx.stroke();

  ctx.translate(fx, fy2);
  ctx.rotate(0.22 + Math.sin(time * 0.9) * 0.04);
  const fg = ctx.createLinearGradient(0, -34, 0, 34);
  fg.addColorStop(0, 'rgba(255, 240, 190, 0.98)');
  fg.addColorStop(0.5, 'rgba(240, 199, 94, 0.95)');
  fg.addColorStop(1, 'rgba(170, 120, 40, 0.85)');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.quadraticCurveTo(13, -12, 0, 38);
  ctx.quadraticCurveTo(-13, -12, 0, -38);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 84, 30, 0.7)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -36);
  ctx.lineTo(0, 36);
  ctx.stroke();

  const halo = ctx.createRadialGradient(0, 0, 2, 0, 0, 58);
  halo.addColorStop(0, 'rgba(255, 214, 130, 0.35)');
  halo.addColorStop(1, 'rgba(255, 214, 130, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();

  // контровой свет слева
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const rim = ctx.createLinearGradient(-80, -330, 10, -120);
  rim.addColorStop(0, 'rgba(255, 206, 150, 0.22)');
  rim.addColorStop(1, 'rgba(255, 206, 150, 0)');
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.ellipse(-30, -220, 42, 130, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

export const BOSS_SPRITES = {
  keys: drawKeys,
  boiler: drawBoiler,
  moth: drawMoth,
  raven: drawRaven,
  shadow: drawShadowChiki,
  shunya: drawShunya,
};
