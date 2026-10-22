/**
 * Headless-прогон всей игры в node: canvas и Web Audio подменяются заглушками.
 * Проверяет, что каждая сцена рисуется, ввод работает и сюжет проходим до конца.
 */
import assert from 'node:assert/strict';

// ------------------------------------------------------------------ окружение
const noop = () => {};
const gradient = { addColorStop: noop };
const ctxTarget = {
  measureText: (text) => ({ width: String(text ?? '').length * 8.2 }),
  createLinearGradient: () => gradient,
  createRadialGradient: () => gradient,
  createPattern: () => null,
  getImageData: () => ({ data: new Uint8ClampedArray(4) }),
  isPointInPath: () => false,
};
let canvas;
const context = new Proxy(ctxTarget, {
  get(target, prop) {
    if (prop in target) return target[prop];
    if (prop === 'canvas') return canvas;
    return noop;
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  },
});

const listeners = new Map();
function addListener(type, handler) {
  if (!listeners.has(type)) listeners.set(type, []);
  listeners.get(type).push(handler);
}

canvas = {
  width: 1280,
  height: 720,
  style: {},
  getContext: () => context,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720, right: 1280, bottom: 720 }),
  addEventListener: (type, handler) => addListener(type, handler),
  removeEventListener: noop,
  setPointerCapture: noop,
  releasePointerCapture: noop,
  focus: noop,
};

const storage = new Map();
globalThis.window = {
  devicePixelRatio: 1,
  addEventListener: (type, handler) => addListener(type, handler),
  removeEventListener: noop,
  matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }),
  localStorage: {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  },
  AudioContext: undefined,
};
globalThis.document = {
  getElementById: () => canvas,
  addEventListener: noop,
};
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = noop;
globalThis.performance = globalThis.performance || { now: () => Date.now() };

// ------------------------------------------------------------------ утилиты
let frames = 0;
function tick(game, { held = [], pressed = [], click = null, dt = 1 / 60 } = {}) {
  game.input.keys = new Set(held);
  for (const code of pressed) game.input.justPressed.add(code);
  game.update(dt);
  if (click) {
    game.input.pointer.x = click[0];
    game.input.pointer.y = click[1];
    game.input.pointer.inside = true;
    game.input.pointer.down = true;
    game.input.click = { x: click[0], y: click[1] };
  }
  game.draw();
  game.input.pointer.down = false;
  frames += 1;
}

function seconds(game, value, options = {}) {
  const steps = Math.ceil(value * 60);
  for (let i = 0; i < steps; i += 1) tick(game, options);
}

function press(game, code) {
  tick(game, { pressed: [code] });
}

function click(game, x, y) {
  tick(game, { click: [x, y] });
}

const { Game } = await import('../src/game/game.js');
const { MenuScene } = await import('../src/scenes/menu.js');
const { ClassSelectScene } = await import('../src/scenes/classSelect.js');
const { ExploreScene } = await import('../src/scenes/explore.js');
const { DialogueScene } = await import('../src/scenes/dialogueScene.js');
const { EndingScene } = await import('../src/scenes/endingScene.js');
const { BasePanel } = await import('../src/ui/panels.js');
const { ENDINGS } = await import('../src/render/palette.js');
const { ROOMS } = await import('../src/data/chapters.js');
const { NOTES } = await import('../src/data/notes.js');

function makeGame() {
  const game = new Game(canvas);
  game.audio.enabled = false;
  game.settings.sound = false;
  game.setScene(new MenuScene(game));
  tick(game);
  return game;
}

function finishDialogue(game, limit = 600) {
  let guard = 0;
  while (game.topOverlay() instanceof DialogueScene && guard < limit) {
    const scene = game.topOverlay();
    if (scene.isTyping) press(game, 'Space');
    else if (scene.visibleChoices.length) press(game, 'Digit1');
    else press(game, 'Space');
    guard += 1;
  }
  assert.ok(guard < limit, 'диалог не зациклился');
}

function fight(game, enemyId, limit = 9000) {
  let guard = 0;
  let retries = 0;
  while (!game.state.player.bosses[enemyId] && guard < limit) {
    guard += 1;
    const combat = game.combatScene;
    if (!combat) {
      if (game.topOverlay() instanceof DialogueScene) {
        finishDialogue(game);
        continue;
      }
      tick(game);
      continue;
    }
    if (combat.victory) press(game, 'Enter');
    else if (combat.defeatShown) {
      if (combat.model.canUseUlt()) {
        press(game, 'Digit1');
      } else {
        retries += 1;
        assert.ok(retries < 12, `бой с ${enemyId}: слишком много поражений`);
        press(game, 'KeyR');
      }
    } else if (combat.pastaOffer) press(game, 'Digit2');
    else if (combat.itemMenu) press(game, 'Escape');
    else if (combat.phase === 'player') {
      const model = combat.model;
      if (model.playerHp <= 6 && !model.itemUsedThisTurn) {
        if (model.inventory.heal > 0) combat.useItem('heal');
        else if (model.inventory.honey > 0) combat.useItem('honey');
        else if (model.skillUsesLeft > 0) combat.doSkill();
        else press(game, 'Digit1');
      } else if (model.skillUsesLeft > 0) combat.doSkill();
      else press(game, 'Digit1');
      tick(game);
    } else tick(game);
  }
  assert.ok(game.state.player.bosses[enemyId], `бой с ${enemyId} завершён победой`);
  finishDialogue(game);
}

function prepare(game) {
  const player = game.state.player;
  player.upgrades = { vitality: true, special: true };
  player.ultOwned = true;
  player.ultUsed = false;
  player.items = { heal: 3, honey: 2, double: 1 };
  player.seeds = Math.max(player.seeds, 2);
  player.hp = 12;
}

const game = makeGame();
assert.ok(game.scene instanceof MenuScene, 'меню загружается');

// ------------------------------------------------------------------ меню → класс → глава → вступление
seconds(game, 0.4);
press(game, 'Digit2');
assert.ok(game.scene instanceof ClassSelectScene, 'кнопка «Новая игра» открывает выбор класса');
press(game, 'Digit2');
press(game, 'Enter');
seconds(game, 1.0);
assert.ok(game.state && game.state.player.classId === 'mage', 'класс выбран и игра создана');
assert.ok(game.scene instanceof ExploreScene, 'после выбора класса открывается комната');
seconds(game, 0.4);
assert.ok(game.topOverlay()?.constructor.name === 'ChapterCard', 'показана карточка главы');
press(game, 'Enter');
seconds(game, 0.4);
assert.ok(game.topOverlay() instanceof DialogueScene, 'после карточки запускается вступление');
finishDialogue(game);
seconds(game, 0.2);
assert.ok(game.state.player.flags.introSeen, 'вступление завершено');
assert.ok(game.state.player.seeds >= 1, 'за вступление дают семя');
console.log('✓ меню → класс → глава → вступление');

// ------------------------------------------------------------------ исследование и находки
{
  const scene = game.scene;
  const startSeeds = game.state.player.seeds;
  const rug = scene.buildInteractables().find((item) => item.prop?.id === 'rug');
  assert.ok(rug, 'коврик доступен для взаимодействия');
  scene.x = rug.center;
  press(game, 'KeyE');
  assert.ok(game.state.taken.includes('living_rug'), 'тайник под ковриком забран');
  assert.ok(game.state.player.seeds > startSeeds, 'тайник дал семя');

  const plant = scene.buildInteractables().find((item) => item.prop?.id === 'plant');
  scene.x = plant.center;
  press(game, 'KeyE');
  assert.ok(game.state.taken.includes('living_plant'), 'второй тайник тоже работает');

  scene.x = scene.room.doors[0].x - 60;
  press(game, 'KeyE');
  seconds(game, 0.4);
  assert.equal(game.state.roomId, 'hall', 'дверь ведёт в коридор');

  // записка в коридоре
  const note = game.scene.buildInteractables().find((item) => item.prop?.type === 'talk');
  if (note) {
    game.scene.x = note.center;
    press(game, 'KeyE');
    if (game.topOverlay() instanceof DialogueScene) finishDialogue(game);
  }
  console.log('✓ исследование, тайники, двери и записки');
}

// ------------------------------------------------------------------ бой с котом
{
  prepare(game);
  game.startCombat('cat');
  seconds(game, 1.8);
  fight(game, 'cat');
  seconds(game, 0.3);
  assert.ok(game.state.player.seeds >= 3, 'за кота дали семена');
  console.log('✓ бой с Мурзилой и последствия');
}

// ------------------------------------------------------------------ магазин и панели
{
  game.state.player.seeds = 20;
  game.openShop('tarakan');
  seconds(game, 0.2);
  const shop = game.topOverlay();
  assert.ok(shop && shop.constructor.name === 'ShopScene', 'магазин таракана открывается');
  const healEntry = shop.shop.stock(game.state).find((entry) => entry.key === 'item:heal');
  const before = game.state.player.items.heal;
  const result = game.purchase('tarakan', healEntry);
  assert.ok(result.ok && game.state.player.items.heal === before + 1, 'покупка кладёт предмет в инвентарь');
  press(game, 'Escape');
  assert.equal(game.overlays.length, 0, 'магазин закрывается по Esc');

  for (const type of ['inventory', 'character', 'journal', 'bestiary', 'pause']) {
    game.openPanel(type);
    seconds(game, 0.1);
    const panel = game.topOverlay();
    assert.ok(panel instanceof BasePanel, `панель ${type} открывается`);
    press(game, 'Escape');
    assert.equal(game.overlays.length, 0, `панель ${type} закрывается`);
  }
  console.log('✓ магазин, покупки и все панели');
}

// ------------------------------------------------------------------ пылесос
{
  prepare(game);
  game.startCombat('vacuum');
  seconds(game, 1.8);
  fight(game, 'vacuum');
  assert.ok(game.state.player.keyItems.key, 'после пылесоса есть ключ');
  assert.ok(game.state.player.keyItems.feather, 'после пылесоса есть перо');
  console.log('✓ бой с Пылесосом-Пожирателем');
}

// ------------------------------------------------------------------ финальный босс и финал
{
  prepare(game);
  game.startCombat('pasta');
  seconds(game, 1.8);
  fight(game, 'pasta');
  assert.ok(game.state.player.bosses.pasta, 'финальный босс побеждён');
  console.log('✓ бой с Хозяином Макарон');
}

// ------------------------------------------------------------------ главы и балкон
{
  for (const [roomId, room] of Object.entries(ROOMS)) {
    game.closeAllOverlays();
    game.state.roomId = roomId;
    game.state.chapter = room.chapter;
    game.scene = new ExploreScene(game, roomId, room.spawn);
    game.scene.enter();
    tick(game);
    assert.ok(game.scene.room.id === roomId, `комната ${roomId} рисуется`);
  }
  console.log('✓ все комнаты отрисованы');
}

// ------------------------------------------------------------------ концовки
{
  for (const endingId of Object.keys(ENDINGS)) {
    game.closeAllOverlays();
    game.endingId = endingId;
    game.state.ending = endingId;
    game.state.player.kindness = 3;
    game.state.player.allies = { cat: true, pigeon: true, vacuum: false };
    game.setScene(new EndingScene(game, endingId));
    seconds(game, 0.8);
    for (let i = 0; i < ENDINGS[endingId].lines.length + 2; i += 1) press(game, 'Space');
    seconds(game, 0.2);
    assert.ok(game.scene instanceof EndingScene, `концовка ${endingId} отрисована`);
    game.setScene(new MenuScene(game));
  }
  console.log('✓ все шесть концовок отрисованы');
}

// ------------------------------------------------------------------ сохранение и продолжение
{
  game.setScene(new MenuScene(game));
  game.newGame('knight');
  seconds(game, 0.8);
  game.closeAllOverlays();
  game.state.player.seeds = 7;
  game.save();
  assert.ok(game.hasSave(), 'сохранение создаётся');
  game.returnToMenu();
  press(game, 'Digit1');
  seconds(game, 0.8);
  assert.ok(game.state && game.state.player.classId === 'knight', '«Продолжить» загружает игру');
  assert.equal(game.state.player.seeds, 7, 'семена сохранились');
  console.log('✓ сохранение и загрузка');
}

// ------------------------------------------------------------------ главы и финал
{
  const run = makeGame();
  run.newGame('knight');
  seconds(run, 0.9);
  while (run.topOverlay()) press(run, 'Enter');
  seconds(run, 0.4);
  if (run.topOverlay() instanceof DialogueScene) finishDialogue(run);
  run.state.player.bosses.cat = 'spare';
  run.enterRoom('hall', 150);
  seconds(run, 0.3);
  run.enterRoom('pantry', 150);
  seconds(run, 0.4);
  assert.equal(run.state.chapter, 2, 'кладовка открывает вторую главу');
  press(run, 'Enter');
  seconds(run, 0.5);
  if (run.topOverlay() instanceof DialogueScene) finishDialogue(run);

  run.state.player.bosses.vacuum = 'spare';
  run.state.player.keyItems = { key: true, feather: true };
  run.enterRoom('kitchen', 170);
  seconds(run, 0.4);
  assert.equal(run.state.chapter, 3, 'кухня открывает третью главу');
  press(run, 'Enter');
  seconds(run, 0.6);
  if (run.topOverlay() instanceof DialogueScene) finishDialogue(run);

  run.state.player.bosses.pasta = 'spare';
  run.state.player.kindness = 3;
  run.state.player.allies = { cat: true, pigeon: true, vacuum: true };
  run.enterRoom('balcony', 380);
  seconds(run, 0.5);
  assert.equal(run.state.chapter, 4, 'балкон — финальная глава');
  press(run, 'Enter');
  seconds(run, 0.6);
  assert.ok(run.topOverlay() instanceof DialogueScene, 'на балконе запускается финал');
  finishDialogue(run);
  seconds(run, 3.2);
  if (run.topOverlay() instanceof DialogueScene) finishDialogue(run);
  seconds(run, 3.2);
  assert.equal(run.state.roomId, 'stairs', 'после балкона история ведёт в подъезд');
  assert.equal(run.state.chapter, 5, 'подъезд открывает пятую главу');
  assert.ok(Boolean(run.state.player.keyItems.shard), 'у Чики остаётся осколок пера');

  // ------------------------------------------------ шесть глав второго акта
  const act2 = ['keys', 'boiler', 'moth', 'raven', 'shadow', 'shunya'];
  for (const boss of act2) run.state.player.bosses[boss] = 'spare';
  run.state.player.allies = {
    cat: true,
    pigeon: true,
    vacuum: true,
    pasta: true,
    keys: true,
    boiler: true,
    moth: true,
    raven: true,
    shadow: true,
    shunya: true,
  };
  run.state.player.kindness = 6;
  run.state.player.keyItems.feather = true;

  for (const roomId of ['basement', 'boiler', 'attic', 'trunks', 'roof', 'antennas', 'eclipse', 'mirrorRoof', 'nest']) {
    run.enterRoom(roomId, 200);
    seconds(run, 0.35);
    press(run, 'Enter');
    seconds(run, 0.3);
    if (run.topOverlay() instanceof DialogueScene) finishDialogue(run);
    seconds(run, 0.2);
  }
  assert.equal(run.state.chapter, 10, 'гнездо — десятая глава');

  run.enterRoom('skyDawn', 220);
  seconds(run, 0.5);
  press(run, 'Enter');
  seconds(run, 0.5);
  assert.ok(run.topOverlay() instanceof DialogueScene, 'в небе запускается финальный выбор');
  finishDialogue(run);
  seconds(run, 0.8);
  assert.ok(run.scene instanceof EndingScene, 'финал приводит к концовке');
  assert.equal(run.endingId, 'dawn', 'мир с Шуней и союзники дают «Первый Рассвет»');
  assert.ok(!run.hasSave(), 'после концовки сохранение удаляется');
  console.log('✓ главы, финал и концовка по накопленным решениям');
}

console.log(`\nHeadless: ${frames} кадров, все проверки пройдены.`);
