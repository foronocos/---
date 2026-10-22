export const CLASSES = [
  {
    id: 'knight',
    name: 'Пернатый Рыцарь',
    role: 'стойкий и прямой',
    hp: 12,
    bonus: 2,
    accent: '#f0c75e',
    blurb:
      'Чики, который решил, что если уж выходить из клетки — то с высоко поднятой головой. Держит удар и отвечает.',
    skill: {
      id: 'shield',
      name: 'Щит крыла',
      desc: 'Раз за бой: следующий удар врага наносит ровно 1 урон.',
      kind: 'shield',
    },
    upgrades: [
      {
        id: 'vitality',
        name: 'Крепкое перо',
        desc: '+3 к максимальному здоровью.',
        price: 2,
        effect: { maxHp: 3 },
      },
      {
        id: 'skill2',
        name: 'Второе крыло',
        desc: '«Щит крыла» можно применить второй раз за бой.',
        price: 2,
        effect: { skillUses: 1 },
      },
      {
        id: 'special',
        name: 'Стальное крыло',
        desc: 'Каждый удар врага ослабляется на 2 (минимум 1).',
        price: 2,
        effect: { absorb: 2 },
      },
    ],
    tips: ['Надёжен в затяжных боях.', 'Щит особенно хорош против Макарон.'],
  },
  {
    id: 'mage',
    name: 'Семечковый Магистр',
    role: 'хрупкий, но точный',
    hp: 9,
    bonus: 1,
    accent: '#8fd3a8',
    blurb:
      'Чики, который пересчитал все семечки в клетке и выучил их язык. Бьёт быстро и больно, но сам тонкий, как шелуха.',
    skill: {
      id: 'volley',
      name: 'Залп семечек',
      desc: 'Раз за бой: два удара подряд по одному броску каждый.',
      kind: 'volley',
    },
    upgrades: [
      {
        id: 'vitality',
        name: 'Полный зоб',
        desc: '+3 к максимальному здоровью.',
        price: 2,
        effect: { maxHp: 3 },
      },
      {
        id: 'skill2',
        name: 'Двойная горсть',
        desc: '«Залп семечек» можно применить второй раз за бой.',
        price: 2,
        effect: { skillUses: 1 },
      },
      {
        id: 'special',
        name: 'Зоркий глаз',
        desc: 'Критический удар (шестёрка) наносит тройной урон вместо двойного.',
        price: 2,
        effect: { critMult: 3 },
      },
    ],
    tips: ['Криты случаются часто — не бойся рисковать.', 'Держи лечение под рукой.'],
  },
  {
    id: 'shadow',
    name: 'Тень Клетки',
    role: 'тихий и опасный',
    hp: 10,
    bonus: 0,
    accent: '#a58ad8',
    blurb:
      'Чики, который годами изучал тени прутьев и научился быть незаметнее собственного отражения. Один точный удар решает всё.',
    skill: {
      id: 'backstab',
      name: 'Клюв в спину',
      desc: 'Раз за бой: следующий удар наносит удвоенный урон.',
      kind: 'backstab',
    },
    upgrades: [
      {
        id: 'vitality',
        name: 'Ночное перо',
        desc: '+3 к максимальному здоровью.',
        price: 2,
        effect: { maxHp: 3 },
      },
      {
        id: 'skill2',
        name: 'Вторая тень',
        desc: '«Клюв в спину» можно применить второй раз за бой.',
        price: 2,
        effect: { skillUses: 1 },
      },
      {
        id: 'special',
        name: 'Обратный коготь',
        desc: 'Атакующий враг получает 1 урон в ответ.',
        price: 2,
        effect: { reflect: 1 },
      },
    ],
    tips: ['Комбинируй «Клюв в спину» с шестёркой — получится 24 урона.', 'Избегай затяжных боёв.'],
  },
];

export const CLASS_UPGRADE_PRICE = 2;
export const ULT_PRICE = 6;

export function getClass(classId) {
  return CLASSES.find((cls) => cls.id === classId) || CLASSES[0];
}

export function getUpgrade(classId, upgradeId) {
  return getClass(classId).upgrades.find((upgrade) => upgrade.id === upgradeId) || null;
}

export function getSkill(classId) {
  return getClass(classId).skill;
}
