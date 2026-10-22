/**
 * Полноэкранный режим и альбомная ориентация на телефоне.
 * Браузеры разрешают это только по действию пользователя, поэтому вызывается
 * из обработчика касания; любая ошибка тихо игнорируется — игра работает и без него.
 */
export function canFullscreen() {
  if (typeof document === 'undefined') return false;
  const el = document.documentElement;
  return Boolean(el.requestFullscreen || el.webkitRequestFullscreen);
}

export function isFullscreen() {
  if (typeof document === 'undefined') return false;
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
}

export async function enterFullscreen(target = null) {
  if (isFullscreen()) {
    await lockLandscape();
    return true;
  }
  const el = target || document.documentElement;
  try {
    if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else return false;
  } catch {
    return false;
  }
  await lockLandscape();
  return true;
}

export async function exitFullscreen() {
  try {
    if (document.exitFullscreen) await document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  } catch {
    // игнорируем: некоторые браузеры не дают выйти программно
  }
}

export async function toggleFullscreen(target = null) {
  if (isFullscreen()) {
    await exitFullscreen();
    return false;
  }
  return enterFullscreen(target);
}

async function lockLandscape() {
  const orientation = typeof screen !== 'undefined' ? screen.orientation : null;
  if (!orientation || typeof orientation.lock !== 'function') return false;
  try {
    await orientation.lock('landscape');
    return true;
  } catch {
    // на iOS и части Android блокировка недоступна — просто остаёмся как есть
    return false;
  }
}
