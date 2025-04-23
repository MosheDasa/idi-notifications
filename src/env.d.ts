/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_NOTIFICATIONS_ENDPOINT: string;
  readonly VITE_API_POLLING_INTERVAL: string;
  readonly VITE_NOTIFICATION_TIMEOUT_DEFAULT: string;
  readonly VITE_NOTIFICATION_TIMEOUT_URL_HTML: string;
  readonly VITE_NOTIFICATION_TIMEOUT_COINS: string;
  readonly VITE_NOTIFICATION_TIMEOUT_ERROR: string;
  readonly VITE_NOTIFICATION_WIDTH: string;
  readonly VITE_NOTIFICATION_POSITION_BOTTOM: string;
  readonly VITE_NOTIFICATION_POSITION_RIGHT: string;
  readonly VITE_NOTIFICATION_GAP: string;
  readonly VITE_WINDOW_WIDTH: string;
  readonly VITE_WINDOW_HEIGHT: string;
  readonly VITE_WINDOW_MARGIN: string;
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
