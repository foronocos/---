import { getClass, getUpgrade } from '../data/classes.js';
import { ITEMS } from '../data/items.js';

export const MAX_HEAL_ITEM_USES = 5;

export function getStats(player) {
  const cls = getClass(player.classId);
  const upgrades = player.upgrades || {};
  const isMage = player.classId === 'mage';
  const isKnight = player.classId === 'knight';
  const isShadow = player.classId === 'shadow';
  return {
    className: cls.name,
    classDef: cls,
    bonus: cls.bonus,
    maxHp: cls.hp + (upgrades.vitality ? 3 : 0),
    critMult: isMage && upgrades.special ? 3 : 2,
    absorb: isKnight && upgrades.special ? 2 : 0,
    reflect: isShadow && upgrades.special ? 1 : 0,
    skillUses: 1 + (upgrades.skill2 ? 1 : 0),
    skill: cls.skill,
  };
}

export function createPlayer(classId) {
  const cls = getClass(classId);
  return {
    classId: cls.id,
    hp: cls.hp,
    maxHp: cls.hp,
    seeds: 0,
    items: { heal: 1, honey: 0, double: 0 },
    keyItems: { key: false, feather: false },
    hasEye: false,
    ultOwned: false,
    ultUsed: false,
    upgrades: {},
    allies: { cat: false, pigeon: false, vacuum: false },
    flags: {},
    kindness: 0,
    greed: 0,
    notesRead: [],
    bestiarySeen: [],
    bosses: {},
    stats: { battles: 0, kills: 0, spares: 0, damageDealt: 0, itemsUsed: 0 },
  };
}

export function createGame(classId) {
  const player = createPlayer(classId);
  return {
    version: 1,
    chapter: 1,
    roomId: 'living',
    roomTitle: 'Гостиная',
    spawnX: null,
    player,
    taken: [],
    used: [],
    visited: ['living'],
    shopRefresh: 1,
    ending: null,
    playTime: 0,
    startedAt: Date.now(),
    lastSavedAt: 0,
  };
}

/** Приводит загруженное состояние к актуальным формулам. */
export function reconcileState(state) {
  if (!state.player) return state;
  const cls = getClass(state.player.classId);
  state.player.classId = cls.id;
  state.player.upgrades = state.player.upgrades || {};
  state.player.flags = state.player.flags || {};
  state.player.allies = { cat: false, pigeon: false, vacuum: false, ...(state.player.allies || {}) };
  state.player.keyItems = { key: false, feather: false, ...(state.player.keyItems || {}) };
  state.player.items = { heal: 0, honey: 0, double: 0, ...(state.player.items || {}) };
  state.player.notesRead = state.player.notesRead || [];
  state.player.bestiarySeen = state.player.bestiarySeen || [];
  state.player.bosses = state.player.bosses || {};
  state.player.stats = {
    battles: 0,
    kills: 0,
    spares: 0,
    damageDealt: 0,
    itemsUsed: 0,
    ...(state.player.stats || {}),
  };
  state.taken = state.taken || [];
  state.used = state.used || [];
  state.visited = state.visited || ['living'];
  const stats = getStats(state.player);
  state.player.maxHp = stats.maxHp;
  state.player.hp = Math.max(0, Math.min(state.player.hp, stats.maxHp));
  state.player.seeds = Math.max(0, Math.floor(state.player.seeds || 0));
  state.player.kindness = Math.max(0, state.player.kindness || 0);
  state.player.greed = Math.max(0, state.player.greed || 0);
  state.chapter = Math.min(4, Math.max(1, state.chapter || 1));
  return state;
}

export function addSeeds(state, amount) {
  state.player.seeds = Math.max(0, state.player.seeds + amount);
  return state.player.seeds;
}

export function spendSeeds(state, amount) {
  if (state.player.seeds < amount) return false;
  state.player.seeds -= amount;
  return true;
}

export function addItem(state, itemId, count = 1) {
  if (!ITEMS[itemId]) return;
  state.player.items[itemId] = (state.player.items[itemId] || 0) + count;
}

export function itemCount(state, itemId) {
  return state.player.items[itemId] || 0;
}

export function healPlayer(state, amount) {
  const stats = getStats(state.player);
  const before = state.player.hp;
  state.player.hp = Math.min(stats.maxHp, state.player.hp + amount);
  return state.player.hp - before;
}

export function damagePlayer(state, amount) {
  state.player.hp = Math.max(0, state.player.hp - amount);
  return state.player.hp;
}

export function hasUpgrade(player, upgradeId) {
  return Boolean(player.upgrades[upgradeId]);
}

export function buyUpgrade(state, upgradeId) {
  const player = state.player;
  const upgrade = getUpgrade(player.classId, upgradeId);
  if (!upgrade) return { ok: false, message: 'Такого улучшения нет.' };
  if (hasUpgrade(player, upgradeId)) return { ok: false, message: 'Улучшение уже куплено.' };
  if (player.seeds < upgrade.price) return { ok: false, message: 'Не хватает Семян Силы.' };
  player.seeds -= upgrade.price;
  player.upgrades[upgradeId] = true;
  if (upgrade.effect.maxHp) {
    player.maxHp += upgrade.effect.maxHp;
    player.hp += upgrade.effect.maxHp;
  }
  return { ok: true, message: `Куплено: ${upgrade.name}.`, upgrade };
}

export function buyUlt(state) {
  const player = state.player;
  if (player.ultOwned) return { ok: false, message: 'Ульта уже куплена.' };
  if (player.seeds < 6) return { ok: false, message: 'Нужно 6 Семян Силы.' };
  player.seeds -= 6;
  player.ultOwned = true;
  return { ok: true, message: '«Эхо Первой Семечки» теперь с тобой. Один раз за игру.' };
}

export function addKindness(state, amount = 1) {
  state.player.kindness += amount;
}

export function addGreed(state, amount = 1) {
  state.player.greed += amount;
}

export function setFlag(state, flag, value = true) {
  state.player.flags[flag] = value;
}

export function getFlag(state, flag) {
  return Boolean(state.player.flags[flag]);
}

export function readNote(state, noteId) {
  if (!state.player.notesRead.includes(noteId)) {
    state.player.notesRead.push(noteId);
    return true;
  }
  return false;
}

export function meetEnemy(state, enemyId) {
  if (!state.player.bestiarySeen.includes(enemyId)) {
    state.player.bestiarySeen.push(enemyId);
    return true;
  }
  return false;
}

export function meetNpc(state, npcId) {
  if (!state.player.bestiarySeen.includes(npcId)) {
    state.player.bestiarySeen.push(npcId);
    return true;
  }
  return false;
}

export function hasItemTaken(state, id) {
  return state.taken.includes(id);
}

export function takeItem(state, id) {
  if (state.taken.includes(id)) return false;
  state.taken.push(id);
  return true;
}

export function hasUsed(state, id) {
  return state.used.includes(id);
}

export function markUsed(state, id) {
  if (!state.used.includes(id)) state.used.push(id);
}

export function markVisited(state, roomId) {
  if (!state.visited.includes(roomId)) state.visited.push(roomId);
}

export function isBossResolved(state, enemyId) {
  return Boolean(state.player.bosses[enemyId]);
}

export function setBossOutcome(state, enemyId, outcome) {
  state.player.bosses[enemyId] = outcome;
}

export function addAlly(state, allyId) {
  state.player.allies[allyId] = true;
}

export function allyCount(player) {
  return Object.values(player.allies || {}).filter(Boolean).length;
}

export function bossResolved(player, bossId) {
  return Boolean(player.bosses?.[bossId]);
}

export function canBuy(state, price) {
  return state.player.seeds >= price;
}

export const SHOP_ITEM_KEYS = {
  'item:heal': { kind: 'item', itemId: 'heal' },
  'item:honey': { kind: 'item', itemId: 'honey' },
  'item:double': { kind: 'item', itemId: 'double' },
  'item:eye': { kind: 'item', itemId: 'eye' },
};
