import { rand, randInt, clamp, easeOutCubic } from '../core/util.js';

export class Particles {
  constructor(max = 300) {
    this.items = [];
    this.max = max;
  }

  burst(x, y, options = {}) {
    const {
      count = 12,
      colors = ['#f0c75e', '#f6e7c1'],
      speed = 140,
      spread = Math.PI * 2,
      angle = 0,
      gravity = 320,
      life = 0.7,
      size = 3,
      shape = 'square',
    } = options;
    for (let i = 0; i < count; i += 1) {
      if (this.items.length >= this.max) break;
      const a = angle + rand(-spread / 2, spread / 2);
      const v = rand(speed * 0.35, speed);
      this.items.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        gravity,
        life: rand(life * 0.6, life),
        maxLife: life,
        color: colors[randInt(0, colors.length - 1)],
        size: rand(size * 0.6, size * 1.4),
        shape,
        rotation: rand(0, Math.PI * 2),
        spin: rand(-6, 6),
      });
    }
  }

  update(dt) {
    for (const particle of this.items) {
      particle.life -= dt;
      particle.vy += particle.gravity * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.rotation += particle.spin * dt;
      particle.vx *= 0.99;
    }
    this.items = this.items.filter((particle) => particle.life > 0);
  }

  draw(ctx) {
    for (const p of this.items) {
      const alpha = clamp(p.life / (p.maxLife * 0.6), 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'feather') {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 2.4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }
  }

  clear() {
    this.items = [];
  }
}

export class DustMotes {
  constructor(width, floorY, count = 38) {
    this.floorY = floorY;
    this.motes = Array.from({ length: count }, () => ({
      x: rand(0, width),
      y: rand(60, floorY - 40),
      size: rand(0.8, 2.4),
      speed: rand(2, 10),
      drift: rand(-7, 7),
      phase: rand(0, Math.PI * 2),
      alpha: rand(0.15, 0.5),
    }));
    this.width = width;
  }

  update(dt, time) {
    for (const mote of this.motes) {
      mote.y -= mote.speed * dt;
      mote.x += Math.sin(time * 0.6 + mote.phase) * mote.drift * dt;
      if (mote.y < 40) {
        mote.y = this.floorY - rand(20, 120);
        mote.x = rand(0, this.width);
      }
    }
  }

  draw(ctx, cameraX, viewWidth, time) {
    ctx.save();
    for (const mote of this.motes) {
      const screenX = mote.x - cameraX;
      if (screenX < -10 || screenX > viewWidth + 10) continue;
      const twinkle = 0.65 + Math.sin(time * 1.6 + mote.phase) * 0.35;
      ctx.globalAlpha = mote.alpha * twinkle;
      ctx.fillStyle = '#f3e6c4';
      ctx.beginPath();
      ctx.arc(screenX, mote.y, mote.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export class FloatTexts {
  constructor() {
    this.items = [];
  }

  add(x, y, text, options = {}) {
    this.items.push({
      x,
      y,
      text,
      color: options.color || '#f6e7c1',
      life: options.life || 1.1,
      maxLife: options.life || 1.1,
      size: options.size || 30,
      vy: options.vy || -46,
      vx: options.vx || rand(-12, 12),
      bold: options.bold !== false,
    });
  }

  update(dt) {
    for (const item of this.items) {
      item.life -= dt;
      item.y += item.vy * dt;
      item.x += item.vx * dt;
      item.vy *= 0.96;
    }
    this.items = this.items.filter((item) => item.life > 0);
  }

  draw(ctx) {
    for (const item of this.items) {
      const progress = 1 - item.life / item.maxLife;
      const alpha = item.life < 0.35 ? item.life / 0.35 : 1;
      const scale = 0.7 + easeOutCubic(clamp(progress * 5, 0, 1)) * 0.3;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(item.x, item.y);
      ctx.scale(scale, scale);
      ctx.font = `${item.bold ? '700' : '400'} ${item.size}px "Trebuchet MS", sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(10, 10, 14, 0.75)';
      ctx.strokeText(item.text, 0, 0);
      ctx.fillStyle = item.color;
      ctx.fillText(item.text, 0, 0);
      ctx.restore();
    }
  }
}

export class ScreenShake {
  constructor() {
    this.time = 0;
    this.power = 0;
    this.x = 0;
    this.y = 0;
  }

  add(power = 8) {
    this.power = Math.max(this.power, power);
    this.time = Math.max(this.time, 0.28);
  }

  update(dt) {
    if (this.time > 0) {
      this.time -= dt;
      const strength = this.power * (this.time / 0.28);
      this.x = rand(-strength, strength);
      this.y = rand(-strength, strength) * 0.6;
    } else {
      this.x = 0;
      this.y = 0;
      this.power = 0;
    }
  }
}

export function drawVignette(ctx, width = 1280, height = 720, strength = 0.55) {
  const grad = ctx.createRadialGradient(width / 2, height / 2, height * 0.35, width / 2, height / 2, height * 0.95);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(4, 5, 9, ${strength})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

export function drawScanlines(ctx, width = 1280, height = 720, alpha = 0.035) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#000';
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1);
  }
  ctx.restore();
}
