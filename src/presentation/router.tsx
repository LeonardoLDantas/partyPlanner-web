import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppShell } from '@/presentation/shell/AppShell';
import { InvitationPage } from '@/presentation/components/invitation/InvitationPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />
  },
  {
    path: '/convite/:token',
    element: <InvitationPage />
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
