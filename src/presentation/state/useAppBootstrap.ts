import { useEffect, useState } from 'react';

import type { AuthSession } from '@/domain/entities/auth';
import type { NotificationSettings, ThemeMode } from '@/domain/entities/notification';
import { container } from '@/infrastructure/container';

export function useAppBootstrap() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    informationalEnabled: true,
    theme: 'light'
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      const [nextSession, settings] = await Promise.all([
        container.bootstrapSession(),
        container.notificationSettingsRepository.load()
      ]);

      setSession(nextSession);
      setNotificationSettings(settings);
      setIsBootstrapping(false);
    }

    void bootstrap();
  }, []);

  async function persistSession(nextSession: AuthSession | null) {
    if (!nextSession) {
      await container.sessionRepository.clear();
      setSession(null);
      return;
    }

    await container.sessionRepository.save(nextSession);
    setSession(nextSession);
  }

  async function updateNotifications(enabled: boolean) {
    const nextSettings = { ...notificationSettings, informationalEnabled: enabled };
    setNotificationSettings(nextSettings);
    await container.notificationSettingsRepository.save(nextSettings);
  }

  async function updateTheme(theme: ThemeMode) {
    const nextSettings = { ...notificationSettings, theme };
    setNotificationSettings(nextSettings);
    await container.notificationSettingsRepository.save(nextSettings);
  }

  return {
    session,
    setSession: persistSession,
    notificationSettings,
    updateNotifications,
    updateTheme,
    isBootstrapping
  };
}
