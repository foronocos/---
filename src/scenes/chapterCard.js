import { CHAPTERS, FONT_TITLE, FONT_UI, UI } from '../render/palette.js';
import { drawFeather } from '../render/sprites.js';
import { drawVignette, DustMotes } from '../render/effects.js';

export class ChapterCard {
  constructor(game, chapter, title, options = {}) {
    this.game = game;
    this.chapter = chapter;
    this.title = title || CHAPTERS[chapter]?.title || '';
    this.options = options;
    this.time = 0;
    this.appear = 0;
    this.dust = new DustMotes(1280, 600, 30);
    this.closed = false;
  }

  enter() {
    this.game.audio.door();
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.game.popOverlay();
    if (this.options.onDone) this.options.onDone();
  }

  update(dt) {
    this.time += dt;
    this.dust.update(dt, this.time);
    this.appear = Math.min(1, this.appear + dt * 1.6);
    const input = this.game.input;
    if (input.consumePressed('Enter', 'NumpadEnter', 'Space', 'Escape', 'KeyE')) {
      this.close();
    }
  }

  draw(ctx) {
    const info = CHAPTERS[this.chapter] || CHAPTERS[1];
    const t = this.appear;
    ctx.save();
    ctx.fillStyle = 'rgba(6, 8, 14, 0.92)';
    ctx.fillRect(0, 0, 1280, 720);

    const glow = ctx.createRadialGradient(640, 340, 30, 640, 340, 460);
    glow.addColorStop(0, 'rgba(240, 199, 94, 0.12)');
    glow.addColorStop(1, 'rgba(240, 199, 94, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1280, 720);

    // декоративные линии
    ctx.strokeStyle = 'rgba(240, 199, 94, 0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(300, 300);
    ctx.lineTo(980, 300);
    ctx.moveTo(360, 470);
    ctx.lineTo(920, 470);
    ctx.stroke();

    ctx.globalAlpha = t;
    ctx.textAlign = 'center';
    ctx.font = `600 16px ${FONT_UI}`;
    ctx.fillStyle = 'rgba(240, 199, 94, 0.8)';
    ctx.fillText(info.number.toUpperCase(), 640, 236);

    ctx.font = `700 68px ${FONT_TITLE}`;
    ctx.fillStyle = UI.cream;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 18;
    ctx.fillText(this.title, 640, 300);
    ctx.shadowBlur = 0;

    drawFeather(ctx, 640, 384, { scale: 0.62, time: this.time, rotation: 0.2 });

    ctx.font = `italic 19px ${FONT_TITLE}`;
    ctx.fillStyle = '#cfc3a8';
    const epigraph = info.epigraph;
    ctx.fillText(epigraph, 640, 476);
    ctx.globalAlpha = 1;

    this.dust.draw(ctx, 0, 1280, this.time);
    drawVignette(ctx, 1280, 720, 0.6);

    ctx.globalAlpha = t;
    ctx.textAlign = 'center';
    ctx.font = `400 12px ${FONT_UI}`;
    ctx.fillStyle = UI.muted;
    ctx.fillText('Пробел / Enter — продолжить', 640, 606);
    ctx.globalAlpha = 1;
    ctx.restore();

    this.game.ui.begin(ctx);
    this.game.ui.button({
      id: 'chapter-continue',
      x: 640 - 140,
      y: 530,
      w: 280,
      h: 50,
      label: 'Дальше',
      variant: 'primary',
      hotkey: 'Enter',
      onClick: () => this.close(),
    });
    this.game.ui.end();
  }
}
