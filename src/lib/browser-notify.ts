const PREF_KEY = 'ax_browser_notify';

export function browserNotifyEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PREF_KEY) === 'on' && Notification?.permission === 'granted';
}

export async function enableBrowserNotify(): Promise<'granted' | 'denied' | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  const permission = await Notification.requestPermission();
  if (permission === 'granted') localStorage.setItem(PREF_KEY, 'on');
  else localStorage.setItem(PREF_KEY, 'off');
  return permission === 'granted' ? 'granted' : 'denied';
}

export function disableBrowserNotify(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREF_KEY, 'off');
}

export function showBrowserNotification(title: string, body?: string, href?: string): void {
  if (!browserNotifyEnabled() || document.hasFocus()) return;
  try {
    const n = new Notification(title, { body, icon: '/ariesxpert-logo.png' });
    if (href) n.onclick = () => window.open(href, '_blank');
  } catch {
    /* ignore */
  }
}
