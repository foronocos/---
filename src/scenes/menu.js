import { FONT_TITLE, FONT_UI, UI } from '../render/palette.js';
import { drawChiki, drawFeather } from '../render/sprites.js';
import { drawBalconySkyline } from '../render/rooms.js';
import { DustMotes, drawVignette } from '../render/effects.js';
import { ClassSelectScene } from './classSelect.js';
import { EndingsModal, HelpModal } from '../ui/panels.js';
import { getClass } from '../data/classes.js';

export class MenuScene {
  constructor(game) {
    this.game = game;
    this.time = 0;
    this.dust = new DustMotes(1280, 620, 46);
    this.featherPhase = Math.random() * Math.PI * 2;
    this.buttons = [];
  }

  enter() {
    this.dust = new DustMotes(1280, 620, 46);
  }

  update(dt) {
    this.time += dt;
    this.dust.update(dt, this.time);
    if (this.game.overlays.length) return;
    if (this.game.input.consumePressed('Enter', 'NumpadEnter')) {
      if (this.game.hasSave()) this.game.continueGame();
      else this.startNewGame();
    }
  }

  startNewGame() {
    this.game.audio.click();
    this.game.setScene(new ClassSelectScene(this.game));
  }

  draw(ctx) {
    const time = this.time;
    const game = this.game;
    const ui = game.ui;
    ctx.save();
    ui.begin(ctx);

    // фон
    const bg = ctx.createLinearGradient(0, 0, 0, 720);
    bg.addColorStop(0, '#080b13');
    bg.addColorStop(0.45, '#12151f');
    bg.addColorStop(1, '#1e1a20');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1280, 720);

    // окно с городом
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(760, 600);
    ctx.lineTo(760, 210);
    ctx.quadraticCurveTo(760, 80, 890, 80);
    ctx.quadraticCurveTo(1020, 80, 1020, 210);
    ctx.lineTo(1020, 600);
    ctx.closePath();
    ctx.clip();
    drawBalconySkyline(ctx, 730, 60, 400, 560, time);
    ctx.restore();
    ctx.strokeStyle = 'rgba(240, 199, 94, 0.25)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(760, 600);
    ctx.lineTo(760, 210);
    ctx.quadraticCurveTo(760, 80, 890, 80);
    ctx.quadraticCurveTo(1020, 80, 1020, 210);
    ctx.lineTo(1020, 600);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(240, 199, 94, 0.18)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(890, 90);
    ctx.lineTo(890, 600);
    ctx.moveTo(760, 350);
    ctx.lineTo(1020, 350);
    ctx.stroke();

    // пол и силуэты мебели
    ctx.fillStyle = '#100f16';
    ctx.fillRect(0, 600, 1280, 120);
    ctx.fillStyle = 'rgba(240, 199, 94, 0.05)';
    ctx.fillRect(0, 600, 1280, 2);

    // растение справа
    ctx.fillStyle = '#131219';
    ctx.beginPath();
    ctx.ellipse(1190, 590, 90, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 7; i += 1) {
      ctx.beginPath();
      ctx.ellipse(
        1180 + Math.cos(i * 1.3) * 46,
        540 + Math.sin(i * 1.8) * 44,
        20,
        44,
        i + Math.sin(time * 0.3) * 0.05,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // клетка-подиум
    ctx.save();
    ctx.strokeStyle = 'rgba(201, 178, 122, 0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(960, 590);
    ctx.lineTo(960, 380);
    ctx.quadraticCurveTo(1030, 300, 1100, 380);
    ctx.lineTo(1100, 590);
    ctx.stroke();
    for (let i = 0; i <= 6; i += 1) {
      const px = 960 + i * 23.3;
      const topY = 380 - Math.sin((i / 6) * Math.PI) * 52;
      ctx.beginPath();
      ctx.moveTo(px, topY);
      ctx.lineTo(px, 590);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(960, 500);
    ctx.lineTo(1100, 500);
    ctx.stroke();
    ctx.fillStyle = 'rgba(201, 178, 122, 0.2)';
    ctx.fillRect(940, 590, 180, 16);
    ctx.restore();

    // Чики на клетке
    drawChiki(ctx, 1040, 478, {
      scale: 1.35,
      facing: -1,
      time,
      classId: 'knight',
      pose: 'idle',
    });

    // пёрышко
    const fy = 280 + Math.sin(time * 0.8 + this.featherPhase) * 18;
    drawFeather(ctx, 700, fy, { scale: 0.9, time, rotation: 0.4, glow: true });

    // заголовок
    ctx.save();
    ctx.font = `600 14px ${FONT_UI}`;
    ctx.fillStyle = 'rgba(240, 199, 94, 0.75)';
    ctx.textAlign = 'left';
    ctx.fillText('ИСТОРИЯ ОДНОГО УТРА, КОТОРОЕ НЕ НАСТУПИЛО', 104, 132);

    const titleGrad = ctx.createLinearGradient(100, 160, 420, 300);
    titleGrad.addColorStop(0, '#fff3c9');
    titleGrad.addColorStop(0.55, '#f0c75e');
    titleGrad.addColorStop(1, '#b8892c');
    ctx.font = `700 106px ${FONT_TITLE}`;
    ctx.fillStyle = titleGrad;
    ctx.shadowColor = 'rgba(240, 199, 94, 0.35)';
    ctx.shadowBlur = 40;
    ctx.fillText('Чики', 96, 250);
    ctx.shadowBlur = 0;

    ctx.font = `400 40px ${FONT_TITLE}`;
    ctx.fillStyle = UI.cream;
    ctx.fillText('Перо Затмения', 104, 304);

    ctx.font = `400 15px ${FONT_UI}`;
    ctx.fillStyle = UI.muted;
    ctx.fillText('Сюжетная сказка о попугае, который впервые вышел из клетки.', 106, 338);
    ctx.restore();

    // кнопки
    const save = game.saveMeta();
    const buttonX = 104;
    const buttonW = 360;
    let y = 382;

    ui.button({
      id: 'continue',
      x: buttonX,
      y,
      w: buttonW,
      h: 54,
      label: 'Продолжить',
      sublabel: save
        ? `${getClass(save.classId).name} · Глава ${save.chapter} · ${save.hp}/${save.maxHp} HP`
        : 'нет сохранения',
      variant: save ? 'primary' : 'default',
      disabled: !save,
      hotkey: '1',
      align: 'left',
      onClick: () => game.continueGame(),
    });
    y += 66;

    ui.button({
      id: 'new',
      x: buttonX,
      y,
      w: buttonW,
      h: 54,
      label: save ? 'Новая игра' : 'Начать игру',
      sublabel: save ? 'начать заново · сохранение перезапишется' : 'выбрать класс и выйти из клетки',
      variant: save ? 'default' : 'primary',
      hotkey: '2',
      align: 'left',
      onClick: () => this.startNewGame(),
    });
    y += 66;

    ui.button({
      id: 'endings',
      x: buttonX,
      y,
      w: buttonW,
      h: 50,
      label: 'Концовки',
      sublabel: `открыто ${game.endingsSeen.length} из 6`,
      hotkey: '3',
      align: 'left',
      onClick: () => game.pushOverlay(new EndingsModal(game)),
    });
    y += 60;

    ui.button({
      id: 'help',
      x: buttonX,
      y,
      w: buttonW,
      h: 50,
      label: 'Управление и правила',
      sublabel: 'клавиши, бой, сохранения',
      hotkey: '4',
      align: 'left',
      onClick: () => game.pushOverlay(new HelpModal(game)),
    });
    y += 60;

    ui.button({
      id: 'sound',
      x: buttonX,
      y,
      w: buttonW,
      h: 44,
      label: game.settings.sound ? 'Звук включён' : 'Звук выключен',
      icon: game.settings.sound ? 'sound' : 'mute',
      variant: 'ghost',
      hotkey: '5',
      align: 'left',
      fontSize: 15,
      onClick: () => game.toggleSound(),
    });

    // подпись
    ctx.save();
    ctx.font = `400 12px ${FONT_UI}`;
    ctx.fillStyle = 'rgba(169, 162, 143, 0.65)';
    ctx.textAlign = 'left';
    ctx.fillText('v1.0 · HTML5 Canvas · без внешних ассетов · звук синтезируется в браузере', 104, 692);
    ctx.textAlign = 'right';
    ctx.fillText('Сохраняется автоматически в localStorage', 1176, 692);
    ctx.restore();

    this.dust.draw(ctx, 0, 1280, time);
    drawVignette(ctx, 1280, 720, 0.5);
    ui.end();
    ctx.restore();
  }
}
