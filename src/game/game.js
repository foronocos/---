import { AudioEngine } from '../core/audio.js';
import { Input } from '../core/input.js';
import { UI } from '../ui/widgets.js';
import { clamp } from '../core/util.js';
import {
  addAlly,
  addGreed,
  addItem,
  addKindness,
  addSeeds,
  buyUlt,
  buyUpgrade,
  createGame,
  damagePlayer,
  getFlag,
  getStats,
  healPlayer,
  markUsed,
  markVisited,
  meetEnemy,
  meetNpc,
  readNote,
  reconcileState,
  setBossOutcome,
  setFlag,
  takeItem,
} from './state.js';
import { createCombatModel } from './combat.js';
import { computeEnding } from './endings.js';
import { getRoom } from '../data/chapters.js';
import { getDialogue } from '../data/dialogues.js';
import { getEnemy } from '../data/enemies.js';
import { getItem, ITEMS } from '../data/items.js';
import { getShop, describeStockEntry } from '../data/shops.js';
import {
  deleteSave,
  getSaveMeta,
  loadEndingsSeen,
  loadGame,
  loadSettings,
  markEndingSeen,
  saveGame,
  saveSettings,
} from '../core/save.js';
import { MenuScene } from '../scenes/menu.js';
import { ExploreScene } from '../scenes/explore.js';
import { DialogueScene } from '../scenes/dialogueScene.js';
import { CombatScene } from '../scenes/combatScene.js';
import { ShopScene } from '../scenes/shopScene.js';
import { ChapterCard } from '../scenes/chapterCard.js';
import { EndingScene } from '../scenes/endingScene.js';
import { openPanel as openPanelScene } from '../ui/panels.js';
import { isFullscreen, toggleFullscreen } from '../core/fullscreen.js';

const AFTER_COMBAT = {
  cat: { spare: 'cat_spare_after', kill: 'cat_kill_after' },
  vacuum: { spare: 'vacuum_spare_after', kill: 'vacuum_kill_after' },
  pasta: { spare: 'pasta_spare_after', kill: 'pasta_kill_after' },
};

const COMBAT_BOSS_BY_ID = { cat: 'cat', vacuum: 'vacuum', pasta: 'pasta' };

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input(canvas);
    this.audio = new AudioEngine();
    this.ui = new UI(this);
    this.scene = null;
    this.overlays = [];
    this.state = null;
    this.combatScene = null;
    this.time = 0;
    this.toasts = [];
    this.fade = { active: false, phase: 'in', t: 0, callback: null };
    this.settings = loadSettings();
    this.audio.enabled = this.settings.sound !== false;
    this.endingsSeen = loadEndingsSeen();
    this.touchMode =
      (typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(pointer: coarse)').matches) ||
      'ontouchstart' in window;
    this.lastFrame = 0;
    this.running = false;
    this.endingId = null;
    this.setupCanvas();
  }

  setupCanvas() {
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = this.canvas.getBoundingClientRect();
      const width = Math.max(320, Math.round(rect.width));
      const height = Math.max(180, Math.round(rect.height));
      const targetW = Math.round(width * dpr);
      const targetH = Math.round(height * dpr);
      if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
        this.canvas.width = targetW;
        this.canvas.height = targetH;
      }
      this.dpr = dpr;
      this.scaleX = targetW / 1280;
      this.scaleY = targetH / 720;
    };
    resize();
    window.addEventListener('resize', resize);
    this.applyContextTransform = () => {
      const dpr = this.dpr || 1;
      const rect = this.canvas.getBoundingClientRect();
      const sx = (rect.width * dpr) / 1280;
      const sy = (rect.height * dpr) / 720;
      this.ctx.setTransform(sx, 0, 0, sy, 0, 0);
    };
    this.resize = resize;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.audio.setEnabled(this.settings.sound !== false);
    this.setScene(new MenuScene(this));
    const loop = (timestamp) => {
      if (!this.lastFrame) this.lastFrame = timestamp;
      const dt = Math.min(0.05, (timestamp - this.lastFrame) / 1000);
      this.lastFrame = timestamp;
      this.time += dt;
      this.update(dt);
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  setScene(scene) {
    this.scene = scene;
    if (scene && typeof scene.enter === 'function') scene.enter();
  }

  pushOverlay(overlay) {
    this.overlays.push(overlay);
    if (typeof overlay.enter === 'function') overlay.enter();
  }

  popOverlay() {
    const overlay = this.overlays.pop();
    if (overlay && typeof overlay.exit === 'function') overlay.exit();
    return overlay;
  }

  closeAllOverlays() {
    while (this.overlays.length) this.popOverlay();
  }

  topOverlay() {
    return this.overlays[this.overlays.length - 1] || null;
  }

  toast(text, tone = 'normal', duration = 3.2) {
    this.toasts.push({ text, tone, life: duration, maxLife: duration });
    if (this.toasts.length > 4) this.toasts.shift();
  }

  transitionTo(callback) {
    if (this.fade.active) return;
    this.fade = { active: true, phase: 'out', t: 0, callback };
  }

  updateFade(dt) {
    if (!this.fade.active) return;
    const speed = 1 / 0.26;
    if (this.fade.phase === 'out') {
      this.fade.t += dt * speed;
      if (this.fade.t >= 1) {
        this.fade.t = 1;
        this.fade.phase = 'in';
        const cb = this.fade.callback;
        this.fade.callback = null;
        if (cb) cb();
      }
    } else {
      this.fade.t -= dt * speed;
      if (this.fade.t <= 0) {
        this.fade.t = 0;
        this.fade.active = false;
      }
    }
  }

  fadeAlpha() {
    if (!this.fade.active) return 0;
    return this.fade.phase === 'out' ? this.fade.t : this.fade.t;
  }

  update(dt) {
    if (this.state) this.state.playTime += dt;
    if (this.scene && typeof this.scene.update === 'function') this.scene.update(dt);
    const top = this.topOverlay();
    if (top && typeof top.update === 'function') top.update(dt);
    for (const toast of this.toasts) toast.life -= dt;
    this.toasts = this.toasts.filter((toast) => toast.life > 0);
    this.updateFade(dt);
  }

  draw() {
    const ctx = this.ctx;
    this.applyContextTransform();
    ctx.clearRect(0, 0, 1280, 720);
    ctx.save();
    const top = this.topOverlay();
    this.ui.inputDisabled = this.overlays.length > 0;
    if (this.scene && typeof this.scene.draw === 'function') this.scene.draw(ctx);
    for (const overlay of this.overlays) {
      ctx.save();
      this.ui.inputDisabled = overlay !== top;
      if (typeof overlay.draw === 'function') overlay.draw(ctx);
      ctx.restore();
    }
    this.ui.inputDisabled = false;
    this.drawToasts(ctx);
    ctx.restore();
    if (this.fade.active) {
      ctx.save();
      ctx.globalAlpha = this.fadeAlpha();
      ctx.fillStyle = '#07090f';
      ctx.fillRect(0, 0, 1280, 720);
      ctx.restore();
    }
    // Клик и нажатия живут до конца кадра: их читают и сцена, и кнопки при отрисовке.
    this.input.endFrame();
  }

  drawToasts(ctx) {
    if (!this.toasts.length) return;
    const colors = {
      normal: '#f4e9ce',
      good: '#b7e6b9',
      bad: '#f0a49e',
      gold: '#f0c75e',
    };
    this.toasts.forEach((toast, index) => {
      const alpha = clamp(toast.life / 0.4, 0, 1) * clamp((toast.maxLife - toast.life) / 0.2, 0, 1);
      const slide = (1 - clamp((toast.maxLife - toast.life) / 0.2, 0, 1)) * 12;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = '500 15px "Trebuchet MS", sans-serif';
      const width = Math.min(720, ctx.measureText(toast.text).width + 54);
      const x = 640 - width / 2;
      const y = 106 + index * 40 - slide;
      ctx.fillStyle = 'rgba(12, 15, 23, 0.9)';
      ctx.beginPath();
      ctx.roundRect(x, y, width, 32, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(240, 199, 94, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = colors[toast.tone] || colors.normal;
      ctx.textAlign = 'center';
      ctx.fillText(toast.text, 640, y + 21);
      ctx.restore();
    });
  }

  // ---------------------------------------------------------------- состояние

  save() {
    if (!this.state) return;
    this.state.lastSavedAt = Date.now();
    saveGame(this.state);
  }

  saveMeta() {
    return getSaveMeta();
  }

  hasSave() {
    return Boolean(getSaveMeta());
  }

  newGame(classId) {
    this.state = createGame(classId);
    this.state.roomTitle = 'Гостиная';
    this.save();
    this.audio.setAmbience(1);
    this.transitionTo(() => {
      this.setScene(new ExploreScene(this, 'living', this.state.player ? getRoom('living').spawn : 420));
      this.openChapterCard(1, 'Коридор', true);
    });
  }

  continueGame() {
    const loaded = loadGame();
    if (!loaded) {
      this.toast('Сохранение не найдено или повреждено.', 'bad');
      return;
    }
    this.state = reconcileState(loaded);
    this.audio.setAmbience(this.state.chapter);
    this.transitionTo(() => {
      const roomId = this.state.roomId || 'living';
      const spawnX = this.state.spawnX ?? getRoom(roomId).spawn;
      this.setScene(new ExploreScene(this, roomId, spawnX));
    });
  }

  returnToMenu() {
    this.save();
    this.closeAllOverlays();
    this.combatScene = null;
    this.audio.stopAmbience();
    this.setScene(new MenuScene(this));
  }

  async toggleFullscreen() {
    const active = await toggleFullscreen(this.canvas.parentElement || this.canvas);
    if (active) this.toast('Полный экран. Поверни телефон горизонтально.', 'gold');
    else this.toast('Обычный режим окна.', 'normal', 2);
    // после смены режима размеры холста пересчитываются
    this.resize();
  }

  get fullscreen() {
    return isFullscreen();
  }

  toggleSound() {
    this.settings.sound = !this.settings.sound;
    this.audio.setEnabled(this.settings.sound);
    saveSettings(this.settings);
    this.toast(this.settings.sound ? 'Звук включён' : 'Звук выключен', 'gold');
  }

  // ------------------------------------------------------------------ комнаты

  enterRoom(roomId, spawnX = null) {
    const room = getRoom(roomId);
    if (!this.state) return;
    const previousChapter = this.state.chapter;
    this.state.roomId = roomId;
    this.state.roomTitle = room.title;
    this.state.spawnX = spawnX ?? room.spawn;
    markVisited(this.state, roomId);
    const chapterAdvanced = room.chapter > previousChapter;
    if (chapterAdvanced) {
      this.state.chapter = room.chapter;
      const healed = healPlayer(this.state, 3);
      this.audio.setAmbience(room.chapter);
      if (healed > 0) this.toast(`Новая глава. Отдых: +${healed} HP`, 'good');
    }
    this.save();

    if (this.scene instanceof ExploreScene) {
      this.scene.changeRoom(room, spawnX ?? room.spawn);
    } else {
      this.setScene(new ExploreScene(this, roomId, spawnX ?? room.spawn));
    }

    if (chapterAdvanced) {
      this.openChapterCard(room.chapter, room.title);
    }
  }

  openChapterCard(chapter, title, isNewGame = false) {
    this.pushOverlay(
      new ChapterCard(this, chapter, title, {
        isNewGame,
        onDone: () => {
          if (this.scene instanceof ExploreScene) this.scene.entryHandled = false;
        },
      }),
    );
  }

  handleRoomEntry() {
    if (!this.state || this.overlays.length) return;
    const room = getRoom(this.state.roomId);
    if (typeof room.onEnter === 'function') {
      const dialogueId = room.onEnter(this.state);
      if (dialogueId) this.startDialogue(dialogueId);
    }
  }

  // ------------------------------------------------------------------ диалоги

  startDialogue(dialogueId, options = {}) {
    const dialogue = getDialogue(dialogueId);
    if (!dialogue) {
      console.warn('Неизвестный диалог:', dialogueId);
      return;
    }
    const top = this.topOverlay();
    if (top instanceof DialogueScene) this.popOverlay();
    this.pushOverlay(new DialogueScene(this, dialogue, { id: dialogueId, ...options }));
  }

  /**
   * Применяет эффекты диалога. Возвращает {stop:true}, если эффект сменил сцену
   * или открыл бой/магазин — проигрыватель диалога должен остановиться.
   */
  applyEffects(effects) {
    if (!effects || !this.state) return { stop: false };
    const player = this.state.player;
    let stop = false;
    let changed = false;

    if (effects.once) {
      const flag = `once:${effects.once}`;
      if (player.flags[flag]) return { stop: false, skipped: true };
      player.flags[flag] = true;
    }

    if (typeof effects.kindness === 'number') {
      addKindness(this.state, effects.kindness);
      this.toast(`Доброта +${effects.kindness}`, 'good');
      changed = true;
    }
    if (typeof effects.greed === 'number') {
      addGreed(this.state, effects.greed);
      this.toast(`Жадность +${effects.greed}`, 'bad');
      changed = true;
    }
    if (typeof effects.seeds === 'number') {
      addSeeds(this.state, effects.seeds);
      this.audio.coin();
      changed = true;
    }
    if (typeof effects.heal === 'number' && effects.heal > 0) {
      const healed = healPlayer(this.state, effects.heal);
      if (healed > 0) {
        this.audio.heal();
        this.toast(`+${healed} HP`, 'good');
      }
      changed = true;
    }
    if (typeof effects.damage === 'number' && effects.damage > 0) {
      damagePlayer(this.state, effects.damage);
      this.audio.hurt();
      this.toast(`−${effects.damage} HP`, 'bad');
      changed = true;
    }
    if (effects.item) {
      addItem(this.state, effects.item, effects.count || 1);
      this.toast(`Получено: ${getItem(effects.item)?.name || effects.item}`, 'gold');
      this.audio.coin();
      changed = true;
    }
    if (effects.keyItem) {
      player.keyItems[effects.keyItem] = true;
      const names = { key: 'Запасной ключ от балкона', feather: 'Золотое Перо' };
      this.toast(`Получено: ${names[effects.keyItem] || effects.keyItem}`, 'gold');
      this.audio.coin();
      changed = true;
    }
    if (effects.keyItem2) {
      player.keyItems[effects.keyItem2] = true;
      const names = { key: 'Запасной ключ от балкона', feather: 'Золотое Перо' };
      this.toast(`Получено: ${names[effects.keyItem2] || effects.keyItem2}`, 'gold');
      this.audio.coin();
      changed = true;
    }
    if (effects.note) {
      readNote(this.state, effects.note);
      changed = true;
    }
    if (Array.isArray(effects.notes)) {
      effects.notes.forEach((noteId) => readNote(this.state, noteId));
      changed = true;
    }
    if (effects.flag) {
      setFlag(this.state, effects.flag, effects.flagValue !== undefined ? effects.flagValue : true);
      changed = true;
    }
    if (effects.ally) {
      addAlly(this.state, effects.ally);
      changed = true;
    }
    if (effects.bestiary) {
      meetEnemy(this.state, effects.bestiary);
      changed = true;
    }
    if (effects.bestiaryNpc) {
      meetNpc(this.state, effects.bestiaryNpc);
      changed = true;
    }
    if (effects.markUsed) {
      markUsed(this.state, effects.markUsed);
      changed = true;
    }
    if (effects.maxHp) {
      player.maxHp += effects.maxHp;
      player.hp = Math.min(player.maxHp, player.hp + effects.maxHp);
      changed = true;
    }
    if (effects.peaceful) {
      this.resolvePeaceful(effects.peaceful);
      changed = true;
    }
    if (effects.toast) {
      this.toast(effects.toast, effects.toastTone || 'gold');
    }
    if (changed) this.save();

    if (effects.startCombat) {
      this.startCombat(effects.startCombat);
      stop = true;
    } else if (effects.openShop) {
      this.openShop(effects.openShop);
      stop = true;
    } else if (effects.ending) {
      this.showEnding(effects.ending);
      stop = true;
    }
    return { stop };
  }

  // ---------------------------------------------------------------------- бой

  startCombat(enemyId) {
    if (!this.state) return;
    const enemy = getEnemy(enemyId);
    if (!enemy) return;
    this.closeAllOverlays();
    this.save();
    const model = createCombatModel(this.state, enemyId);
    this.combatScene = new CombatScene(this, model);
    this.pushOverlay(this.combatScene);
    this.audio.boss();
    meetEnemy(this.state, enemyId);
  }

  retryCombat(enemyId) {
    if (!this.state) return;
    const stats = getStats(this.state.player);
    this.state.player.hp = stats.maxHp;
    this.save();
    this.closeAllOverlays();
    this.combatScene = null;
    this.startCombat(enemyId);
    this.toast('Чики перевёл дыхание. Здоровье восстановлено.', 'good');
  }

  finishCombat() {
    const scene = this.combatScene;
    if (!scene || !this.state) return;
    const model = scene.model;
    const outcome = model.outcome;
    if (outcome !== 'kill' && outcome !== 'spare') return;
    const player = this.state.player;
    const enemy = getEnemy(model.enemyId);

    player.hp = clamp(Math.max(1, model.playerHp), 1, getStats(player).maxHp);
    player.items = { ...player.items, ...model.inventory };
    player.seeds = Math.max(0, model.seeds);
    if (model.ultUsedHere) player.ultUsed = true;
    player.stats.battles += 1;
    player.stats.damageDealt += model.damageDealt;
    player.stats.itemsUsed += model.itemsUsed;

    setBossOutcome(this.state, model.enemyId, outcome);
    if (outcome === 'kill') {
      player.stats.kills += 1;
      addSeeds(this.state, enemy.seedsKill);
      this.toast(`Победа. +${enemy.seedsKill} Семени Силы`, 'gold');
    } else {
      player.stats.spares += 1;
      addSeeds(this.state, enemy.seedsSpare);
      addKindness(this.state, 1);
      addAlly(this.state, model.enemyId);
      this.toast(`Мирное решение: +${enemy.seedsSpare} Семян, доброта +1`, 'good');
    }
    meetEnemy(this.state, model.enemyId);
    this.save();

    const dialogueId = AFTER_COMBAT[model.enemyId]?.[outcome];
    this.combatScene = null;
    this.closeAllOverlays();
    if (dialogueId) this.startDialogue(dialogueId);
  }

  resolvePeaceful(enemyId) {
    if (!this.state) return;
    const player = this.state.player;
    setBossOutcome(this.state, enemyId, 'spare');
    player.stats.spares += 1;
    addSeeds(this.state, 4);
    addKindness(this.state, 1);
    addAlly(this.state, enemyId);
    meetEnemy(this.state, enemyId);
    setFlag(this.state, `peaceful_${enemyId}`);
    this.toast('Конфликт решён без драки: +4 Семени, доброта +1', 'good');
    this.save();
  }

  // -------------------------------------------------------------------- магазин

  openShop(shopId) {
    const shop = getShop(shopId);
    if (!shop) return;
    this.closeAllOverlays();
    this.pushOverlay(new ShopScene(this, shop));
  }

  purchase(shopId, entry) {
    if (!this.state) return { ok: false, message: 'Нет активной игры.' };
    const player = this.state.player;
    if (player.seeds < entry.price) return { ok: false, message: 'Не хватает Семян Силы.' };
    const key = entry.key;

    if (key.startsWith('item:')) {
      const itemId = key.slice(5);
      if (itemId === 'eye' && player.hasEye) return { ok: false, message: 'Глаз Голубя уже есть.' };
      player.seeds -= entry.price;
      if (itemId === 'eye') player.hasEye = true;
      else addItem(this.state, itemId, 1);
      this.audio.coin();
      this.save();
      const name = ITEMS[itemId]?.name || itemId;
      return { ok: true, message: `Куплено: ${name}.` };
    }

    if (key.startsWith('upgrade:')) {
      const upgradeId = key.slice(8);
      const result = buyUpgrade(this.state, upgradeId);
      if (result.ok) {
        this.audio.coin();
        this.save();
      }
      return result;
    }

    if (key === 'ult') {
      const result = buyUlt(this.state);
      if (result.ok) {
        this.audio.coin();
        this.save();
      }
      return result;
    }

    if (key === 'ally:pigeon') {
      if (player.allies.pigeon) return { ok: false, message: 'Гоша уже союзник.' };
      player.seeds -= entry.price;
      addAlly(this.state, 'pigeon');
      meetNpc(this.state, 'pigeon');
      this.audio.coin();
      this.save();
      return { ok: true, message: 'Голубиный контракт подписан. Гоша будет бить первым.' };
    }

    if (key === 'hint:finale') {
      if (getFlag(this.state, 'boughtHint')) return { ok: false, message: 'Подсказка уже куплена.' };
      player.seeds -= entry.price;
      setFlag(this.state, 'boughtHint', true);
      this.audio.coin();
      this.save();
      return {
        ok: true,
        message: '«В финале важно не то, что ты возьмёшь, а с кем ты туда придёшь».',
      };
    }

    if (key === 'healService') {
      if (player.hp >= getStats(player).maxHp) return { ok: false, message: 'Ты и так в порядке.' };
      player.seeds -= entry.price;
      player.hp = getStats(player).maxHp;
      this.audio.heal();
      this.save();
      return { ok: true, message: 'Тёплый пар: здоровье полностью восстановлено.' };
    }

    return { ok: false, message: 'Неизвестный товар.' };
  }

  describeEntry(entry) {
    return describeStockEntry(this.state, entry);
  }

  // -------------------------------------------------------------------- финал

  showEnding(finalChoice) {
    if (!this.state) return;
    const endingId = computeEnding(this.state, finalChoice);
    this.endingId = endingId;
    this.state.ending = endingId;
    this.state.finalChoice = finalChoice;
    this.endingsSeen = markEndingSeen(endingId);
    deleteSave();
    this.closeAllOverlays();
    this.audio.stopAmbience();
    this.audio.ending();
    this.transitionTo(() => {
      this.setScene(new EndingScene(this, endingId));
    });
  }

  openPanel(type) {
    if (!this.state) return;
    openPanelScene(this, type);
  }

  takeLoot(prop) {
    if (!this.state || !prop) return;
    if (prop.takenId && this.state.taken.includes(prop.takenId)) {
      this.toast('Здесь уже пусто.', 'normal', 1.6);
      return;
    }
    if (prop.takenId) takeItem(this.state, prop.takenId);
    if (prop.seeds) addSeeds(this.state, prop.seeds);
    if (prop.item) addItem(this.state, prop.item, prop.itemCount || 1);
    this.audio.coin();
    this.toast(prop.lootToast || 'Находка.', 'gold');
    this.save();
    if (this.scene && typeof this.scene.onLoot === 'function') {
      this.scene.onLoot(prop);
    }
  }

  bossOutcome(enemyId) {
    return this.state?.player?.bosses?.[enemyId] || null;
  }

  isEnemyKnown(enemyId) {
    return Boolean(this.state?.player?.bestiarySeen?.includes(enemyId));
  }

  get combatBossId() {
    return this.combatScene?.model?.enemyId || COMBAT_BOSS_BY_ID.cat;
  }
}
