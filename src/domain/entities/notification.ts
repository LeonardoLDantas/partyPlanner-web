export type ThemeMode = 'light' | 'dark';

export type NotificationSettings = {
  informationalEnabled: boolean;
  theme: ThemeMode;
};

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAtUtc: string;
};
