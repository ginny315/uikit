/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_AUTH_ENABLED?: string;
  readonly VITE_MOCK_ENABLED?: string;
  readonly VITE_MOCK_DELAY?: string;
  readonly VITE_MOCK_ERROR_RATE?: string;
  readonly VITE_REALTIME_METHOD?: string;
  readonly VITE_POLLING_INTERVAL?: string;
  readonly VITE_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
