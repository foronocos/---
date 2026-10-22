import { ENDINGS } from '../render/palette.js';
import { allyCount } from './state.js';

/**
 * Концовка считается по накопленным решениям: доброта, жадность, союзники.
 * Последний выбор задаёт направление (наружу / остаться / забрать перо),
 * но не определяет исход в одиночку.
 */
export function computeEnding(state, finalChoice) {
  const player = state.player;
  const allies = allyCount(player);
  const kindness = player.kindness;
  const greed = player.greed;

  if (finalChoice === 'feather') {
    if (greed >= kindness + 1) return 'eclipse';
    return 'keeper';
  }

  if (finalChoice === 'stay') {
    if (greed > kindness + 1) return 'caged';
    return 'quiet';
  }

  if (kindness >= 3 && allies >= 2) return 'flock';
  if (kindness >= 2) return 'morning';
  return 'caged';
}

export function getEnding(endingId) {
  return ENDINGS[endingId] || ENDINGS.caged;
}

export function endingStats(state) {
  const player = state.player;
  return [
    { label: 'Доброта', value: player.kindness, color: '#8fd3a8' },
    { label: 'Жадность', value: player.greed, color: '#d98a8a' },
    { label: 'Союзники', value: allyCount(player), color: '#f0c75e' },
    { label: 'Семена', value: player.seeds, color: '#c9b36a' },
  ];
}
