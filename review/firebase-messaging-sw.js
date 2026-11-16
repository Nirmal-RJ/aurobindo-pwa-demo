importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDXb9_Y1St4mFN9eD6bKS0zS0IKl4JOhZ0',
  authDomain: 'apl-qc-core-app-f5a3e.firebaseapp.com',
  projectId: 'apl-qc-core-app-f5a3e',
  storageBucket: 'apl-qc-core-app-f5a3e.firebasestorage.app',
  messagingSenderId: '1083240281303',
  appId: '1:1083240281303:web:9bb38a38d1f01499bb6c92'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'New review message';
  const options = {
    body: payload.notification?.body || '',
    data: payload.data || {}
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/review/';
  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      if (client.url.includes('/review/') && 'focus' in client) {
        await client.focus();
        if ('navigate' in client) await client.navigate(targetUrl);
        return;
      }
    }
    if (clients.openWindow) await clients.openWindow(targetUrl);
  })());
});

