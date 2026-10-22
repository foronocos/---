import { getUpgrade, ULT_PRICE } from './classes.js';

export const SHOPS = {
  tarakan: {
    id: 'tarakan',
    name: 'Таракан-Торговец',
    art: 'roach',
    tagline: 'Под ванной, между трубой и вечностью',
    getGreeting(state) {
      const seeds = state.player.seeds;
      if (seeds === 0) return '— Семян нет? Тогда бери глазами. Глаза бесплатно, но не отрываются.';
      if (state.chapter >= 3) return '— А, финальный клиент. Наверху сегодня жарко. Буквально.';
      if (state.chapter === 2) return '— Заходи, заходи. Товар свежий, пыль вчерашняя.';
      return '— Первый раз вижу попугая, который вышел из клетки. Это надо отметить. Скидка не будет, но уважение — да.';
    },
    stock(state) {
      const chapter = state.chapter;
      const list = [
        { key: 'item:heal', price: 1 },
        { key: 'item:double', price: 2 },
        { key: 'healService', price: 2 },
        { key: 'upgrade:vitality', price: 2 },
        { key: 'upgrade:skill2', price: 2 },
        { key: 'upgrade:special', price: 2 },
      ];
      if (chapter >= 2) {
        list.splice(1, 0, { key: 'item:honey', price: 2 });
        list.push({ key: 'ult', price: ULT_PRICE });
      }
      if (chapter >= 3) {
        list.push({ key: 'item:double', price: 1, tag: 'распродажа' });
      }
      return list;
    },
    getClosing(state) {
      return state.player.seeds > 0
        ? '— Приходи ещё. Если выживешь, конечно. Шучу. Почти.'
        : '— Всё, иди. У меня обед: крошка от печенья с 2019 года.';
    },
  },
  pigeon: {
    id: 'pigeon',
    name: 'Гоша-Голубь',
    art: 'pigeon',
    tagline: 'подоконник, вид на город, наличные только семенами',
    getGreeting(state) {
      const player = state.player;
      if (player.allies.pigeon) return '— О, напарник. Контракт в силе. Лети, я прикрою.';
      if (state.chapter >= 3) return '— Слышал, ты дошёл до кухни. Солидно. Есть кое-что редкое.';
      return '— Эй, жёлтый! Да, ты. Хочешь совет? Совет стоит семя. Хочешь вещь? Вещь стоит два.';
    },
    stock(state) {
      const chapter = state.chapter;
      const list = [
        { key: 'item:eye', price: 3 },
        { key: 'item:honey', price: 2 },
        { key: 'ally:pigeon', price: 4 },
        { key: 'hint:finale', price: 1 },
        { key: 'ult', price: ULT_PRICE },
      ];
      if (chapter >= 3) {
        list.push({ key: 'item:double', price: 3, tag: 'редкое' });
        list.push({ key: 'item:heal', price: 1 });
      }
      return list;
    },
    getClosing(state) {
      return state.chapter >= 3
        ? '— И помни: в финале важно не то, что ты возьмёшь. А то, с кем ты туда придёшь.'
        : '— Не задерживайся. Утро само себя не встретит.';
    },
  },
};

export function getShop(shopId) {
  return SHOPS[shopId] || null;
}

export function describeStockEntry(state, entry) {
  const { player } = state;
  if (entry.key.startsWith('item:')) {
    const itemId = entry.key.slice(5);
    const names = { heal: 'Семечко-лечение', honey: 'Медовая капля', double: 'Двойное зерно', eye: 'Глаз Голубя' };
    const descs = {
      heal: 'Восстанавливает 5 HP. Применяется в бою без траты хода.',
      honey: 'Восстанавливает 9 HP. Один предмет за ход.',
      double: 'Первый удар боя наносит двойной урон.',
      eye: 'Точные намерения врагов до их хода.',
    };
    if (itemId === 'eye' && player.hasEye) {
      return { name: names[itemId], desc: descs[itemId], owned: true, affordable: false };
    }
    return {
      name: names[itemId] || itemId,
      desc: descs[itemId] || '',
      count: player.items[itemId] || 0,
      affordable: player.seeds >= entry.price,
    };
  }
  if (entry.key.startsWith('upgrade:')) {
    const upgradeId = entry.key.slice(8);
    const upgrade = getUpgrade(player.classId, upgradeId);
    return {
      name: upgrade.name,
      desc: upgrade.desc,
      owned: Boolean(player.upgrades[upgradeId]),
      affordable: player.seeds >= entry.price,
    };
  }
  if (entry.key === 'ult') {
    return {
      name: 'Эхо Первой Семечки',
      desc: 'Один раз за игру отменить свой ход, включая смертельный.',
      owned: player.ultOwned,
      affordable: player.seeds >= entry.price,
    };
  }
  if (entry.key === 'ally:pigeon') {
    return {
      name: 'Голубиный контракт',
      desc: 'Гоша будет наносить 3 урона в начале каждого боя. Один раз.',
      owned: player.allies.pigeon,
      affordable: player.seeds >= entry.price,
    };
  }
  if (entry.key === 'hint:finale') {
    return {
      name: 'Подсказка о финале',
      desc: 'Гоша расскажет, от чего зависит утро. Не спойлер — предчувствие.',
      owned: Boolean(player.flags.boughtHint),
      affordable: player.seeds >= entry.price,
    };
  }
  if (entry.key === 'healService') {
    return {
      name: 'Тёплый пар',
      desc: 'Полностью восстанавливает здоровье. Таракан деликатно отворачивается.',
      affordable: player.seeds >= entry.price,
      disabled: player.hp >= player.maxHp,
    };
  }
  return { name: entry.key, desc: '', affordable: false };
}
