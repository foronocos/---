import { Game } from './game/game.js';
import { enterFullscreen, isFullscreen } from './core/fullscreen.js';

const canvas = document.getElementById('game');
const fallback = document.getElementById('fallback');

function showFatalError(message) {
  if (!fallback) return;
  fallback.hidden = false;
  fallback.textContent = `Не удалось запустить игру: ${message}. Попробуйте обновить страницу.`;
}

if (!canvas || !canvas.getContext) {
  showFatalError('браузер не поддерживает canvas');
} else {
  try {
    const game = new Game(canvas);
    window.__chiki = game;

    // Звук разрешается только после действия пользователя;
    // на телефоне это же касание разворачивает игру на весь экран.
    const unlock = () => {
      game.audio.ensure();
      game.audio.setEnabled(game.settings.sound !== false);
      if (game.touchMode && !isFullscreen()) enterFullscreen();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    game.start();

    window.addEventListener('error', (event) => {
      console.error('Ошибка игры:', event.error || event.message);
    });
  } catch (error) {
    console.error(error);
    showFatalError(error.message || 'неизвестная ошибка');
  }
}
