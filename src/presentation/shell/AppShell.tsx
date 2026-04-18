import { useEffect } from 'react';

import { AuthPage } from '@/presentation/components/auth/AuthPage';
import { LoadingScreen } from '@/presentation/components/common/LoadingScreen';
import { PlannerDashboard } from '@/presentation/components/dashboard/PlannerDashboard';
import { useAppBootstrap } from '@/presentation/state/useAppBootstrap';

export function AppShell() {
  const {
    session,
    setSession,
    notificationSettings,
    updateNotifications,
    updateTheme,
    isBootstrapping
  } = useAppBootstrap();

  useEffect(() => {
    document.documentElement.dataset.theme = notificationSettings.theme;
    document.documentElement.style.colorScheme = notificationSettings.theme;
  }, [notificationSettings.theme]);

  if (isBootstrapping) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <AuthPage onAuthenticated={async (nextSession) => setSession(nextSession)} />;
  }

  return (
    <PlannerDashboard
      session={session}
      notificationsEnabled={notificationSettings.informationalEnabled}
      theme={notificationSettings.theme}
      onNotificationsChange={updateNotifications}
      onThemeChange={updateTheme}
      onLogout={async () => setSession(null)}
    />
  );
}
