import { CLASSES } from '../data/classes.js';
import { CLASS_COLORS, FONT_TITLE, FONT_UI, UI } from '../render/palette.js';
import { drawChiki, drawSeed } from '../render/sprites.js';
import { DustMotes, drawVignette } from '../render/effects.js';
import { MenuScene } from './menu.js';

export class ClassSelectScene {
  constructor(game) {
    this.game = game;
    this.time = 0;
    this.selected = 0;
    this.hovered = 0;
    this.dust = new DustMotes(1280, 600, 34);
    this.cardRects = [];
  }

  update(dt) {
    this.time += dt;
    this.dust.update(dt, this.time);
    if (this.game.overlays.length) return;
    const input = this.game.input;
    if (input.consumePressed('Digit1')) this.selected = 0;
    if (input.consumePressed('Digit2')) this.selected = 1;
    if (input.consumePressed('Digit3')) this.selected = 2;
    if (input.consumePressed('ArrowLeft', 'KeyA')) this.selected = (this.selected + 2) % 3;
    if (input.consumePressed('ArrowRight', 'KeyD')) this.selected = (this.selected + 1) % 3;
    if (input.consumePressed('Enter', 'NumpadEnter', 'Space')) this.start();
    if (input.consumePressed('Escape')) {
      this.game.setScene(new MenuScene(this.game));
    }
  }

  start() {
    const cls = CLASSES[this.selected];
    this.game.audio.click();
    this.game.newGame(cls.id);
  }

  draw(ctx) {
    const game = this.game;
    const ui = game.ui;
    const time = this.time;
    ctx.save();
    ui.begin(ctx);

    const bg = ctx.createLinearGradient(0, 0, 0, 720);
    bg.addColorStop(0, '#0a0c14');
    bg.addColorStop(0.6, '#171622');
    bg.addColorStop(1, '#231d22');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1280, 720);

    // декоративная арка
    ctx.strokeStyle = 'rgba(240, 199, 94, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(640, 420, 520, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(640, 420, 430, Math.PI, 0);
    ctx.stroke();

    ui.title('Кем будет Чики?', 640, 76, { size: 44 });
    ui.text('Класс определяет здоровье, бонус к урону и умение. Улучшения покупаются по ходу игры.', 640, 108, {
      size: 15,
      color: UI.muted,
      align: 'center',
    });

    this.cardRects = [];
    const cardW = 356;
    const cardH = 496;
    const gap = 26;
    const startX = 640 - (cardW * 3 + gap * 2) / 2;
    CLASSES.forEach((cls, index) => {
      const x = startX + index * (cardW + gap);
      const y = 128 + (this.selected === index ? -6 : 0);
      const colors = CLASS_COLORS[cls.id];
      const selected = this.selected === index;
      const hovering = game.input.isHovering(x, y, cardW, cardH);
      if (hovering && game.input.peekClick()) this.selected = index;

      ctx.save();
      // свечение
      if (selected) {
        const glow = ctx.createRadialGradient(x + cardW / 2, y + cardH / 2, 40, x + cardW / 2, y + cardH / 2, 280);
        glow.addColorStop(0, colors.glow);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x - 80, y - 80, cardW + 160, cardH + 160);
      }
      // карточка
      ctx.fillStyle = selected ? 'rgba(32, 36, 52, 0.98)' : 'rgba(22, 25, 37, 0.94)';
      ctx.beginPath();
      ctx.roundRect(x, y, cardW, cardH, 18);
      ctx.fill();
      ctx.strokeStyle = selected ? colors.main : hovering ? 'rgba(240, 199, 94, 0.4)' : 'rgba(244, 233, 206, 0.12)';
      ctx.lineWidth = selected ? 3 : 1.5;
      ctx.stroke();
      // верхняя полоса
      const stripe = ctx.createLinearGradient(x, y, x + cardW, y);
      stripe.addColorStop(0, colors.main);
      stripe.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = stripe;
      ctx.globalAlpha = selected ? 0.5 : 0.2;
      ctx.fillRect(x + 18, y + 18, cardW - 36, 3);
      ctx.globalAlpha = 1;

      // спрайт
      const bob = Math.sin(time * 2 + index) * 3;
      drawChiki(ctx, x + cardW / 2, y + 176 + bob, {
        scale: 0.64,
        facing: 1,
        time: time + index,
        classId: cls.id,
      });

      ui.text(cls.name, x + cardW / 2, y + 214, {
        size: 26,
        font: FONT_TITLE,
        color: colors.main,
        align: 'center',
        weight: '700',
      });
      ui.text(cls.role, x + cardW / 2, y + 238, { size: 12, color: UI.muted, align: 'center' });

      // статы
      const statY = y + 262;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 10, 16, 0.5)';
      ctx.beginPath();
      ctx.roundRect(x + 22, statY - 18, cardW - 44, 32, 8);
      ctx.fill();
      ctx.restore();
      ui.text(`HP ${cls.hp}`, x + 48, statY + 4, { size: 15, color: UI.green, weight: '700' });
      ui.text(`Урон +${cls.bonus}`, x + 128, statY + 4, { size: 15, color: UI.red, weight: '700' });
      ui.text('d6+бонус', x + cardW - 44, statY + 4, { size: 12, color: UI.muted, align: 'right' });

      ui.text(cls.blurb, x + 26, y + 292, {
        size: 12,
        color: '#cfc6b3',
        maxWidth: cardW - 52,
        lineHeight: 16,
      });

      // умение
      const skillBoxY = y + 350;
      ctx.fillStyle = 'rgba(8, 10, 16, 0.42)';
      ctx.beginPath();
      ctx.roundRect(x + 22, skillBoxY, cardW - 44, 66, 8);
      ctx.fill();
      ui.text(`Умение: ${cls.skill.name}`, x + 34, skillBoxY + 21, {
        size: 14,
        color: colors.main,
        weight: '700',
      });
      ui.text(cls.skill.desc, x + 34, skillBoxY + 39, {
        size: 11,
        color: UI.muted,
        maxWidth: cardW - 68,
        lineHeight: 13,
      });

      // улучшения
      ui.text('Ветка улучшений · по 2 семени', x + 34, skillBoxY + 82, {
        size: 9,
        color: 'rgba(169, 162, 143, 0.85)',
        weight: '700',
      });
      cls.upgrades.forEach((upgrade, uIndex) => {
        drawSeed(ctx, x + 34, y + 444 + uIndex * 16, { scale: 0.7, rotation: -0.2, alpha: 0.7 });
        ui.text(upgrade.name, x + 46, y + 448 + uIndex * 16, { size: 11, color: '#bdb39d' });
      });

      if (selected) {
        ui.chip(x + cardW - 28, y + 10, 'ВЫБРАНО', {
          color: '#241b0d',
          bg: colors.main,
          align: 'right',
          fontSize: 10,
        });
      }
      ctx.restore();

      this.cardRects.push({ x, y, w: cardW, h: cardH, index });
    });

    // клики по карточкам выбирают класс
    const click = game.input.peekClick();
    if (click) {
      const hit = this.cardRects.find(
        (rect) => click.x >= rect.x && click.x <= rect.x + rect.w && click.y >= rect.y && click.y <= rect.y + rect.h,
      );
      if (hit) {
        this.selected = hit.index;
        game.input.consumeClick();
        game.audio.click();
      }
    }

    // кнопки внизу
    ui.button({
      id: 'back',
      x: 60,
      y: 646,
      w: 150,
      h: 46,
      label: 'Назад',
      variant: 'ghost',
      hotkey: 'Esc',
      onClick: () => game.setScene(new MenuScene(game)),
    });
    ui.button({
      id: 'start',
      x: 640 - 150,
      y: 640,
      w: 300,
      h: 56,
      label: 'Выйти из клетки',
      sublabel: CLASSES[this.selected].name,
      variant: 'primary',
      hotkey: 'Enter',
      onClick: () => this.start(),
    });
    ui.text('Клавиши 1–3 — выбрать · Enter — начать', 1180, 672, {
      size: 12,
      color: UI.muted,
      align: 'right',
    });

    this.dust.draw(ctx, 0, 1280, time);
    drawVignette(ctx, 1280, 720, 0.55);
    ui.end();
    ctx.restore();
  }
}
