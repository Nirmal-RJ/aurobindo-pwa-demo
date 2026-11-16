const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDXb9_Y1St4mFN9eD6bKS0zS0IKl4JOhZ0',
  authDomain: 'apl-qc-core-app-f5a3e.firebaseapp.com',
  projectId: 'apl-qc-core-app-f5a3e',
  storageBucket: 'apl-qc-core-app-f5a3e.firebasestorage.app',
  messagingSenderId: '1083240281303',
  appId: '1:1083240281303:web:9bb38a38d1f01499bb6c92'
};

const SESSION_KEY = 'qsl-review-session-v1';
function bearerToken() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || '{}')?.recoveryToken || ''; }
  catch { return ''; }
}

async function saveTokenToServer(token) {
  const headers = { 'Content-Type': 'application/json' };
  const bearer = bearerToken();
  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  const res = await fetch('/review-api/chat/push-token', {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers,
    body: JSON.stringify({ token })
  });
  if (!res.ok) throw Error('Could not register push notifications.');
}

export function initPushNotifications(buttonEl, { onToast } = {}) {
  if (!buttonEl) return;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    buttonEl.hidden = true;
    return;
  }

  let busy = false;
  const updateLabel = () => {
    const perm = Notification.permission;
    buttonEl.textContent = perm === 'granted' ? 'Notifications On' : perm === 'denied' ? 'Notifications Blocked' : 'Enable Notifications';
    buttonEl.disabled = perm === 'denied' || busy;
  };
  updateLabel();

  async function register() {
    if (busy) return;
    busy = true;
    updateLabel();
    try {
      const permission = Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();
      if (permission !== 'granted') {
        onToast?.(permission === 'denied' ? 'Notifications blocked in browser settings.' : 'Notification permission dismissed.');
        return;
      }
      const registration = await navigator.serviceWorker.register('/review/firebase-messaging-sw.js', { scope: '/review/' });
      const [{ initializeApp, getApps }, { getMessaging, getToken, onMessage }] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging.js')
      ]);
      const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
      const messaging = getMessaging(app);
      const token = await getToken(messaging, { serviceWorkerRegistration: registration });
      if (token) {
        await saveTokenToServer(token);
        onToast?.('Push notifications enabled.');
      }
      onMessage(messaging, (payload) => {
        if (document.hidden && payload.notification?.title) {
          onToast?.(`${payload.notification.title}: ${payload.notification.body || ''}`);
        }
      });
    } catch (e) {
      onToast?.(e?.message || 'Could not enable push notifications.');
    } finally {
      busy = false;
      updateLabel();
    }
  }

  buttonEl.onclick = () => { void register(); };
  if (Notification.permission === 'granted') {
    void register();
  }
}

