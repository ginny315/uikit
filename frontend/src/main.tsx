import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { theme } from './theme';
import { App } from './App';
import { config } from './config';
import './i18n';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/spotlight/styles.css';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

async function bootstrap() {
  // Session 9: 开发模式下启动 MSW 拦截网络请求
  if (config.mock.enabled) {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass', // 非 API 请求不受影响
      quiet: true,
    });
  }

  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element not found');
  }

  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <MantineProvider
          theme={theme}
          defaultColorScheme={(localStorage.getItem('agentsys-theme') as 'light' | 'dark' | null) ?? 'light'}
        >
          <Notifications position="top-right" />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MantineProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}

bootstrap();
