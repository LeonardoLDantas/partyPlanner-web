import type { AppNotification } from '@/domain/entities/notification';
import type { NotificationRepository } from '@/domain/ports/notificationRepository';
import type { HttpClient } from '@/infrastructure/http/httpClient';

export class HttpNotificationRepository implements NotificationRepository {
  constructor(private readonly httpClient: HttpClient) {}

  getAll() {
    return this.httpClient.request<AppNotification[]>('/api/notifications');
  }

  markAllAsRead() {
    return this.httpClient.request<{ updated: number }>('/api/notifications/read-all', {
      method: 'PATCH'
    });
  }
}
