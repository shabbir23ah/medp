import { useApi } from './useApi';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Public VAPID key — generate with: npx web-push generate-vapid-keys
// For dev, use a placeholder. In production, use server's public key.
const VAPID_PUBLIC_KEY = 'BEl62i4kAVmPmP_4kNj4mQAGNIkC7DXmQfFhHDZ2gQ5kXJNivNhZ2Kq4mKPgvGq3FeJo0V6LTGU3OZlQPdFTTz8';

export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.log('Notification permission denied');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  // Send subscription to backend
  try {
    const api = useApi();
    await api.post('/reminders/push-subscribe', subscription.toJSON());
    console.log('Push subscription saved');
  } catch (err) {
    console.error('Failed to save push subscription:', err);
  }
}

export async function initNotifications() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered:', registration.scope);
    } catch (err) {
      console.error('Service worker registration failed:', err);
    }
  }
}