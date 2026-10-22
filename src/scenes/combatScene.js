import { CLASS_COLORS, FONT_TITLE, FONT_UI, UI } from '../render/palette.js';
import {
  drawCat,
  drawChiki,
  drawPasta,
  drawVacuum,
} from '../render/sprites.js';
import { BOSS_SPRITES } from '../render/spritesB.js';
import { getEnemy } from '../data/enemies.js';
import { ITEMS } from '../data/items.js';
import { getClass } from '../data/classes.js';
import { getStats } from '../game/state.js';
import { FloatTexts, Particles, ScreenShake, drawVignette, drawScanlines } from '../render/effects.js';
import { drawDice, drawIcon } from '../ui/widgets.js';
import { clamp, ellipsize, lerp, shade, wrapText } from '../core/util.js';

const TONE_COLORS = {
  player: '#f4e9ce',
  crit: '#ffd97a',
  enemy: '#f0a49e',
  heal: '#b7e6b9',
  skill: '#c9b0f0',
  system: '#a9a28f',
  good: '#f0c75e',
  bad: '#f0a49e',
  defend: '#9fc2e8',
  intent: '#c9b0f0',
  ally: '#9fd8b1',
  ult: '#ffd97a',
  buff: '#c9e8a8',
};

const ENEMY_SCALE = {
  cat: 1.32,
  vacuum: 1.12,
  pasta: 0.98,
  keys: 1.05,
  boiler: 1.0,
  moth: 1.02,
  raven: 1.0,
  shadow: 1.05,
  shunya: 1.0,
};
const ENEMY_X = 980;
const PLAYER_X = 255;
const FLOOR_Y = 468;

export class CombatScene {
  constructor(game, model) {
    this.game = game;
    this.model = model;
    this.enemy = getEnemy(model.enemyId);
    this.chapter = model.enemyId === 'cat' ? 1 : model.enemyId === 'vacuum' ? 2 : 3;
    this.backdropDust = Array.from({ length: 34 }, (_, i) => ({
      x: (i * 173.7) % 1280,
      y: 120 + ((i * 97.3) % 420),
      size: 1 + ((i * 7) % 3) * 0.6,
      speed: 4 + ((i * 11) % 9),
      phase: i * 1.7,
    }));
    this.time = 0;
    this.introTime = 0;
    this.phase = 'intro';
    this.timers = [];
    this.dice = { value: 1, final: 1, rolling: false, t: 0, label: 'БРОСОК' };
    this.displayPlayerHp = model.playerHp;
    this.displayEnemyHp = model.enemyHp;
    this.floats = new FloatTexts();
    this.particles = new Particles(260);
    this.shake = new ScreenShake();
    this.playerLunge = 0;
    this.enemyLunge = 0;
    this.playerHurt = 0;
    this.enemyHurt = 0;
    this.itemMenu = false;
    this.pastaOffer = false;
    this.victory = null;
    this.defeatShown = false;
    this.enemyFade = 1;
    this.message = null;
    this.messageTimer = 0;
    this.ultFlash = 0;
    this.introTimer = 1.5;
    this.hideTimer = 0;
  }

  enter() {
    this.model.start();
    this.displayPlayerHp = this.model.playerHp;
    this.displayEnemyHp = this.model.enemyHp;
    if (this.model.outcome === 'kill') {
      this.after(0.9, () => this.finishVictory('kill'));
      return;
    }
    this.after(1.5, () => {
      if (!this.victory && !this.defeatShown) this.phase = 'player';
    });
  }

  after(delay, fn) {
    this.timers.push({ t: delay, fn });
  }

  updateTimers(dt) {
    const ready = [];
    for (const timer of this.timers) {
      timer.t -= dt;
      if (timer.t <= 0) ready.push(timer);
    }
    if (ready.length) {
      this.timers = this.timers.filter((timer) => !ready.includes(timer));
      ready.forEach((timer) => timer.fn());
    }
  }

  addMessage(text, tone = 'normal') {
    this.message = { text, tone, toneColor: TONE_COLORS[tone] || UI.cream };
    this.messageTimer = 2.6;
  }

  get canAct() {
    return (
      this.phase === 'player' &&
      !this.itemMenu &&
      !this.pastaOffer &&
      !this.victory &&
      !this.defeatShown &&
      !this.model.outcome
    );
  }

  // ------------------------------------------------------------------ действия

  doAttack() {
    if (!this.canAct) return;
    const result = this.model.attack();
    if (!result.ok) return;
    this.animateHits(result.hits, { skill: false });
  }

  doSkill() {
    if (!this.canAct) return;
    const result = this.model.useSkill();
    if (!result.ok) {
      this.addMessage(result.message || 'Умение недоступно', 'bad');
      return;
    }
    this.game.audio.skill();
    this.floatAtPlayer(result.skill.name, '#c9b0f0', 22);
    if (result.kind === 'volley') {
      this.animateHits(result.hits, { skill: true });
      return;
    }
    if (result.kind === 'backstab_buff') {
      this.phase = 'player';
      this.ultFlash = 0.5;
      this.addMessage('Тень сгустилась: следующий удар будет двойным.', 'buff');
      return;
    }
    this.phase = 'animating';
    this.ultFlash = 0.7;
    this.after(0.9, () => this.afterPlayerAction());
  }

  useItem(itemId) {
    if (this.phase !== 'player' || this.pastaOffer || this.victory || this.defeatShown) return;
    const result = this.model.useItem(itemId);
    if (!result.ok) {
      this.addMessage(result.message || 'Предмет не сработал', 'bad');
      return;
    }
    this.itemMenu = false;
    if (result.kind === 'heal') {
      this.game.audio.heal();
      this.floatAtPlayer(`+${result.healed}`, '#b7e6b9', 34);
      this.particles.burst(PLAYER_X, FLOOR_Y - 90, {
        count: 16,
        colors: ['#b7e6b9', '#f0c75e'],
        speed: 90,
        gravity: -30,
        life: 0.9,
        size: 3,
        shape: 'circle',
      });
    } else if (result.kind === 'double') {
      this.game.audio.skill();
      this.floatAtPlayer('ДВОЙНОЕ ЗЕРНО', '#ffd97a', 20);
    }
    this.displayPlayerHp = Math.min(this.model.maxHp, this.displayPlayerHp);
  }

  animateHits(hits, options = {}) {
    this.phase = 'animating';
    this.itemMenu = false;
    const first = hits[0];
    this.dice.final = first.roll;
    this.dice.rolling = true;
    this.dice.t = 0.58;
    this.dice.label = first.crit ? 'КРИТ!' : 'БРОСОК';
    this.game.audio.dice();
    let time = 0.62;
    hits.forEach((hit, index) => {
      this.after(time, () => {
        this.dice.value = hit.roll;
        this.dice.rolling = false;
        this.dice.final = hit.roll;
        this.dice.label = hit.crit ? 'КРИТ!' : options.skill ? 'ЗАЛП' : 'БРОСОК';
        this.enemyHurt = 0.45;
        this.enemyLunge = 0;
        this.shake.add(hit.crit ? 16 : 9);
        this.game.audio.hit(hit.crit);
        const dmgColor = hit.crit ? '#ffd97a' : '#f4e9ce';
        this.floats.add(ENEMY_X + (Math.random() * 40 - 20), FLOOR_Y - 190, `−${hit.damage}`, {
          color: dmgColor,
          size: hit.crit ? 44 : 32,
          life: 1.1,
        });
        if (hit.crit) {
          this.floats.add(ENEMY_X, FLOOR_Y - 250, 'КРИТ!', { color: '#ffd97a', size: 24, life: 1.2 });
        }
        this.particles.burst(ENEMY_X, FLOOR_Y - 140, {
          count: hit.crit ? 26 : 14,
          colors: hit.crit ? ['#ffd97a', '#f6e7c1', '#e2645e'] : ['#f6e7c1', '#d9b25c'],
          speed: hit.crit ? 240 : 150,
          gravity: 360,
          life: 0.7,
          size: 3.5,
        });
        this.model.enemyHp = Math.max(0, this.model.enemyHp);
      });
      time += 0.42;
    });
    this.after(time + 0.6, () => this.afterPlayerAction());
  }

  afterPlayerAction() {
    if (this.model.outcome === 'kill' || this.model.enemyHp <= 0) {
      this.finishVictory('kill');
      return;
    }
    if (this.model.outcome === 'defeat') {
      this.handleDefeat();
      return;
    }
    this.enemyTurn();
  }

  enemyTurn() {
    if (this.victory || this.defeatShown) return;
    this.phase = 'enemy';
    this.itemMenu = false;
    const result = this.model.enemyAct();
    if (result.hidden) {
      this.hideTimer = 1.1;
      this.addMessage('Мурзила спрятался. Удар не проходит.', 'defend');
      this.after(0.9, () => this.beginTurn());
      return;
    }
    this.after(0.28, () => {
      this.enemyLunge = 0.7;
    });
    this.after(0.62, () => {
      this.enemyLunge = 0;
      this.playerHurt = 0.5;
      this.shake.add(10);
      this.game.audio.hurt();
      this.floats.add(PLAYER_X + 10, FLOOR_Y - 140, `−${result.damage}`, {
        color: '#f0a49e',
        size: 36,
        life: 1.05,
      });
      this.particles.burst(PLAYER_X + 20, FLOOR_Y - 110, {
        count: 16,
        colors: ['#e2645e', '#f0a49e', '#f6e7c1'],
        speed: 170,
        gravity: 320,
        life: 0.6,
        size: 3,
      });
      if (result.inhale) {
        this.addMessage('Шланг втянул Чики! Следующий ход пропущен.', 'bad');
      }
      if (result.reflect) {
        this.floats.add(ENEMY_X, FLOOR_Y - 170, `−${result.reflect}`, {
          color: '#c9b0f0',
          size: 22,
          life: 0.9,
        });
      }
    });
    this.after(1.25, () => {
      if (this.model.outcome === 'defeat' || this.model.playerHp <= 0) {
        this.handleDefeat();
        return;
      }
      // Обратный коготь и прочие отражения могут добить врага в его же ход.
      if (this.model.enemyHp <= 0) {
        this.finishVictory('kill');
        return;
      }
      if (result.pastaOffer) {
        this.showPastaOffer();
        return;
      }
      this.beginTurn();
    });
  }

  beginTurn() {
    if (this.model.outcome === 'defeat') {
      this.handleDefeat();
      return;
    }
    if (this.model.enemyHp <= 0) {
      this.finishVictory('kill');
      return;
    }
    const result = this.model.beginPlayerTurn();
    if (result.skipped) {
      this.phase = 'animating';
      this.addMessage(this.model.skipReason || 'Чики пропускает ход', 'bad');
      this.after(1.15, () => this.enemyTurn());
      return;
    }
    this.phase = 'player';
  }

  finishVictory(outcome) {
    if (this.victory) return;
    this.phase = 'victory';
    this.victory = { outcome };
    this.phase = 'victory';
    this.game.audio.victory();
    this.shake.add(6);
    this.particles.burst(ENEMY_X, FLOOR_Y - 150, {
      count: 40,
      colors: ['#f0c75e', '#f6e7c1', '#b7e6b9'],
      speed: 260,
      gravity: 200,
      life: 1.4,
      size: 4,
    });
    this.after(0.05, () => {
      this.enemyFade = 0.4;
    });
  }

  handleDefeat() {
    if (this.defeatShown || this.victory) return;
    this.defeatShown = true;
    this.phase = 'defeat';
    this.pastaOffer = false;
    this.itemMenu = false;
    this.game.audio.defeat();
    this.model.outcome = 'defeat';
    this.model.playerHp = 0;
  }

  useUlt() {
    const result = this.model.useUlt();
    if (!result.ok) {
      this.addMessage(result.message || 'Эхо ещё не готово', 'bad');
      return;
    }
    this.defeatShown = false;
    this.victory = null;
    this.phase = 'player';
    this.itemMenu = false;
    this.ultFlash = 1;
    this.displayPlayerHp = this.model.playerHp;
    this.displayEnemyHp = this.model.enemyHp;
    this.game.audio.skill();
    this.addMessage('Эхо Первой Семечки отменило ход.', 'ult');
    this.floatAtPlayer('ЭХО', '#ffd97a', 40);
    this.particles.burst(PLAYER_X, FLOOR_Y - 100, {
      count: 30,
      colors: ['#ffd97a', '#f6e7c1', '#c9b0f0'],
      speed: 200,
      gravity: -20,
      life: 1.1,
      size: 4,
      shape: 'circle',
    });
  }

  spare() {
    if (!this.canAct) return;
    const result = this.model.spare();
    if (!result.ok) {
      this.addMessage(result.message || 'Пока рано', 'bad');
      return;
    }
    this.game.audio.victory();
    this.finishVictory('spare');
  }

  showPastaOffer() {
    this.pastaOffer = true;
    this.phase = 'offer';
    this.addMessage('Хозяин Макарон предлагает макароны.', 'intent');
  }

  acceptPasta() {
    const result = this.model.acceptPasta();
    if (!result.ok) return;
    this.pastaOffer = false;
    this.itemMenu = false;
    this.game.audio.heal();
    this.floatAtPlayer(`+${result.healed}`, '#b7e6b9', 34);
    this.addMessage('Макароны съедены. Два хода будут пропущены.', 'heal');
    this.phase = 'animating';
    this.after(1.0, () => this.beginTurn());
  }

  declinePasta() {
    this.model.declinePasta();
    this.pastaOffer = false;
    this.phase = 'player';
    this.addMessage('Чики отказался. Хозяин Макарон уважительно кивнул.', 'normal');
  }

  retry() {
    this.game.retryCombat(this.model.enemyId);
  }

  // -------------------------------------------------------------------- отрисовка

  floatAtPlayer(text, color, size) {
    this.floats.add(PLAYER_X, FLOOR_Y - 200, text, { color, size, life: 1.1 });
  }

  drawEnemy(ctx) {
    const enemyId = this.model.enemyId;
    const outcome = this.model.outcome;
    const scale = ENEMY_SCALE[enemyId] || 1.1;
    const lunge = this.enemyLunge * -70;
    const hurtShake = this.enemyHurt > 0 ? Math.sin(this.time * 60) * 7 * this.enemyHurt : 0;
    const alpha = this.victory ? Math.max(0.25, this.enemyFade) : 1;
    const x = ENEMY_X + lunge + hurtShake;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (enemyId === 'cat') {
      const mood = this.model.enemyHp / this.model.enemyMaxHp < 0.4 ? 'angry' : 'awake';
      drawCat(ctx, x, FLOOR_Y + 12, { scale, time: this.time, mood, facing: -1 });
    } else if (enemyId === 'vacuum') {
      drawVacuum(ctx, x, FLOOR_Y + 12, {
        scale,
        time: this.time,
        angry: this.model.enemyHp / this.model.enemyMaxHp > 0.35,
      });
    } else if (BOSS_SPRITES[enemyId]) {
      const mood = this.model.enemyHp / this.model.enemyMaxHp < 0.35 ? 'angry' : 'idle';
      BOSS_SPRITES[enemyId](ctx, x, FLOOR_Y + 14, {
        scale,
        time: this.time,
        facing: -1,
        mood,
      });
    } else {
      drawPasta(ctx, x, FLOOR_Y + 12, { scale, time: this.time });
    }
    ctx.restore();

    // тень
    ctx.save();
    ctx.globalAlpha = alpha * 0.4;
    ctx.fillStyle = '#05060a';
    ctx.beginPath();
    ctx.ellipse(ENEMY_X + lunge, FLOOR_Y + 16, 120, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (this.victory && this.victory.outcome === 'spare') {
      const bob = Math.sin(this.time * 3) * 4;
      ctx.save();
      ctx.globalAlpha = 0.9;
      drawIcon(ctx, 'heart', ENEMY_X, FLOOR_Y - 300 + bob, 30, '#f0a49e');
      ctx.restore();
    }
    if (outcome === null && this.model.intent?.kind === 'hide' && this.phase === 'player') {
      ctx.save();
      ctx.globalAlpha = 0.7 + Math.sin(this.time * 4) * 0.2;
      ctx.fillStyle = '#c9b0f0';
      ctx.font = `700 30px ${FONT_TITLE}`;
      ctx.textAlign = 'center';
      ctx.fillText('?', ENEMY_X, FLOOR_Y - 300);
      ctx.restore();
    }
  }

  drawPlayer(ctx) {
    const lunge = this.playerLunge * 70;
    const hurtShake = this.playerHurt > 0 ? Math.sin(this.time * 55) * 6 * this.playerHurt : 0;
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#05060a';
    ctx.beginPath();
    ctx.ellipse(PLAYER_X, FLOOR_Y + 18, 60, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const pose = this.playerHurt > 0.2 ? 'hurt' : this.playerLunge > 0.1 ? 'attack' : 'idle';
    drawChiki(ctx, PLAYER_X + lunge + hurtShake, FLOOR_Y + 14, {
      scale: 0.95,
      facing: 1,
      time: this.time,
      classId: this.model.classId,
      pose,
      blink: this.time % 5 > 4.8,
    });
    if (this.model.shield) {
      ctx.save();
      ctx.globalAlpha = 0.35 + Math.sin(this.time * 4) * 0.12;
      ctx.strokeStyle = '#f0c75e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(PLAYER_X, FLOOR_Y - 90, 78, 100, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#f0c75e';
      ctx.fill();
      ctx.restore();
    }
    if (this.model.backstab) {
      ctx.save();
      ctx.globalAlpha = 0.3 + Math.sin(this.time * 5) * 0.12;
      ctx.fillStyle = '#a58ad8';
      ctx.beginPath();
      ctx.ellipse(PLAYER_X - 24, FLOOR_Y - 8, 50, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (this.ultFlash > 0) {
      ctx.save();
      ctx.globalAlpha = this.ultFlash * 0.5;
      ctx.strokeStyle = '#ffd97a';
      ctx.lineWidth = 4;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(PLAYER_X, FLOOR_Y - 80, 60 + i * 26 + (1 - this.ultFlash) * 60, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (this.model.doublePending) {
      ctx.save();
      ctx.globalAlpha = 0.8;
      drawIcon(ctx, 'seed', PLAYER_X + 60, FLOOR_Y - 170, 18, '#ffd97a');
      ctx.restore();
    }
  }

  drawArena(ctx) {
    const palette = {
      1: { top: '#231d2c', wall: '#3d2e3e', wallDeep: '#2b2130', floor: '#6b4a35', accent: '#f0c75e' },
      2: { top: '#19211d', wall: '#2e3a2b', wallDeep: '#1e2721', floor: '#57452f', accent: '#c9d98a' },
      3: { top: '#222a32', wall: '#38434b', wallDeep: '#232b33', floor: '#6b5636', accent: '#e8c27a' },
    }[this.chapter];
    const bg = ctx.createLinearGradient(0, 0, 0, 720);
    bg.addColorStop(0, palette.top);
    bg.addColorStop(0.62, palette.wall);
    bg.addColorStop(1, palette.wallDeep || palette.wall);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1280, 720);

    // пол: отдельная плоскость, чтобы арена читалась как комната
    const floorTop = 486;
    const floor = ctx.createLinearGradient(0, floorTop, 0, 720);
    floor.addColorStop(0, palette.floor);
    floor.addColorStop(0.45, shade(palette.floor, -0.25));
    floor.addColorStop(1, '#141018');
    ctx.fillStyle = floor;
    ctx.fillRect(0, floorTop, 1280, 720 - floorTop);
    // плинтус и доски
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, floorTop - 4, 1280, 5);
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.16)';
    ctx.lineWidth = 1;
    for (let i = -6; i <= 12; i += 1) {
      ctx.beginPath();
      ctx.moveTo(640 + i * 90, floorTop);
      ctx.lineTo(640 + i * 230, 720);
      ctx.stroke();
    }
    for (let i = 1; i <= 4; i += 1) {
      const y = floorTop + Math.pow(i / 4, 1.7) * (720 - floorTop);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1280, y);
      ctx.stroke();
    }
    ctx.restore();

    // силуэты мебели: дальний план, поэтому тихие и низкие
    ctx.save();
    ctx.fillStyle = 'rgba(8, 8, 14, 0.34)';
    if (this.chapter === 1) {
      ctx.fillRect(720, 396, 540, 96);
      ctx.fillRect(720, 376, 540, 24);
      ctx.fillRect(60, 392, 250, 100);
      ctx.fillRect(60, 366, 250, 26);
      ctx.fillStyle = 'rgba(8, 8, 14, 0.22)';
      ctx.beginPath();
      ctx.ellipse(1030, 300, 110, 84, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.chapter === 2) {
      for (let i = 0; i < 5; i += 1) {
        const h = 110 + i * 26;
        ctx.fillRect(36 + i * 86, 486 - h, 78, h);
        ctx.fillRect(952 + i * 62, 486 - h * 0.72, 52, h * 0.72);
      }
    } else {
      ctx.fillRect(0, 262, 1280, 18);
      ctx.fillRect(40, 386, 300, 106);
      ctx.fillRect(1020, 400, 240, 92);
      ctx.fillStyle = 'rgba(8, 8, 14, 0.24)';
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.arc(340 + i * 200, 236, 68, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // световые полосы
    for (let i = 0; i < 3; i += 1) {
      const beam = ctx.createLinearGradient(300 + i * 300, 0, 420 + i * 260, 620);
      beam.addColorStop(0, 'rgba(240, 220, 180, 0.06)');
      beam.addColorStop(1, 'rgba(240, 220, 180, 0)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(280 + i * 320, 0);
      ctx.lineTo(400 + i * 300, 0);
      ctx.lineTo(620 + i * 240, 640);
      ctx.lineTo(420 + i * 240, 640);
      ctx.closePath();
      ctx.fill();
    }

    // пыль
    ctx.save();
    for (const mote of this.backdropDust) {
      const y = (mote.y - this.time * mote.speed) % 540;
      ctx.globalAlpha = 0.16 + Math.abs(Math.sin(this.time * 0.8 + mote.phase)) * 0.22;
      ctx.fillStyle = '#f0e3c4';
      ctx.beginPath();
      ctx.arc(mote.x, y < 0 ? y + 540 : y, mote.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // арена
    const glow = ctx.createRadialGradient(640, 440, 40, 640, 440, 500);
    glow.addColorStop(0, 'rgba(240, 199, 94, 0.12)');
    glow.addColorStop(1, 'rgba(240, 199, 94, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1280, 720);
    ctx.strokeStyle = 'rgba(240, 199, 94, 0.16)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(640, FLOOR_Y + 34, 540, 66, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(240, 199, 94, 0.07)';
    ctx.beginPath();
    ctx.ellipse(640, FLOOR_Y + 34, 420, 48, 0, 0, Math.PI * 2);
    ctx.stroke();

    // световое пятно на полу под светильником
    const pool = ctx.createRadialGradient(640, FLOOR_Y + 30, 30, 640, FLOOR_Y + 30, 460);
    pool.addColorStop(0, 'rgba(255, 226, 168, 0.16)');
    pool.addColorStop(0.5, 'rgba(255, 226, 168, 0.05)');
    pool.addColorStop(1, 'rgba(255, 226, 168, 0)');
    ctx.fillStyle = pool;
    ctx.fillRect(0, FLOOR_Y - 140, 1280, 360);

    // нижняя тень
    const fg = ctx.createLinearGradient(0, 470, 0, 720);
    fg.addColorStop(0, 'rgba(6, 8, 14, 0)');
    fg.addColorStop(1, 'rgba(6, 8, 14, 0.72)');
    ctx.fillStyle = fg;
    ctx.fillRect(0, 470, 1280, 250);
  }

  drawTopPanels(ctx) {
    const ui = this.game.ui;
    const model = this.model;
    const stats = getStats(this.game.state.player);
    const cls = getClass(model.classId);
    const accent = CLASS_COLORS[model.classId]?.main || UI.gold;
    const playerGhost = Math.max(model.playerHp, this.displayPlayerHp);

    ui.panel(20, 16, 346, 112, { alpha: 0.84 });
    ui.text(cls.name, 40, 42, { size: 15, color: accent, weight: '700' });
    ui.text(`Класс · урон +${stats.bonus}`, 344, 42, { size: 10, color: UI.muted, align: 'right' });
    ui.text(ellipsize(ctx, stats.skill.desc, 306), 40, 60, { size: 10, color: 'rgba(169,162,143,0.8)' });
    ui.bar(40, 68, 220, 20, model.playerHp, model.maxHp, {
      color: model.playerHp / model.maxHp > 0.55 ? '#79c98a' : model.playerHp / model.maxHp > 0.28 ? '#e8c06a' : '#e2645e',
      ghost: playerGhost,
      text: `${model.playerHp}/${model.maxHp}`,
    });
    ui.seedChip(272, 62, model.seeds, { w: 74, h: 32 });
    // умение
    ctx.save();
    ctx.font = `600 11px ${FONT_UI}`;
    ctx.fillStyle = UI.muted;
    ctx.fillText(`${stats.skill.name}:`, 40, 110);
    for (let i = 0; i < model.skillUsesMax; i += 1) {
      ctx.beginPath();
      ctx.arc(180 + i * 16, 106, 5, 0, Math.PI * 2);
      ctx.fillStyle = i < model.skillUsesLeft ? accent : 'rgba(120, 115, 100, 0.35)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.stroke();
    }
    ctx.fillStyle = model.ultAvailable ? '#ffd97a' : 'rgba(169,162,143,0.55)';
    ctx.textAlign = 'right';
    ctx.fillText(
      model.ultAvailable ? 'Эхо готово' : model.ultUsedHere ? 'Эхо применено' : 'Эхо недоступно',
      344,
      110,
    );
    ctx.restore();

    // враг
    ui.panel(914, 16, 346, 112, { alpha: 0.84 });
    ctx.save();
    let nameSize = 19;
    ctx.font = `700 ${nameSize}px ${FONT_TITLE}`;
    while (nameSize > 13 && ctx.measureText(this.enemy.name).width > 306) {
      nameSize -= 0.5;
      ctx.font = `700 ${nameSize}px ${FONT_TITLE}`;
    }
    ctx.fillStyle = '#f0c75e';
    ctx.textAlign = 'left';
    ctx.fillText(this.enemy.name, 934, 42);
    ctx.font = `400 10px ${FONT_UI}`;
    ctx.fillStyle = UI.muted;
    ctx.fillText(ellipsize(ctx, this.enemy.title, 306), 934, 60);
    ctx.restore();
    ui.bar(934, 68, 286, 20, model.enemyHp, model.enemyMaxHp, {
      color: '#d96a62',
      ghost: this.displayEnemyHp,
      text: `${model.enemyHp}/${model.enemyMaxHp}`,
    });
    ui.text('НАМЕРЕНИЕ', 934, 110, { size: 9, color: 'rgba(240,199,94,0.65)', weight: '700' });
    ui.text(model.getIntentText(), 1010, 110, {
      size: 12,
      color: model.intent?.kind === 'attack' ? '#f0c75e' : '#c9b0f0',
      weight: '600',
    });

    // кубик
    drawDice(ctx, 608, 26, 54, this.dice.value, {
      rolling: this.dice.rolling,
      time: this.time,
      highlight: this.dice.value === 6 && !this.dice.rolling,
    });
    ui.text(this.dice.label, 635, 96, {
      size: 9,
      color: this.dice.value === 6 ? '#ffd97a' : 'rgba(240,199,94,0.7)',
      align: 'center',
      weight: '700',
    });
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `600 11px ${FONT_UI}`;
    ctx.fillStyle = this.phase === 'player' ? '#b7e6b9' : '#a9a28f';
    const labels = {
      intro: 'Бой начинается',
      player: 'Твой ход',
      animating: '…',
      enemy: 'Ход врага',
      offer: 'Предложение',
      victory: 'Победа',
      defeat: 'Поражение',
    };
    ctx.fillText(labels[this.phase] || '', 640, 118);
    ctx.restore();
  }

  drawLog(ctx) {
    const ui = this.game.ui;
    const model = this.model;
    ui.panel(20, 516, 620, 186, { alpha: 0.88, title: 'Журнал боя' });
    ctx.save();
    ctx.font = `400 12px ${FONT_UI}`;
    const lines = [];
    for (let i = model.log.length - 1; i >= 0; i -= 1) {
      const entry = model.log[i];
      const wrapped = wrapText(ctx, entry.text, 570);
      if (lines.length + wrapped.length > 7) break;
      wrapped.reverse().forEach((line) => lines.unshift({ text: line, tone: entry.tone }));
    }
    let y = 566;
    for (const line of lines) {
      ctx.fillStyle = TONE_COLORS[line.tone] || TONE_COLORS.player;
      ctx.fillText(line.text, 40, y);
      y += 17;
    }
    ctx.restore();
  }

  drawItemsMenu(ctx) {
    if (!this.itemMenu) return;
    const ui = this.game.ui;
    ui.panel(660, 270, 596, 226, { title: 'Предметы в бою' });
    const owned = ['heal', 'honey', 'tonic', 'double', 'charm'].filter(
      (id) => (this.model.inventory[id] || 0) > 0,
    );
    if (!owned.length) {
      ui.text('Карманы пусты. Даже крошек нет.', 958, 360, { size: 16, color: UI.muted, align: 'center' });
    }
    owned.forEach((id, index) => {
      const item = ITEMS[id];
      const y = 312 + index * 54;
      const disabled = this.model.itemUsedThisTurn;
      ui.button({
        id: `item-${id}`,
        x: 682,
        y,
        w: 552,
        h: 46,
        label: `${item.name} ×${this.model.inventory[id]}`,
        sublabel: item.desc.slice(0, 80),
        align: 'left',
        fontSize: 15,
        icon: id === 'heal' || id === 'tonic' ? 'seed' : id === 'honey' ? 'heart' : id === 'charm' ? 'feather' : 'star',
        disabled,
        onClick: () => this.useItem(id),
      });
    });
    ui.button({
      id: 'item-close',
      x: 1110,
      y: 282,
      w: 126,
      h: 26,
      label: 'Закрыть',
      variant: 'ghost',
      fontSize: 11,
      onClick: () => {
        this.itemMenu = false;
      },
    });
    ui.text(
      this.model.itemUsedThisTurn ? 'Предмет уже использован в этот ход.' : 'Предметы не тратят ход. Один за ход.',
      682,
      484,
      { size: 11, color: UI.muted },
    );
  }

  drawActions(ctx) {
    const ui = this.game.ui;
    const model = this.model;
    const skill = getStats(this.game.state.player).skill;
    const items = ['heal', 'honey', 'tonic', 'double', 'charm'].reduce(
      (sum, id) => sum + (model.inventory[id] || 0),
      0,
    );
    const disabled = !this.canAct;

    if (model.canSpare()) {
      ui.button({
        id: 'spare',
        x: 660,
        y: 458,
        w: 596,
        h: 46,
        label: this.enemy.spareLabel,
        sublabel: 'мирный исход даст +1 семя и доброту',
        variant: 'success',
        icon: 'heart',
        fontSize: 16,
        onClick: () => this.spare(),
      });
    }

    const actionButtons = [
      {
        id: 'attack',
        x: 668,
        y: 524,
        label: 'Атака',
        sublabel: 'бросок d6 + бонус',
        hotkey: '1',
        icon: 'star',
        variant: 'primary',
        onClick: () => this.doAttack(),
      },
      {
        id: 'skill',
        x: 970,
        y: 524,
        label: skill.name,
        sublabel: `осталось: ${model.skillUsesLeft}`,
        hotkey: '2',
        icon: 'feather',
        disabled: disabled || model.skillUsesLeft <= 0,
        onClick: () => this.doSkill(),
      },
      {
        id: 'items',
        x: 668,
        y: 610,
        label: 'Предметы',
        sublabel: `${items} шт. в сумке`,
        hotkey: '3',
        icon: 'seed',
        disabled: disabled || items === 0,
        onClick: () => {
          this.itemMenu = !this.itemMenu;
        },
      },
      {
        id: 'ult',
        x: 970,
        y: 610,
        label: 'Эхо',
        sublabel: model.canUseUlt() ? 'отменить ход' : model.ultUsedHere ? 'уже применено' : 'не готово',
        hotkey: '4',
        icon: 'eye',
        disabled: !model.canUseUlt(),
        onClick: () => this.useUlt(),
      },
    ];
    actionButtons.forEach((button) => {
      ui.button({
        ...button,
        w: 294,
        h: 74,
        align: 'left',
        fontSize: 17,
      });
    });
    if (this.message && this.messageTimer > 0) {
      const alpha = clamp(this.messageTimer / 0.4, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `600 13px ${FONT_UI}`;
      ctx.fillStyle = this.message.toneColor;
      ctx.textAlign = 'center';
      ctx.fillText(this.message.text, 640, 154);
      ctx.restore();
    }
  }

  drawPastaModal(ctx) {
    if (!this.pastaOffer) return;
    const ui = this.game.ui;
    ctx.save();
    ctx.fillStyle = 'rgba(4, 6, 12, 0.7)';
    ctx.fillRect(0, 0, 1280, 720);
    ui.panel(300, 190, 680, 320, { title: 'Хозяин Макарон' });
    ui.text('— Стоп. Сначала поедим. Нельзя воевать голодным.', 640, 268, {
      size: 20,
      font: FONT_TITLE,
      color: UI.cream,
      align: 'center',
    });
    ui.text('Тарелка макарон: +5 HP, но два следующих хода будут пропущены.', 640, 312, {
      size: 14,
      color: UI.muted,
      align: 'center',
    });
    ui.button({
      id: 'pasta-accept',
      x: 340,
      y: 356,
      w: 280,
      h: 62,
      label: 'Съесть макароны',
      sublabel: '+5 HP · пропуск 2 ходов',
      variant: 'primary',
      onClick: () => this.acceptPasta(),
    });
    ui.button({
      id: 'pasta-decline',
      x: 660,
      y: 356,
      w: 280,
      h: 62,
      label: 'Отказаться',
      sublabel: 'бой продолжится',
      onClick: () => this.declinePasta(),
    });
    ui.text('Это предложение делается только раз за бой.', 640, 450, {
      size: 11,
      color: 'rgba(169,162,143,0.6)',
      align: 'center',
    });
    ctx.restore();
  }

  drawResultModal(ctx) {
    if (this.victory) {
      const ui = this.game.ui;
      const spare = this.victory.outcome === 'spare';
      ctx.save();
      ctx.fillStyle = 'rgba(4, 6, 12, 0.66)';
      ctx.fillRect(0, 0, 1280, 720);
      ui.panel(300, 186, 680, 336, { title: spare ? 'Перемирие' : 'Победа' });
      ui.title(spare ? 'Мир' : 'Бой окончен', 640, 276, {
        size: 46,
        color: spare ? '#b7e6b9' : '#f0c75e',
      });
      const lines = spare
        ? [
            `${this.enemy.name} соглашается прекратить бой.`,
            'Это было не поражение врага, а решение конфликта.',
            `Награда: +${this.enemy.seedsSpare} Семян Силы, доброта +1.`,
          ]
        : [
            `${this.enemy.name} больше не может сражаться.`,
            `Награда: +${this.enemy.seedsKill} Семени Силы.`,
            'Иногда сила — это единственный язык, который слышат.',
          ];
      lines.forEach((line, index) => {
        ui.text(line, 640, 320 + index * 26, {
          size: 14,
          color: index === 2 ? (spare ? '#b7e6b9' : '#f0c75e') : UI.cream,
          align: 'center',
        });
      });
      ui.button({
        id: 'victory-continue',
        x: 470,
        y: 430,
        w: 340,
        h: 54,
        label: 'Продолжить',
        variant: 'primary',
        hotkey: 'Enter',
        onClick: () => this.game.finishCombat(),
      });
      ctx.restore();
      return;
    }

    if (this.defeatShown) {
      const ui = this.game.ui;
      ctx.save();
      ctx.fillStyle = 'rgba(4, 6, 12, 0.72)';
      ctx.fillRect(0, 0, 1280, 720);
      ui.panel(290, 170, 700, 380, { title: 'Поражение' });
      ui.title('Чики выдохся', 640, 262, { size: 44, color: '#e2a19a' });
      ui.text(
        this.model.canUseUlt()
          ? 'Последний удар оказался слишком сильным. Но Эхо ещё звучит.'
          : 'Чики приходит в себя на полу. Кто-то аккуратно подложил ему под крыло полотенце.',
        640,
        302,
        { size: 15, color: UI.muted, align: 'center', maxWidth: 600 },
      );
      if (this.model.canUseUlt()) {
        ui.button({
          id: 'death-ult',
          x: 360,
          y: 340,
          w: 560,
          h: 58,
          label: 'Эхо Первой Семечки',
          sublabel: 'отменить смертельный ход',
          variant: 'primary',
          icon: 'eye',
          onClick: () => this.useUlt(),
        });
        ui.button({
          id: 'death-retry',
          x: 360,
          y: 410,
          w: 270,
          h: 50,
          label: 'Попробовать снова',
          sublabel: 'полное здоровье',
          onClick: () => this.retry(),
        });
        ui.button({
          id: 'death-menu',
          x: 650,
          y: 410,
          w: 270,
          h: 50,
          label: 'В главное меню',
          variant: 'ghost',
          onClick: () => this.game.returnToMenu(),
        });
      } else {
        ui.button({
          id: 'death-retry',
          x: 360,
          y: 356,
          w: 560,
          h: 58,
          label: 'Попробовать снова',
          sublabel: 'Чики отдохнёт и восстановит здоровье',
          variant: 'primary',
          onClick: () => this.retry(),
        });
        ui.button({
          id: 'death-menu',
          x: 450,
          y: 430,
          w: 380,
          h: 46,
          label: 'В главное меню',
          variant: 'ghost',
          onClick: () => this.game.returnToMenu(),
        });
      }
      ctx.restore();
    }
  }

  drawIntro(ctx) {
    if (this.phase !== 'intro') return;
    const t = clamp(this.introTime / 0.45, 0, 1);
    ctx.save();
    ctx.globalAlpha = clamp(t * 2, 0, 1);
    const width = 620 * clamp(t * 1.2, 0, 1);
    ctx.fillStyle = 'rgba(6, 8, 14, 0.82)';
    ctx.fillRect(640 - width / 2, 200, width, 150);
    ctx.strokeStyle = 'rgba(240, 199, 94, 0.5)';
    ctx.strokeRect(640 - width / 2, 200, width, 150);
    ctx.textAlign = 'center';
    let titleSize = 42;
    ctx.font = `700 ${titleSize}px ${FONT_TITLE}`;
    while (titleSize > 24 && ctx.measureText(this.enemy.name).width > 520) {
      titleSize -= 1;
      ctx.font = `700 ${titleSize}px ${FONT_TITLE}`;
    }
    ctx.fillStyle = UI.cream;
    ctx.fillText(this.enemy.name, 640, 270);
    ctx.font = `italic 17px ${FONT_TITLE}`;
    ctx.fillStyle = '#d9b25c';
    ctx.fillText(ellipsize(ctx, this.enemy.title, 580), 640, 304);
    ctx.font = `400 12px ${FONT_UI}`;
    ctx.fillStyle = UI.muted;
    ctx.fillText('Бой начнётся через мгновение', 640, 330);
    ctx.restore();
  }

  update(dt) {
    this.time += dt;
    if (this.phase === 'intro') this.introTime += dt;
    this.updateTimers(dt);
    this.shake.update(dt);
    this.floats.update(dt);
    this.particles.update(dt);
    this.playerHurt = Math.max(0, this.playerHurt - dt * 3.2);
    this.enemyHurt = Math.max(0, this.enemyHurt - dt * 3.2);
    this.playerLunge = Math.max(0, this.playerLunge - dt * 4);
    this.enemyLunge = Math.max(0, this.enemyLunge - dt * 3.6);
    this.ultFlash = Math.max(0, this.ultFlash - dt * 1.6);
    this.messageTimer = Math.max(0, this.messageTimer - dt);
    this.hideTimer = Math.max(0, this.hideTimer - dt);
    if (this.victory) {
      this.enemyFade = Math.max(0.25, this.enemyFade - dt * 0.7);
    }
    if (this.dice.rolling) {
      this.dice.t -= dt;
      if (Math.floor(this.time * 18) % 2 === 0) {
        this.dice.value = 1 + Math.floor(Math.random() * 6);
      }
      if (this.dice.t <= 0) {
        this.dice.rolling = false;
        this.dice.value = this.dice.final;
      }
    }
    this.displayPlayerHp = lerp(this.displayPlayerHp, this.model.playerHp, clamp(dt * 7, 0, 1));
    this.displayEnemyHp = lerp(this.displayEnemyHp, this.model.enemyHp, clamp(dt * 7, 0, 1));

    const input = this.game.input;
    if (this.itemMenu && input.consumePressed('Escape')) {
      this.itemMenu = false;
      return;
    }
    if (this.pastaOffer) {
      if (input.consumePressed('Digit1')) this.acceptPasta();
      else if (input.consumePressed('Digit2')) this.declinePasta();
      return;
    }
    if (this.victory) {
      if (input.consumePressed('Enter', 'NumpadEnter', 'Space')) this.game.finishCombat();
      return;
    }
    if (this.defeatShown) {
      if (this.model.canUseUlt() && input.consumePressed('Digit1', 'KeyE')) this.useUlt();
      else if (input.consumePressed('KeyR', 'Enter', 'NumpadEnter')) this.retry();
      return;
    }
    if (this.phase === 'player') {
      if (input.consumePressed('Digit1')) this.doAttack();
      else if (input.consumePressed('Digit2')) this.doSkill();
      else if (input.consumePressed('Digit3')) {
        const items = ['heal', 'honey', 'tonic', 'double', 'charm'].reduce(
          (sum, id) => sum + (this.model.inventory[id] || 0),
          0,
        );
        if (items > 0) this.itemMenu = !this.itemMenu;
      } else if (input.consumePressed('Digit4')) this.useUlt();
    }
  }

  draw(ctx) {
    this.game.ui.begin(ctx);
    ctx.save();
    ctx.translate(this.shake.x, this.shake.y);
    this.drawArena(ctx);
    ctx.save();
    // сцена боя
    this.drawEnemy(ctx);
    this.drawPlayer(ctx);
    this.particles.draw(ctx);
    this.floats.draw(ctx);
    ctx.restore();

    this.drawTopPanels(ctx);
    this.drawLog(ctx);
    this.drawActions(ctx);

    if (this.itemMenu) this.drawItemsMenu(ctx);
    this.drawPastaModal(ctx);
    this.drawResultModal(ctx);
    this.drawIntro(ctx);

    drawVignette(ctx, 1280, 720, 0.55);
    drawScanlines(ctx, 1280, 720, 0.025);
    ctx.restore();
    this.game.ui.end();
  }
}
