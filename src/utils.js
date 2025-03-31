export const requestNotification = async () => {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('permission granted')
  } else {
    console.log('permission denied')
  }
}

export const showNotification = async (title, body, icon) => {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  registration.active.postMessage({
    type: 'SHOW_NOTIFICATION',
    title,
    body,
    icon,
  });
}

export const subscribeUser = async (username) => {
  const registration = await navigator.serviceWorker.register('/sw.js');
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'BOKkN_i4LLkDXN1Oqrwa3JJ-37qgvFSsmByL4hVdnroOyDoAvw7lJOXDkU6T619kzd2erRYmIM7Co0sHETM9lWo'
  });
  
  await fetch('https://server-zjg0.onrender.com/subscribe', {
    method: 'POST',
    body: JSON.stringify({ username, subscription }),
    headers: { 'Content-Type': 'application/json' }
  });
  
  console.log(`Пользователь ${username} подписан на push`);
}

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SyncDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('requests')) {
        db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const savePendingRequest = async (request) => {
  const db = await openDatabase();
  if (!db) throw new Error('Database not initialized');

  const tx = db.transaction('requests', 'readwrite');
  const store = tx.objectStore('requests');

  await store.add(request);
  await tx.done;
}
