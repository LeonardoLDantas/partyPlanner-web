import '@mantine/core/styles.css';
import 'react-day-picker/dist/style.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';

import '@/styles/global.css';
import { router } from '@/presentation/router';
import { queryClient } from '@/shared/query/queryClient';
import { registerPwa } from '@/shared/pwa/registerPwa';

registerPwa();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>
);
