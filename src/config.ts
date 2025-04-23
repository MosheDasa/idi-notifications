interface Config {
  api: {
    baseUrl: string;
    notificationsEndpoint: string;
    pollingInterval: number;
  };
  notifications: {
    timeouts: {
      default: number;
      urlHtml: number;
      coins: number;
      error: number;
    };
    ui: {
      width: number;
      positionBottom: number;
      positionRight: number;
      gap: number;
    };
  };
  window: {
    width: number;
    height: number;
    margin: number;
  };
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = getEnvVar(key, defaultValue?.toString());
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} is not a valid number`);
  }
  return num;
}

export const config: Config = {
  api: {
    baseUrl: getEnvVar("VITE_API_URL", "http://localhost:3001"),
    notificationsEndpoint: getEnvVar(
      "VITE_API_NOTIFICATIONS_ENDPOINT",
      "/notifications/check"
    ),
    pollingInterval: getEnvNumber("VITE_API_POLLING_INTERVAL", 10000),
  },
  notifications: {
    timeouts: {
      default: getEnvNumber("VITE_NOTIFICATION_TIMEOUT_DEFAULT", 5000),
      urlHtml: getEnvNumber("VITE_NOTIFICATION_TIMEOUT_URL_HTML", 10000),
      coins: getEnvNumber("VITE_NOTIFICATION_TIMEOUT_COINS", 7000),
      error: getEnvNumber("VITE_NOTIFICATION_TIMEOUT_ERROR", 8000),
    },
    ui: {
      width: getEnvNumber("VITE_NOTIFICATION_WIDTH", 320),
      positionBottom: getEnvNumber("VITE_NOTIFICATION_POSITION_BOTTOM", 20),
      positionRight: getEnvNumber("VITE_NOTIFICATION_POSITION_RIGHT", 20),
      gap: getEnvNumber("VITE_NOTIFICATION_GAP", 10),
    },
  },
  window: {
    width: getEnvNumber("VITE_WINDOW_WIDTH", 400),
    height: getEnvNumber("VITE_WINDOW_HEIGHT", 600),
    margin: getEnvNumber("VITE_WINDOW_MARGIN", 20),
  },
} as const;
