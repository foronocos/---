export const ITEMS = {
  heal: {
    id: 'heal',
    name: 'Семечко-лечение',
    short: 'Семечко',
    icon: 'seed',
    kind: 'battle',
    desc: 'Восстанавливает 5 HP. Можно применить в бою, не тратя ход (один предмет за ход).',
    price: 1,
    use: { type: 'heal', amount: 5 },
  },
  honey: {
    id: 'honey',
    name: 'Медовая капля',
    short: 'Мёд',
    icon: 'honey',
    kind: 'battle',
    desc: 'Восстанавливает 9 HP. Тяжёлая, липкая и очень своевременная.',
    price: 2,
    use: { type: 'heal', amount: 9 },
  },
  double: {
    id: 'double',
    name: 'Двойное зерно',
    short: 'Зерно',
    icon: 'grain',
    kind: 'battle',
    desc: 'Удваивает урон первого удара в бою. Применяется бесплатно, один раз за бой.',
    price: 2,
    use: { type: 'double' },
  },
  eye: {
    id: 'eye',
    name: 'Глаз Голубя',
    short: 'Глаз',
    icon: 'eye',
    kind: 'relic',
    desc: 'Показывает точное намерение врага до его хода. Покупается один раз, работает всегда.',
    price: 3,
  },
};

export const KEY_ITEMS = {
  key: {
    id: 'key',
    name: 'Запасной ключ от балкона',
    desc: 'Медный ключ, который годы пылился в мешке пылесоса. Пахнет металлом и надеждой.',
  },
  feather: {
    id: 'feather',
    name: 'Золотое Перо',
    desc: 'Перо, которым была заперта балконная дверь. Тёплое, будто в нём остался кусочек утра.',
  },
};

export const ITEM_ORDER = ['heal', 'honey', 'double'];

export function getItem(itemId) {
  return ITEMS[itemId] || null;
}
