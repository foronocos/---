import { bossResolved, allyCount } from '../game/state.js';
import { NOTES } from './notes.js';

export function mainObjective(state) {
  const player = state.player;
  if (state.chapter === 1) {
    if (!bossResolved(player, 'cat')) {
      return {
        title: 'Найти пропавшее Золотое Перо',
        text: 'Балконная дверь пуста, солнце не встало. На диване спит кот — он явно знает больше, чем говорит.',
        hint: 'Подойди к дивану в гостиной. Заодно осмотри комнату: записки и тайники.',
      };
    }
    return {
      title: 'Выйти из гостиной',
      text: 'Кот больше не преграждает путь. Дверь в коридор открыта, а где-то там — кладовка и балкон.',
      hint: 'Иди вправо, в коридор. Дверь в кладовку теперь не заперта.',
    };
  }
  if (state.chapter === 2) {
    if (!bossResolved(player, 'vacuum')) {
      return {
        title: 'Обыскать кладовку',
        text: 'В глубине кладовки гудит что-то древнее. Оно глотает вещи уже много лет — и, кажется, перо тоже.',
        hint: 'Исследуй полки, вентиляцию и глубокий проход. Тайники дают Семена Силы.',
      };
    }
    return {
      title: 'Вернуться в коридор',
      text: 'В мешке нашёлся запасной ключ. Кухня ждёт, а за ней — балкон.',
      hint: 'Выйди из кладовки и иди в коридор: дверь на кухню открыта.',
    };
  }
  if (state.chapter === 3) {
    if (!bossResolved(player, 'pasta')) {
      return {
        title: 'Пройти на балкон',
        text: 'Балконная дверь близко, но у плиты стоит тот, кто варил эту квартиру. Он не пропустит без проверки.',
        hint: 'Поговори с Хозяином Макарон. Перед боем проверь инвентарь и улучшения.',
      };
    }
    if (!player.keyItems.key) {
      return {
        title: 'Найти ключ от балкона',
        text: 'Хозяин Макарон больше не мешает, но дверь заперта. Запасной ключ где-то в квартире.',
        hint: 'Вернись в кладовку: ключ был в мешке пылесоса.',
      };
    }
    if (!player.keyItems.feather) {
      return {
        title: 'Найти Золотое Перо',
        text: 'Ключ есть, а без пера утро всё равно не наступит. Перо должно быть в мешке пылесоса.',
        hint: 'Проверь глубину кладовки.',
      };
    }
    return {
      title: 'Открыть балконную дверь',
      text: 'Ключ в клюве, перо под крылом. Пора выходить.',
      hint: 'Подойди к двери в правом конце кухни.',
    };
  }
  return {
    title: 'Встретить утро',
    text: 'Балкон открыт. Осталось решить, что делать с пером и с собой.',
    hint: 'Финальный выбор определит концовку — но не только он.',
  };
}

export function sideQuests(state) {
  const player = state.player;
  const noteCount = player.notesRead.length;
  const visited = state.visited.length;
  return [
    {
      id: 'seeds',
      title: 'Семена Силы',
      text: `Собрано: ${player.seeds}. Трать на улучшения и предметы у торговцев.`,
      done: player.seeds >= 6,
    },
    {
      id: 'notes',
      title: 'Записки квартиры',
      text: `Прочитано ${noteCount} из ${Object.keys(NOTES).length}.`,
      done: noteCount >= Object.keys(NOTES).length,
    },
    {
      id: 'bestiary',
      title: 'Бестиарий',
      text: `Записано ${player.bestiarySeen.length} существ.`,
      done: player.bestiarySeen.length >= 6,
    },
    {
      id: 'allies',
      title: 'Не в одиночку',
      text: `Союзников: ${allyCount(player)}.`,
      done: allyCount(player) >= 2,
    },
    {
      id: 'rooms',
      title: 'Квартира выросла',
      text: `Исследовано комнат: ${visited} из 8.`,
      done: visited >= 8,
    },
  ];
}

export function journalSummary(state) {
  const player = state.player;
  const outcomes = Object.values(player.bosses);
  return {
    kills: outcomes.filter((value) => value === 'kill').length,
    spares: outcomes.filter((value) => value === 'spare').length,
    kindness: player.kindness,
    greed: player.greed,
  };
}
