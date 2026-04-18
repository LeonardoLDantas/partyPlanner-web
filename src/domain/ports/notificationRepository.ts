import type { AppNotification, NotificationSettings } from '@/domain/entities/notification';

export interface NotificationRepository {
  getAll(): Promise<AppNotification[]>;
  markAllAsRead(): Promise<{ updated: number }>;
}

export interface NotificationSettingsRepository {
  load(): Promise<NotificationSettings>;
  save(settings: NotificationSettings): Promise<void>;
}
