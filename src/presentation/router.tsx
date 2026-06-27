import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppShell } from '@/presentation/shell/AppShell';
import { InvitationPage } from '@/presentation/components/invitation/InvitationPage';
import { ResetPasswordPage } from '@/presentation/pages/ResetPasswordPage';

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
    path: '/reset-senha/:token',
    element: <ResetPasswordPage />
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
