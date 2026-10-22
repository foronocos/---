import { deepClone } from './util.js';

const SAVE_KEY = 'chiki_eclipse_save_v1';
const ENDINGS_KEY = 'chiki_eclipse_endings_v1';
const SETTINGS_KEY = 'chiki_eclipse_settings_v1';
const SAVE_VERSION = 1;

function storage() {
  try {
    const probe = '__chiki_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveGame(state) {
  const store = storage();
  if (!store || !state) return false;
  try {
    const payload = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      state: deepClone(state),
    };
    store.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function loadGame() {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(SAVE_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (!payload || payload.version !== SAVE_VERSION || !payload.state) return null;
    const state = payload.state;
    if (!state.player || !state.roomId || !state.player.classId) return null;
    if (typeof state.player.hp !== 'number' || Number.isNaN(state.player.hp)) return null;
    return state;
  } catch {
    return null;
  }
}

export function getSaveMeta() {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(SAVE_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (!payload || !payload.state) return null;
    const { state } = payload;
    return {
      savedAt: payload.savedAt || 0,
      chapter: state.chapter || 1,
      roomTitle: state.roomTitle || '',
      classId: state.player?.classId || '',
      hp: state.player?.hp ?? 0,
      maxHp: state.player?.maxHp ?? 0,
      seeds: state.player?.seeds ?? 0,
      ending: state.ending || null,
    };
  } catch {
    return null;
  }
}

export function deleteSave() {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(SAVE_KEY);
  } catch {
    // хранилище может быть недоступно в приватном режиме — игра продолжится без сохранения
  }
}

export function hasSave() {
  return Boolean(getSaveMeta());
}

export function loadEndingsSeen() {
  const store = storage();
  if (!store) return [];
  try {
    const raw = store.getItem(ENDINGS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function markEndingSeen(endingId) {
  const seen = new Set(loadEndingsSeen());
  seen.add(endingId);
  const store = storage();
  if (store) {
    try {
      store.setItem(ENDINGS_KEY, JSON.stringify([...seen]));
    } catch {
      // игнорируем переполнение хранилища
    }
  }
  return [...seen];
}

export function loadSettings() {
  const store = storage();
  const defaults = { sound: true };
  if (!store) return defaults;
  try {
    const raw = store.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings) {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // настройки не критичны для игры
  }
}

export { SAVE_KEY, SAVE_VERSION };
