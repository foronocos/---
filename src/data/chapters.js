import { bossResolved } from '../game/state.js';
import { ROOMS_ACT2 } from './chaptersB.js';

const catDialogue = (state) => {
  const outcome = state.player.bosses.cat;
  if (outcome === 'spare') return 'cat_ally_hint';
  if (outcome === 'kill') return 'cat_grave';
  return 'cat_meet';
};

const vacuumDialogue = (state) => {
  const outcome = state.player.bosses.vacuum;
  if (outcome === 'spare') return 'vacuum_friend';
  if (outcome === 'kill') return 'vacuum_grave';
  return 'vacuum_meet';
};

const pastaDialogue = (state) => {
  const outcome = state.player.bosses.pasta;
  if (outcome === 'spare') return 'pasta_friend';
  if (outcome === 'kill') return 'pasta_grave';
  return 'pasta_meet';
};

const ROOMS_ACT1 = {
  living: {
    id: 'living',
    chapter: 1,
    title: 'Гостиная',
    subtitle: 'здесь всё началось',
    width: 2000,
    floorY: 600,
    spawn: 420,
    art: 'living',
    onEnter(state) {
      if (!state.player.flags.introSeen) return 'intro';
      return null;
    },
    doors: [
      {
        id: 'living_hall',
        x: 1900,
        to: 'hall',
        spawnX: 150,
        label: 'В коридор',
        art: 'arch',
      },
    ],
    props: [
      {
        id: 'cage',
        art: 'cage',
        x: 190,
        y: 320,
        w: 220,
        h: 290,
        label: 'Клетка',
        type: 'talk',
        dialogue: 'cage_look',
      },
      {
        id: 'photo',
        art: 'photo',
        x: 1100,
        y: 210,
        w: 110,
        h: 85,
        label: 'Фотография',
        type: 'talk',
        dialogue: 'photo_note',
      },
      {
        id: 'sofa',
        art: 'sofa',
        x: 620,
        y: 430,
        w: 450,
        h: 180,
        label: 'Диван',
        type: 'talk',
        getDialogue: catDialogue,
        getLabel(state) {
          const outcome = state.player.bosses.cat;
          if (outcome === 'spare') return 'Мурзила, союзник';
          if (outcome === 'kill') return 'Пустая подушка';
          return 'Спящий кот';
        },
      },
      {
        id: 'tv',
        art: 'tv',
        x: 1300,
        y: 400,
        w: 250,
        h: 180,
        label: 'Телевизор',
        type: 'talk',
        dialogue: 'tv_note',
      },
      {
        id: 'plant',
        art: 'plant',
        x: 1620,
        y: 450,
        w: 150,
        h: 160,
        label: 'Фикус',
        type: 'loot',
        seeds: 1,
        takenId: 'living_plant',
        lootToast: 'В горшке фикуса нашлось семя. Пахнет землёй и надеждой.',
      },
      {
        id: 'rug',
        art: 'rug',
        x: 420,
        y: 555,
        w: 190,
        h: 45,
        label: 'Коврик',
        type: 'loot',
        seeds: 1,
        takenId: 'living_rug',
        lootToast: 'Под ковриком — семя, забытое кем-то очень запасливым.',
      },
    ],
  },

  hall: {
    id: 'hall',
    chapter: 1,
    title: 'Коридор',
    subtitle: 'длиннее, чем был вчера',
    width: 2420,
    floorY: 600,
    spawn: 150,
    art: 'hall',
    doors: [
      {
        id: 'hall_living',
        x: 60,
        to: 'living',
        spawnX: 1820,
        label: 'В гостиную',
        art: 'arch',
      },
      {
        id: 'hall_bath',
        x: 300,
        to: 'bath',
        spawnX: 180,
        label: 'Ванная',
        art: 'door',
      },
      {
        id: 'hall_pantry',
        x: 1270,
        to: 'pantry',
        spawnX: 150,
        label: 'Кладовка',
        art: 'door',
        getLocked(state) {
          return bossResolved(state.player, 'cat') ? null : 'pantry_locked';
        },
      },
      {
        id: 'hall_stairs',
        x: 2050,
        to: 'stairs',
        spawnX: 180,
        label: 'В подъезд',
        art: 'door',
        labelOffset: -40,
        getLocked(state) {
          return state.player.flags.act2 ? null : 'stairs_locked';
        },
      },
      {
        id: 'hall_kitchen',
        x: 2280,
        to: 'kitchen',
        spawnX: 170,
        label: 'Кухня',
        art: 'door',
        getLocked(state) {
          return bossResolved(state.player, 'vacuum') ? null : 'kitchen_locked';
        },
      },
    ],
    props: [
      {
        id: 'mirror',
        art: 'mirror',
        x: 470,
        y: 260,
        w: 130,
        h: 220,
        label: 'Зеркало',
        type: 'talk',
        dialogue: 'mirror_note',
      },
      {
        id: 'coat',
        art: 'coat',
        x: 780,
        y: 350,
        w: 150,
        h: 250,
        label: 'Пальто',
        type: 'loot',
        seeds: 1,
        takenId: 'hall_coat',
        lootToast: 'В кармане пальто — семя и старая трамвайная карточка.',
      },
      {
        id: 'hall_note',
        art: 'wallNote',
        x: 990,
        y: 290,
        w: 100,
        h: 90,
        label: 'Записка у двери',
        type: 'talk',
        dialogue: 'hall_note',
      },
      {
        id: 'pigeon',
        art: 'pigeonWindow',
        x: 1600,
        y: 280,
        w: 190,
        h: 220,
        label: 'Голубь за окном',
        type: 'talk',
        getDialogue(state) {
          return state.player.flags.metPigeon ? 'pigeon_return' : 'pigeon_intro';
        },
        hidden(state) {
          return !bossResolved(state.player, 'vacuum');
        },
      },
      {
        id: 'harness',
        art: 'looseBoard',
        x: 1880,
        y: 555,
        w: 180,
        h: 45,
        label: 'Отставшая половица',
        type: 'loot',
        seeds: 1,
        takenId: 'hall_board',
        lootToast: 'Под половицей — тайник. Одно семя и пыль в подарок.',
      },
    ],
  },

  bath: {
    id: 'bath',
    chapter: 1,
    title: 'Ванная',
    subtitle: 'здесь ведут дела',
    width: 1500,
    floorY: 600,
    spawn: 180,
    art: 'bath',
    doors: [
      {
        id: 'bath_hall',
        x: 70,
        to: 'hall',
        spawnX: 380,
        label: 'В коридор',
        art: 'door',
      },
    ],
    props: [
      {
        id: 'pipe',
        art: 'pipe',
        x: 300,
        y: 260,
        w: 100,
        h: 300,
        label: 'Труба',
        type: 'talk',
        dialogue: 'bath_note',
      },
      {
        id: 'tub',
        art: 'tub',
        x: 520,
        y: 430,
        w: 480,
        h: 190,
        label: 'Под ванной',
        type: 'talk',
        dialogue: 'roach_intro',
      },
      {
        id: 'shelf',
        art: 'bathShelf',
        x: 1080,
        y: 330,
        w: 200,
        h: 240,
        label: 'Полка с пузырьками',
        type: 'loot',
        seeds: 1,
        takenId: 'bath_shelf',
        lootToast: 'За пузырьками с шампунем — семя. Таракан знал, что оно там.',
      },
    ],
  },

  pantry: {
    id: 'pantry',
    chapter: 2,
    title: 'Кладовка',
    subtitle: 'пыль здесь старше меня',
    width: 2250,
    floorY: 600,
    spawn: 150,
    art: 'pantry',
    doors: [
      {
        id: 'pantry_hall',
        x: 70,
        to: 'hall',
        spawnX: 1210,
        label: 'В коридор',
        art: 'door',
      },
      {
        id: 'pantry_vent',
        x: 1350,
        to: 'vent',
        spawnX: 120,
        label: 'Вентиляция',
        art: 'vent',
        labelOffset: -140,
      },
      {
        id: 'pantry_deep',
        x: 2080,
        to: 'pantryDeep',
        spawnX: 1600,
        label: 'Глубина кладовки',
        art: 'arch',
      },
    ],
    props: [
      {
        id: 'jars',
        art: 'jars',
        x: 360,
        y: 380,
        w: 300,
        h: 230,
        label: 'Банка с семенами',
        type: 'talk',
        getDialogue(state) {
          return state.used.includes('pantry_jar') ? 'jar_empty' : 'jar_choice';
        },
      },
      {
        id: 'crates',
        art: 'crates',
        x: 800,
        y: 440,
        w: 250,
        h: 170,
        label: 'Ящики',
        type: 'talk',
        dialogue: 'notebook_note',
      },
      {
        id: 'sack',
        art: 'sack',
        x: 1100,
        y: 500,
        w: 130,
        h: 110,
        label: 'Мешок с крупой',
        type: 'loot',
        seeds: 1,
        takenId: 'pantry_sack',
        lootToast: 'В мешке с крупой — семя. Крупа обиженно шуршит.',
      },
      {
        id: 'pantry_note',
        art: 'wallNote',
        x: 1600,
        y: 300,
        w: 100,
        h: 90,
        label: 'Наклейка на пылесосе',
        type: 'talk',
        dialogue: 'pantry_note',
      },
    ],
  },

  pantryDeep: {
    id: 'pantryDeep',
    chapter: 2,
    title: 'Глубина кладовки',
    subtitle: 'здесь глотают вещи',
    width: 1900,
    floorY: 600,
    spawn: 1600,
    art: 'pantryDeep',
    doors: [
      {
        id: 'deep_pantry',
        x: 70,
        to: 'pantry',
        spawnX: 1980,
        label: 'Назад в кладовку',
        art: 'arch',
      },
    ],
    props: [
      {
        id: 'trap',
        art: 'mousetrap',
        x: 520,
        y: 545,
        w: 120,
        h: 60,
        label: 'Мышеловка',
        type: 'loot',
        seeds: 1,
        takenId: 'deep_trap',
        lootToast: 'Мышеловка пуста, зато рядом лежит семя. Мышь была запасливой.',
      },
      {
        id: 'vacuum_note',
        art: 'wallNote',
        x: 340,
        y: 300,
        w: 100,
        h: 90,
        label: 'Список на стене',
        type: 'talk',
        dialogue: 'vacuum_note',
      },
      {
        id: 'vacuum',
        art: 'vacuumBoss',
        x: 950,
        y: 280,
        w: 300,
        h: 320,
        label: 'Гудящая груда',
        type: 'talk',
        getDialogue: vacuumDialogue,
        getLabel(state) {
          const outcome = state.player.bosses.vacuum;
          if (outcome === 'spare') return 'Пылесос-друг';
          if (outcome === 'kill') return 'Разрезанный мешок';
          return 'Пылесос-Пожиратель';
        },
      },
      {
        id: 'bag',
        art: 'bag',
        x: 1390,
        y: 500,
        w: 180,
        h: 130,
        label: 'Мешок пылесоса',
        type: 'talk',
        getDialogue(state) {
          return bossResolved(state.player, 'vacuum') ? 'bag_after' : 'bag_before';
        },
      },
    ],
  },

  vent: {
    id: 'vent',
    chapter: 2,
    title: 'Вентиляция',
    subtitle: 'короткий путь, длинная история',
    width: 1400,
    floorY: 620,
    spawn: 130,
    art: 'vent',
    doors: [
      {
        id: 'vent_pantry',
        x: 60,
        to: 'pantry',
        spawnX: 1300,
        label: 'В кладовку',
        art: 'door',
      },
      {
        id: 'vent_hall',
        x: 1270,
        to: 'hall',
        spawnX: 1660,
        label: 'Лаз в коридор',
        art: 'vent',
        labelOffset: -150,
        getLocked(state) {
          return state.player.allies.cat ? null : 'vent_locked';
        },
      },
    ],
    props: [
      {
        id: 'scratch',
        art: 'scratch',
        x: 570,
        y: 300,
        w: 180,
        h: 130,
        label: 'Царапины на жести',
        type: 'talk',
        dialogue: 'vent_note',
      },
      {
        id: 'vent_seed',
        art: 'seedPile',
        x: 950,
        y: 545,
        w: 100,
        h: 60,
        label: 'Кучка семян',
        type: 'loot',
        seeds: 2,
        takenId: 'vent_seed',
        lootToast: 'Кто-то хранил здесь семена. Спасибо тебе, кто бы ты ни был.',
      },
    ],
  },

  kitchen: {
    id: 'kitchen',
    chapter: 3,
    title: 'Кухня',
    subtitle: 'пахнет лавровым листом и решимостью',
    width: 2600,
    floorY: 600,
    spawn: 170,
    art: 'kitchen',
    doors: [
      {
        id: 'kitchen_hall',
        x: 70,
        to: 'hall',
        spawnX: 2200,
        label: 'В коридор',
        art: 'door',
      },
      {
        id: 'kitchen_balcony',
        x: 2460,
        to: 'balcony',
        spawnX: 380,
        label: 'Балкон',
        art: 'balconyDoor',
        getLocked(state) {
          if (!bossResolved(state.player, 'pasta')) return 'balcony_blocked';
          if (!state.player.keyItems.key) return 'balcony_locked';
          return null;
        },
      },
    ],
    props: [
      {
        id: 'fridge',
        art: 'fridge',
        x: 300,
        y: 330,
        w: 210,
        h: 270,
        label: 'Холодильник',
        type: 'talk',
        dialogue: 'fridge_note',
      },
      {
        id: 'table',
        art: 'table',
        x: 700,
        y: 470,
        w: 340,
        h: 140,
        label: 'Стол',
        type: 'talk',
        getDialogue(state) {
          return state.used.includes('kitchen_table') ? 'table_empty' : 'table_choice';
        },
      },
      {
        id: 'stove',
        art: 'stove',
        x: 1170,
        y: 400,
        w: 250,
        h: 200,
        label: 'Плита',
        type: 'talk',
        dialogue: 'recipe_old',
      },
      {
        id: 'window',
        art: 'pigeonWindow',
        x: 1520,
        y: 260,
        w: 210,
        h: 240,
        label: 'Гоша на подоконнике',
        type: 'talk',
        getDialogue(state) {
          return state.player.flags.metPigeon ? 'pigeon_return' : 'pigeon_intro';
        },
        hidden(state) {
          return !bossResolved(state.player, 'vacuum');
        },
      },
      {
        id: 'bowl',
        art: 'bowl',
        x: 1850,
        y: 545,
        w: 120,
        h: 60,
        label: 'Миска с водой',
        type: 'talk',
        getDialogue(state) {
          return state.used.includes('water_bowl') ? 'bowl_empty' : 'water_bowl';
        },
      },
      {
        id: 'pasta',
        art: 'pastaBoss',
        x: 2120,
        y: 290,
        w: 310,
        h: 310,
        label: 'Хозяин Макарон',
        type: 'talk',
        getDialogue: pastaDialogue,
        getLabel(state) {
          const outcome = state.player.bosses.pasta;
          if (outcome === 'spare') return 'Хозяин Макарон, союзник';
          if (outcome === 'kill') return 'Погасшая плита';
          return 'Хозяин Макарон';
        },
      },
    ],
  },

  balcony: {
    id: 'balcony',
    chapter: 4,
    title: 'Балкон',
    subtitle: 'высоко, темно и наконец-то близко',
    width: 1600,
    floorY: 600,
    spawn: 380,
    art: 'balcony',
    onEnter(state) {
      if (state.ending) return null;
      if (state.player && state.player.flags && state.player.flags.leftBalcony) return null;
      if (state.player && state.player.flags && state.player.flags.act2) return null;
      return 'finale';
    },
    doors: [],
    props: [],
  },
};

export const ROOMS = { ...ROOMS_ACT1, ...ROOMS_ACT2 };

/** Карта комнат по главам — для журнала и отладки. */
export function roomsOfChapter(chapter) {
  return Object.values(ROOMS).filter((room) => room.chapter === chapter);
}

export function getRoom(roomId) {
  return ROOMS[roomId] || ROOMS.living;
}

export function getRoomProp(room, propId) {
  return room.props.find((prop) => prop.id === propId) || null;
}

export function isPropHidden(prop, state) {
  return typeof prop.hidden === 'function' ? Boolean(prop.hidden(state)) : false;
}

export function getPropDialogue(prop, state) {
  if (typeof prop.getDialogue === 'function') return prop.getDialogue(state);
  return prop.dialogue || null;
}

export function getPropLabel(prop, state) {
  if (typeof prop.getLabel === 'function') return prop.getLabel(state);
  return prop.label || '';
}

export function getDoorLock(room, door, state) {
  if (typeof door.getLocked === 'function') return door.getLocked(state);
  return null;
}
