export const registerBackgroundSync = async () => {
  if (!navigator.serviceWorker) {
    console.warn('Service Worker не поддерживается');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  if ('sync' in registration) {
    try {
      await registration.sync.register('background-sync-task');
      console.log('Фоновая синхронизация зарегистрирована');
    } catch (error) {
      console.error('Ошибка при регистрации фоновой синхронизации:', error);
    }
  }
};
