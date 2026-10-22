import { drawRoom } from '../render/rooms.js';
import { drawChiki } from '../render/sprites.js';
import { DustMotes, Particles, drawVignette, drawScanlines } from '../render/effects.js';
import { CHAPTERS, FONT_UI, UI } from '../render/palette.js';
import { HUD } from '../ui/hud.js';
import {
  getDoorLock,
  getPropDialogue,
  getPropLabel,
  getRoom,
  isPropHidden,
} from '../data/chapters.js';
import { clamp, lerp } from '../core/util.js';
import { drawIcon } from '../ui/widgets.js';

const WALK_SPEED = 265;

export class ExploreScene {
  constructor(game, roomId, spawnX = null) {
    this.game = game;
    this.room = getRoom(roomId);
    this.x = spawnX ?? this.room.spawn;
    this.facing = 1;
    this.walkTime = 0;
    this.time = 0;
    this.cameraX = clamp(this.x - 640, 0, Math.max(0, this.room.width - 1280));
    this.fade = 1;
    this.entryHandled = false;
    this.autoTarget = null;
    this.nearestItem = null;
    this.touchLeft = false;
    this.touchRight = false;
    this.dust = new DustMotes(this.room.width, this.room.floorY, 42);
    this.particles = new Particles(180);
    this.hud = new HUD(game);
    this.stepTimer = 0;
    this.lastRoomTitle = '';
    this.roomLabelTime = 0;
  }

  enter() {
    this.roomLabelTime = 3;
  }

  changeRoom(room, spawnX) {
    this.room = room;
    this.x = spawnX ?? room.spawn;
    this.facing = 1;
    this.autoTarget = null;
    this.cameraX = clamp(this.x - 640, 0, Math.max(0, room.width - 1280));
    this.fade = 1;
    this.entryHandled = false;
    this.roomLabelTime = 3;
    this.dust = new DustMotes(room.width, room.floorY, room.art === 'vent' ? 18 : 42);
    this.particles.clear();
  }

  buildInteractables() {
    const state = this.game.state;
    const items = [];
    for (const prop of this.room.props) {
      if (isPropHidden(prop, state)) continue;
      const taken = prop.takenId && state.taken.includes(prop.takenId);
      items.push({
        kind: 'prop',
        prop,
        center: prop.x + prop.w / 2,
        width: prop.w,
        label: getPropLabel(prop, state) + (taken ? ' · пусто' : ''),
        x: prop.x,
        y: prop.y,
        w: prop.w,
        h: prop.h,
      });
    }
    for (const door of this.room.doors) {
      const lock = getDoorLock(this.room, door, state);
      items.push({
        kind: 'door',
        door,
        center: door.x,
        width: 150,
        label: door.label + (lock ? ' · заперто' : ''),
        locked: Boolean(lock),
        lockDialogue: lock,
        x: door.x - 80,
        y: this.room.floorY - 330,
        w: 160,
        h: 330,
      });
    }
    return items;
  }

  inRange(item) {
    return Math.abs(this.x - item.center) < item.width / 2 + 96;
  }

  nearestInteractable() {
    let best = null;
    let bestDistance = Infinity;
    for (const item of this.buildInteractables()) {
      const distance = Math.abs(this.x - item.center);
      if (distance < item.width / 2 + 96 && distance < bestDistance) {
        best = item;
        bestDistance = distance;
      }
    }
    return best;
  }

  nearestByProximity() {
    let best = null;
    let bestDistance = Infinity;
    for (const item of this.buildInteractables()) {
      const distance = Math.abs(this.x - item.center);
      if (distance < bestDistance) {
        best = item;
        bestDistance = distance;
      }
    }
    return best;
  }

  interactNearest() {
    const item = this.nearestInteractable();
    if (!item) {
      this.game.toast('Рядом ничего интересного. Осмотрись.', 'normal', 1.6);
      return;
    }
    this.interact(item);
  }

  interact(item) {
    if (!item) return;
    const game = this.game;
    if (item.kind === 'door') {
      if (item.locked) {
        game.audio.door();
        game.startDialogue(item.lockDialogue);
        return;
      }
      game.audio.door();
      game.enterRoom(item.door.to, item.door.spawnX);
      return;
    }
    const prop = item.prop;
    if (prop.type === 'loot') {
      if (prop.takenId && game.state.taken.includes(prop.takenId)) {
        game.toast('Здесь уже пусто.', 'normal', 1.5);
        return;
      }
      game.takeLoot(prop);
      return;
    }
    const dialogueId = getPropDialogue(prop, game.state);
    if (dialogueId) game.startDialogue(dialogueId);
  }

  itemAtPoint(worldX, y) {
    for (const item of this.buildInteractables()) {
      if (worldX >= item.x && worldX <= item.x + item.w && y >= item.y && y <= item.y + item.h) {
        return item;
      }
    }
    return null;
  }

  walkTo(item) {
    this.autoTarget = item;
  }

  onLoot(prop) {
    const x = prop.x + prop.w / 2;
    const y = prop.y + prop.h * 0.6;
    this.particles.burst(x, y, {
      count: 20,
      colors: ['#f0c75e', '#f6e7c1', '#d9b25c'],
      speed: 150,
      gravity: 190,
      life: 0.9,
      size: 4,
    });
  }

  update(dt) {
    const game = this.game;
    const input = game.input;
    this.time += dt;
    this.fade = Math.max(0, this.fade - dt * 2.1);
    this.roomLabelTime = Math.max(0, this.roomLabelTime - dt);
    this.dust.update(dt, this.time);
    this.particles.update(dt);

    if (game.overlays.length) {
      this.autoTarget = null;
      return;
    }
    if (!game.state) return;

    if (!this.entryHandled && this.fade < 0.5) {
      this.entryHandled = true;
      game.handleRoomEntry();
      if (game.overlays.length) return;
    }

    const left = input.isDown('ArrowLeft', 'KeyA') || this.touchLeft;
    const right = input.isDown('ArrowRight', 'KeyD') || this.touchRight;
    let moved = false;

    if (left || right) {
      this.autoTarget = null;
      const dir = left ? -1 : 1;
      this.x += dir * WALK_SPEED * dt;
      this.facing = dir;
      this.walkTime += dt;
      moved = true;
    } else if (this.autoTarget) {
      const item = this.autoTarget;
      const stopOffset = item.width / 2 + 34;
      const targetX = clamp(
        item.center + (this.x < item.center ? -stopOffset : stopOffset),
        50,
        this.room.width - 50,
      );
      const dx = targetX - this.x;
      if (Math.abs(dx) < 8) {
        this.autoTarget = null;
        this.interact(item);
        return;
      }
      const dir = Math.sign(dx);
      this.x += dir * WALK_SPEED * dt;
      this.facing = dir;
      this.walkTime += dt;
      moved = true;
    }

    this.x = clamp(this.x, 48, this.room.width - 48);

    // шаги поднимают пыль
    if (moved) {
      this.stepTimer += dt;
      if (this.stepTimer > 0.16) {
        this.stepTimer = 0;
        this.particles.burst(this.x - this.facing * 18, this.room.floorY - 2, {
          count: 2,
          colors: ['rgba(220, 205, 170, 0.6)', 'rgba(180, 165, 135, 0.4)'],
          speed: 26,
          spread: 1.2,
          angle: -Math.PI / 2,
          gravity: -16,
          life: 0.55,
          size: 2.6,
          shape: 'circle',
        });
      }
    }

    if (input.consumePressed('KeyE', 'Space')) {
      this.interactNearest();
      if (game.overlays.length) return;
    }

    // клик по предмету — подойти и взаимодействовать
    const click = input.peekClick();
    if (click && click.y > 118 && click.y < 575) {
      const worldX = click.x + this.cameraX;
      const item = this.itemAtPoint(worldX, click.y);
      if (item) {
        input.consumeClick();
        if (this.inRange(item)) this.interact(item);
        else this.walkTo(item);
        return;
      }
    }

    this.nearestItem = this.nearestInteractable();

    const targetCamera = clamp(this.x - 640, 0, Math.max(0, this.room.width - 1280));
    this.cameraX = lerp(this.cameraX, targetCamera, clamp(dt * 6.5, 0, 1));
  }

  drawPlayer(ctx) {
    const blinkPhase = this.time % 4.6;
    const blink = blinkPhase > 4.42;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.room.floorY + 4, 46, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const moving =
      this.game.input.isDown('ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD') ||
      this.touchLeft ||
      this.touchRight ||
      Boolean(this.autoTarget);
    drawChiki(ctx, this.x, this.room.floorY + 6, {
      scale: 0.74,
      facing: this.facing,
      time: this.walkTime || this.time,
      classId: this.game.state.player.classId,
      pose: moving ? 'walk' : 'idle',
      blink,
    });
  }

  drawHighlight(ctx, item) {
    if (!item) return;
    ctx.save();
    if (item.kind === 'door') {
      const pulse = 0.35 + Math.sin(this.time * 3) * 0.12;
      const x = item.center;
      const y = this.room.floorY - 10;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#f0c75e';
      ctx.beginPath();
      ctx.ellipse(x, y, 70, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      const prop = item.prop;
      const pulse = 0.55 + Math.sin(this.time * 3.2) * 0.2;
      ctx.globalAlpha = pulse * 0.45;
      ctx.strokeStyle = '#f0c75e';
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 8]);
      ctx.beginPath();
      ctx.roundRect(prop.x - 8, prop.y - 8, prop.w + 16, prop.h + 16, 12);
      ctx.stroke();
      ctx.setLineDash([]);
      const ax = prop.x + prop.w / 2;
      const ay = prop.y - 26 + Math.sin(this.time * 3) * 4;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#f0c75e';
      ctx.beginPath();
      ctx.moveTo(ax, ay + 10);
      ctx.lineTo(ax + 7, ay);
      ctx.lineTo(ax - 7, ay);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawPrompt(ctx) {
    const item = this.nearestItem;
    if (!item) return;
    const screenX = clamp(this.x - this.cameraX, 150, 1130);
    const text = item.label;
    ctx.save();
    ctx.font = `600 14px ${FONT_UI}`;
    const width = Math.min(360, ctx.measureText(text).width + 74);
    const x = screenX - width / 2;
    const y = this.room.floorY - 250;
    ctx.fillStyle = 'rgba(10, 13, 20, 0.9)';
    ctx.strokeStyle = 'rgba(240, 199, 94, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, width, 36, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(240, 199, 94, 0.15)';
    ctx.beginPath();
    ctx.arc(x + 19, y + 18, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(240, 199, 94, 0.6)';
    ctx.beginPath();
    ctx.arc(x + 19, y + 18, 11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#f0c75e';
    if (this.game.touchMode) {
      // на телефоне клавиши нет — рисуем кружок-точку касания
      ctx.beginPath();
      ctx.arc(x + 19, y + 18, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.font = `700 11px ${FONT_UI}`;
      ctx.textAlign = 'center';
      ctx.fillText('E', x + 19, y + 22);
    }
    ctx.fillStyle = '#f4e9ce';
    ctx.font = `600 14px ${FONT_UI}`;
    ctx.textAlign = 'left';
    ctx.fillText(text, x + 38, y + 23);
    // указатель
    ctx.fillStyle = 'rgba(10, 13, 20, 0.9)';
    ctx.beginPath();
    ctx.moveTo(screenX - 7, y + 36);
    ctx.lineTo(screenX + 7, y + 36);
    ctx.lineTo(screenX, y + 44);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  draw(ctx) {
    const game = this.game;
    const state = game.state;
    if (!state) return;
    const cam = this.cameraX;
    const palette = CHAPTERS[this.room.chapter]?.palette || CHAPTERS[1].palette;

    ctx.save();
    ctx.translate(-cam, 0);
    drawRoom(ctx, this.room, state, this.time);
    this.drawHighlight(ctx, this.nearestItem);
    this.drawPlayer(ctx);
    this.dust.draw(ctx, cam, 1280, this.time);
    this.particles.draw(ctx);
    ctx.restore();

    // передний план
    const fg = ctx.createLinearGradient(0, 560, 0, 720);
    fg.addColorStop(0, 'rgba(6, 8, 14, 0)');
    fg.addColorStop(1, 'rgba(6, 8, 14, 0.55)');
    ctx.fillStyle = fg;
    ctx.fillRect(0, 560, 1280, 160);
    drawVignette(ctx, 1280, 720, 0.45);
    drawScanlines(ctx, 1280, 720, 0.02);

    game.ui.begin(ctx);
    this.hud.draw(ctx, this, this.room);
    if (!game.overlays.length) this.drawPrompt(ctx);
    game.ui.end();

    // фейд комнаты
    if (this.fade > 0) {
      ctx.save();
      ctx.globalAlpha = this.fade;
      ctx.fillStyle = '#07090f';
      ctx.fillRect(0, 0, 1280, 720);
      ctx.restore();
    }

    // название комнаты при входе
    if (this.roomLabelTime > 0 && !game.overlays.length) {
      const alpha = Math.min(1, this.roomLabelTime) * Math.min(1, (3 - this.roomLabelTime + 0.2) * 2);
      ctx.save();
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.textAlign = 'center';
      ctx.font = `700 34px Georgia, serif`;
      ctx.fillStyle = 'rgba(244, 233, 206, 0.9)';
      ctx.fillText(this.room.title, 640, 210);
      ctx.font = `400 13px ${FONT_UI}`;
      ctx.fillStyle = 'rgba(240, 199, 94, 0.7)';
      ctx.fillText(this.room.subtitle || '', 640, 234);
      ctx.restore();
    }
  }
}
