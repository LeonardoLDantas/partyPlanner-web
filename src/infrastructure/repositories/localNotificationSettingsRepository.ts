import type { NotificationSettings } from '@/domain/entities/notification';
import type { NotificationSettingsRepository } from '@/domain/ports/notificationRepository';

const settingsKey = 'party-planner-web-preferences';
const defaultSettings: NotificationSettings = {
  informationalEnabled: true,
  theme: 'light'
};

export class LocalNotificationSettingsRepository implements NotificationSettingsRepository {
  async load() {
    const raw = localStorage.getItem(settingsKey);
    if (!raw) {
      return defaultSettings;
    }

    return {
      ...defaultSettings,
      ...(JSON.parse(raw) as Partial<NotificationSettings>)
    };
  }

  async save(settings: NotificationSettings) {
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  }
}
