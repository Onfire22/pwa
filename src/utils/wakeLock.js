let wakeLock = null;

export const requestWakeLock = async () => {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    console.log('Экран заблокирован от выключения');
    wakeLock.addEventListener('release', () => {
      console.log('Блокировка экрана снята');
    });
  } catch (err) {
    console.error(`Ошибка при запросе Wake Lock: ${err.message}`);
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && wakeLock === null) {
    console.log('visibilitychange');
    requestWakeLock();
  }
});
