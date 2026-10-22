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
  tonic: {
    id: 'tonic',
    name: 'Настойка из коры',
    short: 'Настойка',
    icon: 'honey',
    kind: 'battle',
    desc: 'Восстанавливает 12 HP. Пахнет подвалом и немного — надеждой.',
    price: 3,
    use: { type: 'heal', amount: 12 },
  },
  charm: {
    id: 'charm',
    name: 'Талисман из перьев',
    short: 'Талисман',
    icon: 'feather',
    kind: 'battle',
    desc: '+3 к урону следующего удара. Один раз за бой.',
    price: 3,
    use: { type: 'charm', amount: 3 },
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
  shard: {
    id: 'shard',
    name: 'Осколок Золотого Пера',
    desc: 'Кусочек утреннего света, который треснул и всё равно светит. Тёплый даже сквозь перья.',
  },
  feather: {
    id: 'feather',
    name: 'Золотое Перо',
    desc: 'Перо, которым была заперта балконная дверь. Тёплое, будто в нём остался кусочек утра.',
  },
};

export const ITEM_ORDER = ['heal', 'honey', 'tonic', 'double', 'charm'];

export function getItem(itemId) {
  return ITEMS[itemId] || null;
}
