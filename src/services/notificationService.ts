export interface NotificationPreference {
  sundayService: boolean;
  bibleStudy: boolean;
  devotional: boolean;
  announcements: boolean;
}

export interface ChurchNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'sunday' | 'wednesday' | 'devotional' | 'announcement';
  read: boolean;
}

const STORAGE_KEYS = {
  PREFERENCES: 'nncm_notification_preferences',
  HISTORY: 'nncm_notification_history',
};

const defaultPreferences: NotificationPreference = {
  sundayService: true,
  bibleStudy: true,
  devotional: true,
  announcements: true,
};

// Seed notifications for initial realistic content
const initialNotifications: ChurchNotification[] = [
  {
    id: 'notif-1',
    title: 'Sunday Service approaching!',
    body: 'Join us this Sunday at 6:00 AM for an anointed time of praise and transformation. Location: Zomba Sanctuary.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    type: 'sunday',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Mid-week Bible Study Reminder',
    body: 'Do not miss our Bible Study tonight at 2:00 PM (CAT). We are diving deep into walking as a New Creation!',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    type: 'wednesday',
    read: true,
  },
  {
    id: 'notif-3',
    title: 'New Devotional Available!',
    body: '"Walking in Divine Strength" reflection has been released by the pastoral assistant.',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    type: 'devotional',
    read: true,
  }
];

export const notificationService = {
  /**
   * Checks if the browser supports the Web Notification API
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  /**
   * Gets the current browser notification permission state
   */
  getPermissionState(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    try {
      return Notification.permission;
    } catch (err) {
      console.warn('[Notifications] Blocked from reading Notification.permission in iframe:', err);
      return 'denied';
    }
  },

  /**
   * Requests permission to send desktop push notifications
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }
    
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.error('[Notifications] Error requesting permission:', err);
      return 'default';
    }
  },

  /**
   * Gets user-configured notification preferences
   */
  getPreferences(): NotificationPreference {
    if (typeof window === 'undefined') return defaultPreferences;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
    } catch (e) {
      return defaultPreferences;
    }
  },

  /**
   * Updates user-configured notification preferences
   */
  savePreferences(prefs: NotificationPreference): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (e) {
      console.error('[Notifications] Error saving preferences:', e);
    }
  },

  /**
   * Gets notification history
   */
  getHistory(): ChurchNotification[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Seed initial history
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(initialNotifications));
      return initialNotifications;
    } catch (e) {
      return [];
    }
  },

  /**
   * Clears notification history
   */
  clearHistory(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
  },

  /**
   * Marks a notification as read
   */
  markAsRead(id: string): ChurchNotification[] {
    const list = this.getHistory();
    const updated = list.map(item => item.id === id ? { ...item, read: true } : item);
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (e) {}
    return updated;
  },

  /**
   * Marks all notifications as read
   */
  markAllAsRead(): ChurchNotification[] {
    const list = this.getHistory();
    const updated = list.map(item => ({ ...item, read: true }));
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (e) {}
    return updated;
  },

  /**
   * Sends a real system notification if permitted, and appends to visual history
   */
  sendNotification(title: string, body: string, type: ChurchNotification['type'] = 'announcement'): void {
    // 1. Append to visual in-app history
    const history = this.getHistory();
    const newNotif: ChurchNotification = {
      id: `notif-${Date.now()}`,
      title,
      body,
      timestamp: new Date().toISOString(),
      type,
      read: false
    };
    
    const updatedHistory = [newNotif, ...history];
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
    } catch (e) {}

    // Dispatch global CustomEvent so the UI updates dynamically
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nncm_new_notification', { detail: newNotif }));
    }

    // 2. Fire browser native notification
    if (this.isSupported() && this.getPermissionState() === 'granted') {
      try {
        const iconUrl = '/logo.png';
        const notification = new Notification(title, {
          body,
          icon: iconUrl,
          badge: iconUrl,
          tag: 'nncm-alert',
          silent: false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (err) {
        console.warn('[Notifications] Browser could not launch native notification:', err);
      }
    }
  },

  /**
   * Simulates a scheduled Sunday Service Reminder (Sunday 6:00 AM)
   */
  simulateSundayServicePush(): void {
    const prefs = this.getPreferences();
    if (!prefs.sundayService) {
      console.warn('[Notifications] Sunday Service push is disabled by user preferences.');
      return;
    }
    this.sendNotification(
      'Sunday Worship Service Starts Soon! ⛪',
      'It is Sunday 6:00 AM. Join us at New Nature In Christ Ministry (NNCM) for a powerful, Spirit-filled service. "Transforming lives by the power of the Holy Spirit."',
      'sunday'
    );
  },

  /**
   * Simulates a scheduled Bible Study Reminder (Wednesday 2:00 PM)
   */
  simulateBibleStudyPush(): void {
    const prefs = this.getPreferences();
    if (!prefs.bibleStudy) {
      console.warn('[Notifications] Bible Study push is disabled by user preferences.');
      return;
    }
    this.sendNotification(
      'Mid-Week Bible Study Starting Now! 📖',
      'It is Wednesday 2:00 PM. Get ready to dive deep into God\'s Word. "Teaching the uncompromised word of God, raising a Christ-minded generation."',
      'wednesday'
    );
  }
};
