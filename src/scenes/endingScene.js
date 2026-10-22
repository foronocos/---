import { FONT_TITLE, FONT_UI, UI } from '../render/palette.js';
import { getEnding, endingStats } from '../game/endings.js';
import { getClass } from '../data/classes.js';
import { drawFeather } from '../render/sprites.js';
import { drawBalconySkyline } from '../render/rooms.js';
import { DustMotes, drawVignette } from '../render/effects.js';
import { MenuScene } from './menu.js';
import { ClassSelectScene } from './classSelect.js';
import { ENDINGS } from '../render/palette.js';

export class EndingScene {
  constructor(game, endingId) {
    this.game = game;
    this.endingId = endingId;
    this.ending = getEnding(endingId);
    this.time = 0;
    this.page = 0;
    this.linesShown = 0;
    this.dust = new DustMotes(1280, 640, 40);
    this.started = false;
  }

  enter() {
    this.game.audio.ending();
  }

  totalLines() {
    return this.ending.lines.length;
  }

  advance() {
    const lines = this.ending.lines;
    if (this.linesShown < lines.length) {
      this.linesShown += 1;
      this.game.audio.tone({ freq: 620, dur: 0.08, type: 'triangle', gain: 0.06 });
      return;
    }
    if (this.page === 0) {
      this.page = 1;
      this.game.audio.click();
    }
  }

  update(dt) {
    this.time += dt;
    this.dust.update(dt, this.time);
    if (this.game.overlays.length) return;
    const input = this.game.input;
    if (input.consumePressed('Space', 'Enter', 'NumpadEnter', 'KeyE')) this.advance();
    if (input.consumePressed('Escape')) this.game.setScene(new MenuScene(this.game));
    // мягкое автопоявление первой строки
    if (!this.started && this.time > 0.6) {
      this.started = true;
      this.linesShown = 1;
    }
    if (this.page === 1 && input.consumePressed('KeyR')) {
      this.game.setScene(new ClassSelectScene(this.game));
    }
  }

  drawBackdrop(ctx) {
    const id = this.endingId;
    const time = this.time;
    if (id === 'eclipse') {
      const sky = ctx.createLinearGradient(0, 0, 0, 720);
      sky.addColorStop(0, '#06040c');
      sky.addColorStop(0.6, '#1a1026');
      sky.addColorStop(1, '#2a1a33');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 1280, 720);
      ctx.fillStyle = 'rgba(180, 140, 220, 0.12)';
      ctx.beginPath();
      ctx.arc(900, 250, 160, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#06040c';
      ctx.beginPath();
      ctx.arc(940, 230, 150, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'quiet') {
      const sky = ctx.createLinearGradient(0, 0, 0, 720);
      sky.addColorStop(0, '#101a18');
      sky.addColorStop(1, '#2e3a2c');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 1280, 720);
      // окно с утренним светом
      const glow = ctx.createRadialGradient(900, 240, 20, 900, 240, 340);
      glow.addColorStop(0, 'rgba(240, 220, 160, 0.28)');
      glow.addColorStop(1, 'rgba(240, 220, 160, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(500, 0, 780, 620);
      ctx.fillStyle = '#1c2620';
      ctx.fillRect(0, 600, 1280, 120);
    } else {
      drawBalconySkyline(ctx, 0, 0, 1280, 720, time);
      // рассветное тепло снизу — без резкой горизонтальной границы
      const warm = ctx.createLinearGradient(0, 720, 0, 260);
      warm.addColorStop(0, 'rgba(246, 217, 138, 0.3)');
      warm.addColorStop(0.55, 'rgba(246, 217, 138, 0.1)');
      warm.addColorStop(1, 'rgba(246, 217, 138, 0)');
      ctx.fillStyle = warm;
      ctx.fillRect(0, 0, 1280, 720);
      const haze = ctx.createLinearGradient(0, 720, 0, 470);
      haze.addColorStop(0, 'rgba(8, 10, 16, 0.62)');
      haze.addColorStop(1, 'rgba(8, 10, 16, 0)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, 1280, 720);
    }
    // мягкая подложка под текстовую колонку, чтобы буквы не спорили с городом
    const scrim = ctx.createLinearGradient(660, 0, 1280, 0);
    scrim.addColorStop(0, 'rgba(6, 8, 14, 0)');
    scrim.addColorStop(0.32, 'rgba(6, 8, 14, 0.62)');
    scrim.addColorStop(1, 'rgba(6, 8, 14, 0.78)');
    ctx.fillStyle = scrim;
    ctx.fillRect(600, 0, 680, 720);
    // силуэт перил
    ctx.fillStyle = 'rgba(8, 10, 16, 0.7)';
    ctx.fillRect(0, 520, 1280, 10);
    for (let x = 20; x < 1280; x += 70) {
      ctx.fillRect(x, 530, 6, 110);
    }
    // пыль и перо
    drawFeather(ctx, 250, 260 + Math.sin(time * 0.7) * 14, {
      scale: 1.1,
      time,
      rotation: 0.25,
      glow: this.endingId !== 'eclipse',
    });
    this.dust.draw(ctx, 0, 1280, time);
    drawVignette(ctx, 1280, 720, 0.62);
  }

  draw(ctx) {
    const game = this.game;
    const ui = game.ui;
    const state = game.state;
    const player = state?.player;
    const t = this.time;
    ctx.save();
    ui.begin(ctx);
    this.drawBackdrop(ctx);

    // заголовок
    const titleX = 700;
    ctx.save();
    ctx.globalAlpha = Math.min(1, t * 0.8);
    ctx.textAlign = 'left';
    ctx.font = `600 13px ${FONT_UI}`;
    ctx.fillStyle = this.ending.tone;
    ctx.fillText('КОНЦОВКА', titleX, 150);
    ctx.font = `700 54px ${FONT_TITLE}`;
    ctx.fillStyle = UI.cream;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 20;
    ctx.fillText(this.ending.title, titleX, 210);
    ctx.shadowBlur = 0;
    ctx.font = `italic 18px ${FONT_TITLE}`;
    ctx.fillStyle = this.ending.tone;
    ctx.fillText(this.ending.subtitle, titleX, 240);
    ctx.strokeStyle = `${this.ending.tone}66`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(titleX, 258);
    ctx.lineTo(titleX + 470, 258);
    ctx.stroke();
    ctx.restore();

    if (this.page === 0) {
      // строки истории
      const lines = this.ending.lines.slice(0, this.linesShown);
      let y = 300;
      ctx.save();
      ctx.textAlign = 'left';
      ctx.font = `400 17px ${FONT_TITLE}`;
      lines.forEach((line) => {
        ctx.fillStyle = 'rgba(235, 225, 200, 0.92)';
        const words = line.split(' ');
        let current = '';
        const maxWidth = 470;
        const out = [];
        for (const word of words) {
          const test = current ? `${current} ${word}` : word;
          if (ctx.measureText(test).width > maxWidth && current) {
            out.push(current);
            current = word;
          } else current = test;
        }
        if (current) out.push(current);
        out.forEach((row) => {
          ctx.fillText(row, titleX, y);
          y += 24;
        });
        y += 8;
      });
      ctx.restore();
      if (this.linesShown < this.ending.lines.length) {
        ui.text('Нажми, чтобы читать дальше', titleX, 640, { size: 12, color: 'rgba(244,233,206,0.5)' });
      } else {
        ui.button({
          id: 'ending-next',
          x: titleX,
          y: 620,
          w: 260,
          h: 48,
          label: 'Итоги пути',
          variant: 'primary',
          onClick: () => {
            this.page = 1;
            game.audio.click();
          },
        });
      }
    } else {
      // итоги
      ui.panel(titleX - 20, 286, 530, 250, { title: 'Что осталось после' });
      const stats = endingStats(state || { player: { kindness: 0, greed: 0, allies: {}, seeds: 0 } });
      stats.forEach((stat, index) => {
        ui.text(stat.label, titleX + 10, 350 + index * 30, { size: 15, color: UI.muted });
        ui.text(String(stat.value), titleX + 300, 350 + index * 30, {
          size: 18,
          color: stat.color,
          weight: '700',
          align: 'right',
        });
      });
      const outcomes = player ? Object.values(player.bosses) : [];
      const spares = outcomes.filter((value) => value === 'spare').length;
      const kills = outcomes.filter((value) => value === 'kill').length;
      ui.text(`Мирно: ${spares} · Силой: ${kills}`, titleX + 10, 500, { size: 13, color: UI.muted });

      ui.text(`Открыто концовок: ${game.endingsSeen.length} из ${Object.keys(ENDINGS).length}`, titleX - 20, 566, {
        size: 13,
        color: UI.muted,
      });

      ui.button({
        id: 'ending-menu',
        x: titleX - 20,
        y: 600,
        w: 230,
        h: 52,
        label: 'В главное меню',
        variant: 'primary',
        onClick: () => game.setScene(new MenuScene(game)),
      });
      ui.button({
        id: 'ending-restart',
        x: titleX + 230,
        y: 600,
        w: 250,
        h: 52,
        label: 'Пройти заново',
        variant: 'ghost',
        onClick: () => game.setScene(new ClassSelectScene(game)),
      });
    }

    // нижняя подпись
    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = `400 12px ${FONT_UI}`;
    ctx.fillStyle = 'rgba(244,233,206,0.4)';
    if (player) {
      ctx.fillText(
        `${getClass(player.classId).name} · ${player.hp}/${player.maxHp} HP · ${player.seeds} семян · время в пути ${Math.floor((state.playTime || 0) / 60)} мин`,
        104,
        692,
      );
    }
    ctx.restore();

    ui.end();
    ctx.restore();
  }
}
