import { CHAPTERS, FONT_UI, FONT_TITLE } from './palette.js';
import {
  drawCat,
  drawPasta,
  drawPigeon,
  drawRoach,
  drawVacuum,
  drawFeather,
  drawSeed,
} from './sprites.js';
import { isPropHidden } from '../data/chapters.js';
import { clamp } from '../core/util.js';

function seeded(value) {
  const x = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function baseWall(ctx, palette, width, floorY) {
  const grad = ctx.createLinearGradient(0, 0, 0, floorY);
  grad.addColorStop(0, palette.wallDeep);
  grad.addColorStop(0.55, palette.wall);
  grad.addColorStop(1, palette.wallDeep);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, floorY);

  // обои: тонкие вертикальные полосы и ромбы
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#000';
  for (let x = 0; x < width; x += 64) {
    ctx.fillRect(x, 0, 2, floorY);
  }
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#f4e9ce';
  for (let x = 32; x < width; x += 64) {
    for (let y = 60; y < floorY - 40; y += 64) {
      ctx.beginPath();
      ctx.moveTo(x, y - 8);
      ctx.lineTo(x + 8, y);
      ctx.lineTo(x, y + 8);
      ctx.lineTo(x - 8, y);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();

  // верхняя тень
  const top = ctx.createLinearGradient(0, 0, 0, 120);
  top.addColorStop(0, 'rgba(4, 5, 9, 0.65)');
  top.addColorStop(1, 'rgba(4, 5, 9, 0)');
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, width, 120);

  // плинтус
  ctx.fillStyle = palette.wallDeep;
  ctx.fillRect(0, floorY - 26, width, 26);
  ctx.fillStyle = 'rgba(244, 233, 206, 0.12)';
  ctx.fillRect(0, floorY - 28, width, 3);
}

function drawPlankFloor(ctx, palette, width, floorY, plank = 96) {
  const grad = ctx.createLinearGradient(0, floorY, 0, 720);
  grad.addColorStop(0, palette.floor);
  grad.addColorStop(1, palette.floorDeep);
  ctx.fillStyle = grad;
  ctx.fillRect(0, floorY, width, 720 - floorY);
  ctx.save();
  ctx.strokeStyle = 'rgba(20, 12, 8, 0.35)';
  ctx.lineWidth = 2;
  for (let x = 0; x < width; x += plank) {
    ctx.beginPath();
    ctx.moveTo(x, floorY);
    ctx.lineTo(x - 40, 720);
    ctx.stroke();
  }
  for (let i = 0; i < 5; i += 1) {
    const y = floorY + 18 + i * 26;
    ctx.globalAlpha = 0.16;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + 4);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTileFloor(ctx, palette, width, floorY, tile = 74) {
  ctx.fillStyle = palette.floorDeep;
  ctx.fillRect(0, floorY, width, 720 - floorY);
  ctx.save();
  ctx.globalAlpha = 0.4;
  for (let x = 0; x < width; x += tile) {
    for (let y = floorY; y < 720; y += tile) {
      if ((x / tile + (y - floorY) / tile) % 2 === 0) {
        ctx.fillStyle = palette.floor;
        ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
      }
    }
  }
  ctx.restore();
}

function drawWindow(ctx, x, y, w, h, palette, time, options = {}) {
  const { moon = false, glow = 0.2 } = options;
  ctx.save();
  // рама
  ctx.fillStyle = '#2a2320';
  ctx.fillRect(x - 12, y - 12, w + 24, h + 24);
  // ночное небо
  const sky = ctx.createLinearGradient(x, y, x, y + h);
  sky.addColorStop(0, '#0d1322');
  sky.addColorStop(0.6, palette.skyTop);
  sky.addColorStop(1, palette.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  // далёкие дома
  ctx.fillStyle = 'rgba(6, 8, 14, 0.75)';
  for (let i = 0; i < 7; i += 1) {
    const bw = w / 7 + 4;
    const bh = 40 + seeded(i + x) * 90;
    ctx.fillRect(x + i * bw - 2, y + h - bh, bw, bh);
  }
  ctx.fillStyle = 'rgba(240, 199, 94, 0.5)';
  for (let i = 0; i < 14; i += 1) {
    const wx = x + 8 + seeded(i * 3.3) * (w - 16);
    const wy = y + h - 20 - seeded(i * 7.7) * 80;
    if (seeded(i * 9.1) > 0.55) {
      ctx.globalAlpha = 0.35 + seeded(i) * 0.4;
      ctx.fillRect(wx, wy, 3, 4);
    }
  }
  ctx.globalAlpha = 1;
  if (moon) {
    ctx.fillStyle = '#f4e9ce';
    ctx.beginPath();
    ctx.arc(x + w * 0.72, y + h * 0.28, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#121827';
    ctx.beginPath();
    ctx.arc(x + w * 0.77, y + h * 0.24, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  // блик
  const gl = ctx.createLinearGradient(x, y, x + w, y + h);
  gl.addColorStop(0, `rgba(200, 216, 255, ${glow * 0.5})`);
  gl.addColorStop(1, 'rgba(200, 216, 255, 0)');
  ctx.fillStyle = gl;
  ctx.fillRect(x, y, w, h);
  // переплёт
  ctx.strokeStyle = '#2a2320';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
  ctx.restore();
}

function lightShaft(ctx, x, y, w, h, color = 'rgba(210, 220, 255, 0.07)') {
  ctx.save();
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w + 220, y + h);
  ctx.lineTo(x + 120, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawDoor(ctx, door, palette, floorY, locked) {
  const w = door.art === 'arch' ? 150 : 140;
  const h = door.art === 'arch' ? 330 : 300;
  const x = door.x - w / 2;
  const y = floorY - h;
  ctx.save();
  if (door.art === 'arch') {
    ctx.fillStyle = '#0a0b10';
    ctx.beginPath();
    ctx.moveTo(x, floorY);
    ctx.lineTo(x, y + 40);
    ctx.quadraticCurveTo(x + w / 2, y - 40, x + w, y + 40);
    ctx.lineTo(x + w, floorY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(240, 199, 94, 0.15)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = 'rgba(240, 199, 94, 0.06)';
    ctx.fillRect(x + 10, y + 60, w - 20, h - 60);
  } else if (door.art === 'vent') {
    ctx.fillStyle = '#2b2f34';
    ctx.fillRect(x + 10, y + 150, w - 20, 120);
    ctx.strokeStyle = '#6d7680';
    ctx.lineWidth = 4;
    for (let i = 0; i < 7; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 14 + i * 16, y + 152);
      ctx.lineTo(x + 14 + i * 16, y + 268);
      ctx.stroke();
    }
    ctx.strokeStyle = '#1b1e21';
    ctx.strokeRect(x + 10, y + 150, w - 20, 120);
  } else if (door.art === 'balconyDoor') {
    ctx.fillStyle = '#1c2130';
    ctx.fillRect(x - 8, y - 10, w + 16, h + 10);
    const glass = ctx.createLinearGradient(x, y, x, y + h);
    glass.addColorStop(0, 'rgba(120, 150, 210, 0.3)');
    glass.addColorStop(0.5, 'rgba(30, 40, 70, 0.75)');
    glass.addColorStop(1, 'rgba(12, 16, 28, 0.9)');
    ctx.fillStyle = glass;
    ctx.fillRect(x + 12, y + 14, w - 24, h - 40);
    ctx.strokeStyle = '#b8892c';
    ctx.lineWidth = 5;
    ctx.strokeRect(x + 12, y + 14, w - 24, h - 40);
    ctx.beginPath();
    ctx.moveTo(door.x, y + 14);
    ctx.lineTo(door.x, y + h - 26);
    ctx.stroke();
    // пустой паз для пера
    ctx.fillStyle = '#0b0d14';
    ctx.beginPath();
    ctx.ellipse(door.x, y + 110, 12, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(240, 199, 94, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#8f6f2c';
    ctx.beginPath();
    ctx.arc(door.x + 46, y + h * 0.58, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#2f2620';
    ctx.fillRect(x - 8, y - 8, w + 16, h + 8);
    const wood = ctx.createLinearGradient(x, y, x + w, y + h);
    wood.addColorStop(0, '#5b4030');
    wood.addColorStop(0.5, '#483224');
    wood.addColorStop(1, '#33231a');
    ctx.fillStyle = wood;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(20, 12, 8, 0.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 16, y + 24, w - 32, h * 0.34);
    ctx.strokeRect(x + 16, y + h * 0.48, w - 32, h * 0.38);
    ctx.fillStyle = '#c9a55a';
    ctx.beginPath();
    ctx.arc(x + w - 24, y + h * 0.53, 6, 0, Math.PI * 2);
    ctx.fill();
    if (locked) {
      ctx.fillStyle = '#c9a55a';
      ctx.fillRect(x + w / 2 - 9, y + h * 0.42, 18, 16);
      ctx.strokeStyle = '#8a6a24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h * 0.42, 6, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = '#2a2018';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h * 0.42 + 8, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // тень у порога
  const shadow = ctx.createLinearGradient(0, floorY - 30, 0, floorY + 10);
  shadow.addColorStop(0, 'rgba(0,0,0,0)');
  shadow.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = shadow;
  ctx.fillRect(x - 10, floorY - 30, w + 20, 40);
  ctx.restore();
}

function drawSofa(ctx, prop, state, time) {
  const { x, y, w, h } = prop;
  ctx.save();
  // тень
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 8, w * 0.48, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  // спинка
  const fabric = ctx.createLinearGradient(0, y, 0, y + h);
  fabric.addColorStop(0, '#6c4550');
  fabric.addColorStop(1, '#4a2f38');
  ctx.fillStyle = fabric;
  ctx.strokeStyle = '#2e1d24';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x, y + 10, w, h - 10, 18);
  ctx.fill();
  ctx.stroke();
  // подушки
  ctx.fillStyle = '#7d505b';
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.roundRect(x + 18 + i * ((w - 36) / 3), y + 22, (w - 50) / 3, h * 0.48, 10);
    ctx.fill();
    ctx.stroke();
  }
  // сиденье
  ctx.fillStyle = '#5c3a45';
  ctx.beginPath();
  ctx.roundRect(x + 8, y + h * 0.58, w - 16, h * 0.3, 10);
  ctx.fill();
  ctx.stroke();
  // лапы
  ctx.fillStyle = '#3a2417';
  ctx.fillRect(x + 24, y + h - 8, 18, 18);
  ctx.fillRect(x + w - 42, y + h - 8, 18, 18);

  const outcome = state.player.bosses.cat;
  if (outcome !== 'kill') {
    const mood = outcome === 'spare' ? 'awake' : 'sleep';
    drawCat(ctx, x + w * 0.56, y + h * 0.5, {
      scale: 0.74,
      time,
      mood,
      facing: -1,
      alpha: 1,
    });
  } else {
    ctx.fillStyle = 'rgba(30, 20, 25, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.56, y + h * 0.64, 70, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(190, 180, 190, 0.35)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + w * 0.5 + i * 9, y + h * 0.62);
      ctx.quadraticCurveTo(x + w * 0.52 + i * 9, y + h * 0.56, x + w * 0.55 + i * 9, y + h * 0.64);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawCage(ctx, prop, state, time) {
  const { x, y, w, h } = prop;
  ctx.save();
  // тень
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 4, w * 0.5, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // подставка
  ctx.fillStyle = '#3b2a20';
  ctx.fillRect(x + 18, y + h - 28, w - 36, 20);
  ctx.fillStyle = '#2a1d16';
  ctx.fillRect(x + w / 2 - 8, y + h - 8, 16, 12);
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 2, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // каркас
  ctx.strokeStyle = '#9a8456';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 12, y + 40);
  ctx.lineTo(x + 12, y + h - 28);
  ctx.moveTo(x + w - 12, y + 40);
  ctx.lineTo(x + w - 12, y + h - 28);
  ctx.moveTo(x + 12, y + h - 28);
  ctx.lineTo(x + w - 12, y + h - 28);
  ctx.stroke();
  // купол
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 42);
  ctx.quadraticCurveTo(x + w / 2, y - 34, x + w - 8, y + 42);
  ctx.strokeStyle = '#b19862';
  ctx.lineWidth = 4;
  ctx.stroke();
  // прутья
  ctx.strokeStyle = 'rgba(200, 178, 126, 0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 10; i += 1) {
    const px = x + 12 + (i / 10) * (w - 24);
    const topY = y + 42 - Math.sin((i / 10) * Math.PI) * 62;
    ctx.beginPath();
    ctx.moveTo(px, topY);
    ctx.lineTo(px, y + h - 28);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x + 12, y + 120);
  ctx.lineTo(x + w - 12, y + 120);
  ctx.stroke();
  // открытая дверца
  ctx.strokeStyle = '#c9b27a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w - 12, y + 120);
  ctx.lineTo(x + w + 34, y + 148);
  ctx.lineTo(x + w + 34, y + 250);
  ctx.stroke();
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + w - 12 + i * 12, y + 128 + i * 6);
    ctx.lineTo(x + w + 34 - i * 2, y + 156 + i * 6);
    ctx.stroke();
  }
  // кормушка и качели
  ctx.fillStyle = '#7d8b74';
  ctx.beginPath();
  ctx.ellipse(x + 58, y + h - 44, 20, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d9b25c';
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(x + 50 + i * 5, y + h - 47, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#c9b27a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 96, y + 100);
  ctx.lineTo(x + 96, y + 140);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x + 96, y + 146, 16, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#c9b27a';
  ctx.fill();
  // тень внутри
  ctx.fillStyle = 'rgba(10, 8, 12, 0.25)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 32, w * 0.35, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTV(ctx, prop, time) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.fillStyle = '#2a2018';
  ctx.fillRect(x + 30, y + h - 14, w - 60, 20);
  ctx.fillStyle = '#1b1613';
  ctx.beginPath();
  ctx.roundRect(x, y + 20, w, h - 40, 10);
  ctx.fill();
  ctx.strokeStyle = '#4a3a2c';
  ctx.lineWidth = 3;
  ctx.stroke();
  const screen = ctx.createLinearGradient(x + 20, y + 40, x + w - 20, y + h - 30);
  screen.addColorStop(0, '#1d3a44');
  screen.addColorStop(0.5, '#2f5a62');
  screen.addColorStop(1, '#16262c');
  ctx.fillStyle = screen;
  ctx.beginPath();
  ctx.roundRect(x + 20, y + 40, w - 40, h - 80, 14);
  ctx.fill();
  const flicker = 0.06 + Math.abs(Math.sin(time * 7.3)) * 0.06;
  ctx.fillStyle = `rgba(180, 230, 240, ${flicker})`;
  ctx.fillRect(x + 20, y + 40, w - 40, h - 80);
  ctx.strokeStyle = 'rgba(240, 240, 230, 0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i += 1) {
    const ly = y + 50 + i * 16;
    ctx.beginPath();
    ctx.moveTo(x + 30, ly);
    ctx.lineTo(x + w - 30 - (i % 3) * 20, ly);
    ctx.stroke();
  }
  // антенна
  ctx.strokeStyle = '#9a8456';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 20);
  ctx.lineTo(x + w / 2 - 36, y - 26);
  ctx.moveTo(x + w / 2, y + 20);
  ctx.lineTo(x + w / 2 + 30, y - 18);
  ctx.stroke();
  ctx.restore();
}

function drawPlant(ctx, prop, time) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h, w * 0.42, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  const pot = ctx.createLinearGradient(x + 30, y + h - 70, x + w - 30, y + h);
  pot.addColorStop(0, '#a0664a');
  pot.addColorStop(1, '#6e402d');
  ctx.fillStyle = pot;
  ctx.beginPath();
  ctx.moveTo(x + 34, y + h - 74);
  ctx.lineTo(x + w - 34, y + h - 74);
  ctx.lineTo(x + w - 44, y + h - 10);
  ctx.lineTo(x + 44, y + h - 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4a2a1c';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#4a3324';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 76, w * 0.3, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3f6a44';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h - 76);
  ctx.lineTo(x + w / 2, y + 34);
  ctx.stroke();
  const leaves = [
    { lx: -52, ly: -20, r: -0.6 },
    { lx: 46, ly: 4, r: 0.5 },
    { lx: -40, ly: 32, r: -0.4 },
    { lx: 38, ly: 50, r: 0.35 },
    { lx: -26, ly: 66, r: -0.9 },
  ];
  leaves.forEach((leaf, index) => {
    ctx.save();
    ctx.translate(x + w / 2, y + h - 80);
    ctx.rotate(leaf.r + Math.sin(time * 1.2 + index) * 0.02);
    ctx.fillStyle = index % 2 ? '#4f8a56' : '#3f7048';
    ctx.beginPath();
    ctx.ellipse(leaf.lx * 0.9, leaf.ly - 20, 26, 13, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2c5033';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
}

function drawPhoto(ctx, prop) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.fillStyle = '#3a2b20';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#6a5638';
  ctx.fillRect(x + 5, y + 5, w - 10, h - 10);
  ctx.fillStyle = '#cfc2a4';
  ctx.fillRect(x + 10, y + 10, w - 20, h - 20);
  // силуэт женщины и клетки
  ctx.fillStyle = '#6b6150';
  ctx.beginPath();
  ctx.arc(x + w * 0.38, y + h * 0.44, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + w * 0.3, y + h * 0.78);
  ctx.quadraticCurveTo(x + w * 0.38, y + h * 0.52, x + w * 0.46, y + h * 0.78);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#6b6150';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + w * 0.62, y + h * 0.36, w * 0.2, h * 0.34);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.62, y + h * 0.55);
  ctx.lineTo(x + w * 0.82, y + h * 0.55);
  ctx.stroke();
  ctx.restore();
}

function drawMirror(ctx, prop, time) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.fillStyle = '#b8892c';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 40);
  ctx.fill();
  ctx.fillStyle = '#5a4630';
  ctx.beginPath();
  ctx.roundRect(x + 8, y + 8, w - 16, h - 16, 34);
  ctx.fill();
  const glass = ctx.createLinearGradient(x, y, x + w, y + h);
  glass.addColorStop(0, '#46536b');
  glass.addColorStop(0.5, '#2d3648');
  glass.addColorStop(1, '#1c2333');
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.roundRect(x + 12, y + 12, w - 24, h - 24, 30);
  ctx.fill();
  const shimmer = (Math.sin(time * 0.7) + 1) / 2;
  ctx.globalAlpha = 0.15 + shimmer * 0.15;
  ctx.fillStyle = '#dbe6ff';
  ctx.beginPath();
  ctx.moveTo(x + 20, y + h - 40);
  ctx.lineTo(x + w - 30, y + 30);
  ctx.lineTo(x + w - 16, y + 30);
  ctx.lineTo(x + 20, y + h - 24);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCoat(ctx, prop) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.strokeStyle = '#8d7a52';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 4);
  ctx.lineTo(x + w / 2, y + 50);
  ctx.stroke();
  ctx.fillStyle = '#3d4658';
  ctx.strokeStyle = '#252c3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 44);
  ctx.lineTo(x + w / 2 - 44, y + 96);
  ctx.lineTo(x + w / 2 - 52, y + h);
  ctx.lineTo(x + w / 2 + 52, y + h);
  ctx.lineTo(x + w / 2 + 44, y + 96);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(20, 26, 38, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 50);
  ctx.lineTo(x + w / 2, y + h - 10);
  ctx.stroke();
  ctx.fillStyle = '#2a3140';
  ctx.fillRect(x + w / 2 - 52, y + 150, 18, 40);
  ctx.fillStyle = '#a58a5c';
  ctx.beginPath();
  ctx.arc(x + w / 2 - 30, y + 170, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWallNote(ctx, prop) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.fillStyle = '#e3d6b6';
  ctx.beginPath();
  ctx.moveTo(x + 10, y);
  ctx.lineTo(x + w, y + 6);
  ctx.lineTo(x + w - 6, y + h);
  ctx.lineTo(x, y + h - 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#a89a75';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = '#8d7c58';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 16 + i * 12);
    ctx.lineTo(x + w - 12, y + 18 + i * 12);
    ctx.stroke();
  }
  ctx.fillStyle = '#a53f36';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 6, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTub(ctx, prop, state, time) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 4, w * 0.46, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  const tub = ctx.createLinearGradient(0, y, 0, y + h);
  tub.addColorStop(0, '#e8e4da');
  tub.addColorStop(1, '#b9b4a8');
  ctx.fillStyle = tub;
  ctx.strokeStyle = '#7d7a70';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 20, y + 30);
  ctx.lineTo(x + w - 20, y + 30);
  ctx.quadraticCurveTo(x + w - 8, y + 60, x + w - 30, y + h - 30);
  ctx.lineTo(x + 30, y + h - 30);
  ctx.quadraticCurveTo(x + 8, y + 60, x + 20, y + 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#8f8b80';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + 34, w * 0.36, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // ножки
  ctx.fillStyle = '#6a5a42';
  ctx.beginPath();
  ctx.arc(x + 36, y + h - 26, 12, 0, Math.PI * 2);
  ctx.arc(x + w - 36, y + h - 26, 12, 0, Math.PI * 2);
  ctx.fill();

  // Таракан-Торговец под ванной
  const met = state.player.flags.metRoach;
  drawRoach(ctx, x + w * 0.5, y + h - 4, { scale: 0.95, time, alpha: 0.95 });
  if (met) {
    ctx.fillStyle = '#3a3226';
    ctx.fillRect(x + w * 0.5 + 30, y + h - 34, 54, 30);
    ctx.fillStyle = '#5a4c38';
    ctx.fillRect(x + w * 0.5 + 30, y + h - 40, 54, 8);
    ctx.fillStyle = '#c9b27a';
    ctx.font = `9px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.fillText('ТОВАР', x + w * 0.5 + 57, y + h - 20);
  }
  // занавеска
  ctx.fillStyle = 'rgba(120, 150, 165, 0.35)';
  ctx.beginPath();
  ctx.moveTo(x + w - 90, y - 120);
  ctx.lineTo(x + w - 30, y - 120);
  ctx.quadraticCurveTo(x + w - 44, y + 40, x + w - 96, y + 70);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPipe(ctx, prop) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.fillStyle = '#6d7a7e';
  ctx.fillRect(x + w * 0.35, y, w * 0.3, h);
  ctx.fillStyle = '#8d9a9e';
  ctx.fillRect(x + w * 0.38, y, w * 0.08, h);
  ctx.strokeStyle = '#3f4a4d';
  ctx.lineWidth = 3;
  ctx.strokeRect(x + w * 0.35, y, w * 0.3, h);
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = '#535f62';
    ctx.fillRect(x + w * 0.28, y + 40 + i * 90, w * 0.44, 14);
  }
  ctx.fillStyle = '#b8892c';
  ctx.beginPath();
  ctx.arc(x + w * 0.5, y + 120, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6a4d18';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5 - 12, y + 120);
  ctx.lineTo(x + w * 0.5 + 12, y + 120);
  ctx.moveTo(x + w * 0.5, y + 108);
  ctx.lineTo(x + w * 0.5, y + 132);
  ctx.stroke();
  ctx.restore();
}

function drawBathShelf(ctx, prop) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.fillStyle = '#4a3a2c';
  ctx.fillRect(x, y + h - 16, w, 16);
  ctx.fillRect(x, y + h - 90, w, 12);
  const colors = ['#7fb2e6', '#b58be0', '#e2645e', '#8fd3a8'];
  for (let shelf = 0; shelf < 2; shelf += 1) {
    const sy = y + h - 16 - shelf * 74;
    for (let i = 0; i < 4; i += 1) {
      const bw = 18 + (i % 2) * 6;
      const bh = 30 + ((i * 7) % 18);
      ctx.fillStyle = colors[(i + shelf) % colors.length];
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.roundRect(x + 10 + i * 42, sy - bh, bw, bh, 5);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(x + 13 + i * 42, sy - bh + 5, 4, bh - 10);
    }
  }
  ctx.restore();
}

function drawJars(ctx, prop, state) {
  const { x, y, w, h } = prop;
  const used = state.used.includes('pantry_jar');
  ctx.save();
  ctx.fillStyle = '#4a3826';
  ctx.fillRect(x, y + h - 18, w, 18);
  ctx.fillRect(x, y + h - 106, w, 14);
  for (let i = 0; i < 6; i += 1) {
    const jx = x + 12 + i * 46;
    const jh = 54 + (i % 3) * 10;
    ctx.fillStyle = 'rgba(190, 205, 190, 0.28)';
    ctx.strokeStyle = 'rgba(230, 235, 220, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(jx, y + h - 18 - jh, 34, jh, 8);
    ctx.fill();
    ctx.stroke();
    const isEmpty = used && i === 2;
    ctx.fillStyle = isEmpty ? 'rgba(90, 70, 40, 0.35)' : '#c9a95e';
    ctx.beginPath();
    ctx.roundRect(jx + 4, y + h - 18 - jh + 20, 26, jh - 26, 5);
    ctx.fill();
    if (!isEmpty) {
      for (let s = 0; s < 8; s += 1) {
        ctx.fillStyle = s % 2 ? '#d9b25c' : '#b8893c';
        ctx.beginPath();
        ctx.ellipse(jx + 10 + (s % 3) * 6, y + h - 30 - Math.floor(s / 3) * 8, 3, 5, s, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#7a5a2e';
    ctx.fillRect(jx - 2, y + h - 18 - jh - 6, 38, 8);
  }
  ctx.restore();
}

function drawCrates(ctx, prop) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.fillStyle = '#6b4c30';
  ctx.strokeStyle = '#3b2a1a';
  ctx.lineWidth = 3;
  ctx.fillRect(x + 20, y + h - 110, 120, 110);
  ctx.strokeRect(x + 20, y + h - 110, 120, 110);
  ctx.fillStyle = '#7d5a3a';
  ctx.fillRect(x + 90, y + 30, 140, 130);
  ctx.strokeRect(x + 90, y + 30, 140, 130);
  ctx.strokeStyle = 'rgba(50, 35, 20, 0.6)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 24, y + h - 96 + i * 22);
    ctx.lineTo(x + 136, y + h - 96 + i * 22);
    ctx.moveTo(x + 94, y + 44 + i * 26);
    ctx.lineTo(x + 226, y + 44 + i * 26);
    ctx.stroke();
  }
  ctx.fillStyle = '#d8cba6';
  ctx.fillRect(x + 120, y + 60, 70, 26);
  ctx.strokeStyle = '#8d7c58';
  ctx.strokeRect(x + 120, y + 60, 70, 26);
  ctx.fillStyle = '#5a4a30';
  ctx.font = `10px ${FONT_UI}`;
  ctx.fillText('КРУПА', x + 130, y + 78);
  ctx.restore();
}

function drawSack(ctx, prop) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.fillStyle = '#9c8f70';
  ctx.strokeStyle = '#5c513c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 12, y + h);
  ctx.quadraticCurveTo(x - 4, y + 20, x + w / 2, y + 10);
  ctx.quadraticCurveTo(x + w + 4, y + 20, x + w - 12, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#6b5f46';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w / 2 - 20, y + 24);
  ctx.lineTo(x + w / 2 + 20, y + 24);
  ctx.stroke();
  ctx.fillStyle = '#c9b27a';
  ctx.font = `11px ${FONT_UI}`;
  ctx.textAlign = 'center';
  ctx.fillText('КРУПА', x + w / 2, y + h - 32);
  ctx.restore();
}

function drawMousetrap(ctx, prop) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.fillStyle = '#8d6b45';
  ctx.fillRect(x, y + h - 18, w, 18);
  ctx.strokeStyle = '#5a432c';
  ctx.strokeRect(x, y + h - 18, w, 18);
  ctx.strokeStyle = '#c9ced2';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 12, y + h - 20);
  ctx.lineTo(x + w - 12, y + h - 20);
  ctx.lineTo(x + w - 12, y + h - 44);
  ctx.stroke();
  ctx.fillStyle = '#d9b25c';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h - 26, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawVacuumBoss(ctx, prop, state, time) {
  const { x, y, w, h } = prop;
  const outcome = state.player.bosses.vacuum;
  const cx = x + w / 2;
  ctx.save();
  if (outcome === 'kill') {
    ctx.globalAlpha = 0.35;
    drawVacuum(ctx, cx, y + h + 10, { scale: 0.9, time, angry: false });
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#1c2126';
    ctx.beginPath();
    ctx.ellipse(cx, y + h - 20, 90, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    drawVacuum(ctx, cx, y + h + 10, {
      scale: 1.08,
      time,
      angry: outcome !== 'spare',
    });
  }
  ctx.restore();
}

function drawBag(ctx, prop) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.fillStyle = '#8d7a5c';
  ctx.strokeStyle = '#4f4330';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 10, y + h);
  ctx.quadraticCurveTo(x - 6, y + 20, x + w / 2, y + 8);
  ctx.quadraticCurveTo(x + w + 6, y + 20, x + w - 10, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#5a4c36';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + w / 2 - 26, y + 26);
  ctx.lineTo(x + w / 2 + 26, y + 26);
  ctx.stroke();
  ctx.fillStyle = '#3b3428';
  ctx.font = `10px ${FONT_UI}`;
  ctx.textAlign = 'center';
  ctx.fillText('ПЫЛЕСОС', x + w / 2, y + h - 26);
  ctx.restore();
}

function drawFridge(ctx, prop) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 2, w * 0.46, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  const body = ctx.createLinearGradient(x, y, x + w, y);
  body.addColorStop(0, '#d9d6cc');
  body.addColorStop(0.5, '#c4c0b4');
  body.addColorStop(1, '#a8a498');
  ctx.fillStyle = body;
  ctx.strokeStyle = '#77746a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#8d8a80';
  ctx.beginPath();
  ctx.moveTo(x + 6, y + h * 0.42);
  ctx.lineTo(x + w - 6, y + h * 0.42);
  ctx.stroke();
  ctx.fillStyle = '#8d8a80';
  ctx.fillRect(x + w - 26, y + 40, 6, 60);
  ctx.fillRect(x + w - 26, y + h * 0.5, 6, 40);
  // магнитики
  ctx.fillStyle = '#e2645e';
  ctx.beginPath();
  ctx.arc(x + 36, y + 44, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7fb2e6';
  ctx.fillRect(x + 56, y + 36, 16, 16);
  ctx.fillStyle = '#e3d6b6';
  ctx.fillRect(x + 26, y + 66, 46, 34);
  ctx.strokeStyle = '#a89a75';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 30, y + 76 + i * 7);
    ctx.lineTo(x + 66, y + 76 + i * 7);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTable(ctx, prop, state, time) {
  const { x, y, w, h } = prop;
  const used = state.used.includes('kitchen_table');
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 4, w * 0.44, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a6440';
  ctx.fillRect(x + w / 2 - 50, y + 46, 16, h - 46);
  ctx.fillRect(x + w / 2 + 34, y + 46, 16, h - 46);
  const top = ctx.createLinearGradient(0, y, 0, y + 46);
  top.addColorStop(0, '#c9a475');
  top.addColorStop(1, '#9a7650');
  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.roundRect(x, y + 26, w, 34, 6);
  ctx.fill();
  ctx.strokeStyle = '#5c432c';
  ctx.lineWidth = 3;
  ctx.stroke();
  if (!used) {
    ctx.fillStyle = '#e8e2d0';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + 26, 62, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b9b2a0';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#e8c06a';
    for (let i = 0; i < 12; i += 1) {
      ctx.save();
      ctx.translate(x + w / 2 + Math.cos(i * 2.1) * 34, y + 22 + Math.sin(i * 1.7) * 6);
      ctx.rotate(i);
      ctx.fillRect(-2, -6, 4, 12);
      ctx.restore();
    }
    // пар
    ctx.strokeStyle = 'rgba(240, 240, 230, 0.28)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i += 1) {
      const phase = time * 0.9 + i * 1.2;
      ctx.beginPath();
      ctx.moveTo(x + w / 2 - 26 + i * 26, y + 18);
      ctx.bezierCurveTo(
        x + w / 2 - 34 + i * 26,
        y - 6,
        x + w / 2 - 14 + i * 26,
        y - 18,
        x + w / 2 - 24 + i * 26,
        y - 44,
      );
      ctx.stroke();
    }
  }
  // вилка
  ctx.strokeStyle = '#c9ced2';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 62, y + 40);
  ctx.lineTo(x + 62, y + 18);
  ctx.stroke();
  ctx.restore();
}

function drawStove(ctx, prop, time) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.fillStyle = '#6d6a62';
  ctx.fillRect(x, y + h - 120, w, 120);
  ctx.fillStyle = '#8d8a80';
  ctx.fillRect(x, y + h - 130, w, 14);
  // плита
  ctx.fillStyle = '#2b2b2e';
  ctx.fillRect(x, y + h - 152, w, 24);
  for (let i = 0; i < 2; i += 1) {
    ctx.strokeStyle = '#8d8a80';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 60 + i * 120, y + h - 140, 26, 0, Math.PI * 2);
    ctx.stroke();
  }
  // кастрюля
  ctx.fillStyle = '#9aa3aa';
  ctx.beginPath();
  ctx.roundRect(x + 42, y + h - 224, 150, 80, 8);
  ctx.fill();
  ctx.fillStyle = '#7d8790';
  ctx.beginPath();
  ctx.ellipse(x + 117, y + h - 224, 75, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c9ced2';
  ctx.beginPath();
  ctx.ellipse(x + 117, y + h - 228, 70, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // пар
  ctx.strokeStyle = `rgba(240, 240, 230, ${0.2 + Math.sin(time * 2) * 0.05})`;
  ctx.lineWidth = 4;
  for (let i = 0; i < 3; i += 1) {
    const px = x + 80 + i * 34;
    ctx.beginPath();
    ctx.moveTo(px, y + h - 240);
    ctx.bezierCurveTo(px - 16, y + h - 280, px + 18, y + h - 300, px - 6, y + h - 340);
    ctx.stroke();
  }
  // духовка
  ctx.fillStyle = '#4a4842';
  ctx.fillRect(x + 24, y + h - 100, w - 48, 80);
  ctx.strokeStyle = '#a8a498';
  ctx.strokeRect(x + 24, y + h - 100, w - 48, 80);
  ctx.fillStyle = '#c9a55a';
  ctx.fillRect(x + 40, y + h - 82, w - 80, 6);
  ctx.restore();
}

function drawPigeonWindow(ctx, prop, state, time) {
  const { x, y, w, h } = prop;
  ctx.save();
  drawWindow(ctx, x, y, w, h, CHAPTERS[state.chapter]?.palette || CHAPTERS[1].palette, time, {
    moon: state.chapter >= 3,
    glow: 0.28,
  });
  ctx.fillStyle = '#3a2b20';
  ctx.fillRect(x - 20, y + h - 8, w + 40, 16);
  if (!isPropHidden(prop, state)) {
    drawPigeon(ctx, x + w * 0.58, y + h - 4, { scale: 1.05, time });
  }
  ctx.restore();
}

function drawBowl(ctx, prop, state) {
  const { x, y, w, h } = prop;
  const used = state.used.includes('water_bowl');
  ctx.save();
  ctx.fillStyle = '#8d8a80';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 10, w * 0.46, 16, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = used ? 'rgba(120, 130, 140, 0.25)' : '#7fb2e6';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 16, w * 0.36, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPastaBoss(ctx, prop, state, time) {
  const { x, y, w, h } = prop;
  const outcome = state.player.bosses.pasta;
  const cx = x + w / 2;
  ctx.save();
  if (outcome === 'kill') {
    ctx.globalAlpha = 0.4;
    drawPasta(ctx, cx, y + h + 10, { scale: 0.86, time });
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#2b2b2e';
    ctx.beginPath();
    ctx.ellipse(cx, y + h - 12, 80, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    drawPasta(ctx, cx, y + h + 10, { scale: 1.04, time });
  }
  ctx.restore();
}

function drawRug(ctx, prop) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.fillStyle = '#7a4a44';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9a55a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2 - 8, h / 1.8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawLooseBoard(ctx, prop) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.fillStyle = 'rgba(20, 12, 8, 0.5)';
  ctx.beginPath();
  ctx.moveTo(x + 10, y + h);
  ctx.lineTo(x + 24, y);
  ctx.lineTo(x + w, y + 6);
  ctx.lineTo(x + w - 14, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(240, 220, 170, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 24, y);
  ctx.lineTo(x + w, y + 6);
  ctx.stroke();
  ctx.restore();
}

function drawProp(ctx, prop, state, time) {
  switch (prop.art) {
    case 'cage':
      drawCage(ctx, prop, state, time);
      break;
    case 'sofa':
      drawSofa(ctx, prop, state, time);
      break;
    case 'tv':
      drawTV(ctx, prop, time);
      break;
    case 'plant':
      drawPlant(ctx, prop, time);
      break;
    case 'photo':
      drawPhoto(ctx, prop);
      break;
    case 'mirror':
      drawMirror(ctx, prop, time);
      break;
    case 'coat':
      drawCoat(ctx, prop);
      break;
    case 'wallNote':
      drawWallNote(ctx, prop);
      break;
    case 'tub':
      drawTub(ctx, prop, state, time);
      break;
    case 'pipe':
      drawPipe(ctx, prop);
      break;
    case 'bathShelf':
      drawBathShelf(ctx, prop);
      break;
    case 'jars':
      drawJars(ctx, prop, state);
      break;
    case 'crates':
      drawCrates(ctx, prop);
      break;
    case 'sack':
      drawSack(ctx, prop);
      break;
    case 'mousetrap':
      drawMousetrap(ctx, prop);
      break;
    case 'vacuumBoss':
      drawVacuumBoss(ctx, prop, state, time);
      break;
    case 'bag':
      drawBag(ctx, prop);
      break;
    case 'fridge':
      drawFridge(ctx, prop);
      break;
    case 'table':
      drawTable(ctx, prop, state, time);
      break;
    case 'stove':
      drawStove(ctx, prop, time);
      break;
    case 'pigeonWindow':
      drawPigeonWindow(ctx, prop, state, time);
      break;
    case 'bowl':
      drawBowl(ctx, prop, state);
      break;
    case 'pastaBoss':
      drawPastaBoss(ctx, prop, state, time);
      break;
    case 'rug':
      drawRug(ctx, prop);
      break;
    case 'looseBoard':
      drawLooseBoard(ctx, prop);
      break;
    case 'scratch':
      drawScratch(ctx, prop);
      break;
    case 'seedPile':
      drawSeedPile(ctx, prop, time);
      break;
    default:
      break;
  }
}

function drawScratch(ctx, prop) {
  const { x, y, w, h } = prop;
  ctx.save();
  ctx.strokeStyle = 'rgba(230, 235, 225, 0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + i * 22, y + 8);
    ctx.lineTo(x + i * 22 + 8, y + h - 10);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(30, 25, 20, 0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 10, y + h - 20);
  ctx.lineTo(x + w + 20, y + 20);
  ctx.stroke();
  ctx.restore();
}

function drawSeedPile(ctx, prop, time) {
  const { x, y, w } = prop;
  ctx.save();
  for (let i = 0; i < 8; i += 1) {
    drawSeed(ctx, x + (i % 4) * 14 + (i % 2) * 4, y + 20 + Math.floor(i / 4) * 8, {
      scale: 0.9,
      rotation: i * 0.7,
      alpha: 0.9,
    });
  }
  ctx.globalAlpha = 0.4 + Math.sin(time * 2) * 0.1;
  ctx.fillStyle = '#f0c75e';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 8, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLivingBackground(ctx, room, palette, time) {
  baseWall(ctx, palette, room.width, room.floorY);
  drawPlankFloor(ctx, palette, room.width, room.floorY);
  drawWindow(ctx, 900, 130, 300, 260, palette, time, { moon: false, glow: 0.18 });
  lightShaft(ctx, 1030, 190, 160, 420, 'rgba(160, 180, 220, 0.09)');
  // шторы
  [860, 1200].forEach((sx, index) => {
    const grad = ctx.createLinearGradient(sx, 100, sx + 70, 400);
    grad.addColorStop(0, index === 0 ? '#6a4450' : '#5e3c47');
    grad.addColorStop(1, '#3a2530');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(sx, 90);
    ctx.quadraticCurveTo(sx + 40, 240, sx + 16, 420);
    ctx.lineTo(sx + 70, 420);
    ctx.quadraticCurveTo(sx + 60, 220, sx + 60, 90);
    ctx.closePath();
    ctx.fill();
  });
  // карниз
  ctx.fillStyle = '#3a2a20';
  ctx.fillRect(840, 86, 440, 12);
  // люстра
  ctx.strokeStyle = '#3a2a20';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(600, 0);
  ctx.lineTo(600, 80);
  ctx.stroke();
  ctx.fillStyle = '#c9a55a';
  ctx.beginPath();
  ctx.moveTo(560, 110);
  ctx.lineTo(640, 110);
  ctx.lineTo(620, 66);
  ctx.lineTo(580, 66);
  ctx.closePath();
  ctx.fill();
  const glow = ctx.createRadialGradient(600, 130, 10, 600, 130, 180);
  glow.addColorStop(0, 'rgba(240, 199, 94, 0.18)');
  glow.addColorStop(1, 'rgba(240, 199, 94, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(420, 0, 360, 340);
}

function drawHallBackground(ctx, room, palette, time) {
  baseWall(ctx, palette, room.width, room.floorY);
  drawPlankFloor(ctx, palette, room.width, room.floorY);
  // ковровая дорожка
  ctx.fillStyle = 'rgba(90, 45, 55, 0.55)';
  ctx.beginPath();
  ctx.moveTo(0, 640);
  ctx.lineTo(room.width, 630);
  ctx.lineTo(room.width, 700);
  ctx.lineTo(0, 712);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(240, 199, 94, 0.18)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 650);
  ctx.lineTo(room.width, 640);
  ctx.moveTo(0, 694);
  ctx.lineTo(room.width, 684);
  ctx.stroke();
  // низкая полка
  ctx.fillStyle = '#4a3826';
  ctx.fillRect(720, 470, 220, 12);
  // лампа
  ctx.strokeStyle = '#3a2a20';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(1180, 0);
  ctx.lineTo(1180, 70);
  ctx.stroke();
  ctx.fillStyle = '#d9c48a';
  ctx.beginPath();
  ctx.moveTo(1140, 70);
  ctx.lineTo(1220, 70);
  ctx.lineTo(1204, 110);
  ctx.lineTo(1156, 110);
  ctx.closePath();
  ctx.fill();
  const glow = ctx.createRadialGradient(1180, 120, 10, 1180, 120, 220);
  glow.addColorStop(0, 'rgba(240, 199, 94, 0.16)');
  glow.addColorStop(1, 'rgba(240, 199, 94, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(940, 0, 480, 380);
}

function drawBathBackground(ctx, room, palette, time) {
  // плитка
  const grad = ctx.createLinearGradient(0, 0, 0, room.floorY);
  grad.addColorStop(0, '#2e4244');
  grad.addColorStop(1, '#3c5254');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, room.width, room.floorY);
  ctx.strokeStyle = 'rgba(180, 210, 205, 0.12)';
  ctx.lineWidth = 2;
  for (let x = 0; x < room.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, room.floorY);
    ctx.stroke();
  }
  for (let y = 0; y < room.floorY; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(room.width, y);
    ctx.stroke();
  }
  drawTileFloor(ctx, palette, room.width, room.floorY, 64);
  // лампа
  const glow = ctx.createRadialGradient(760, 120, 20, 760, 120, 360);
  glow.addColorStop(0, 'rgba(180, 220, 200, 0.2)');
  glow.addColorStop(1, 'rgba(180, 220, 200, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(380, 0, 760, 520);
  // лужа
  ctx.fillStyle = 'rgba(110, 160, 170, 0.18)';
  ctx.beginPath();
  ctx.ellipse(1250, 660, 130, 26, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPantryBackground(ctx, room, palette, time) {
  baseWall(ctx, palette, room.width, room.floorY);
  drawPlankFloor(ctx, palette, room.width, room.floorY, 78);
  // стеллаж на стене
  ctx.fillStyle = '#3f4a32';
  ctx.fillRect(0, 170, room.width, 18);
  ctx.fillRect(0, 330, room.width, 14);
  for (let x = 40; x < room.width; x += 260) {
    ctx.fillStyle = '#4a5638';
    ctx.fillRect(x, 120, 16, 480);
  }
  // коробки на верхней полке
  for (let i = 0; i < 9; i += 1) {
    const bx = 80 + i * 230;
    ctx.fillStyle = i % 2 ? '#5c4a30' : '#4f3f2a';
    ctx.fillRect(bx, 100 + (i % 3) * 12, 70, 60);
    ctx.strokeStyle = '#2e2418';
    ctx.strokeRect(bx, 100 + (i % 3) * 12, 70, 60);
  }
  // лампочка
  ctx.strokeStyle = '#2a2a24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(1150, 0);
  ctx.lineTo(1150, 90);
  ctx.stroke();
  ctx.fillStyle = '#f0e3b0';
  ctx.beginPath();
  ctx.arc(1150, 104, 12, 0, Math.PI * 2);
  ctx.fill();
  const glow = ctx.createRadialGradient(1150, 110, 8, 1150, 110, 300);
  glow.addColorStop(0, 'rgba(240, 220, 160, 0.18)');
  glow.addColorStop(1, 'rgba(240, 220, 160, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(850, 0, 600, 500);
}

function drawDeepBackground(ctx, room, palette, time) {
  const grad = ctx.createLinearGradient(0, 0, 0, room.floorY);
  grad.addColorStop(0, '#1e241e');
  grad.addColorStop(1, '#2b3227');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, room.width, room.floorY);
  drawPlankFloor(ctx, palette, room.width, room.floorY, 70);
  // штабели коробок
  const boxes = [
    { x: 120, y: 420, w: 160, h: 180 },
    { x: 250, y: 360, w: 130, h: 240 },
    { x: 1450, y: 380, w: 190, h: 220 },
    { x: 1600, y: 440, w: 140, h: 160 },
    { x: 680, y: 470, w: 150, h: 130 },
  ];
  boxes.forEach((box, index) => {
    ctx.fillStyle = index % 2 ? '#4a3c2b' : '#3f3325';
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = 'rgba(20, 16, 12, 0.6)';
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = 'rgba(220, 200, 160, 0.1)';
    ctx.beginPath();
    ctx.moveTo(box.x + 10, box.y + 20);
    ctx.lineTo(box.x + box.w - 10, box.y + 20);
    ctx.stroke();
  });
  // трубы
  ctx.strokeStyle = '#4d5a52';
  ctx.lineWidth = 22;
  ctx.beginPath();
  ctx.moveTo(0, 90);
  ctx.lineTo(room.width, 60);
  ctx.stroke();
  ctx.strokeStyle = '#68786c';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 84);
  ctx.lineTo(room.width, 54);
  ctx.stroke();
  // лампочка
  ctx.strokeStyle = '#22231e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(900, 0);
  ctx.lineTo(900, 120);
  ctx.stroke();
  ctx.fillStyle = '#efe2b0';
  ctx.beginPath();
  ctx.arc(900, 134, 11, 0, Math.PI * 2);
  ctx.fill();
  const glow = ctx.createRadialGradient(900, 140, 10, 900, 140, 340);
  glow.addColorStop(0, 'rgba(240, 220, 150, 0.2)');
  glow.addColorStop(1, 'rgba(240, 220, 150, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(560, 0, 680, 520);
}

function drawVentBackground(ctx, room, palette, time) {
  const grad = ctx.createLinearGradient(0, 0, 0, 720);
  grad.addColorStop(0, '#20262a');
  grad.addColorStop(0.55, '#2e363a');
  grad.addColorStop(1, '#181d20');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, room.width, 720);
  // рёбра туннеля
  ctx.strokeStyle = 'rgba(140, 160, 165, 0.14)';
  ctx.lineWidth = 8;
  for (let x = 40; x < room.width; x += 210) {
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x + 40, 660);
    ctx.stroke();
  }
  // пол
  ctx.fillStyle = '#3a4245';
  ctx.fillRect(0, room.floorY - 8, room.width, 16);
  ctx.fillStyle = 'rgba(110, 130, 135, 0.4)';
  for (let x = 0; x < room.width; x += 34) {
    ctx.fillRect(x, room.floorY - 8, 20, 6);
  }
  // световые щели
  for (const lx of [320, 740, 1120]) {
    const glow = ctx.createLinearGradient(lx, 0, lx, 660);
    glow.addColorStop(0, 'rgba(220, 230, 200, 0.14)');
    glow.addColorStop(1, 'rgba(220, 230, 200, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(lx, 30, 16, 620);
  }
}

function drawKitchenBackground(ctx, room, palette, time) {
  baseWall(ctx, palette, room.width, room.floorY);
  drawTileFloor(ctx, palette, room.width, room.floorY, 80);
  // кухонный фартук
  ctx.fillStyle = 'rgba(220, 225, 215, 0.1)';
  for (let x = 0; x < room.width; x += 54) {
    for (let y = 300; y < 430; y += 54) {
      ctx.strokeStyle = 'rgba(230, 235, 225, 0.12)';
      ctx.strokeRect(x, y, 54, 54);
    }
  }
  // верхние шкафы
  for (let x = 80; x < 1950; x += 300) {
    if (x > 650 && x < 1150) continue;
    ctx.fillStyle = '#4c5b52';
    ctx.fillRect(x, 120, 240, 150);
    ctx.strokeStyle = '#2e3a33';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, 120, 240, 150);
    ctx.fillStyle = '#6d7d72';
    ctx.fillRect(x + 10, 130, 220, 6);
    ctx.fillStyle = '#c9a55a';
    ctx.beginPath();
    ctx.arc(x + 120, 250, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  // вытяжка
  ctx.fillStyle = '#7d8780';
  ctx.beginPath();
  ctx.moveTo(1120, 100);
  ctx.lineTo(1420, 100);
  ctx.lineTo(1380, 230);
  ctx.lineTo(1160, 230);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4c5650';
  ctx.stroke();
  // фартук под вытяжкой
  ctx.fillStyle = 'rgba(30, 40, 36, 0.5)';
  ctx.fillRect(1160, 230, 220, 170);
  // окно
  drawWindow(ctx, 1600, 130, 200, 190, palette, time, { moon: true, glow: 0.22 });
  lightShaft(ctx, 1700, 180, 120, 380, 'rgba(200, 210, 255, 0.08)');
  // балконная дверь рисуется как door
  // полка с банками
  ctx.fillStyle = '#4a3826';
  ctx.fillRect(2000, 330, 360, 14);
  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = i % 2 ? '#7fb2e6' : '#c9a95e';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.roundRect(2020 + i * 52, 280, 32, 50, 5);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  // висящие кастрюли
  ctx.strokeStyle = '#2a2a24';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    const px = 800 + i * 70;
    ctx.beginPath();
    ctx.moveTo(px, 290);
    ctx.lineTo(px, 330 + i * 6);
    ctx.stroke();
    ctx.fillStyle = '#8d969d';
    ctx.beginPath();
    ctx.roundRect(px - 22, 330 + i * 6, 44, 30, 5);
    ctx.fill();
  }
}

function drawBalconyBackground(ctx, room, palette, time) {
  // небо
  const sky = ctx.createLinearGradient(0, 0, 0, 560);
  sky.addColorStop(0, '#0b1020');
  sky.addColorStop(0.55, '#1b2540');
  sky.addColorStop(0.85, '#3a3f6b');
  sky.addColorStop(1, '#55506b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, room.width, 720);
  // звёзды
  for (let i = 0; i < 90; i += 1) {
    const sx = seeded(i * 1.7) * room.width;
    const sy = seeded(i * 3.1) * 420;
    const twinkle = 0.35 + Math.abs(Math.sin(time * 0.8 + i)) * 0.65;
    ctx.globalAlpha = twinkle * (0.3 + seeded(i * 5.3) * 0.6);
    ctx.fillStyle = '#f4e9ce';
    ctx.fillRect(sx, sy, seeded(i) > 0.8 ? 2 : 1, seeded(i) > 0.8 ? 2 : 1);
  }
  ctx.globalAlpha = 1;
  // луна
  ctx.fillStyle = '#f4e9ce';
  ctx.beginPath();
  ctx.arc(1240, 130, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#10162a';
  ctx.beginPath();
  ctx.arc(1256, 118, 32, 0, Math.PI * 2);
  ctx.fill();
  // город
  ctx.fillStyle = '#131a2a';
  for (let i = 0; i < 18; i += 1) {
    const bw = 60 + seeded(i * 2.7) * 80;
    const bh = 110 + seeded(i * 4.1) * 210;
    const bx = i * 95 - 40;
    ctx.fillRect(bx, 560 - bh, bw, bh);
    for (let w = 0; w < 8; w += 1) {
      if (seeded(i * 9 + w) > 0.62) {
        ctx.fillStyle = `rgba(240, 199, 94, ${0.15 + seeded(i + w) * 0.35})`;
        ctx.fillRect(bx + 10 + (w % 3) * 18, 570 - bh + 16 + Math.floor(w / 3) * 26, 6, 9);
        ctx.fillStyle = '#131a2a';
      }
    }
  }
  // горизонт
  const horizon = ctx.createLinearGradient(0, 430, 0, 560);
  horizon.addColorStop(0, 'rgba(240, 199, 94, 0)');
  horizon.addColorStop(1, 'rgba(240, 199, 94, 0.12)');
  ctx.fillStyle = horizon;
  ctx.fillRect(0, 430, room.width, 140);
  // пол балкона
  ctx.fillStyle = '#404258';
  ctx.fillRect(0, 600, room.width, 120);
  ctx.strokeStyle = 'rgba(20, 22, 34, 0.6)';
  ctx.lineWidth = 2;
  for (let x = 0; x < room.width; x += 90) {
    ctx.beginPath();
    ctx.moveTo(x, 600);
    ctx.lineTo(x - 40, 720);
    ctx.stroke();
  }
  // перила
  ctx.strokeStyle = '#2a2d40';
  ctx.fillStyle = '#2a2d40';
  ctx.fillRect(0, 470, room.width, 14);
  ctx.fillRect(0, 560, room.width, 12);
  for (let x = 20; x < room.width; x += 54) {
    ctx.fillRect(x, 484, 7, 76);
  }
  // растения
  for (const px of [1140, 1420]) {
    ctx.fillStyle = '#8d5c3c';
    ctx.beginPath();
    ctx.moveTo(px - 28, 600);
    ctx.lineTo(px + 28, 600);
    ctx.lineTo(px + 20, 540);
    ctx.lineTo(px - 20, 540);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3f6a4c';
    for (let i = 0; i < 6; i += 1) {
      ctx.beginPath();
      ctx.ellipse(px + Math.cos(i * 1.7) * 26, 520 + Math.sin(i * 1.3) * 14, 16, 8, i, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // гирлянда
  ctx.strokeStyle = 'rgba(240, 199, 94, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 120);
  ctx.quadraticCurveTo(400, 210, 800, 130);
  ctx.quadraticCurveTo(1200, 60, 1600, 140);
  ctx.stroke();
  for (let i = 0; i < 12; i += 1) {
    const lx = 20 + i * 130;
    const ly = 130 + Math.sin(i * 1.4) * 26;
    const flicker = 0.5 + Math.sin(time * 2 + i) * 0.3;
    ctx.fillStyle = `rgba(255, 226, 140, ${flicker})`;
    ctx.beginPath();
    ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fill();
    const glow = ctx.createRadialGradient(lx, ly, 1, lx, ly, 18);
    glow.addColorStop(0, `rgba(255, 226, 140, ${flicker * 0.35})`);
    glow.addColorStop(1, 'rgba(255, 226, 140, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lx, ly, 18, 0, Math.PI * 2);
    ctx.fill();
  }
}

const BACKGROUNDS = {
  living: drawLivingBackground,
  hall: drawHallBackground,
  bath: drawBathBackground,
  pantry: drawPantryBackground,
  pantryDeep: drawDeepBackground,
  vent: drawVentBackground,
  kitchen: drawKitchenBackground,
  balcony: drawBalconyBackground,
};

export function drawRoom(ctx, room, state, time) {
  const palette = CHAPTERS[room.chapter]?.palette || CHAPTERS[1].palette;
  ctx.save();
  const drawBackground = BACKGROUNDS[room.art] || drawLivingBackground;
  drawBackground(ctx, room, palette, time);

  const lockedIds = new Set();
  for (const door of room.doors) {
    const locked = typeof door.getLocked === 'function' ? door.getLocked(state) : null;
    if (locked) lockedIds.add(door.id);
    drawDoor(ctx, door, palette, room.floorY, Boolean(locked));
  }

  const props = room.props.filter((prop) => !isPropHidden(prop, state));
  const floorProps = props.filter((prop) => prop.art === 'rug' || prop.art === 'looseBoard');
  floorProps.forEach((prop) => drawProp(ctx, prop, state, time));
  props.filter((prop) => !floorProps.includes(prop)).forEach((prop) => drawProp(ctx, prop, state, time));

  // мягкий передний свет
  const fg = ctx.createLinearGradient(0, room.floorY - 60, 0, 720);
  fg.addColorStop(0, 'rgba(8, 8, 14, 0)');
  fg.addColorStop(1, 'rgba(8, 8, 14, 0.5)');
  ctx.fillStyle = fg;
  ctx.fillRect(0, room.floorY - 60, room.width, 180);
  ctx.restore();
}

export function drawBalconySkyline(ctx, x, y, w, h, time) {
  // мини-пейзаж для финальных экранов
  ctx.save();
  const sky = ctx.createLinearGradient(x, y, x, y + h);
  sky.addColorStop(0, '#10182c');
  sky.addColorStop(0.7, '#3a3f6b');
  sky.addColorStop(1, '#6a5f72');
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#0e1422';
  for (let i = 0; i < 12; i += 1) {
    const bw = (w / 12) * (0.7 + seeded(i) * 0.6);
    const bh = h * (0.18 + seeded(i * 2.3) * 0.3);
    ctx.fillRect(x + (i * w) / 12, y + h - bh, bw, bh);
  }
  ctx.fillStyle = 'rgba(240, 199, 94, 0.09)';
  ctx.fillRect(x, y + h * 0.72, w, h * 0.28);
  ctx.fillStyle = '#f4e9ce';
  ctx.beginPath();
  ctx.arc(x + w * 0.78, y + h * 0.2, Math.min(w, h) * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
