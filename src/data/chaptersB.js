import { bossResolved } from '../game/state.js';

/**
 * Акт II: шесть глав за пределами квартиры.
 * Каждая комната описывает не только интерактивные предметы, но и слой декора:
 * `decor.back` рисуется за мебелью, `decor.front` — перед ней (с параллаксом),
 * `decor.ambient` задаёт тип частиц в воздухе.
 */

const keysDialogue = (state) => {
  const outcome = state.player.bosses.keys;
  if (outcome === 'spare') return 'keys_ally';
  if (outcome === 'kill') return 'keys_grave';
  if (!state.player.flags.metKeys) return 'keys_meet';
  return 'keys_again';
};

const boilerDialogue = (state) => {
  const outcome = state.player.bosses.boiler;
  if (outcome === 'spare') return 'boiler_ally';
  if (outcome === 'kill') return 'boiler_grave';
  if (!state.player.flags.metBoiler) return 'boiler_meet';
  return 'boiler_again';
};

const mothDialogue = (state) => {
  const outcome = state.player.bosses.moth;
  if (outcome === 'spare') return 'moth_ally';
  if (outcome === 'kill') return 'moth_grave';
  if (!state.player.flags.metMoth) return 'moth_meet';
  return 'moth_again';
};

const ravenDialogue = (state) => {
  const outcome = state.player.bosses.raven;
  if (outcome === 'spare') return 'raven_ally';
  if (outcome === 'kill') return 'raven_grave';
  if (!state.player.flags.metRaven) return 'raven_meet';
  return 'raven_again';
};

const shadowDialogue = (state) => {
  const outcome = state.player.bosses.shadow;
  if (outcome === 'spare') return 'shadow_ally';
  if (outcome === 'kill') return 'shadow_grave';
  if (!state.player.flags.metShadow) return 'shadow_meet';
  return 'shadow_again';
};

const shunyaDialogue = (state) => {
  const outcome = state.player.bosses.shunya;
  if (outcome === 'spare') return 'shunya_ally';
  if (outcome === 'kill') return 'shunya_grave';
  if (!state.player.flags.metShunya) return 'shunya_meet';
  return 'shunya_again';
};

export const ROOMS_ACT2 = {
  // ------------------------------------------------------------------ глава V
  stairs: {
    id: 'stairs',
    chapter: 5,
    title: 'Лестничная клетка',
    subtitle: 'дом продолжается за дверью',
    width: 2000,
    floorY: 600,
    spawn: 180,
    art: 'stairs',
    onEnter(state) {
      if (!state.player.flags.act2Intro) return 'act2_intro';
      return null;
    },
    decor: {
      ambient: 'dust',
      back: [
        { art: 'wallTiles', x: 0, y: 0, w: 2000, h: 600 },
        { art: 'pipes', x: 260, y: 0, w: 34, h: 470 },
        { art: 'bulb', x: 980, y: 40, w: 26, h: 120 },
        { art: 'railing', x: 1300, y: 330, w: 420, h: 260 },
        { art: 'stairsUp', x: 1500, y: 200, w: 360, h: 400 },
        { art: 'graffiti', x: 620, y: 300, w: 220, h: 150 },
        { art: 'meterBox', x: 120, y: 250, w: 110, h: 160 },
        { art: 'window', x: 1750, y: 130, w: 190, h: 240 },
        { art: 'wires', x: 0, y: 80, w: 2000, h: 60 },
        { art: 'boots', x: 760, y: 545, w: 90, h: 55 },
        { art: 'cobweb', x: 900, y: 120, w: 160, h: 140 },
      ],
      front: [
        { art: 'railingFront', x: 120, y: 470, w: 260, h: 160, parallax: 0.22 },
        { art: 'pipesFront', x: 1900, y: 0, w: 40, h: 620, parallax: 0.3 },
      ],
    },
    doors: [
      {
        id: 'stairs_hall',
        x: 70,
        to: 'hall',
        spawnX: 1700,
        label: 'Обратно в квартиру',
        art: 'door',
      },
      {
        id: 'stairs_landing',
        x: 1880,
        to: 'landing',
        spawnX: 180,
        label: 'Выше по лестнице',
        art: 'arch',
      },
    ],
    props: [
      {
        id: 'mailboxes',
        art: 'mailboxesProp',
        x: 300,
        y: 380,
        w: 230,
        h: 210,
        label: 'Почтовые ящики',
        type: 'talk',
        dialogue: 'stairs_mail',
      },
      {
        id: 'notice',
        art: 'noticeProp',
        x: 640,
        y: 300,
        w: 190,
        h: 150,
        label: 'Объявление',
        type: 'talk',
        dialogue: 'stairs_notice',
      },
      {
        id: 'scooter',
        art: 'scooterProp',
        x: 1130,
        y: 470,
        w: 210,
        h: 130,
        label: 'Самокат соседа',
        type: 'loot',
        seeds: 2,
        takenId: 'stairs_scooter',
        lootToast: 'В корзине самоката — два семечка и фантик. Кто-то катал на них кота.',
      },
      {
        id: 'stair_note',
        art: 'wallNote',
        x: 430,
        y: 180,
        w: 100,
        h: 90,
        label: 'Записка на стене',
        type: 'talk',
        dialogue: 'stairs_note',
      },
    ],
  },

  landing: {
    id: 'landing',
    chapter: 5,
    title: 'Площадка',
    subtitle: 'здесь решают, кто куда пойдёт',
    width: 1800,
    floorY: 600,
    spawn: 170,
    art: 'landing',
    decor: {
      ambient: 'dust',
      back: [
        { art: 'wallTiles', x: 0, y: 0, w: 1800, h: 600 },
        { art: 'doorRows', x: 120, y: 240, w: 300, h: 360 },
        { art: 'doorRows', x: 1420, y: 240, w: 300, h: 360 },
        { art: 'elevator', x: 700, y: 220, w: 300, h: 380 },
        { art: 'bulb', x: 560, y: 30, w: 24, h: 110 },
        { art: 'plant', x: 1150, y: 470, w: 150, h: 150 },
        { art: 'wires', x: 0, y: 70, w: 1800, h: 50 },
        { art: 'cobweb', x: 1600, y: 100, w: 170, h: 150 },
        { art: 'puddle', x: 400, y: 630, w: 260, h: 50 },
        { art: 'numbers', x: 470, y: 230, w: 90, h: 60 },
        { art: 'numbers', x: 1300, y: 230, w: 90, h: 60 },
      ],
      front: [
        { art: 'railingFront', x: 1620, y: 470, w: 180, h: 160, parallax: 0.25 },
      ],
    },
    doors: [
      {
        id: 'landing_stairs',
        x: 70,
        to: 'stairs',
        spawnX: 1800,
        label: 'Вниз по лестнице',
        art: 'door',
      },
      {
        id: 'landing_basement',
        x: 430,
        to: 'basement',
        spawnX: 170,
        label: 'В подвал',
        art: 'door',
        getLocked(state) {
          return bossResolved(state.player, 'keys') ? null : 'landing_locked';
        },
      },
      {
        id: 'landing_attic',
        x: 1300,
        to: 'attic',
        spawnX: 170,
        label: 'На чердак',
        art: 'door',
        getLocked(state) {
          return bossResolved(state.player, 'keys') ? null : 'landing_locked';
        },
      },
    ],
    props: [
      {
        id: 'keys',
        art: 'keysBoss',
        x: 980,
        y: 300,
        w: 260,
        h: 300,
        label: 'Связка ключей',
        type: 'talk',
        getDialogue: keysDialogue,
        getLabel(state) {
          const outcome = state.player.bosses.keys;
          if (outcome === 'spare') return 'Ключница, союзница';
          if (outcome === 'kill') return 'Рассыпанные ключи';
          return 'Ключница';
        },
      },
      {
        id: 'elevator',
        art: 'elevatorProp',
        x: 700,
        y: 240,
        w: 300,
        h: 360,
        label: 'Лифт',
        type: 'talk',
        dialogue: 'landing_elevator',
      },
      {
        id: 'chute',
        art: 'chuteProp',
        x: 1500,
        y: 380,
        w: 150,
        h: 220,
        label: 'Мусоропровод',
        type: 'loot',
        seeds: 2,
        takenId: 'landing_chute',
        lootToast: 'В мусоропроводе застряло семя и чей-то давний список покупок.',
      },
    ],
  },

  // ----------------------------------------------------------------- глава VI
  basement: {
    id: 'basement',
    chapter: 6,
    title: 'Подвал',
    subtitle: 'пахнет сыростью и чужими секретами',
    width: 2300,
    floorY: 600,
    spawn: 160,
    art: 'basement',
    decor: {
      ambient: 'drip',
      back: [
        { art: 'brickWall', x: 0, y: 0, w: 2300, h: 600 },
        { art: 'pipesLong', x: 0, y: 120, w: 2300, h: 40 },
        { art: 'pipesLong', x: 0, y: 190, w: 2300, h: 26 },
        { art: 'valves', x: 520, y: 120, w: 90, h: 110 },
        { art: 'valves', x: 1760, y: 100, w: 80, h: 100 },
        { art: 'bike', x: 1180, y: 430, w: 300, h: 170 },
        { art: 'shelves', x: 1450, y: 330, w: 260, h: 270 },
        { art: 'puddle', x: 300, y: 630, w: 320, h: 60 },
        { art: 'puddle', x: 900, y: 645, w: 260, h: 50 },
        { art: 'mushrooms', x: 700, y: 540, w: 120, h: 70 },
        { art: 'crates', x: 1900, y: 440, w: 280, h: 170 },
        { art: 'cobweb', x: 100, y: 90, w: 180, h: 160 },
        { art: 'lamp', x: 1050, y: 40, w: 20, h: 100 },
      ],
      front: [
        { art: 'pipesFront', x: 80, y: 0, w: 60, h: 660, parallax: 0.3 },
        { art: 'cobweb', x: 1180, y: 60, w: 240, h: 200, parallax: 0.18, alpha: 0.5 },
      ],
    },
    doors: [
      {
        id: 'basement_landing',
        x: 70,
        to: 'landing',
        spawnX: 500,
        label: 'Наверх, на площадку',
        art: 'arch',
      },
      {
        id: 'basement_boiler',
        x: 2200,
        to: 'boiler',
        spawnX: 160,
        label: 'В котельную',
        art: 'door',
        labelOffset: -120,
      },
    ],
    props: [
      {
        id: 'meters',
        art: 'meterProp',
        x: 240,
        y: 280,
        w: 180,
        h: 190,
        label: 'Счётчики',
        type: 'talk',
        dialogue: 'basement_note',
      },
      {
        id: 'basement_mushrooms',
        art: 'mushroomsProp',
        x: 760,
        y: 520,
        w: 140,
        h: 90,
        label: 'Грибы у стены',
        type: 'loot',
        seeds: 2,
        takenId: 'basement_mushrooms',
        lootToast: 'Под грибами — тайничок: два семени, завёрнутые в паутину.',
      },
      {
        id: 'basement_water',
        art: 'puddleProp',
        x: 380,
        y: 600,
        w: 280,
        h: 70,
        label: 'Лужа',
        type: 'talk',
        dialogue: 'basement_puddle',
      },
      {
        id: 'basement_note',
        art: 'wallNote',
        x: 1560,
        y: 220,
        w: 100,
        h: 90,
        label: 'Табличка у щитка',
        type: 'talk',
        dialogue: 'basement_board',
      },
    ],
  },

  boiler: {
    id: 'boiler',
    chapter: 6,
    title: 'Котельная',
    subtitle: 'сердце дома бьётся неровно',
    width: 1900,
    floorY: 600,
    spawn: 170,
    art: 'boiler',
    decor: {
      ambient: 'steam',
      back: [
        { art: 'brickWall', x: 0, y: 0, w: 1900, h: 600 },
        { art: 'pipesLong', x: 0, y: 90, w: 1900, h: 50 },
        { art: 'valves', x: 320, y: 90, w: 100, h: 120 },
        { art: 'boilerTank', x: 1380, y: 250, w: 330, h: 350 },
        { art: 'gauge', x: 1180, y: 220, w: 120, h: 120 },
        { art: 'coalPile', x: 620, y: 540, w: 260, h: 80 },
        { art: 'lamp', x: 800, y: 40, w: 20, h: 110 },
        { art: 'crates', x: 150, y: 460, w: 200, h: 150 },
        { art: 'cobweb', x: 1700, y: 80, w: 180, h: 160 },
        { art: 'mushrooms', x: 980, y: 550, w: 100, h: 60 },
      ],
      front: [
        { art: 'pipesFront', x: 0, y: 0, w: 70, h: 660, parallax: 0.3 },
        { art: 'steamCloud', x: 1250, y: 200, w: 300, h: 300, parallax: 0.15, alpha: 0.35 },
      ],
    },
    doors: [
      {
        id: 'boiler_basement',
        x: 70,
        to: 'basement',
        spawnX: 2080,
        label: 'Назад в подвал',
        art: 'arch',
      },
    ],
    props: [
      {
        id: 'boiler',
        art: 'boilerBoss',
        x: 1320,
        y: 280,
        w: 320,
        h: 320,
        label: 'Котёл-Ворчун',
        type: 'talk',
        getDialogue: boilerDialogue,
        getLabel(state) {
          const outcome = state.player.bosses.boiler;
          if (outcome === 'spare') return 'Котёл-Ворчун, союзник';
          if (outcome === 'kill') return 'Остывший котёл';
          return 'Котёл-Ворчун';
        },
      },
      {
        id: 'boiler_valve',
        art: 'valveProp',
        x: 380,
        y: 330,
        w: 150,
        h: 200,
        label: 'Вентиль',
        type: 'talk',
        dialogue: 'boiler_valve',
      },
      {
        id: 'boiler_note',
        art: 'wallNote',
        x: 900,
        y: 210,
        w: 100,
        h: 90,
        label: 'Инструкция',
        type: 'talk',
        dialogue: 'boiler_manual',
      },
      {
        id: 'coal',
        art: 'coalProp',
        x: 700,
        y: 545,
        w: 160,
        h: 70,
        label: 'Куча угля',
        type: 'loot',
        seeds: 2,
        takenId: 'boiler_coal',
        lootToast: 'В угле блеснули два семени. Тёплые, как сам котёл.',
      },
    ],
  },

  // ---------------------------------------------------------------- глава VII
  attic: {
    id: 'attic',
    chapter: 7,
    title: 'Чердак',
    subtitle: 'здесь хранят то, что жалко выбросить',
    width: 2400,
    floorY: 600,
    spawn: 170,
    art: 'attic',
    decor: {
      ambient: 'dust',
      back: [
        { art: 'roofBeams', x: 0, y: 0, w: 2400, h: 600 },
        { art: 'skylight', x: 1010, y: 60, w: 300, h: 220 },
        { art: 'boxPile', x: 240, y: 420, w: 330, h: 200 },
        { art: 'boxPile', x: 700, y: 460, w: 260, h: 160 },
        { art: 'mannequin', x: 1620, y: 280, w: 210, h: 330 },
        { art: 'oldChair', x: 1950, y: 430, w: 190, h: 190 },
        { art: 'cobweb', x: 380, y: 80, w: 220, h: 190 },
        { art: 'cobweb', x: 1900, y: 90, w: 200, h: 170 },
        { art: 'hangingClothes', x: 1250, y: 120, w: 300, h: 260 },
        { art: 'toys', x: 420, y: 555, w: 160, h: 60 },
        { art: 'lamp', x: 600, y: 60, w: 18, h: 130 },
      ],
      front: [
        { art: 'beamFront', x: 1500, y: 0, w: 120, h: 700, parallax: 0.28 },
        { art: 'dustSheet', x: 60, y: 420, w: 220, h: 220, parallax: 0.16 },
      ],
    },
    doors: [
      {
        id: 'attic_landing',
        x: 70,
        to: 'landing',
        spawnX: 1300,
        label: 'Вниз, на площадку',
        art: 'door',
      },
      {
        id: 'attic_trunks',
        x: 2300,
        to: 'trunks',
        spawnX: 170,
        label: 'В сундучный угол',
        art: 'arch',
        getLocked(state) {
          return bossResolved(state.player, 'keys') ? null : 'attic_locked';
        },
      },
      {
        id: 'attic_roof',
        x: 1180,
        to: 'roof',
        spawnX: 200,
        label: 'Люк на крышу',
        art: 'hatch',
        labelOffset: -120,
        getLocked(state) {
          return bossResolved(state.player, 'moth') ? null : 'roof_locked';
        },
      },
    ],
    props: [
      {
        id: 'skylight',
        art: 'skylightProp',
        x: 1000,
        y: 60,
        w: 320,
        h: 220,
        label: 'Слуховое окно',
        type: 'talk',
        dialogue: 'attic_skylight',
      },
      {
        id: 'toybox',
        art: 'toyBoxProp',
        x: 380,
        y: 500,
        w: 200,
        h: 110,
        label: 'Ящик с игрушками',
        type: 'loot',
        seeds: 2,
        takenId: 'attic_toys',
        lootToast: 'Среди игрушек — два семени и оловянный солдатик без головы.',
      },
      {
        id: 'attic_note',
        art: 'wallNote',
        x: 1500,
        y: 220,
        w: 100,
        h: 90,
        label: 'Старая открытка',
        type: 'talk',
        dialogue: 'attic_card',
      },
      {
        id: 'clothes',
        art: 'clothesProp',
        x: 1250,
        y: 130,
        w: 300,
        h: 260,
        label: 'Развешанная одежда',
        type: 'talk',
        dialogue: 'attic_clothes',
      },
    ],
  },

  trunks: {
    id: 'trunks',
    chapter: 7,
    title: 'Сундучный угол',
    subtitle: 'тут моль хранит память',
    width: 2000,
    floorY: 600,
    spawn: 160,
    art: 'trunks',
    decor: {
      ambient: 'moth',
      back: [
        { art: 'roofBeams', x: 0, y: 0, w: 2000, h: 600 },
        { art: 'chestStack', x: 260, y: 400, w: 300, h: 230 },
        { art: 'chestStack', x: 640, y: 450, w: 260, h: 190 },
        { art: 'gramophoneStand', x: 1450, y: 400, w: 260, h: 230 },
        { art: 'fabrics', x: 1000, y: 300, w: 340, h: 260 },
        { art: 'cobweb', x: 780, y: 70, w: 240, h: 190 },
        { art: 'cobweb', x: 1700, y: 90, w: 200, h: 160 },
        { art: 'lamp', x: 1150, y: 50, w: 18, h: 120 },
        { art: 'toys', x: 1760, y: 550, w: 140, h: 60 },
        { art: 'mothSwarm', x: 1200, y: 200, w: 260, h: 240 },
      ],
      front: [
        { art: 'fabricFront', x: 0, y: 620, w: 260, h: 160, parallax: 0.2 },
      ],
    },
    doors: [
      {
        id: 'trunks_attic',
        x: 70,
        to: 'attic',
        spawnX: 2180,
        label: 'Назад на чердак',
        art: 'arch',
      },
    ],
    props: [
      {
        id: 'moth',
        art: 'mothBoss',
        x: 1240,
        y: 250,
        w: 300,
        h: 320,
        label: 'Моль-Хранительница',
        type: 'talk',
        getDialogue: mothDialogue,
        getLabel(state) {
          const outcome = state.player.bosses.moth;
          if (outcome === 'spare') return 'Моль-Хранительница, союзница';
          if (outcome === 'kill') return 'Пыль на сундуках';
          return 'Моль-Хранительница';
        },
      },
      {
        id: 'chest',
        art: 'chestProp',
        x: 480,
        y: 470,
        w: 220,
        h: 140,
        label: 'Сундук с замком',
        type: 'loot',
        seeds: 3,
        takenId: 'trunks_chest',
        lootToast: 'В сундуке — три семени и чей-то первый зуб. Семена полезнее.',
      },
      {
        id: 'gramophone',
        art: 'gramophoneProp',
        x: 1470,
        y: 410,
        w: 220,
        h: 190,
        label: 'Патефон',
        type: 'talk',
        dialogue: 'trunks_gramophone',
      },
      {
        id: 'trunks_note',
        art: 'wallNote',
        x: 900,
        y: 200,
        w: 100,
        h: 90,
        label: 'Ярлык от пальто',
        type: 'talk',
        dialogue: 'trunks_label',
      },
    ],
  },

  // --------------------------------------------------------------- глава VIII
  roof: {
    id: 'roof',
    chapter: 8,
    title: 'Крыша',
    subtitle: 'ветер, город и ни одной стены',
    width: 2500,
    floorY: 600,
    spawn: 190,
    art: 'roof',
    decor: {
      ambient: 'wind',
      back: [
        { art: 'roofSky', x: 0, y: 0, w: 2500, h: 600 },
        { art: 'cityline', x: 0, y: 330, w: 2500, h: 270 },
        { art: 'roofSurface', x: 0, y: 560, w: 2500, h: 160 },
        { art: 'chimney', x: 560, y: 300, w: 180, h: 280 },
        { art: 'clothesline', x: 900, y: 250, w: 520, h: 160 },
        { art: 'satellite', x: 1580, y: 300, w: 220, h: 250 },
        { art: 'stairBox', x: 1900, y: 260, w: 340, h: 320 },
        { art: 'rainPuddle', x: 420, y: 620, w: 300, h: 60 },
        { art: 'pigeons', x: 1250, y: 520, w: 200, h: 70 },
        { art: 'wires', x: 0, y: 120, w: 2500, h: 50 },
      ],
      front: [
        { art: 'wires', x: 0, y: 60, w: 2500, h: 60, parallax: 0.15, alpha: 0.55 },
      ],
    },
    doors: [
      {
        id: 'roof_attic',
        x: 70,
        to: 'attic',
        spawnX: 1180,
        label: 'Вниз, на чердак',
        art: 'hatch',
      },
      {
        id: 'roof_antennas',
        x: 2400,
        to: 'antennas',
        spawnX: 180,
        label: 'К антеннам',
        art: 'arch',
      },
    ],
    props: [
      {
        id: 'roof_line',
        art: 'clotheslineProp',
        x: 950,
        y: 260,
        w: 480,
        h: 160,
        label: 'Бельё на верёвке',
        type: 'loot',
        item: 'honey',
        takenId: 'roof_laundry',
        lootToast: 'В кармане забытого халата — капля мёда в бумажке. Ещё тёплая.',
      },
      {
        id: 'roof_dish',
        art: 'dishProp',
        x: 1600,
        y: 310,
        w: 220,
        h: 240,
        label: 'Спутниковая тарелка',
        type: 'talk',
        dialogue: 'roof_dish',
      },
      {
        id: 'roof_note',
        art: 'wallNote',
        x: 1980,
        y: 300,
        w: 100,
        h: 90,
        label: 'Надпись на будке',
        type: 'talk',
        dialogue: 'roof_note',
      },
      {
        id: 'roof_pigeons',
        art: 'pigeonsProp',
        x: 1260,
        y: 520,
        w: 190,
        h: 80,
        label: 'Голуби',
        type: 'talk',
        dialogue: 'roof_pigeons',
      },
    ],
  },

  antennas: {
    id: 'antennas',
    chapter: 8,
    title: 'Антенное поле',
    subtitle: 'здесь собирают блестящее',
    width: 2100,
    floorY: 600,
    spawn: 170,
    art: 'antennas',
    decor: {
      ambient: 'wind',
      back: [
        { art: 'roofSky', x: 0, y: 0, w: 2100, h: 600 },
        { art: 'cityline', x: 0, y: 360, w: 2100, h: 240 },
        { art: 'roofSurface', x: 0, y: 560, w: 2100, h: 160 },
        { art: 'antennaForest', x: 260, y: 120, w: 620, h: 470 },
        { art: 'antennaForest', x: 1500, y: 170, w: 500, h: 420 },
        { art: 'dishBig', x: 1050, y: 280, w: 300, h: 300 },
        { art: 'wires', x: 0, y: 90, w: 2100, h: 70 },
        { art: 'rainPuddle', x: 700, y: 620, w: 280, h: 60 },
        { art: 'pigeons', x: 300, y: 530, w: 160, h: 60 },
      ],
      front: [
        { art: 'antennaFront', x: 1800, y: 60, w: 120, h: 620, parallax: 0.35 },
      ],
    },
    doors: [
      {
        id: 'antennas_roof',
        x: 70,
        to: 'roof',
        spawnX: 2320,
        label: 'Назад на крышу',
        art: 'arch',
      },
      {
        id: 'antennas_eclipse',
        x: 2000,
        to: 'eclipse',
        spawnX: 170,
        label: 'В затмение',
        art: 'arch',
        getLocked(state) {
          return bossResolved(state.player, 'raven') ? null : 'eclipse_locked';
        },
      },
    ],
    props: [
      {
        id: 'raven',
        art: 'ravenBoss',
        x: 980,
        y: 280,
        w: 300,
        h: 310,
        label: 'Ворон-Собиратель',
        type: 'talk',
        getDialogue: ravenDialogue,
        getLabel(state) {
          const outcome = state.player.bosses.raven;
          if (outcome === 'spare') return 'Ворон-Собиратель, союзник';
          if (outcome === 'kill') return 'Пустая антенна';
          return 'Ворон-Собиратель';
        },
      },
      {
        id: 'ravens_nest',
        art: 'nestProp',
        x: 380,
        y: 470,
        w: 220,
        h: 140,
        label: 'Гнездо ворона',
        type: 'loot',
        seeds: 3,
        takenId: 'antennas_nest',
        lootToast: 'В гнезде — фольга, стёкла и три семени. Блестит всё, полезны семена.',
      },
      {
        id: 'antennas_dish',
        art: 'dishProp',
        x: 1580,
        y: 320,
        w: 200,
        h: 220,
        label: 'Малая тарелка',
        type: 'talk',
        dialogue: 'antennas_dish',
      },
      {
        id: 'antennas_note',
        art: 'wallNote',
        x: 820,
        y: 230,
        w: 100,
        h: 90,
        label: 'Табличка антеннщика',
        type: 'talk',
        dialogue: 'antennas_sign',
      },
    ],
  },

  // ----------------------------------------------------------------- глава IX
  eclipse: {
    id: 'eclipse',
    chapter: 9,
    title: 'Затмение',
    subtitle: 'свет закончился на середине шага',
    width: 2200,
    floorY: 600,
    spawn: 170,
    art: 'eclipse',
    decor: {
      ambient: 'star',
      back: [
        { art: 'voidSky', x: 0, y: 0, w: 2200, h: 600 },
        { art: 'stars', x: 0, y: 0, w: 2200, h: 480 },
        { art: 'blackSun', x: 900, y: 90, w: 300, h: 300 },
        { art: 'roofSurface', x: 0, y: 560, w: 2200, h: 160 },
        { art: 'shadowTrees', x: 200, y: 330, w: 500, h: 270 },
        { art: 'mirrorShards', x: 1500, y: 380, w: 300, h: 220 },
        { art: 'featherPile', x: 780, y: 540, w: 200, h: 70 },
        { art: 'fogBank', x: 0, y: 460, w: 2200, h: 200 },
      ],
      front: [
        { art: 'fogBank', x: 0, y: 636, w: 2200, h: 120, parallax: 0.2, alpha: 0.4 },
        { art: 'featherFront', x: 1250, y: 300, w: 90, h: 180, parallax: 0.3 },
      ],
    },
    doors: [
      {
        id: 'eclipse_antennas',
        x: 70,
        to: 'antennas',
        spawnX: 1900,
        label: 'Назад к антеннам',
        art: 'arch',
      },
      {
        id: 'eclipse_mirror',
        x: 2100,
        to: 'mirrorRoof',
        spawnX: 170,
        label: 'Зеркальная площадка',
        art: 'arch',
      },
    ],
    props: [
      {
        id: 'eclipse_note',
        art: 'wallNote',
        x: 460,
        y: 260,
        w: 100,
        h: 90,
        label: 'Чёрная записка',
        type: 'talk',
        dialogue: 'eclipse_note',
      },
      {
        id: 'eclipse_feathers',
        art: 'featherPileProp',
        x: 800,
        y: 535,
        w: 180,
        h: 70,
        label: 'Груда чёрных перьев',
        type: 'loot',
        seeds: 3,
        takenId: 'eclipse_feathers',
        lootToast: 'Под чёрными перьями — три семени. Они светятся даже здесь.',
      },
      {
        id: 'eclipse_stars',
        art: 'starWellProp',
        x: 1560,
        y: 470,
        w: 220,
        h: 140,
        label: 'Провал в небе',
        type: 'talk',
        dialogue: 'eclipse_well',
      },
    ],
  },

  mirrorRoof: {
    id: 'mirrorRoof',
    chapter: 9,
    title: 'Зеркальная площадка',
    subtitle: 'здесь каждый видит себя',
    width: 1900,
    floorY: 600,
    spawn: 170,
    art: 'mirrorRoof',
    decor: {
      ambient: 'star',
      back: [
        { art: 'voidSky', x: 0, y: 0, w: 1900, h: 600 },
        { art: 'stars', x: 0, y: 0, w: 1900, h: 460 },
        { art: 'mirrorFloor', x: 0, y: 560, w: 1900, h: 160 },
        { art: 'mirrorWall', x: 300, y: 180, w: 1300, h: 400 },
        { art: 'mirrorShards', x: 1560, y: 400, w: 260, h: 200 },
        { art: 'fogBank', x: 0, y: 480, w: 1900, h: 180 },
        { art: 'blackSun', x: 1380, y: 70, w: 220, h: 220 },
      ],
      front: [
        { art: 'mirrorShardFront', x: 90, y: 300, w: 160, h: 300, parallax: 0.22 },
      ],
    },
    doors: [
      {
        id: 'mirror_eclipse',
        x: 70,
        to: 'eclipse',
        spawnX: 2000,
        label: 'Назад в затмение',
        art: 'arch',
      },
      {
        id: 'mirror_nest',
        x: 1820,
        to: 'nest',
        spawnX: 170,
        label: 'Туда, где гнездо',
        art: 'arch',
        getLocked(state) {
          return bossResolved(state.player, 'shadow') ? null : 'mirror_locked';
        },
      },
    ],
    props: [
      {
        id: 'shadow',
        art: 'shadowBoss',
        x: 900,
        y: 260,
        w: 300,
        h: 320,
        label: 'Тень Чики',
        type: 'talk',
        getDialogue: shadowDialogue,
        getLabel(state) {
          const outcome = state.player.bosses.shadow;
          if (outcome === 'spare') return 'Тень, которая осталась';
          if (outcome === 'kill') return 'Пустое отражение';
          return 'Тень Чики';
        },
      },
      {
        id: 'mirror_glass',
        art: 'mirrorProp',
        x: 1240,
        y: 300,
        w: 240,
        h: 300,
        label: 'Большое зеркало',
        type: 'talk',
        dialogue: 'mirror_reflection',
      },
      {
        id: 'mirror_shard',
        art: 'shardProp',
        x: 300,
        y: 540,
        w: 150,
        h: 60,
        label: 'Осколок',
        type: 'loot',
        seeds: 2,
        takenId: 'mirror_shard',
        lootToast: 'В осколке отразилось утро. Рядом лежали два семени.',
      },
    ],
  },

  // ----------------------------------------------------------------- глава X
  nest: {
    id: 'nest',
    chapter: 10,
    title: 'Гнездо Шуни',
    subtitle: 'выше, чем страшно',
    width: 2100,
    floorY: 600,
    spawn: 170,
    art: 'nest',
    decor: {
      ambient: 'feather',
      back: [
        { art: 'dawnSky', x: 0, y: 0, w: 2100, h: 600 },
        { art: 'cloudSea', x: 0, y: 380, w: 2100, h: 260 },
        { art: 'giantNest', x: 700, y: 300, w: 700, h: 320 },
        { art: 'goldThreads', x: 0, y: 100, w: 2100, h: 300 },
        { art: 'floatingFeathers', x: 0, y: 120, w: 2100, h: 400 },
        { art: 'sunRays', x: 1500, y: 0, w: 600, h: 600 },
      ],
      front: [
        { art: 'nestTwigs', x: 0, y: 640, w: 2100, h: 120, parallax: 0.25, alpha: 0.9 },
      ],
    },
    doors: [
      {
        id: 'nest_mirror',
        x: 70,
        to: 'mirrorRoof',
        spawnX: 1750,
        label: 'Вниз, в затмение',
        art: 'arch',
      },
      {
        id: 'nest_dawn',
        x: 2000,
        to: 'skyDawn',
        spawnX: 200,
        label: 'Навстречу рассвету',
        art: 'arch',
        getLocked(state) {
          return bossResolved(state.player, 'shunya') ? null : 'dawn_locked';
        },
      },
    ],
    props: [
      {
        id: 'shunya',
        art: 'shunyaBoss',
        x: 900,
        y: 250,
        w: 340,
        h: 340,
        label: 'Шуня',
        type: 'talk',
        getDialogue: shunyaDialogue,
        getLabel(state) {
          const outcome = state.player.bosses.shunya;
          if (outcome === 'spare') return 'Шуня, которая отпустила';
          if (outcome === 'kill') return 'Опустевшее гнездо';
          return 'Шуня';
        },
      },
      {
        id: 'nest_eggs',
        art: 'nestEggsProp',
        x: 1450,
        y: 500,
        w: 200,
        h: 110,
        label: 'Яйца в гнезде',
        type: 'loot',
        item: 'tonic',
        takenId: 'nest_eggs',
        lootToast: 'В гнезде лежала склянка настоя. Шуня явно готовилась к долгой ночи.',
      },
      {
        id: 'nest_note',
        art: 'wallNote',
        x: 520,
        y: 250,
        w: 100,
        h: 90,
        label: 'Записка, вплетённая в прутья',
        type: 'talk',
        dialogue: 'nest_note',
      },
      {
        id: 'nest_feathers',
        art: 'featherPileProp',
        x: 300,
        y: 545,
        w: 170,
        h: 70,
        label: 'Золотые перья',
        type: 'loot',
        seeds: 3,
        takenId: 'nest_feathers',
        lootToast: 'Три семени среди золотых перьев. Шуня собирала их очень давно.',
      },
    ],
  },

  skyDawn: {
    id: 'skyDawn',
    chapter: 10,
    title: 'Рассвет',
    subtitle: 'небо, в котором можно остаться',
    width: 1800,
    floorY: 600,
    spawn: 220,
    art: 'skyDawn',
    onEnter(state) {
      return state.ending ? null : 'finale2';
    },
    decor: {
      ambient: 'feather',
      back: [
        { art: 'dawnSky', x: 0, y: 0, w: 1800, h: 600 },
        { art: 'sunRising', x: 1150, y: 140, w: 340, h: 340 },
        { art: 'cloudSea', x: 0, y: 420, w: 1800, h: 240 },
        { art: 'citylineFar', x: 0, y: 470, w: 1800, h: 150 },
        { art: 'floatingFeathers', x: 0, y: 150, w: 1800, h: 380 },
        { art: 'goldThreads', x: 0, y: 60, w: 1800, h: 280 },
      ],
      front: [
        { art: 'dawnGlow', x: 0, y: 0, w: 1800, h: 720, parallax: 0.1, alpha: 0.4 },
      ],
    },
    doors: [],
    props: [
      {
        id: 'altar',
        art: 'altarProp',
        x: 800,
        y: 500,
        w: 240,
        h: 110,
        label: 'Место для пера',
        type: 'talk',
        dialogue: 'finale2',
      },
    ],
  },
};

// Дополнительный декор: комнаты должны быть обжитыми, а не пустыми.
const EXTRA_DECOR = {
  stairs: [
    { layer: 'back', art: 'bulb', x: 760, y: 40, w: 70, h: 120 },
    { layer: 'back', art: 'numbers', x: 210, y: 150, w: 140, h: 70 },
    { layer: 'back', art: 'doorRows', x: 1420, y: 150, w: 420, h: 400 },
    { layer: 'back', art: 'graffiti', x: 940, y: 300, w: 260, h: 200 },
    { layer: 'back', art: 'boots', x: 620, y: 500, w: 90, h: 90 },
    { layer: 'back', art: 'bike', x: 1680, y: 430, w: 260, h: 180 },
    { layer: 'back', art: 'plant', x: 1230, y: 430, w: 120, h: 180 },
    { layer: 'back', art: 'pipes', x: 30, y: 0, w: 90, h: 620 },
  ],
  landing: [
    { layer: 'back', art: 'numbers', x: 120, y: 170, w: 140, h: 70 },
    { layer: 'back', art: 'plant', x: 1120, y: 420, w: 130, h: 190 },
    { layer: 'back', art: 'bike', x: 240, y: 440, w: 260, h: 170 },
    { layer: 'back', art: 'cobweb', x: 1520, y: 40, w: 220, h: 190, alpha: 0.6 },
    { layer: 'back', art: 'puddle', x: 820, y: 590, w: 320, h: 70 },
    { layer: 'back', art: 'bulb', x: 600, y: 40, w: 70, h: 120 },
  ],
  basement: [
    { layer: 'back', art: 'crates', x: 240, y: 440, w: 220, h: 170 },
    { layer: 'back', art: 'coalPile', x: 1880, y: 500, w: 300, h: 120 },
    { layer: 'back', art: 'valves', x: 660, y: 170, w: 180, h: 150 },
    { layer: 'back', art: 'mushrooms', x: 1450, y: 540, w: 160, h: 90 },
    { layer: 'back', art: 'puddle', x: 880, y: 600, w: 380, h: 80 },
    { layer: 'back', art: 'meterBox', x: 1720, y: 210, w: 150, h: 200 },
    { layer: 'back', art: 'pipesLong', x: 1180, y: 40, w: 700, h: 70 },
    { layer: 'back', art: 'cobweb', x: 2100, y: 30, w: 200, h: 180, alpha: 0.55 },
  ],
  boiler: [
    { layer: 'back', art: 'boilerTank', x: 1120, y: 250, w: 320, h: 360 },
    { layer: 'back', art: 'gauge', x: 880, y: 190, w: 110, h: 110 },
    { layer: 'back', art: 'coalPile', x: 1520, y: 500, w: 300, h: 120 },
    { layer: 'back', art: 'crates', x: 230, y: 450, w: 220, h: 160 },
    { layer: 'back', art: 'pipesLong', x: 0, y: 60, w: 640, h: 70 },
    { layer: 'front', art: 'steamCloud', x: 1320, y: 200, w: 300, h: 300, parallax: 0.15, alpha: 0.35 },
  ],
  attic: [
    { layer: 'back', art: 'boxPile', x: 260, y: 430, w: 260, h: 190 },
    { layer: 'back', art: 'oldChair', x: 880, y: 440, w: 180, h: 180 },
    { layer: 'back', art: 'mannequin', x: 1420, y: 350, w: 160, h: 270 },
    { layer: 'back', art: 'toys', x: 700, y: 520, w: 200, h: 100 },
    { layer: 'back', art: 'skylight', x: 1880, y: 40, w: 220, h: 160 },
    { layer: 'back', art: 'cobweb', x: 150, y: 40, w: 220, h: 190, alpha: 0.6 },
    { layer: 'front', art: 'dustSheet', x: 2100, y: 400, w: 220, h: 220, parallax: 0.18 },
  ],
  trunks: [
    { layer: 'back', art: 'chestStack', x: 360, y: 440, w: 260, h: 190 },
    { layer: 'back', art: 'gramophoneStand', x: 1040, y: 400, w: 200, h: 220 },
    { layer: 'back', art: 'fabrics', x: 1520, y: 120, w: 300, h: 300 },
    { layer: 'back', art: 'hangingClothes', x: 760, y: 90, w: 320, h: 300 },
    { layer: 'back', art: 'boxPile', x: 1680, y: 450, w: 240, h: 170 },
    { layer: 'back', art: 'mothSwarm', x: 1260, y: 260, w: 240, h: 200 },
  ],
  roof: [
    { layer: 'back', art: 'satellite', x: 560, y: 300, w: 220, h: 240 },
    { layer: 'back', art: 'dishBig', x: 1980, y: 280, w: 280, h: 280 },
    { layer: 'back', art: 'stairBox', x: 260, y: 300, w: 300, h: 300 },
    { layer: 'back', art: 'pigeons', x: 1200, y: 520, w: 200, h: 80 },
    { layer: 'back', art: 'rainPuddle', x: 820, y: 610, w: 320, h: 70 },
    { layer: 'back', art: 'chimney', x: 1660, y: 320, w: 180, h: 280 },
    { layer: 'back', art: 'clothesline', x: 1900, y: 220, w: 460, h: 150 },
  ],
  antennas: [
    { layer: 'back', art: 'antennaForest', x: 0, y: 120, w: 720, h: 460 },
    { layer: 'back', art: 'dishBig', x: 700, y: 280, w: 260, h: 260 },
    { layer: 'back', art: 'satellite', x: 1450, y: 300, w: 220, h: 240 },
    { layer: 'back', art: 'pigeons', x: 380, y: 520, w: 190, h: 70 },
    { layer: 'back', art: 'crates', x: 1720, y: 470, w: 200, h: 150 },
    { layer: 'front', art: 'antennaFront', x: 150, y: 60, w: 100, h: 620, parallax: 0.4, alpha: 0.8 },
  ],
  eclipse: [
    { layer: 'back', art: 'shadowTrees', x: 0, y: 400, w: 700, h: 220 },
    { layer: 'back', art: 'featherPile', x: 1580, y: 550, w: 220, h: 90 },
    { layer: 'back', art: 'mirrorShards', x: 1000, y: 500, w: 260, h: 120 },
    { layer: 'back', art: 'wires', x: 0, y: 70, w: 2200, h: 60, alpha: 0.5 },
  ],
  mirrorRoof: [
    { layer: 'back', art: 'mirrorShards', x: 320, y: 320, w: 280, h: 300 },
    { layer: 'back', art: 'mirrorFloor', x: 0, y: 600, w: 1900, h: 120 },
    { layer: 'back', art: 'stars', x: 0, y: 0, w: 1900, h: 320, alpha: 0.7 },
    { layer: 'front', art: 'mirrorShardFront', x: 1420, y: 300, w: 160, h: 300, parallax: 0.3 },
  ],
  nest: [
    { layer: 'back', art: 'giantNest', x: 0, y: 420, w: 2100, h: 220 },
    { layer: 'back', art: 'featherPile', x: 1460, y: 545, w: 240, h: 90 },
    { layer: 'back', art: 'goldThreads', x: 0, y: 80, w: 2100, h: 300, alpha: 0.7 },
    { layer: 'back', art: 'floatingFeathers', x: 0, y: 140, w: 2100, h: 380 },
  ],
  skyDawn: [
    { layer: 'back', art: 'floatingFeathers', x: 0, y: 120, w: 1800, h: 380 },
    { layer: 'back', art: 'goldThreads', x: 0, y: 60, w: 1800, h: 260, alpha: 0.8 },
    { layer: 'back', art: 'cloudSea', x: 0, y: 430, w: 1800, h: 220 },
  ],
};

for (const [roomId, items] of Object.entries(EXTRA_DECOR)) {
  const room = ROOMS_ACT2[roomId];
  if (!room) continue;
  if (!room.decor) room.decor = { ambient: 'dust', back: [], front: [] };
  room.decor.back = room.decor.back || [];
  room.decor.front = room.decor.front || [];
  for (const item of items) {
    const target = item.layer === 'front' ? room.decor.front : room.decor.back;
    target.push(item);
  }
}

