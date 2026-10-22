import { FONT_TITLE, FONT_UI, UI } from '../render/palette.js';
import { drawPortrait } from '../render/sprites.js';
import { drawIcon } from '../ui/widgets.js';
import { wrapText } from '../core/util.js';

export class ShopScene {
  constructor(game, shop) {
    this.game = game;
    this.shop = shop;
    this.time = 0;
    this.message = null;
    this.messageTimer = 0;
  }

  enter() {
    this.game.audio.tone({ freq: 300, dur: 0.2, type: 'triangle', gain: 0.06 });
  }

  close() {
    this.game.save();
    this.game.popOverlay();
  }

  buy(entry) {
    const result = this.game.purchase(this.shop.id, entry);
    this.message = result.message;
    this.messageTimer = 3.4;
    if (result.ok) {
      this.game.audio.coin();
    } else {
      this.game.audio.tone({ freq: 180, dur: 0.14, type: 'square', gain: 0.06 });
    }
  }

  update(dt) {
    this.time += dt;
    this.messageTimer = Math.max(0, this.messageTimer - dt);
    if (this.game.input.consumePressed('Escape')) this.close();
  }

  draw(ctx) {
    const game = this.game;
    const ui = game.ui;
    const state = game.state;
    if (!state) return;
    const player = state.player;
    ui.begin(ctx);
    const stock = this.shop.stock(state).map((entry) => ({
      entry,
      info: game.describeEntry(entry),
    }));

    ctx.save();
    ctx.fillStyle = 'rgba(4, 6, 12, 0.7)';
    ctx.fillRect(0, 0, 1280, 720);
    // фон магазина
    const glow = ctx.createRadialGradient(1000, 300, 40, 1000, 300, 460);
    glow.addColorStop(0, 'rgba(240, 199, 94, 0.09)');
    glow.addColorStop(1, 'rgba(240, 199, 94, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1280, 720);

    ui.panel(60, 34, 1160, 652, { alpha: 0.97, title: null });

    // заголовок
    ctx.save();
    ctx.font = `700 34px ${FONT_TITLE}`;
    ctx.fillStyle = UI.cream;
    ctx.fillText(this.shop.name, 92, 88);
    ctx.font = `italic 14px ${FONT_TITLE}`;
    ctx.fillStyle = '#c9b27a';
    ctx.fillText(this.shop.tagline, 94, 112);
    ctx.restore();
    // линия
    ctx.strokeStyle = 'rgba(240, 199, 94, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(92, 128);
    ctx.lineTo(1188, 128);
    ctx.stroke();

    ui.seedChip(1060, 72, player.seeds, { w: 116, h: 40 });
    ui.text(`Глава ${state.chapter}`, 1060, 128, { size: 10, color: UI.muted, align: 'left' });

    // портрет торговца
    const portraitId = this.shop.art;
    drawPortrait(ctx, portraitId, 1036, 248, 156, this.time);
    ui.text(this.shop.name, 1036, 350, {
      size: 18,
      font: FONT_TITLE,
      color: UI.gold,
      align: 'center',
      weight: '700',
    });
    const greeting = this.shop.getGreeting(state);
    ui.text(greeting, 908, 384, {
      size: 13,
      color: '#d7cdb7',
      maxWidth: 258,
      lineHeight: 19,
    });
    ctx.save();
    ctx.strokeStyle = 'rgba(240, 199, 94, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(900, 480);
    ctx.lineTo(1172, 480);
    ctx.stroke();
    ctx.restore();
    ui.text('Ассортимент обновляется между главами.', 908, 506, {
      size: 11,
      color: UI.muted,
      maxWidth: 258,
      lineHeight: 16,
    });
    ui.text(`Семян у Чики: ${player.seeds}`, 908, 548, { size: 12, color: UI.gold });
    ui.text('Улучшения покупаются один раз.', 908, 570, { size: 11, color: UI.muted });

    ui.button({
      id: 'shop-close',
      x: 988,
      y: 604,
      w: 190,
      h: 46,
      label: 'Уйти',
      variant: 'ghost',
      hotkey: 'Esc',
      onClick: () => this.close(),
    });

    // товары
    const rowX = 92;
    const rowW = 760;
    const rowH = 56;
    const startY = 148;
    stock.forEach(({ entry, info }, index) => {
      const y = startY + index * (rowH + 6);
      if (y + rowH > 648) return;
      const affordable = player.seeds >= entry.price;
      const owned = Boolean(info.owned);
      const disabled = Boolean(info.disabled);

      ctx.save();
      ctx.fillStyle = owned ? 'rgba(20, 32, 24, 0.5)' : 'rgba(24, 28, 42, 0.7)';
      ctx.strokeStyle = owned
        ? 'rgba(121, 201, 138, 0.3)'
        : affordable
          ? 'rgba(240, 199, 94, 0.18)'
          : 'rgba(244, 233, 206, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(rowX, y, rowW, rowH, 9);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ui.text(info.name, rowX + 16, y + 22, {
        size: 15,
        color: owned ? '#8fd3a8' : disabled ? 'rgba(244,233,206,0.4)' : UI.cream,
        weight: '600',
      });
      ui.text(info.desc, rowX + 16, y + 41, {
        size: 10.5,
        color: 'rgba(169, 162, 143, 0.85)',
        maxWidth: 520,
        lineHeight: 13,
      });
      if (entry.tag) {
        ui.chip(rowX + 470, y + 14, entry.tag, {
          color: '#241b0d',
          bg: '#b7e6b9',
          fontSize: 9,
        });
      }
      if (info.count !== undefined) {
        ui.text(`в сумке: ${info.count}`, rowX + 590, y + 22, {
          size: 10,
          color: 'rgba(169,162,143,0.6)',
          align: 'right',
        });
      }

      // цена
      drawIcon(ctx, 'seed', rowX + 604, y + 28, 13, affordable ? UI.gold : '#8a6a5a');
      ui.text(String(entry.price), rowX + 622, y + 34, {
        size: 16,
        color: affordable ? UI.gold : '#c98a7a',
        weight: '700',
      });

      ui.button({
        id: `buy-${index}`,
        x: rowX + rowW - 104,
        y: y + 9,
        w: 92,
        h: 38,
        label: owned ? 'Куплено' : disabled ? 'Недоступно' : 'Купить',
        variant: owned ? 'ghost' : affordable ? 'primary' : 'default',
        disabled: owned || disabled,
        fontSize: disabled && !owned ? 11 : 12,
        onClick: () => this.buy(entry),
      });
    });

    if (this.shop.getClosing && !(this.message && this.messageTimer > 0)) {
      ui.text(this.shop.getClosing(state), 92, 664, {
        size: 11,
        color: 'rgba(169, 162, 143, 0.6)',
        maxWidth: 700,
      });
    }

    if (this.message && this.messageTimer > 0) {
      const alpha = Math.min(1, this.messageTimer / 0.4);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `600 14px ${FONT_UI}`;
      const width = Math.min(700, ctx.measureText(this.message).width + 40);
      ctx.fillStyle = 'rgba(12, 15, 23, 0.95)';
      ctx.strokeStyle = 'rgba(240, 199, 94, 0.35)';
      ctx.beginPath();
      ctx.roundRect(92, 646, width, 30, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = UI.cream;
      ctx.font = `600 12px ${FONT_UI}`;
      ctx.fillText(this.message, 110, 666);
      ctx.restore();
    }

    ui.end();
    ctx.restore();
  }
}
