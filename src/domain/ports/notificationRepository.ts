import type { AppNotification, NotificationSettings } from '@/domain/entities/notification';

export interface NotificationRepository {
  getAll(): Promise<AppNotification[]>;
  markAllAsRead(): Promise<{ updated: number }>;
  clearAll(): Promise<{ deleted: number }>;
}

export interface NotificationSettingsRepository {
  load(): Promise<NotificationSettings>;
  save(settings: NotificationSettings): Promise<void>;
}
