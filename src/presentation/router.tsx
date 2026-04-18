import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppShell } from '@/presentation/shell/AppShell';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
