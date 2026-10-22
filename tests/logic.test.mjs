import assert from 'node:assert/strict';
import { CombatModel } from '../src/game/combat.js';
import {
  createGame,
  createPlayer,
  getStats,
  reconcileState,
  addSeeds,
  buyUpgrade,
  buyUlt,
  addItem,
  healPlayer,
  readNote,
  meetEnemy,
  takeItem,
  setBossOutcome,
  addAlly,
  addKindness,
  addGreed,
  allyCount,
} from '../src/game/state.js';
import { computeEnding } from '../src/game/endings.js';
import { mainObjective, sideQuests } from '../src/data/quests.js';
import { RNG } from '../src/core/util.js';
import { NOTES } from '../src/data/notes.js';
import { ENDINGS } from '../src/render/palette.js';

let checks = 0;
function ok(condition, message) {
  checks += 1;
  assert.ok(condition, message);
}

function makeModel(classId, enemyId, rolls = [], options = {}) {
  const player = createPlayer(classId);
  player.upgrades = options.upgrades || {};
  player.ultOwned = Boolean(options.ult);
  player.items = { heal: options.heal ?? 0, honey: 0, double: options.double ? 1 : 0 };
  player.hp = getStats(player).maxHp;
  player.seeds = options.seeds ?? 0;
  player.allies = { cat: Boolean(options.catAlly), pigeon: Boolean(options.pigeon), vacuum: false };
  const queue = [...rolls];
  let state = 42;
  const rng = {
    d6: () => (queue.length ? queue.shift() : 1),
    int: (n) => Math.floor(Math.random() * n),
    getState: () => state,
    setState: (value) => {
      state = value;
    },
  };
  const model = new CombatModel({ enemyId, player, rng });
  model.start();
  return model;
}

// ------------------------------------------------------------------ формулы
{
  const model = makeModel('knight', 'cat', [6]);
  const result = model.attack();
  ok(result.hits[0].crit, 'шестёрка даёт крит');
  ok(result.hits[0].damage === 16, 'рыцарь: (6+2)×2 = 16');
  ok(model.enemyHp === 0 && model.outcome === 'kill', '15 HP кота пробиваются критом');
}
{
  const model = makeModel('mage', 'pasta', [6], { upgrades: { special: true } });
  const result = model.attack();
  ok(result.hits[0].damage === 21, 'магистр с улучшением: (6+1)×3 = 21');
}
{
  const model = makeModel('shadow', 'pasta', [6], { upgrades: { special: true } });
  model.useSkill();
  ok(model.backstab, '«Клюв в спину» ставит усиление');
  const result = model.attack();
  ok(result.hits[0].damage === 24, 'тень: 6×2 крит ×2 клюв = 24');
}
{
  const model = makeModel('knight', 'pasta', [3], { double: true });
  model.useItem('double');
  const result = model.attack();
  ok(result.hits[0].damage === 10, 'двойное зерно: (3+2)×2 = 10');
}
{
  const model = makeModel('mage', 'cat', [4, 5]);
  const result = model.useSkill();
  ok(result.kind === 'volley' && result.hits.length === 2, 'залп бьёт дважды');
  ok(result.hits[0].damage === 5 && result.hits[1].damage === 6, 'залп считает каждый бросок');
}

// ------------------------------------------------------------------ механики боссов
{
  const model = makeModel('knight', 'cat');
  model.useSkill();
  const enemy = model.enemyAct();
  ok(enemy.damage === 1, 'щит крыла снижает удар до 1');
  ok(model.playerHp === model.maxHp - 1, 'HP снижено ровно на 1');
}
{
  const model = makeModel('knight', 'cat');
  const hpBefore = model.playerHp;
  const first = model.enemyAct();
  const second = model.enemyAct();
  const third = model.enemyAct();
  ok(first.damage === 3 && second.damage === 3, 'первые два удара кота проходят');
  ok(third.hidden && model.playerHp === hpBefore - 6, 'каждый третий ход кот прячется');
}
{
  const model = makeModel('mage', 'vacuum');
  model.lastRoll = 1;
  const result = model.enemyAct();
  ok(result.inhale, 'слабый бросок втягивает игрока');
  ok(result.damage === 2, 'втягивание наносит 2 урона');
  ok(model.skipTurns === 1, 'после втягивания пропускается ход');
  model.beginPlayerTurn();
  ok(model.beginPlayerTurn().skipped === false, 'пропуск расходуется');
}
{
  const model = makeModel('knight', 'vacuum');
  model.lastRoll = 1;
  model.useSkill();
  const result = model.enemyAct();
  ok(!result.inhale, 'щит защищает от втягивания');
}
{
  const model = makeModel('knight', 'pasta');
  const result = model.enemyAct();
  ok(result.pastaOffer, 'макароны предлагаются после первого хода');
  const before = model.playerHp;
  const accepted = model.acceptPasta();
  ok(accepted.ok && model.playerHp === Math.min(model.maxHp, before + 5), 'макароны дают +5 HP');
  ok(model.skipTurns === 2, 'макароны стоят два хода');
  ok(!model.pendingPastaOffer, 'предложение одноразовое');
}
{
  const model = makeModel('knight', 'pasta');
  model.enemyHp = 9;
  ok(!model.canSpare(), 'перемирие недоступно при высоком HP');
  model.enemyHp = 8;
  ok(model.canSpare(), 'перемирие доступно на пороге');
  const result = model.spare();
  ok(result.ok && model.outcome === 'spare', 'мирный исход фиксируется');
}
{
  const model = makeModel('knight', 'pasta', [5], { ult: true });
  const enemyHpBefore = model.enemyHp;
  const playerHpBefore = model.playerHp;
  model.attack();
  ok(model.enemyHp < enemyHpBefore, 'удар проходит до отмены');
  model.enemyAct();
  ok(model.playerHp < playerHpBefore, 'ответ врага проходит до отмены');
  const ult = model.useUlt();
  ok(ult.ok, 'эхо применяется');
  ok(model.playerHp === playerHpBefore, 'эхо отменяет и удар врага');
  ok(model.enemyHp === enemyHpBefore, 'эхо возвращает HP врага');
  ok(model.ultUsedHere, 'эхо помечается использованным');
  ok(!model.useUlt().ok, 'эхо нельзя применить дважды');
  model.beginPlayerTurn();
  model.attack();
  model.enemyAct();
  ok(model.playerHp >= 0, 'после отмены бой продолжается');
}

// ------------------------------------------------------------------ экономика и прокачка
{
  const state = createGame('mage');
  addSeeds(state, 6);
  ok(buyUpgrade(state, 'vitality').ok, 'улучшение здоровья покупается');
  ok(state.player.maxHp === 12 && state.player.hp === 12, 'максимум и текущее HP растут на 3');
  ok(state.player.seeds === 4, 'стоимость улучшения списана');
  ok(buyUpgrade(state, 'vitality').ok === false, 'повторное улучшение недоступно');
  ok(buyUpgrade(state, 'skill2').ok, 'второе использование умения покупается');
  ok(getStats(state.player).skillUses === 2, 'умение получает второй заряд');
  addSeeds(state, 6);
  ok(buyUlt(state).ok, 'ульта покупается за 6 семян');
  ok(state.player.ultOwned && state.player.seeds === 2, 'ульта отмечена');
}
{
  const state = createGame('shadow');
  state.player.hp = 2;
  const healed = healPlayer(state, 99);
  ok(healed === 8 && state.player.hp === 10, 'лечение не превышает максимум');
  addItem(state, 'honey', 2);
  ok(state.player.items.honey === 2, 'предметы складываются');
}
{
  const state = createGame('knight');
  ok(readNote(state, 'n_tv') === true, 'записка добавляется один раз');
  ok(readNote(state, 'n_tv') === false, 'повторное чтение не дублируется');
  ok(meetEnemy(state, 'cat') === true, 'бестиарий заполняется');
  ok(takeItem(state, 'cache_1') === true, 'тайник отмечается');
  ok(takeItem(state, 'cache_1') === false, 'тайник нельзя взять дважды');
  addKindness(state, 2);
  addGreed(state, 1);
  addAlly(state, 'cat');
  ok(allyCount(state.player) === 1, 'союзник учитывается');
}
{
  const state = reconcileState(createGame('knight'));
  state.player.hp = 999;
  state.chapter = 42;
  reconcileState(state);
  ok(state.player.hp === state.player.maxHp, 'загрузка чинит превышение HP');
  ok(state.chapter === 10, 'глава ограничена десятой');
}

// ------------------------------------------------------------------ концовки
{
  const base = () => createGame('knight');
  {
    const state = base();
    state.player.kindness = 3;
    state.player.allies.cat = true;
    state.player.allies.pigeon = true;
    ok(computeEnding(state, 'out') === 'flock', 'доброта и союзники дают «Квартиру-Стаю»');
  }
  {
    const state = base();
    state.player.kindness = 2;
    ok(computeEnding(state, 'out') === 'morning', 'умеренная доброта — «Настоящее Утро»');
  }
  {
    const state = base();
    ok(computeEnding(state, 'out') === 'caged', 'без доброты — «Солнце в Клетке»');
  }
  {
    const state = base();
    state.player.kindness = 2;
    ok(computeEnding(state, 'stay') === 'quiet', 'остаться с добрым сердцем — «Тихий Дом»');
  }
  {
    const state = base();
    state.player.greed = 3;
    ok(computeEnding(state, 'stay') === 'caged', 'остаться с жадностью — «Солнце в Клетке»');
  }
  {
    const state = base();
    state.player.greed = 2;
    state.player.kindness = 1;
    ok(computeEnding(state, 'feather') === 'eclipse', 'забрать перо с жадностью — «Перо Затмения»');
  }
  {
    const state = base();
    state.player.kindness = 2;
    state.player.greed = 1;
    ok(computeEnding(state, 'feather') === 'keeper', 'забрать перо без жадности — «Хранитель»');
  }
  const reachable = new Set();
  for (const kindness of [0, 1, 2, 3, 4, 5, 6]) {
    for (const greed of [0, 1, 2, 3]) {
      for (const choice of ['out', 'stay', 'feather']) {
        const state = createGame('knight');
        state.player.kindness = kindness;
        state.player.greed = greed;
        state.player.allies.cat = kindness >= 3;
        state.player.allies.pigeon = kindness >= 3;
        state.player.allies.vacuum = kindness >= 5;
        state.player.allies.moth = kindness >= 5;
        state.player.bosses.shunya = kindness >= 5 ? 'spare' : 'kill';
        reachable.add(computeEnding(state, choice));
      }
    }
  }
  ok(reachable.size === Object.keys(ENDINGS).length, 'все концовки достижимы');
}

// ------------------------------------------------------------------ журнал
{
  const state = createGame('knight');
  ok(mainObjective(state).title.includes('Найти'), 'первая задача — найти перо');
  setBossOutcome(state, 'cat', 'spare');
  ok(mainObjective(state).title === 'Выйти из гостиной', 'после кота задача меняется');
  state.chapter = 2;
  setBossOutcome(state, 'vacuum', 'kill');
  ok(mainObjective(state).title === 'Вернуться в коридор', 'после пылесоса задача меняется');
  state.chapter = 3;
  setBossOutcome(state, 'pasta', 'spare');
  ok(mainObjective(state).title.includes('ключ') || mainObjective(state).title.includes('Ключ'), 'нужен ключ от балкона');
  state.player.keyItems.key = true;
  ok(mainObjective(state).title.includes('Перо'), 'нужно перо');
  state.player.keyItems.feather = true;
  ok(mainObjective(state).title.includes('балкон'), 'дверь готова открыться');
  ok(sideQuests(state).length === 5, 'попутные дела перечислены');
  ok(NOTES.n_vent.text.includes('ВЫТАЩИЛ ПЕРО'), 'записка в вентиляции раскрывает тайну');
}

// ------------------------------------------------------------------ симуляция баланса
function botFight(classId, enemyId, seed, options = {}) {
  const player = createPlayer(classId);
  player.upgrades = options.upgrades || {};
  player.ultOwned = Boolean(options.ult);
  player.items = { heal: options.heal ?? 0, honey: options.honey ?? 0, double: options.double ? 1 : 0 };
  player.hp = getStats(player).maxHp;
  player.seeds = options.seeds ?? 0;
  const model = new CombatModel({ enemyId, player, rng: new RNG(seed) });
  model.start();
  if (model.outcome) return model.outcome;
  let guard = 0;
  const handleOffer = () => {
    if (model.pendingPastaOffer) model.declinePasta();
  };
  while (!model.outcome && guard < 80) {
    guard += 1;
    handleOffer();
    if (model.inventory.double > 0 && !model.doubleUsed && !model.itemUsedThisTurn) {
      model.useItem('double');
    }
    if (model.playerHp <= model.maxHp * 0.5) {
      const item = model.inventory.honey > 0 ? 'honey' : 'heal';
      if ((model.inventory[item] || 0) > 0 && !model.itemUsedThisTurn) model.useItem(item);
    }
    if (model.backstab) model.attack();
    else if (model.skillUsesLeft > 0) {
      const result = model.useSkill();
      if (!result.ok) model.attack();
      else if (result.kind === 'backstab_buff') model.attack();
    } else model.attack();
    if (model.outcome) break;

    model.enemyAct();
    if (model.outcome === 'defeat' && model.canUseUlt()) model.useUlt();
    if (model.outcome || model.playerHp <= 0) break;
    handleOffer();
    let turn = model.beginPlayerTurn();
    let skipGuard = 0;
    while (turn.skipped && !model.outcome && skipGuard < 4) {
      skipGuard += 1;
      model.enemyAct();
      if (model.outcome === 'defeat' && model.canUseUlt()) model.useUlt();
      if (model.outcome || model.playerHp <= 0) break;
      turn = model.beginPlayerTurn();
    }
  }
  return model.outcome || 'timeout';
}

{
  const prepared = {
    heal: 1,
    honey: 2,
    double: true,
    ult: true,
    upgrades: { vitality: true, special: true },
  };
  for (const classId of ['knight', 'mage', 'shadow']) {
    for (const enemyId of ['cat', 'vacuum', 'pasta']) {
      let wins = 0;
      let timeouts = 0;
      for (let seed = 1; seed <= 80; seed += 1) {
        const result = botFight(classId, enemyId, seed * 7919, prepared);
        if (result === 'kill' || result === 'spare') wins += 1;
        if (result === 'timeout') timeouts += 1;
      }
      ok(timeouts === 0, `${classId} vs ${enemyId}: бой всегда завершается`);
      ok(wins / 80 >= 0.7, `${classId} vs ${enemyId}: подготовленный бой выигрывается (${wins}/80)`);
    }
  }
  for (const classId of ['knight', 'mage', 'shadow']) {
    let catWins = 0;
    for (let seed = 1; seed <= 80; seed += 1) {
      const result = botFight(classId, 'cat', seed * 104729, { heal: 1 });
      if (result === 'kill' || result === 'spare') catWins += 1;
    }
    ok(catWins / 80 >= 0.7, `${classId}: Мурзила проходим без прокачки`);
  }
}

console.log(`Логика: ${checks} проверок пройдено.`);
console.log('Формулы, механики боссов, экономика, концовки и баланс — в порядке.');

// ------------------------------------------------------------------ целостность данных
{
  const { DIALOGUES } = await import('../src/data/dialogues.js');
  const { ROOMS } = await import('../src/data/chapters.js');
  const { SHOPS } = await import('../src/data/shops.js');
  const { ITEMS } = await import('../src/data/items.js');
  const { ENEMIES } = await import('../src/data/enemies.js');
  const { NOTES } = await import('../src/data/notes.js');

  const dialogueIds = new Set(Object.keys(DIALOGUES));
  const noteIds = new Set(Object.keys(NOTES));
  const itemIds = new Set(Object.keys(ITEMS));
  const enemyIds = new Set(Object.keys(ENEMIES));

  const checkDialogue = (id, where) => {
    ok(dialogueIds.has(id), `диалог «${id}» существует (${where})`);
  };

  for (const [roomId, room] of Object.entries(ROOMS)) {
    for (const prop of room.props || []) {
      if (prop.dialogue) checkDialogue(prop.dialogue, `${roomId}.${prop.id}`);
      if (prop.type === 'loot' && prop.item) ok(itemIds.has(prop.item), `предмет тайника ${prop.id} существует`);
    }
    for (const door of room.doors || []) {
      ok(Boolean(ROOMS[door.to]), `дверь ${door.id} ведёт в существующую комнату`);
    }
    const enter = room.onEnter ? room.onEnter({ player: { flags: {}, bosses: {} }, chapter: room.chapter }) : null;
    if (typeof enter === 'string') checkDialogue(enter, `${roomId}.onEnter`);
  }

  const walkDialogue = (dialogue, id) => {
    const nodes = dialogue.nodes;
    const visited = new Set();
    const stack = [dialogue.start];
    while (stack.length) {
      const nodeId = stack.pop();
      if (!nodeId || visited.has(nodeId)) continue;
      visited.add(nodeId);
      const node = nodes[nodeId];
      ok(Boolean(node), `узел ${id}.${nodeId} существует`);
      if (!node) continue;
      if (node.next) stack.push(node.next);
      for (const choice of node.choices || []) {
        if (choice.next) stack.push(choice.next);
        const effects = choice.effects || {};
        if (effects.startCombat) ok(enemyIds.has(effects.startCombat), `бой «${effects.startCombat}» существует (${id})`);
        if (effects.ending) ok(['out', 'stay', 'feather'].includes(effects.ending), `финальный выбор «${effects.ending}» корректен (${id})`);
        if (effects.item) ok(itemIds.has(effects.item), `предмет «${effects.item}» существует (${id})`);
        if (effects.note) ok(noteIds.has(effects.note), `записка «${effects.note}» существует (${id})`);
      }
      const effects = node.effects || {};
      if (effects.startCombat) ok(enemyIds.has(effects.startCombat), `бой «${effects.startCombat}» существует (${id})`);
      if (effects.ending) ok(['out', 'stay', 'feather'].includes(effects.ending), `финальный выбор «${effects.ending}» корректен (${id})`);
      if (effects.item) ok(itemIds.has(effects.item), `предмет «${effects.item}» существует (${id})`);
      if (effects.note) ok(noteIds.has(effects.note), `записка «${effects.note}» существует (${id})`);
      if (effects.peaceful) ok(enemyIds.has(effects.peaceful), `мирный босс «${effects.peaceful}» существует (${id})`);
    }
  };
  for (const [id, dialogue] of Object.entries(DIALOGUES)) walkDialogue(dialogue, id);

  for (const [shopId, shop] of Object.entries(SHOPS)) {
    const state = createGame('knight');
    state.chapter = 4;
    state.player.seeds = 99;
    const stock = shop.stock(state);
    ok(stock.length >= 3, `ассортимент ${shopId} не пуст`);
    for (const entry of stock) {
      const key = entry.key;
      if (key.startsWith('item:')) ok(itemIds.has(key.slice(5)), `товар ${key} существует в ${shopId}`);
    }
  }
}
console.log('Данные: диалоги, комнаты, товары и ссылки согласованы.');
