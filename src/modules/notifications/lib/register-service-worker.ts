const SW_PATH = '/sw.js';

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.register(SW_PATH, { scope: '/' });
  } catch {
    return null;
  }
}
