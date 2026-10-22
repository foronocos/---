import { CHAPTERS, CLASS_COLORS, FONT_TITLE, FONT_UI, UI } from '../render/palette.js';
import { getClass } from '../data/classes.js';
import { getStats } from '../game/state.js';
import { mainObjective } from '../data/quests.js';
import { drawIcon } from './widgets.js';
import { clamp } from '../core/util.js';

export class HUD {
  constructor(game) {
    this.game = game;
    this.cache = null;
  }

  draw(ctx, scene, room) {
    const game = this.game;
    const state = game.state;
    if (!state) return;
    const player = state.player;
    const stats = getStats(player);
    const cls = getClass(player.classId);
    const accent = CLASS_COLORS[player.classId]?.main || UI.gold;
    const interactive = game.overlays.length === 0;
    const ui = game.ui;
    const hpRatio = player.hp / stats.maxHp;

    // ---------------------------------------------------------- левая панель
    ui.panel(20, 16, 330, 74, { alpha: 0.78, radius: 12 });
    ctx.save();
    ctx.fillStyle = `${accent}22`;
    ctx.strokeStyle = `${accent}88`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(55, 53, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    drawIcon(ctx, player.classId === 'knight' ? 'star' : player.classId === 'mage' ? 'seed' : 'eye', 55, 53, 20, accent);
    ctx.restore();

    ui.text(cls.name, 86, 44, { size: 13, color: accent, weight: '600' });
    ui.bar(86, 54, 168, 18, player.hp, stats.maxHp, {
      color: hpRatio > 0.55 ? '#79c98a' : hpRatio > 0.28 ? '#e8c06a' : '#e2645e',
      text: `${player.hp}/${stats.maxHp}`,
    });
    ui.seedChip(264, 37, player.seeds, { w: 76, h: 34 });
    ctx.save();
    ctx.font = `400 10px ${FONT_UI}`;
    ctx.fillStyle = UI.muted;
    ctx.textAlign = 'left';
    ctx.fillText(`Урон +${stats.bonus}`, 86, 86);
    ctx.textAlign = 'right';
    ctx.fillText(player.ultOwned ? (player.ultUsed ? 'Эхо исчерпано' : 'Эхо готово') : 'Эхо не куплено', 334, 86);
    ctx.restore();

    // --------------------------------------------------------- название комнаты
    const chapter = CHAPTERS[state.chapter] || CHAPTERS[1];
    ui.text(chapter.number.toUpperCase(), 551, 36, {
      size: 10,
      color: 'rgba(240, 199, 94, 0.7)',
      align: 'center',
      weight: '600',
    });
    ui.title(room.title, 551, 62, { size: 25, color: UI.cream });
    ui.text(room.subtitle || '', 551, 80, {
      size: 10,
      color: 'rgba(169, 162, 143, 0.75)',
      align: 'center',
    });

    // -------------------------------------------------------------- кнопки
    // На телефоне — плитки с иконкой и подписью: палец должен попадать без прицела.
    if (game.touchMode) {
      this.drawTouchPanels(ctx, interactive);
    } else {
      const buttons = [
        { id: 'character', label: 'Персонаж', key: 'C' },
        { id: 'inventory', label: 'Инвентарь', key: 'I' },
        { id: 'journal', label: 'Журнал', key: 'J' },
        { id: 'bestiary', label: 'Бестиарий', key: 'B' },
        { id: 'pause', label: 'Меню', key: 'Esc' },
      ];
      let bx = 1256 - buttons.length * 90 + 6;
      buttons.forEach((button) => {
        ui.button({
          id: `hud-${button.id}`,
          x: bx,
          y: 20,
          w: 84,
          h: 56,
          label: button.label,
          sublabel: button.key,
          fontSize: 11,
          variant: 'ghost',
          disabled: !interactive,
          onClick: () => {
            game.audio.click();
            game.openPanel(button.id);
          },
        });
        bx += 90;
      });
    }

    if (interactive) {
      if (game.input.consumePressed('KeyI')) game.openPanel('inventory');
      else if (game.input.consumePressed('KeyC')) game.openPanel('character');
      else if (game.input.consumePressed('KeyJ')) game.openPanel('journal');
      else if (game.input.consumePressed('KeyB')) game.openPanel('bestiary');
      else if (game.input.consumePressed('Escape')) game.openPanel('pause');
    }

    // ------------------------------------------------------------ нижняя строка
    const objective = mainObjective(state);
    ctx.save();
    const barGrad = ctx.createLinearGradient(0, 660, 0, 720);
    barGrad.addColorStop(0, 'rgba(6, 8, 14, 0)');
    barGrad.addColorStop(1, 'rgba(6, 8, 14, 0.85)');
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, 652, 1280, 68);
    ctx.restore();

    ui.text('ЗАДАЧА', 26, 690, { size: 9, color: 'rgba(240, 199, 94, 0.65)', weight: '700' });
    ui.text(objective.title, 78, 690, { size: 13, color: '#e7dcc2' });
    if (!game.touchMode) {
      ui.text('A/D или ←/→ — идти · E — действие · I — инвентарь · Esc — меню', 1256, 690, {
        size: 11,
        color: 'rgba(169, 162, 143, 0.7)',
        align: 'right',
      });
    } else {
      ui.text('Нажми на предмет, чтобы подойти', 1256, 690, {
        size: 11,
        color: 'rgba(169, 162, 143, 0.7)',
        align: 'right',
      });
    }

    if (game.touchMode && interactive) this.drawTouch(ctx, scene);
  }

  drawTouchPanels(ctx, interactive) {
    const game = this.game;
    const input = game.input;
    const tiles = [
      { id: 'character', label: 'Герой', icon: 'star' },
      { id: 'inventory', label: 'Сумка', icon: 'seed' },
      { id: 'journal', label: 'Журнал', icon: 'book' },
      { id: 'bestiary', label: 'Звери', icon: 'paw' },
      { id: 'pause', label: 'Меню', icon: 'gear' },
    ];
    const w = 88;
    const h = 66;
    const gap = 6;
    const y = 14;
    let x = 1256 - (tiles.length * w + (tiles.length - 1) * gap);
    tiles.forEach((tile) => {
      const hovered = interactive && input.isHovering(x, y, w, h);
      const click = input.peekClick();
      const pressed =
        hovered && click && click.x >= x && click.x <= x + w && click.y >= y && click.y <= y + h;
      ctx.save();
      ctx.globalAlpha = interactive ? 1 : 0.45;
      ctx.fillStyle = hovered ? 'rgba(44, 51, 70, 0.94)' : 'rgba(18, 22, 33, 0.85)';
      ctx.strokeStyle = hovered ? 'rgba(240, 199, 94, 0.72)' : 'rgba(240, 199, 94, 0.26)';
      ctx.lineWidth = hovered ? 1.8 : 1.2;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 12);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      drawIcon(ctx, tile.icon, x + w / 2, y + 25, 22, hovered ? UI.gold : UI.cream);
      ctx.save();
      ctx.font = `600 11px ${FONT_UI}`;
      ctx.fillStyle = hovered ? UI.gold : 'rgba(240, 232, 210, 0.86)';
      ctx.textAlign = 'center';
      ctx.fillText(tile.label, x + w / 2, y + 54);
      ctx.restore();
      if (pressed) {
        input.consumeClick();
        game.audio.click();
        game.openPanel(tile.id);
      }
      x += w + gap;
    });
  }

  drawTouch(ctx, scene) {
    const game = this.game;
    const input = game.input;
    // кнопки держим подальше от краёв экрана: там вырезы и системные жесты
    const y = 556;
    const size = 78;
    const leftX = 30;
    const rightX = leftX + size + 14;
    const actionX = 1250 - size;
    const leftHover = input.isHovering(leftX, y, size, size);
    const rightHover = input.isHovering(rightX, y, size, size);
    const actionHover = input.isHovering(actionX, y, size, size);
    scene.touchLeft = input.pointer.down && leftHover;
    scene.touchRight = input.pointer.down && rightHover;

    const drawRound = (x, yy, active, icon, label) => {
      ctx.save();
      ctx.globalAlpha = active ? 0.95 : 0.5;
      ctx.fillStyle = active ? 'rgba(40, 46, 64, 0.92)' : 'rgba(16, 19, 29, 0.82)';
      ctx.strokeStyle = active ? UI.gold : 'rgba(240, 199, 94, 0.38)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + size / 2, yy + size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      drawIcon(ctx, icon, x + size / 2, yy + size / 2, 28, UI.cream);
      if (label) {
        ctx.font = `700 10px ${FONT_UI}`;
        ctx.fillStyle = 'rgba(240, 230, 205, 0.85)';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + size / 2, yy + size + 14);
      }
      ctx.restore();
    };
    drawRound(leftX, y, scene.touchLeft, 'arrowLeft', 'идти');
    drawRound(rightX, y, scene.touchRight, 'arrowRight', 'идти');
    drawRound(actionX, y, actionHover, 'star', 'действие');

    const click = input.peekClick();
    if (click) {
      const inside = (x) => click.x >= x && click.x <= x + size && click.y >= y && click.y <= y + size;
      if (inside(actionX)) {
        input.consumeClick();
        scene.interactNearest();
      } else if (inside(leftX) || inside(rightX)) {
        // короткий тап по стрелке не должен «проваливаться» в предметы под ней
        input.consumeClick();
      }
    }
  }
}
