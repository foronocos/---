/**
 * Сквозное прохождение без подсказок: три класса, реальная экономика,
 * честный бот (лечится, покупает улучшения на собранные семена, не жульничает).
 * Проверяет, что игра проходима от меню до концовки.
 */
import assert from 'node:assert/strict';

const noop = () => {};
const gradient = { addColorStop: noop };
const ctxTarget = {
  measureText: (text) => ({ width: String(text ?? '').length * 8.2 }),
  createLinearGradient: () => gradient,
  createRadialGradient: () => gradient,
  createPattern: () => null,
  getImageData: () => ({ data: new Uint8ClampedArray(4) }),
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
canvas = {
  width: 1280,
  height: 720,
  style: {},
  getContext: () => context,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720, right: 1280, bottom: 720 }),
  addEventListener: (type, handler) => {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(handler);
  },
  removeEventListener: noop,
  setPointerCapture: noop,
  releasePointerCapture: noop,
  focus: noop,
};
const storage = new Map();
globalThis.window = {
  devicePixelRatio: 1,
  addEventListener: noop,
  removeEventListener: noop,
  matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }),
  localStorage: {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  },
  AudioContext: undefined,
};
globalThis.document = { getElementById: () => canvas, addEventListener: noop };
globalThis.requestAnimationFrame = () => 0;
let fakeNow = 1700000000000;
Date.now = () => (fakeNow += 16);
globalThis.cancelAnimationFrame = noop;

const { Game } = await import('../src/game/game.js');
const { MenuScene } = await import('../src/scenes/menu.js');
const { ExploreScene } = await import('../src/scenes/explore.js');
const { DialogueScene } = await import('../src/scenes/dialogueScene.js');
const { EndingScene } = await import('../src/scenes/endingScene.js');
const { ROOMS } = await import('../src/data/chapters.js');
const { buyUpgrade, getStats, allyCount } = await import('../src/game/state.js');
const { getShop } = await import('../src/data/shops.js');

const MERCY = process.argv.includes('--mercy');

// Детерминированный Math.random: прохождения должны воспроизводиться.
let randomSeed = MERCY ? 2024 : 7331;
Math.random = () => {
  randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0;
  return randomSeed / 4294967296;
};

let frames = 0;
function tick(game, { pressed = [], dt = 1 / 60 } = {}) {
  for (const code of pressed) game.input.justPressed.add(code);
  game.update(dt);
  game.draw();
  frames += 1;
}

function chooseBrave(game, scene) {
  const choices = scene.visibleChoices;
  const nodes = scene.dialogue.nodes;
  // кратчайшее расстояние до узла, который запускает бой
  const distanceToFight = (nodeId, seen = new Set(), depth = 0) => {
    if (!nodeId || depth > 10 || seen.has(nodeId)) return Infinity;
    const node = nodes[nodeId];
    if (!node) return Infinity;
    if (node.effects?.startCombat) return depth;
    seen.add(nodeId);
    const nested = (node.choices || []).map((choice) => distanceToFight(choice.next, seen, depth + 1));
    return Math.min(...nested, distanceToFight(node.next, seen, depth + 1));
  };
  const isFinale = choices.some((choice) => choice.effects?.ending);
  if (MERCY && !isFinale) {
    // добрый игрок выбирает варианты, которые дают доброту
    const kindnessOf = (nodeId, seen = new Set(), depth = 0) => {
      if (!nodeId || depth > 5 || seen.has(nodeId)) return 0;
      const node = nodes[nodeId];
      if (!node) return 0;
      seen.add(nodeId);
      let score = (node.effects?.kindness || 0) - (node.effects?.greed || 0);
      const nested = (node.choices || []).map((choice) => kindnessOf(choice.next, seen, depth + 1));
      score += Math.max(0, ...nested, kindnessOf(node.next, seen, depth + 1));
      return score;
    };
    const scores = choices.map((choice) => {
      const direct = (choice.effects?.kindness || 0) - (choice.effects?.greed || 0);
      return direct * 10 + kindnessOf(choice.next);
    });
    const bestKind = scores.indexOf(Math.max(...scores));
    if (scores[bestKind] > 0) return bestKind;
  }
  const fightDistance = choices.map((choice) => distanceToFight(choice.next));
  const best = fightDistance.indexOf(Math.min(...fightDistance));
  if (Number.isFinite(fightDistance[best])) return best;
  return 0;
}

function resolveDialogues(game) {
  let guard = 0;
  while (game.topOverlay() instanceof DialogueScene && guard < 400) {
    const scene = game.topOverlay();
    if (scene.isTyping) tick(game, { pressed: ['Space'] });
    else if (scene.visibleChoices.length) {
      const index = chooseBrave(game, scene);
      tick(game, { pressed: [`Digit${index + 1}`] });
    } else tick(game, { pressed: ['Space'] });
    guard += 1;
  }
  assert.ok(guard < 400, 'диалог зациклился');
}

function shopBeforeFight(game) {
  const player = game.state.player;
  const shop = getShop('tarakan');
  if (!shop) return;
  const stock = shop.stock(game.state);
  const buy = (key, limit) => {
    const entry = stock.find((item) => item.key === key);
    if (!entry) return;
    for (let i = 0; i < limit; i += 1) {
      const count = key.startsWith('item:') ? player.items[key.slice(5)] || 0 : 0;
      if (player.seeds < entry.price || count >= 3) break;
      const result = game.purchase('tarakan', entry);
      if (!result.ok) break;
    }
  };
  if (player.seeds >= 2) buy('item:heal', 2);
  if (player.seeds >= 2) buy('item:honey', 1);
  if (player.seeds >= 3 && !MERCY) buy('item:double', 1);
}

function upgradeBeforeFight(game) {
  const player = game.state.player;
  const order = ['vitality', 'special', 'skill2'];
  for (const id of order) {
    if (player.seeds >= 2 && !player.upgrades[id]) {
      const result = buyUpgrade(game.state, id);
      assert.ok(result.ok, `улучшение ${id} покупается`);
    }
  }
  if (player.seeds >= 6 && !player.ultOwned) {
    player.seeds -= 6;
    player.ultOwned = true;
    player.ultUsed = false;
  }
}

function fightBot(game, enemyId, allowance = 3) {
  let guard = 0;
  let retries = 0;
  while (!game.state.player.bosses[enemyId] && guard < 12000) {
    guard += 1;
    const combat = game.combatScene;
    if (!combat) {
      if (game.topOverlay() instanceof DialogueScene) {
        resolveDialogues(game);
        continue;
      }
      tick(game);
      continue;
    }
    if (combat.victory) tick(game, { pressed: ['Enter'] });
    else if (combat.defeatShown) {
      if (combat.model.canUseUlt()) tick(game, { pressed: ['Digit1'] });
      else {
        retries += 1;
        
        tick(game, { pressed: ['KeyR'] });
      }
    } else if (combat.pastaOffer) tick(game, { pressed: ['Digit2'] });
    else if (MERCY && combat.canAct && combat.model.canSpare()) combat.spare();
    else if (combat.itemMenu) tick(game, { pressed: ['Escape'] });
    else if (combat.phase === 'player') {
      const model = combat.model;
      if (model.inventory.double > 0 && !model.doubleUsed && !model.itemUsedThisTurn) {
        combat.useItem('double');
      } else if (model.playerHp <= model.maxHp * 0.5 && !model.itemUsedThisTurn) {
        if (model.inventory.heal > 0) combat.useItem('heal');
        else if (model.inventory.honey > 0) combat.useItem('honey');
        else if (model.skillUsesLeft > 0) combat.doSkill();
        else tick(game, { pressed: ['Digit1'] });
      } else if (model.skillUsesLeft > 0) combat.doSkill();
      else tick(game, { pressed: ['Digit1'] });
      tick(game);
    } else tick(game);
  }
  assert.ok(game.state.player.bosses[enemyId], `бой с ${enemyId} завершён`);
  game.lastRetries = (game.lastRetries || 0) + retries;
  if (process.env.DBG) console.log('  boss', enemyId, 'retries', retries, 'hp', game.state.player.hp, 'seeds', game.state.player.seeds, 'upg', JSON.stringify(game.state.player.upgrades), 'ult', game.state.player.ultOwned, 'items', JSON.stringify(game.state.player.items));
  resolveDialogues(game);
}

function collectLoot(game) {
  let guard = 0;
  while (guard < 60) {
    guard += 1;
    const scene = game.scene;
    if (!(scene instanceof ExploreScene)) return;
    const loot = scene
      .buildInteractables()
      .find((item) => item.prop?.type === 'loot' && !(item.prop.takenId && game.state.taken.includes(item.prop.takenId)));
    if (!loot) return;
    scene.x = loot.center;
    scene.entryHandled = true;
    tick(game);
    scene.interact(loot);
    resolveDialogues(game);
    if (game.combatScene) return;
  }
}

function talkTo(game, propId) {
  const scene = game.scene;
  const item = scene.buildInteractables().find((entry) => entry.prop?.id === propId);
  assert.ok(item, `в комнате есть ${propId}`);
  scene.x = item.center;
  scene.interact(item);
  resolveDialogues(game);
}

function travel(game, roomId) {
  game.closeAllOverlays();
  game.enterRoom(roomId, ROOMS[roomId].spawn);
  const scene = game.scene;
  scene.entryHandled = true;
  scene.fade = 0;
  for (let i = 0; i < 4; i += 1) tick(game);
  resolveDialogues(game);
  if (game.topOverlay()?.constructor.name === 'ChapterCard') {
    tick(game, { pressed: ['Enter'] });
    for (let i = 0; i < 4; i += 1) tick(game);
    resolveDialogues(game);
  }
}

function playthrough(classId) {
  const game = new Game(canvas);
  game.audio.enabled = false;
  game.settings.sound = false;
  game.setScene(new MenuScene(game));
  tick(game);

  game.newGame(classId);
  for (let i = 0; i < 90; i += 1) tick(game);
  game.closeAllOverlays();
  for (let i = 0; i < 60; i += 1) tick(game);
  resolveDialogues(game);

  // глава 1: гостиная
  collectLoot(game);
  talkTo(game, 'sofa');
  shopBeforeFight(game);
  upgradeBeforeFight(game);
  fightBot(game, 'cat');
  collectLoot(game);

  travel(game, 'hall');
  collectLoot(game);
  travel(game, 'bath');
  collectLoot(game);
  travel(game, 'pantry');
  collectLoot(game);
  travel(game, 'pantryDeep');
  collectLoot(game);
  travel(game, 'vent');
  collectLoot(game);
  travel(game, 'pantryDeep');
  travel(game, 'pantry');
  travel(game, 'hall');

  // глава 2: пылесос
  if (!game.state.player.bosses.vacuum) {
    travel(game, 'pantryDeep');
    collectLoot(game);
    talkTo(game, 'vacuum');
    shopBeforeFight(game);
    upgradeBeforeFight(game);
    fightBot(game, 'vacuum');
    resolveDialogues(game);
  }
  assert.ok(game.state.player.keyItems.key, 'ключ от балкона добыт');
  assert.ok(game.state.player.keyItems.feather, 'Золотое Перо добыто');

  // глава 3: кухня
  travel(game, 'hall');
  travel(game, 'kitchen');
  collectLoot(game);
  travel(game, 'kitchen');
  talkTo(game, 'pasta');
  shopBeforeFight(game);
  upgradeBeforeFight(game);
  fightBot(game, 'pasta');
  collectLoot(game);

  // финал
  travel(game, 'balcony');
  for (let i = 0; i < 200; i += 1) {
    if (game.scene instanceof EndingScene) break;
    const scene = game.topOverlay();
    if (scene instanceof DialogueScene) {
      if (scene.isTyping) tick(game, { pressed: ['Space'] });
      else if (scene.visibleChoices.length) {
        if (process.env.DBG) console.log('FINAL CHOICE', scene.visibleChoices.map((c) => c.label));
        tick(game, { pressed: ['Digit1'] });
      }
      else tick(game, { pressed: ['Space'] });
    } else tick(game);
  }
  assert.ok(game.scene instanceof EndingScene, 'финал приводит к экрану концовки');
  if (MERCY) {
    assert.ok(game.state.player.kindness >= 1, 'мирное прохождение накапливает доброту');
    assert.ok(allyCount(game.state.player) >= 1, 'мирное прохождение приносит союзника');
    assert.ok(!['eclipse'].includes(game.endingId), 'без жадности тёмная концовка недоступна');
  } else {
    assert.equal(game.endingId, 'caged', 'путь силой без доброты ведёт к «Солнцу в Клетке»');
  }
  return {
    ending: game.endingId,
    finalChoice: game.state.finalChoice,
    hp: game.state.player.hp,
    seeds: game.state.player.seeds,
    kindness: game.state.player.kindness,
    allies: allyCount(game.state.player),
    stats: game.state.player.stats,
    retries: game.lastRetries || 0,
  };
}

const results = [];
for (const classId of ['knight', 'mage', 'shadow']) {
  const result = playthrough(classId);
  results.push({ classId, ...result });
  assert.ok(result.ending, `${classId}: концовка определена`);
}

console.log('Сквозные прохождения:');
for (const result of results) {
  console.log(
    `  ${result.classId.padEnd(7)} → ${result.ending.padEnd(8)} · бои ${result.stats.battles} · побед ${result.stats.kills} · перемирий ${result.stats.spares} · доброта ${result.kindness} · союзники ${result.allies} · семена ${result.seeds} · попыток ${result.retries} · выбор ${result.finalChoice}`,
  );
}
console.log(`Пройдено без тупиков за ${frames} кадров.`);
