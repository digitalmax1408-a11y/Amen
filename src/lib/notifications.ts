/**
 * Browser Notifications Helper for Family Challenge
 */

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (!isBrowserNotificationSupported()) {
    console.warn('Browser notifications are not supported in this browser environment.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export function sendBrowserNotification(
  title: string, 
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    onClick?: () => void;
  }
) {
  if (!isBrowserNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notif = new Notification(title, {
      body: options?.body,
      icon: options?.icon || 'https://api.iconify.design/lucide:trophy.svg?color=%230284c7',
      tag: options?.tag,
      dir: 'rtl',
      lang: 'ar',
    });

    notif.onclick = () => {
      window.focus();
      if (options?.onClick) options.onClick();
      notif.close();
    };

    // Auto-close after 8 seconds
    setTimeout(() => {
      try {
        notif.close();
      } catch (e) {
        // ignore
      }
    }, 8000);
  } catch (error) {
    console.error('Failed to trigger browser notification:', error);
  }
}
