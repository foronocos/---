import { CLASS_COLORS, ENDINGS, FONT_TITLE, FONT_UI, UI } from '../render/palette.js';
import { drawChiki, drawPortrait, drawSeed } from '../render/sprites.js';
import { getClass } from '../data/classes.js';
import { ITEMS } from '../data/items.js';
import { NOTES, NOTE_ORDER } from '../data/notes.js';
import { BESTIARY } from '../data/enemies.js';
import { mainObjective, sideQuests, journalSummary } from '../data/quests.js';
import { allyCount, getStats } from '../game/state.js';
import { drawIcon } from './widgets.js';
import { wrapText } from '../core/util.js';
import { isFullscreen } from '../core/fullscreen.js';
import { getRoom } from '../data/chapters.js';

const PANEL_RECT = { x: 90, y: 70, w: 1100, h: 580 };

export class BasePanel {
  constructor(game, options = {}) {
    this.game = game;
    this.id = options.id || 'panel';
    this.title = options.title || '';
    this.x = options.x ?? PANEL_RECT.x;
    this.y = options.y ?? PANEL_RECT.y;
    this.w = options.w ?? PANEL_RECT.w;
    this.h = options.h ?? PANEL_RECT.h;
    this.time = 0;
    this.appear = 0;
    this.closed = false;
  }

  enter() {
    this.appear = 0;
  }

  get content() {
    return {
      x: this.x + 30,
      y: this.y + 62,
      w: this.w - 60,
      h: this.h - 92,
    };
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.game.audio.click();
    this.game.popOverlay();
  }

  update(dt) {
    this.time += dt;
    this.appear = Math.min(1, this.appear + dt * 5);
    if (this.game.input.consumePressed('Escape')) this.close();
  }

  draw(ctx) {
    const game = this.game;
    const ui = game.ui;
    ctx.save();
    ctx.fillStyle = 'rgba(4, 6, 12, 0.72)';
    ctx.fillRect(0, 0, 1280, 720);
    ui.begin(ctx);
    ui.panel(this.x, this.y, this.w, this.h, { title: this.title, alpha: 0.98 });
    this.drawBody(ctx);
    ui.button({
      id: `${this.id}-close`,
      x: this.x + this.w - 50,
      y: this.y + 10,
      w: 34,
      h: 30,
      label: '',
      icon: 'close',
      variant: 'ghost',
      hotkey: 'Esc',
      onClick: () => this.close(),
    });
    ui.end();
    ctx.restore();
  }

  drawBody() {}

  statRow(x, y, label, value, color = UI.cream, width = 560) {
    const ui = this.game.ui;
    ui.text(label, x, y, { size: 14, color: UI.muted });
    ui.text(value, x + width, y, { size: 15, color, weight: '700', align: 'right' });
    const ctx = this.game.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(244, 233, 206, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    ctx.lineTo(x + width, y + 10);
    ctx.stroke();
    ctx.restore();
  }
}

export class InventoryPanel extends BasePanel {
  constructor(game) {
    super(game, { id: 'inventory', title: 'Инвентарь' });
  }

  drawBody(ctx) {
    const game = this.game;
    const ui = game.ui;
    const state = game.state;
    const player = state.player;
    const c = this.content;

    ui.text('СУМКА', c.x, c.y + 6, { size: 11, color: 'rgba(240,199,94,0.65)', weight: '700' });
    const list = ['heal', 'honey', 'double', 'eye'];
    list.forEach((itemId, index) => {
      const item = ITEMS[itemId];
      const y = c.y + 20 + index * 88;
      const count = itemId === 'eye' ? (player.hasEye ? 1 : 0) : player.items[itemId] || 0;
      const has = count > 0;
      ctx.save();
      ctx.fillStyle = has ? 'rgba(26, 31, 46, 0.85)' : 'rgba(18, 21, 31, 0.6)';
      ctx.strokeStyle = has ? 'rgba(240, 199, 94, 0.25)' : 'rgba(244, 233, 206, 0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(c.x, y, 540, 78, 10);
      ctx.fill();
      ctx.stroke();
      // иконка
      ctx.fillStyle = has ? 'rgba(240, 199, 94, 0.12)' : 'rgba(244, 233, 206, 0.04)';
      ctx.beginPath();
      ctx.arc(c.x + 44, y + 39, 27, 0, Math.PI * 2);
      ctx.fill();
      drawIcon(
        ctx,
        itemId === 'honey' ? 'heart' : itemId === 'double' ? 'star' : itemId === 'eye' ? 'eye' : 'seed',
        c.x + 44,
        y + 39,
        24,
        has ? UI.gold : 'rgba(169,162,143,0.4)',
      );
      ctx.restore();
      ui.text(item.name, c.x + 84, y + 30, {
        size: 16,
        color: has ? UI.cream : 'rgba(244,233,206,0.4)',
        weight: '600',
      });
      ui.text(has ? `×${count}` : 'нет', c.x + 500, y + 30, {
        size: 15,
        color: has ? UI.gold : 'rgba(169,162,143,0.4)',
        align: 'right',
        weight: '700',
      });
      ui.text(item.desc, c.x + 84, y + 52, {
        size: 11,
        color: 'rgba(169,162,143,0.85)',
        maxWidth: 420,
        lineHeight: 14,
      });
    });

    // правая колонка
    const rx = c.x + 575;
    const rw = c.w - 575;
    ui.text('КЛЮЧЕВЫЕ ПРЕДМЕТЫ', rx, c.y + 6, {
      size: 11,
      color: 'rgba(240,199,94,0.65)',
      weight: '700',
    });
    const keyEntries = [
      { id: 'key', label: 'Запасной ключ', owned: player.keyItems.key, desc: 'Открывает балконную дверь.' },
      { id: 'feather', label: 'Золотое Перо', owned: player.keyItems.feather, desc: 'Тёплое. Помнит утро.' },
    ];
    keyEntries.forEach((entry, index) => {
      const y = c.y + 24 + index * 64;
      ctx.save();
      ctx.fillStyle = entry.owned ? 'rgba(240, 199, 94, 0.08)' : 'rgba(18, 21, 31, 0.5)';
      ctx.beginPath();
      ctx.roundRect(rx, y, rw, 54, 8);
      ctx.fill();
      ctx.restore();
      drawIcon(ctx, entry.id === 'key' ? 'lock' : 'feather', rx + 24, y + 27, 18, entry.owned ? UI.gold : '#5f5a4d');
      ui.text(entry.owned ? entry.label : '???', rx + 48, y + 24, {
        size: 14,
        color: entry.owned ? UI.cream : UI.muted,
        weight: '600',
      });
      ui.text(entry.owned ? entry.desc : 'ещё не найден', rx + 48, y + 42, {
        size: 10,
        color: UI.muted,
      });
    });

    ui.text('ОСОБОЕ', rx, c.y + 170, { size: 11, color: 'rgba(240,199,94,0.65)', weight: '700' });
    const specials = [
      {
        label: 'Эхо Первой Семечки',
        value: player.ultOwned ? (player.ultUsed ? 'использовано' : 'готово') : 'не куплено',
        color: player.ultOwned && !player.ultUsed ? '#ffd97a' : UI.muted,
      },
      { label: 'Глаз Голубя', value: player.hasEye ? 'активен' : 'нет', color: player.hasEye ? '#9fd8b1' : UI.muted },
      { label: 'Семена Силы', value: String(player.seeds), color: UI.gold },
      { label: 'Класс', value: getClass(player.classId).name, color: CLASS_COLORS[player.classId].main },
    ];
    specials.forEach((entry, index) => {
      this.statRow(rx, c.y + 198 + index * 32, entry.label, entry.value, entry.color, rw);
    });

    ui.text('Предметы применяются в бою. Один предмет за ход.', rx, c.y + 356, {
      size: 11,
      color: UI.muted,
      maxWidth: rw,
      lineHeight: 16,
    });
    ui.text('Клавиши: I — закрыть · J — журнал · B — бестиарий', rx, c.y + 428, {
      size: 11,
      color: 'rgba(169,162,143,0.6)',
    });
  }
}

export class CharacterPanel extends BasePanel {
  constructor(game) {
    super(game, { id: 'character', title: 'Чики' });
  }

  drawBody(ctx) {
    const game = this.game;
    const ui = game.ui;
    const state = game.state;
    const player = state.player;
    const cls = getClass(player.classId);
    const stats = getStats(player);
    const accent = CLASS_COLORS[player.classId]?.main || UI.gold;
    const c = this.content;
    const time = this.time;

    // левая часть с портретом
    ctx.save();
    const glow = ctx.createRadialGradient(c.x + 200, c.y + 230, 30, c.x + 200, c.y + 230, 240);
    glow.addColorStop(0, `${accent}22`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(c.x, c.y, 380, 480);
    ctx.restore();
    drawChiki(ctx, c.x + 190, c.y + 424, {
      scale: 1.16,
      time,
      classId: player.classId,
      facing: 1,
    });
    ui.text(cls.name, c.x + 190, c.y + 40, {
      size: 27,
      font: FONT_TITLE,
      color: accent,
      align: 'center',
      weight: '700',
    });
    ui.text(cls.role, c.x + 190, c.y + 62, { size: 12, color: UI.muted, align: 'center' });
    ui.text(`HP ${player.hp}/${stats.maxHp}`, c.x + 190, c.y + 438, {
      size: 15,
      color: UI.green,
      align: 'center',
      weight: '700',
    });
    ui.text('УМЕНИЕ', c.x + 40, c.y + 466, { size: 10, color: 'rgba(240,199,94,0.6)', weight: '700' });
    ui.text(cls.skill.name, c.x + 40, c.y + 486, { size: 15, color: accent, weight: '700' });
    ui.text(`использований: ${stats.skillUses} · ${cls.skill.desc}`, c.x + 40, c.y + 504, {
      size: 9.5,
      color: UI.muted,
      maxWidth: 330,
      lineHeight: 13,
    });

    // правая часть
    const rx = c.x + 430;
    const rw = c.w - 430;
    ui.text('ХАРАКТЕРИСТИКИ', rx, c.y + 6, { size: 11, color: 'rgba(240,199,94,0.65)', weight: '700' });
    this.statRow(rx, c.y + 34, 'Максимальное здоровье', String(stats.maxHp), UI.green, rw);
    this.statRow(rx, c.y + 66, 'Бонус к урону', `+${stats.bonus}`, '#e2a19a', rw);
    this.statRow(rx, c.y + 98, 'Критический удар', `×${stats.critMult} на шестёрке`, '#ffd97a', rw);
    this.statRow(rx, c.y + 130, 'Умение', stats.skill.name, accent, rw);
    this.statRow(rx, c.y + 162, 'Союзники', String(allyCount(player)), UI.gold, rw);

    ui.text('ВЕТКА КЛАССА', rx, c.y + 206, {
      size: 11,
      color: 'rgba(240,199,94,0.65)',
      weight: '700',
    });
    cls.upgrades.forEach((upgrade, index) => {
      const owned = Boolean(player.upgrades[upgrade.id]);
      const bx = rx + index * 198;
      const by = c.y + 220;
      ctx.save();
      ctx.fillStyle = owned ? 'rgba(36, 52, 38, 0.75)' : 'rgba(22, 26, 38, 0.75)';
      ctx.strokeStyle = owned ? 'rgba(143, 211, 168, 0.45)' : 'rgba(244, 233, 206, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, 184, 132, 10);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      drawSeed(ctx, bx + 20, by + 20, { scale: 0.8, rotation: -0.2, alpha: owned ? 1 : 0.4 });
      ui.text(upgrade.name, bx + 32, by + 26, {
        size: 13,
        color: owned ? '#b7e6b9' : UI.cream,
        weight: '600',
      });
      ui.text(upgrade.desc, bx + 12, by + 52, {
        size: 10,
        color: 'rgba(169,162,143,0.9)',
        maxWidth: 160,
        lineHeight: 14,
      });
      ui.text(owned ? 'куплено' : '2 семени', bx + 12, by + 118, {
        size: 10,
        color: owned ? '#8fd3a8' : UI.gold,
        weight: '700',
      });
    });

    ui.text('ПУТЬ', rx, c.y + 386, { size: 11, color: 'rgba(240,199,94,0.65)', weight: '700' });
    const summary = journalSummary(state);
    const pathItems = [
      { label: 'Доброта', value: String(player.kindness), color: '#8fd3a8' },
      { label: 'Жадность', value: String(player.greed), color: '#e2a19a' },
      { label: 'Мирных решений', value: String(summary.spares), color: '#f0c75e' },
      { label: 'Силой', value: String(summary.kills), color: '#c98a7a' },
    ];
    pathItems.forEach((entry, index) => {
      const bx = rx + index * 148;
      ui.text(entry.label, bx, c.y + 410, { size: 10, color: UI.muted });
      ui.text(entry.value, bx, c.y + 432, { size: 20, color: entry.color, weight: '700' });
    });
    ui.text(
      player.ultOwned
        ? 'Эхо Первой Семечки куплено. Оно отменяет один ход за всю игру — включая смертельный.'
        : 'Ульту «Эхо Первой Семечки» можно купить у торговцев за 6 семян.',
      rx,
      c.y + 468,
      { size: 11, color: UI.muted, maxWidth: rw, lineHeight: 16 },
    );
  }
}

export class JournalPanel extends BasePanel {
  constructor(game) {
    super(game, { id: 'journal', title: 'Журнал' });
    this.tab = 'quests';
    this.selectedNote = null;
  }

  drawBody(ctx) {
    const game = this.game;
    const ui = game.ui;
    const state = game.state;
    const player = state.player;
    const c = this.content;

    const tabs = [
      { id: 'quests', label: 'Задания' },
      { id: 'notes', label: 'Записки' },
    ];
    tabs.forEach((tab, index) => {
      ui.button({
        id: `journal-tab-${tab.id}`,
        x: c.x + index * 170,
        y: c.y,
        w: 156,
        h: 38,
        label: tab.label,
        variant: this.tab === tab.id ? 'primary' : 'ghost',
        fontSize: 14,
        onClick: () => {
          this.tab = tab.id;
        },
      });
    });
    ctx.save();
    ctx.strokeStyle = 'rgba(240,199,94,0.15)';
    ctx.beginPath();
    ctx.moveTo(c.x, c.y + 48);
    ctx.lineTo(c.x + c.w, c.y + 48);
    ctx.stroke();
    ctx.restore();

    if (this.tab === 'quests') {
      const objective = mainObjective(state);
      ui.panel(c.x, c.y + 64, c.w, 138, { tone: 'light', alpha: 0.7 });
      ui.text('ГЛАВНАЯ ЗАДАЧА', c.x + 20, c.y + 92, {
        size: 10,
        color: 'rgba(240,199,94,0.7)',
        weight: '700',
      });
      ui.text(objective.title, c.x + 20, c.y + 118, {
        size: 20,
        font: FONT_TITLE,
        color: UI.cream,
        weight: '700',
      });
      ui.text(objective.text, c.x + 20, c.y + 142, {
        size: 12,
        color: '#cfc6b3',
        maxWidth: c.w - 40,
        lineHeight: 17,
      });
      ui.text(`Подсказка: ${objective.hint}`, c.x + 20, c.y + 184, {
        size: 11,
        color: 'rgba(240,199,94,0.65)',
        maxWidth: c.w - 40,
      });

      ui.text('ПОПУТНЫЕ ДЕЛА', c.x, c.y + 238, {
        size: 11,
        color: 'rgba(240,199,94,0.65)',
        weight: '700',
      });
      const quests = sideQuests(state);
      quests.forEach((quest, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = c.x + col * (c.w / 2 + 10);
        const y = c.y + 250 + row * 72;
        const width = c.w / 2 - 10;
        ctx.save();
        ctx.fillStyle = quest.done ? 'rgba(36, 52, 38, 0.55)' : 'rgba(22, 26, 38, 0.65)';
        ctx.strokeStyle = quest.done ? 'rgba(143, 211, 168, 0.35)' : 'rgba(244, 233, 206, 0.08)';
        ctx.beginPath();
        ctx.roundRect(x, y, width, 62, 8);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        drawIcon(ctx, quest.done ? 'star' : 'note', x + 22, y + 24, 14, quest.done ? '#8fd3a8' : UI.muted);
        ui.text(quest.title, x + 42, y + 28, {
          size: 14,
          color: quest.done ? '#b7e6b9' : UI.cream,
          weight: '600',
        });
        ui.text(quest.text, x + 42, y + 46, { size: 11, color: UI.muted });
      });

      ui.text(
        `Глава ${state.chapter} · Чики ${player.hp}/${getStats(player).maxHp} HP · ${player.seeds} семян · прочитано записок: ${player.notesRead.length}/${NOTE_ORDER.length}`,
        c.x,
        c.y + c.h + 2,
        { size: 11, color: 'rgba(169,162,143,0.6)' },
      );
      return;
    }

    // записки
    const listW = 350;
    ui.text('НАЙДЕННЫЕ ЗАПИСКИ', c.x, c.y + 68, {
      size: 11,
      color: 'rgba(240,199,94,0.65)',
      weight: '700',
    });
    const readNotes = NOTE_ORDER.filter((id) => player.notesRead.includes(id));
    const allNotes = [...readNotes, ...NOTE_ORDER.filter((id) => !player.notesRead.includes(id))];
    if (this.selectedNote === null && allNotes.length) {
      this.selectedNote = allNotes[0];
    }
    allNotes.forEach((noteId, index) => {
      const note = NOTES[noteId];
      const read = player.notesRead.includes(noteId);
      const y = c.y + 82 + index * 36;
      const selected = this.selectedNote === noteId;
      ctx.save();
      ctx.fillStyle = selected ? 'rgba(240, 199, 94, 0.13)' : 'rgba(20, 23, 34, 0.55)';
      ctx.beginPath();
      ctx.roundRect(c.x, y, listW, 31, 6);
      ctx.fill();
      ctx.strokeStyle = selected ? 'rgba(240,199,94,0.5)' : 'rgba(244,233,206,0.06)';
      ctx.stroke();
      ctx.restore();
      ui.text(read ? note.title : '???', c.x + 12, y + 20, {
        size: 12,
        color: read ? (selected ? UI.gold : UI.cream) : 'rgba(169,162,143,0.45)',
        weight: selected ? '700' : '400',
      });
      ui.text(read ? note.where : 'не найдена', c.x + listW - 10, y + 20, {
        size: 9,
        color: 'rgba(169,162,143,0.55)',
        align: 'right',
      });
    });

    const detailX = c.x + listW + 26;
    const detailW = c.w - listW - 26;
    ui.panel(detailX, c.y + 64, detailW, c.h - 70, { tone: 'paper', alpha: 0.96 });
    const note = this.selectedNote ? NOTES[this.selectedNote] : null;
    if (!note || !player.notesRead.includes(note.id)) {
      ui.text('Записка ещё не найдена', detailX + 24, c.y + 110, {
        size: 20,
        font: FONT_TITLE,
        color: '#5c4526',
      });
      ui.text('Осматривай комнаты: записки раскрывают, что случилось в квартире до затмения.', detailX + 24, c.y + 146, {
        size: 12,
        color: '#6b5a3c',
        maxWidth: detailW - 48,
        lineHeight: 18,
      });
    } else {
      ui.text(note.where, detailX + 24, c.y + 96, {
        size: 10,
        color: '#8a703f',
        weight: '700',
      });
      ui.text(note.title, detailX + 24, c.y + 128, {
        size: 24,
        font: FONT_TITLE,
        color: '#3f3120',
        weight: '700',
      });
      ctx.save();
      ctx.font = `italic 15px ${FONT_TITLE}`;
      const lines = wrapText(ctx, note.text, detailW - 48);
      ctx.fillStyle = '#4a3a24';
      lines.forEach((line, index) => {
        ctx.fillText(line, detailX + 24, c.y + 168 + index * 24);
      });
      ctx.restore();
    }
  }
}

export class BestiaryPanel extends BasePanel {
  constructor(game) {
    super(game, { id: 'bestiary', title: 'Бестиарий' });
    this.selected = 'cat';
  }

  drawBody(ctx) {
    const game = this.game;
    const ui = game.ui;
    const player = game.state.player;
    const c = this.content;
    const seen = player.bestiarySeen;

    ui.text('ВСТРЕЧЕННЫЕ СУЩЕСТВА', c.x, c.y + 6, {
      size: 11,
      color: 'rgba(240,199,94,0.65)',
      weight: '700',
    });
    BESTIARY.forEach((entry, index) => {
      const known = seen.includes(entry.id);
      const y = c.y + 20 + index * 60;
      const selected = this.selected === entry.id;
      ctx.save();
      ctx.fillStyle = selected ? 'rgba(240, 199, 94, 0.12)' : 'rgba(20, 23, 34, 0.6)';
      ctx.strokeStyle = selected ? 'rgba(240,199,94,0.45)' : 'rgba(244,233,206,0.07)';
      ctx.beginPath();
      ctx.roundRect(c.x, y, 340, 52, 8);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      drawPortrait(ctx, known ? entry.art : 'voice', c.x + 28, y + 26, 40, this.time);
      ui.text(known ? entry.name : '???', c.x + 56, y + 24, {
        size: 14,
        color: known ? (selected ? UI.gold : UI.cream) : 'rgba(169,162,143,0.5)',
        weight: '600',
      });
      ui.text(known ? entry.lockedTitle : entry.hint, c.x + 56, y + 41, {
        size: 9,
        color: 'rgba(169,162,143,0.7)',
        maxWidth: 270,
      });
      if (game.input.isHovering(c.x, y, 340, 52) && game.input.peekClick()) {
        this.selected = entry.id;
        game.input.consumeClick();
        game.audio.click();
      }
    });

    const detailX = c.x + 370;
    const entry = BESTIARY.find((item) => item.id === this.selected) || BESTIARY[0];
    const known = seen.includes(entry.id);
    ui.panel(detailX, c.y + 18, c.w - 370, c.h - 30, { tone: 'light', alpha: 0.7 });
    drawPortrait(ctx, known ? entry.art : 'voice', detailX + 110, c.y + 150, 128, this.time);
    ui.text(known ? entry.name : 'Ещё не встречен', detailX + 200, c.y + 108, {
      size: 26,
      font: FONT_TITLE,
      color: known ? UI.cream : UI.muted,
      weight: '700',
    });
    if (known) {
      const enemy = BESTIARY.find((item) => item.id === entry.id);
      const extra = {
        cat: 'Первый страж коридора',
        vacuum: 'Второй страж, кладовка',
        pasta: 'Последний страж, кухня',
        roach: 'Торговец под ванной',
        pigeon: 'Посредник на подоконнике',
        apartment: 'Сама квартира',
      }[entry.id];
      ui.text(extra, detailX + 200, c.y + 132, { size: 12, color: UI.gold });
      const source = {
        cat: 'Кот, который сторожит диван так, будто диван — это трон.',
        vacuum: 'Годами глотал всё, что плохо лежало.',
        pasta: 'Варил эту квартиру, пока не решил, что достоин варить судьбы.',
        roach: 'Пережил три ремонта и одну попытку отравить его крупой.',
        pigeon: 'Знает, где в городе можно достать что угодно.',
        apartment: 'Квартира проснулась вместе с пером и выросла.',
      }[entry.id];
      const tips = {
        cat: 'Каждый третий ход прячется под диван. При HP 4 и ниже можно предложить перемирие.',
        vacuum: 'Слабый бросок (1–2) затягивает Чики. Мирно договориться можно с Мурзилой-союзником.',
        pasta: 'Раз за бой предлагает макароны: +5 HP, но два пропущенных хода. При HP 8 и ниже можно разделить трапезу.',
        roach: 'Ассортимент обновляется между главами.',
        pigeon: 'Открывает второй магазин после второй главы.',
        apartment: 'Записки в комнатах рассказывают предысторию.',
      }[entry.id];
      ctx.save();
      ctx.font = `400 13px ${FONT_UI}`;
      const lines = wrapText(ctx, source, c.w - 430);
      ctx.fillStyle = '#d7cdb7';
      lines.forEach((line, index) => ctx.fillText(line, detailX + 30, c.y + 270 + index * 20));
      ctx.font = `400 12px ${FONT_UI}`;
      const tipLines = wrapText(ctx, `Совет: ${tips}`, c.w - 430);
      ctx.fillStyle = '#c9b27a';
      tipLines.forEach((line, index) => ctx.fillText(line, detailX + 30, c.y + 340 + index * 18));
      ctx.restore();
      ui.text(`Записей: ${seen.length}/${BESTIARY.length}`, detailX + 30, c.y + c.h - 52, {
        size: 11,
        color: UI.muted,
      });
    } else {
      ui.text(entry.hint, detailX + 200, c.y + 150, { size: 14, color: UI.muted });
      ui.text('Исследуй квартиру, чтобы заполнить бестиарий.', detailX + 200, c.y + 180, {
        size: 12,
        color: 'rgba(169,162,143,0.7)',
      });
    }
  }
}

export class PausePanel extends BasePanel {
  constructor(game) {
    super(game, { id: 'pause', title: 'Пауза', x: 356, y: 78, w: 568, h: 566 });
  }

  drawBody(ctx) {
    const game = this.game;
    const ui = game.ui;
    const state = game.state;
    const c = this.content;
    const player = state.player;
    const cls = getClass(player.classId);
    const stats = getStats(player);
    const minutes = Math.floor((state.playTime || 0) / 60);
    const seconds = Math.floor((state.playTime || 0) % 60);

    // заголовок с классом
    ctx.save();
    ctx.fillStyle = `${CLASS_COLORS[player.classId].main}18`;
    ctx.strokeStyle = `${CLASS_COLORS[player.classId].main}66`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(c.x + 28, c.y + 26, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    drawIcon(ctx, player.classId === 'knight' ? 'star' : player.classId === 'mage' ? 'seed' : 'eye', c.x + 28, c.y + 26, 20, CLASS_COLORS[player.classId].main);
    ctx.restore();
    ui.text(cls.name, c.x + 64, c.y + 22, {
      size: 17,
      color: CLASS_COLORS[player.classId].main,
      weight: '700',
    });
    const roomTitle = getRoom(state.roomId).title;
    ui.text(`Глава ${state.chapter} · ${roomTitle}`, c.x + 64, c.y + 40, {
      size: 12,
      color: UI.muted,
    });
    ui.text(`HP ${player.hp}/${stats.maxHp} · ${player.seeds} семян`, c.x + c.w, c.y + 22, {
      size: 12,
      color: UI.gold,
      align: 'right',
    });
    ui.text(`Время в пути: ${minutes}:${String(seconds).padStart(2, '0')}`, c.x + c.w, c.y + 40, {
      size: 10,
      color: UI.muted,
      align: 'right',
    });

    ctx.save();
    ctx.strokeStyle = 'rgba(240,199,94,0.15)';
    ctx.beginPath();
    ctx.moveTo(c.x, c.y + 66);
    ctx.lineTo(c.x + c.w, c.y + 66);
    ctx.stroke();
    ctx.restore();

    ui.button({
      id: 'pause-resume',
      x: c.x,
      y: c.y + 88,
      w: c.w,
      h: 54,
      label: 'Продолжить',
      variant: 'primary',
      hotkey: 'Esc',
      onClick: () => this.close(),
    });
    ui.button({
      id: 'pause-save',
      x: c.x,
      y: c.y + 152,
      w: c.w,
      h: 48,
      label: 'Сохранить сейчас',
      sublabel: 'игра сохраняется автоматически при переходах',
      onClick: () => {
        game.save();
        game.toast('Игра сохранена.', 'good');
        game.audio.coin();
      },
    });
    ui.button({
      id: 'pause-sound',
      x: c.x,
      y: c.y + 210,
      w: c.w,
      h: 44,
      label: game.settings.sound ? 'Звук включён' : 'Звук выключен',
      icon: game.settings.sound ? 'sound' : 'mute',
      variant: 'ghost',
      onClick: () => game.toggleSound(),
    });
    ui.button({
      id: 'pause-help',
      x: c.x,
      y: c.y + 264,
      w: c.w,
      h: 44,
      label: 'Управление и правила',
      icon: 'book',
      variant: 'ghost',
      onClick: () => game.pushOverlay(new HelpModal(game)),
    });
    if (game.touchMode) {
      ui.button({
        id: 'pause-fullscreen',
        x: c.x,
        y: c.y + 316,
        w: c.w,
        h: 44,
        label: isFullscreen() ? 'Выйти из полного экрана' : 'Развернуть на весь экран',
        sublabel: 'на телефоне удобнее боком',
        icon: 'star',
        variant: 'ghost',
        onClick: () => game.toggleFullscreen(),
      });
    }
    ui.button({
      id: 'pause-menu',
      x: c.x,
      y: c.y + 372,
      w: c.w,
      h: 48,
      label: 'В главное меню',
      sublabel: 'прогресс сохранится',
      variant: 'danger',
      onClick: () => game.returnToMenu(),
    });
    ui.text(
      game.touchMode
        ? 'Сохранение хранится в памяти этого браузера. В бою меню недоступно.'
        : 'Сохранение хранится в localStorage этого браузера.\nПауза не сбрасывает бой: во время сражения меню недоступно.',
      c.x,
      c.y + 442,
      {
        size: 10,
        color: 'rgba(169,162,143,0.55)',
        align: 'center',
        maxWidth: c.w,
        lineHeight: 15,
      },
    );
  }
}

export class EndingsModal extends BasePanel {
  constructor(game) {
    super(game, { id: 'endings', title: 'Концовки', x: 150, y: 56, w: 980, h: 608 });
  }

  drawBody(ctx) {
    const game = this.game;
    const ui = game.ui;
    const c = this.content;
    const total = Object.keys(ENDINGS).length;
    ui.text(
      `Открыто ${game.endingsSeen.length} из ${total}. Исход зависит от накопленных решений, а не от одного клика.`,
      c.x,
      c.y + 8,
      { size: 12, color: UI.muted, maxWidth: c.w, lineHeight: 17 },
    );
    const list = Object.values(ENDINGS);
    const cardW = (c.w - 20) / 2;
    const cardH = 142;
    list.forEach((ending, index) => {
      const seen = game.endingsSeen.includes(ending.id);
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = c.x + col * (cardW + 20);
      const y = c.y + 40 + row * (cardH + 14);
      ctx.save();
      const grad = ctx.createLinearGradient(x, y, x, y + cardH);
      if (seen) {
        grad.addColorStop(0, 'rgba(38, 34, 40, 0.95)');
        grad.addColorStop(1, 'rgba(20, 22, 32, 0.95)');
      } else {
        grad.addColorStop(0, 'rgba(20, 23, 34, 0.8)');
        grad.addColorStop(1, 'rgba(14, 16, 24, 0.8)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, cardW, cardH, 12);
      ctx.fill();
      ctx.strokeStyle = seen ? `${ending.tone}88` : 'rgba(244,233,206,0.08)';
      ctx.lineWidth = seen ? 1.6 : 1;
      ctx.stroke();
      if (seen) {
        const glow = ctx.createRadialGradient(x + 44, y + 46, 4, x + 44, y + 46, 120);
        glow.addColorStop(0, `${ending.tone}33`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x, y, cardW, cardH);
      }
      ctx.restore();
      drawIcon(ctx, seen ? 'feather' : 'lock', x + 40, y + 40, 24, seen ? ending.tone : '#5f5a4d');
      ui.text(seen ? ending.title : 'Закрытая концовка', x + 68, y + 34, {
        size: 19,
        font: FONT_TITLE,
        color: seen ? ending.tone : 'rgba(169,162,143,0.6)',
        weight: '700',
      });
      ui.text(seen ? ending.subtitle : 'как её получить', x + 68, y + 54, {
        size: 11,
        color: 'rgba(169,162,143,0.7)',
      });
      ctx.save();
      ctx.font = `400 12px ${FONT_TITLE}`;
      const lines = wrapText(ctx, seen ? ending.lines[0] : ending.hint, cardW - 40);
      ctx.fillStyle = seen ? 'rgba(235, 225, 200, 0.8)' : 'rgba(169,162,143,0.55)';
      lines.slice(0, 3).forEach((line, lineIndex) => {
        ctx.fillText(line, x + 20, y + 86 + lineIndex * 19);
      });
      ctx.restore();
      if (seen) {
        ui.chip(x + cardW - 16, y + 16, 'ОТКРЫТА', {
          color: '#241b0d',
          bg: ending.tone,
          align: 'right',
          fontSize: 9,
        });
      }
    });
    ui.text('Каждая концовка помнит, что Чики делал раньше: с кем подружился, кого обошёл и чем заплатил.', c.x, c.y + c.h, {
      size: 11,
      color: 'rgba(169,162,143,0.6)',
      maxWidth: c.w,
    });
  }
}

export class HelpModal extends BasePanel {
  constructor(game) {
    super(game, { id: 'help', title: 'Управление и правила', x: 190, y: 50, w: 900, h: 620 });
  }

  drawBody(ctx) {
    const ui = this.game.ui;
    const c = this.content;
    const left = c.x;
    const right = c.x + c.w / 2 + 20;
    const width = c.w / 2 - 30;

    ui.text('УПРАВЛЕНИЕ', left, c.y + 10, { size: 11, color: 'rgba(240,199,94,0.7)', weight: '700' });
    const controls = [
      ['A / D или ← / →', 'идти по комнате'],
      ['E или Пробел', 'осмотреть, поговорить, взять'],
      ['клик по предмету', 'подойти и взаимодействовать'],
      ['I', 'инвентарь'],
      ['C', 'экран персонажа'],
      ['J', 'журнал заданий и записки'],
      ['B', 'бестиарий'],
      ['Esc', 'меню / закрыть экран'],
      ['1–4', 'действия в бою'],
    ];
    controls.forEach(([key, action], index) => {
      const y = c.y + 40 + index * 32;
      ui.chip(left, y - 14, key, { color: UI.cream, bg: 'rgba(244,233,206,0.08)', fontSize: 11 });
      ui.text(action, left + 150, y, { size: 12, color: '#d7cdb7' });
    });

    ui.text('БОЙ', right, c.y + 10, { size: 11, color: 'rgba(240,199,94,0.7)', weight: '700' });
    const rules = [
      'Урон = бросок d6 + бонус класса. Шестёрка — критический удар.',
      'Каждый класс имеет умение на 1–2 применения за бой.',
      'Предметы не тратят ход, но применять можно один за ход.',
      'Мирный исход возможен, когда у врага мало HP. Он даёт больше семян и доброту.',
      'Семена Силы тратятся на улучшения, предметы и ульту.',
      'Эхо Первой Семечки отменяет ваш ход, включая смертельный.',
    ];
    ctx.save();
    ctx.font = `400 12px ${FONT_UI}`;
    let ry = c.y + 42;
    rules.forEach((rule) => {
      const lines = wrapText(ctx, `• ${rule}`, width);
      ctx.fillStyle = '#d7cdb7';
      lines.forEach((line) => {
        ctx.fillText(line, right, ry);
        ry += 17;
      });
      ry += 12;
    });
    ctx.restore();

    ui.text(
      'Сохранение: игра пишется в localStorage при входе в комнату, покупках и после боя. «Продолжить» на главном экране загрузит последнее сохранение.',
      left,
      c.y + c.h - 90,
      { size: 11, color: UI.muted, maxWidth: c.w, lineHeight: 17 },
    );
    ui.text('Звук: только Web Audio, без внешних файлов.', left, c.y + c.h - 32, {
      size: 11,
      color: 'rgba(169,162,143,0.6)',
    });
  }
}

const PANELS = {
  inventory: InventoryPanel,
  character: CharacterPanel,
  journal: JournalPanel,
  bestiary: BestiaryPanel,
  pause: PausePanel,
};

export function openPanel(game, type) {
  if (!game.state) return;
  const top = game.topOverlay();
  if (top instanceof BasePanel) {
    if (top.id === type) {
      game.popOverlay();
      return;
    }
    game.popOverlay();
  }
  const Panel = PANELS[type];
  if (!Panel) return;
  game.audio.click();
  game.pushOverlay(new Panel(game));
}

export function isPanelOpen(game) {
  return game.topOverlay() instanceof BasePanel;
}
