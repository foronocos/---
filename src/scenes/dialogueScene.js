import { FONT_TITLE, FONT_UI, UI } from '../render/palette.js';
import { drawPortrait } from '../render/sprites.js';
import { getPortrait, getSpeakerColor } from '../data/dialogues.js';
import { wrapText } from '../core/util.js';

const CHARS_PER_SECOND = 58;

export class DialogueScene {
  constructor(game, dialogue, options = {}) {
    this.game = game;
    this.dialogue = dialogue;
    this.options = options;
    this.nodeId = null;
    this.node = null;
    this.chars = 0;
    this.time = 0;
    this.visibleChoices = [];
    this.appliedNodes = new Set();
    this.stopped = false;
    this.closed = false;
    this.lastBlip = 0;
  }

  enter() {
    this.goTo(this.dialogue.start);
  }

  resolveNode(nodeId) {
    let id = nodeId;
    let guard = 0;
    while (id && guard < 60) {
      const node = this.dialogue.nodes[id];
      if (!node) return { id: null, node: null };
      if (typeof node.showIf === 'function' && !node.showIf(this.game.state.player)) {
        id = node.next;
        guard += 1;
        continue;
      }
      return { id, node };
    }
    return { id: null, node: null };
  }

  goTo(nodeId) {
    const { id, node } = this.resolveNode(nodeId);
    this.nodeId = id;
    this.node = node;
    this.chars = 0;
    this.time = 0;
    if (!node) {
      this.finish();
      return;
    }
    this.visibleChoices = (node.choices || []).filter((choice) => {
      if (typeof choice.require !== 'function') return true;
      return choice.require(this.game.state.player, this.game.state);
    });
    if (node.effects && !this.appliedNodes.has(id)) {
      this.appliedNodes.add(id);
      const result = this.game.applyEffects(node.effects);
      if (result.stop) {
        this.stopped = true;
        return;
      }
      if (result.skipped) {
        // эффект уже был применён ранее — просто продолжаем
      }
    }
    if (node.tone === 'note') this.game.audio.tone({ freq: 380, dur: 0.1, type: 'sine', gain: 0.05 });
  }

  get isTyping() {
    return this.node ? this.chars < this.node.text.length : false;
  }

  advance() {
    if (this.stopped || !this.node) return;
    if (this.isTyping) {
      this.chars = this.node.text.length;
      return;
    }
    if (this.visibleChoices.length) return;
    if (this.node.end || !this.node.next) {
      this.finish();
      return;
    }
    this.game.audio.click();
    this.goTo(this.node.next);
  }

  selectChoice(index) {
    if (this.stopped || this.isTyping) return;
    const choice = this.visibleChoices[index];
    if (!choice) return;
    this.game.audio.click();
    if (choice.effects) {
      const result = this.game.applyEffects(choice.effects);
      if (result.stop) {
        this.stopped = true;
        return;
      }
    }
    if (choice.end || !choice.next) {
      this.finish();
      return;
    }
    this.goTo(choice.next);
  }

  finish() {
    if (this.closed) return;
    this.closed = true;
    this.game.popOverlay();
    if (this.options.onEnd) this.options.onEnd();
  }

  update(dt) {
    if (this.stopped || this.closed) return;
    const input = this.game.input;
    this.time += dt;

    if (this.isTyping) {
      const before = Math.floor(this.chars);
      this.chars = Math.min(this.node.text.length, this.chars + dt * CHARS_PER_SECOND);
      const after = Math.floor(this.chars);
      if (after > before && after % 3 === 0) this.game.audio.blip();
      if (this.chars >= this.node.text.length) this.chars = this.node.text.length;
    }

    const choicesVisible = this.visibleChoices.length > 0 && !this.isTyping;
    if (choicesVisible) {
      if (input.consumePressed('Digit1')) this.selectChoice(0);
      else if (input.consumePressed('Digit2')) this.selectChoice(1);
      else if (input.consumePressed('Digit3')) this.selectChoice(2);
      else if (input.consumePressed('Digit4')) this.selectChoice(3);
      else if (input.consumePressed('KeyA', 'ArrowUp', 'ArrowLeft')) this.selectChoice(0);
    } else if (input.consumePressed('Space', 'Enter', 'NumpadEnter', 'KeyE')) {
      this.advance();
    }
  }

  drawPanel(ctx) {
    const ui = this.game.ui;
    const node = this.node;
    const isNote = node.tone === 'note';
    const speaker = node.speaker || '';
    const accent = isNote ? '#b8892c' : getSpeakerColor(speaker);
    const panelX = 58;
    const panelY = 438;
    const panelW = 1164;
    const panelH = 250;

    ui.panel(panelX, panelY, panelW, panelH, {
      tone: isNote ? 'paper' : 'dark',
      border: isNote ? 'rgba(184, 137, 44, 0.65)' : 'rgba(240, 199, 94, 0.3)',
      alpha: 0.97,
    });

    // портрет
    const portraitX = panelX + 100;
    const portraitY = panelY + 116;
    if (!isNote) {
      drawPortrait(ctx, getPortrait(speaker), portraitX, portraitY + Math.sin(this.time * 1.6) * 2, 132, this.time);
    } else {
      drawPortrait(ctx, 'note', portraitX, portraitY, 122, this.time);
    }

    // имя
    if (speaker) {
      const nameY = panelY + 44;
      ctx.save();
      ctx.font = `700 21px ${FONT_TITLE}`;
      ctx.fillStyle = isNote ? '#5c4526' : accent;
      ctx.textAlign = 'left';
      ctx.fillText(speaker, panelX + 190, nameY);
      ctx.restore();
    }

    // текст
    const textX = panelX + 190;
    const textY = panelY + (speaker ? 82 : 66);
    const maxWidth = panelW - 230;
    ctx.save();
    ctx.font = `${isNote ? 'italic ' : ''}${node.tone === 'narration' ? '400' : '400'} 19px ${
      isNote ? FONT_TITLE : FONT_UI
    }`;
    const lines = wrapText(ctx, node.text, maxWidth);
    let remaining = Math.floor(this.chars);
    let cursorY = textY;
    for (const line of lines) {
      if (remaining <= 0) break;
      const slice = line.slice(0, remaining);
      remaining -= line.length + 1;
      ctx.fillStyle = isNote ? '#3f3120' : node.tone === 'narration' ? '#c9c0ad' : UI.cream;
      ctx.fillText(slice, textX, cursorY);
      cursorY += 27;
    }
    ctx.restore();

    // подсказка
    if (!this.visibleChoices.length) {
      if (this.isTyping) {
        ui.text('Пробел / клик — показать всё', panelX + panelW - 24, panelY + panelH - 18, {
          size: 11,
          color: 'rgba(169, 162, 143, 0.6)',
          align: 'right',
        });
      } else {
        const pulse = 0.55 + Math.sin(this.time * 4) * 0.25;
        ctx.save();
        ctx.globalAlpha = pulse;
        ui.text('Пробел / клик — дальше', panelX + panelW - 24, panelY + panelH - 18, {
          size: 11,
          color: UI.gold,
          align: 'right',
        });
        ctx.restore();
      }
    }

    // варианты
    if (this.visibleChoices.length && !this.isTyping) {
      // на телефоне по этим строкам бьют пальцем — делаем их выше и шире
      const rowH = this.game.touchMode ? 58 : 48;
      const gap = this.game.touchMode ? 10 : 8;
      const total = this.visibleChoices.length * (rowH + gap) - gap;
      let y = panelY - 18 - total;
      const x = this.game.touchMode ? 150 : 240;
      const w = this.game.touchMode ? 980 : 790;
      this.visibleChoices.forEach((choice, index) => {
        ui.button({
          id: `choice-${this.nodeId}-${index}`,
          x,
          y,
          w,
          h: rowH,
          label: choice.label,
          variant: index === 0 ? 'primary' : 'default',
          align: 'left',
          fontSize: this.game.touchMode ? 17 : 16,
          hotkey: String(index + 1),
          onClick: () => this.selectChoice(index),
        });
        y += rowH + gap;
      });
    }
  }

  draw(ctx) {
    if (this.stopped || this.closed || !this.node) return;
    ctx.save();
    ctx.fillStyle = 'rgba(4, 6, 12, 0.62)';
    ctx.fillRect(0, 0, 1280, 720);
    // виньетка поверх
    const vin = ctx.createRadialGradient(640, 360, 260, 640, 360, 720);
    vin.addColorStop(0, 'rgba(0,0,0,0)');
    vin.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = vin;
    ctx.fillRect(0, 0, 1280, 720);

    this.game.ui.begin(ctx);
    this.drawPanel(ctx);

    // клик вне кнопок — продолжить
    if (!this.game.input.peekClick() || this.game.overlays[this.game.overlays.length - 1] !== this) {
      this.game.ui.end();
      ctx.restore();
      return;
    }
    const click = this.game.input.peekClick();
    if (click) {
      if (!this.visibleChoices.length || this.isTyping) {
        this.game.input.consumeClick();
        this.advance();
      }
    }
    this.game.ui.end();
    ctx.restore();
  }
}
