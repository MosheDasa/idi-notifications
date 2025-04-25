import { app, BrowserWindow, ipcMain, powerMonitor } from "electron";
import * as path from "path";
import axios from "axios";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { config } from "./config";
import * as os from "os";
import WebSocket from "ws";
import { playSound } from "./utils/sound";

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

// Get USERID from Windows environment variables
const userId = process.env.USERID || process.env.USERNAME;

if (!userId) {
  writeLog("ERROR", "ENV_VAR_MISSING", {
    message: "USERID or USERNAME environment variable is not set",
  });
}

// Logger setup
const LOG_DIR = path.join(
  "C:",
  "Users",
  userId!,
  "idi-notifications-config",
  "log"
);
const LOG_FILE = path.join(
  LOG_DIR,
  `idi-notifications-${new Date().toISOString().split("T")[0]}.log`
);

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

interface LogEntry {
  timestamp: string;
  severity: "INFO" | "ERROR" | "DEBUG" | "WARN";
  event: string;
  data?: any;
}

function writeLog(severity: LogEntry["severity"], event: string, data?: any) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    severity,
    event,
    data,
  };

  const logLine = `${entry.timestamp} severity="${entry.severity}" event="${
    entry.event
  }" ${data ? `data="${JSON.stringify(data).replace(/"/g, '\\"')}"` : ""}\n`;

  fs.appendFileSync(LOG_FILE, logLine);
}

interface ExternalConfig {
  API_URL: string;
  API_POLLING_INTERVAL: number;
  LOG: boolean;
}

const loadExternalConfig = (): ExternalConfig => {
  const defaultConfig: ExternalConfig = {
    API_URL: "http://localhost:3001/notifications/check",
    API_POLLING_INTERVAL: 10000,
    LOG: true,
  };

  const configPath = path.join(
    "C:",
    "Users",
    userId!,
    "idi-notifications-config",
    "config.json"
  );

  try {
    // Ensure directory exists
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
      return { ...defaultConfig, ...configData };
    } else {
      // Create new config file with default values
      fs.writeFileSync(
        configPath,
        JSON.stringify(defaultConfig, null, 2),
        "utf8"
      );
      console.log("Created new config file at:", configPath);
      return defaultConfig;
    }
  } catch (error) {
    console.error("Error loading config:", error);
    return defaultConfig;
  }
};

// Load the configuration
const externalConfig = loadExternalConfig();

interface NotificationResponse {
  hasNotification: boolean;
  notification?: {
    id: string;
    type: "INFO" | "ERROR" | "COINS" | "FREE_HTML" | "URL_HTML";
    message: string;
    isPermanent?: boolean;
    displayTime?: number;
  };
}

interface ProcessedNotification {
  id: string;
  type: "INFO" | "ERROR" | "COINS" | "FREE_HTML" | "URL_HTML";
  message: string;
  isPermanent: boolean;
  displayTime?: number;
}

// WebSocket connection
let ws: WebSocket | null = null;
let notificationWindow: BrowserWindow | null = null;
let lastNotificationId: string | null = null;

function createNotificationWindow(): BrowserWindow {
  writeLog("INFO", "CREATING_NOTIFICATION_WINDOW");

  const { height: screenHeight } =
    require("electron").screen.getPrimaryDisplay().workAreaSize;

  notificationWindow = new BrowserWindow({
    width: 400,
    height: screenHeight,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  notificationWindow.loadFile(path.join(__dirname, "index.html"));

  notificationWindow.once("ready-to-show", () => {
    if (notificationWindow) {
      const { width } = notificationWindow.getBounds();
      const { width: screenWidth } =
        require("electron").screen.getPrimaryDisplay().workAreaSize;
      notificationWindow.setPosition(screenWidth - width - 20, 0);
      notificationWindow.show();

      // Make sure the window is visible and interactive
      notificationWindow.setVisibleOnAllWorkspaces(true);
      notificationWindow.focus();
    }
  });

  // Wait for window to be fully loaded before setting up mouse events
  notificationWindow.webContents.once("did-finish-load", () => {
    if (notificationWindow) {
      // Allow mouse events for the notification container
      notificationWindow.webContents
        .executeJavaScript(
          `
        try {
          document.body.style.pointerEvents = 'none';
          const container = document.querySelector('.notification-container');
          if (container) {
            container.style.pointerEvents = 'auto';
            container.style.zIndex = '1000';
            // Make sure close button is clickable
            const closeButtons = container.querySelectorAll('.close-button');
            closeButtons.forEach(button => {
              button.style.pointerEvents = 'auto';
              button.style.zIndex = '1001';
            });
          }
        } catch (error) {
          console.error('Error setting pointer events:', error);
        }
      `
        )
        .catch((error) => {
          writeLog("ERROR", "JAVASCRIPT_EXECUTION_ERROR", {
            error: error.message,
          });
        });
    }
  });

  notificationWindow.on("closed", () => {
    notificationWindow = null;
    writeLog("INFO", "NOTIFICATION_WINDOW_CLOSED");
  });

  return notificationWindow;
}

function connectWebSocket() {
  if (ws) {
    try {
      ws.close();
    } catch (error) {
      writeLog("ERROR", "WEBSOCKET_CLOSE_ERROR", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  try {
    ws = new WebSocket(`ws://localhost:3001?userId=${userId}`);

    // Set up ping/pong manually
    const pingInterval = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);

    ws.on("open", () => {
      writeLog("INFO", "WEBSOCKET_CONNECTED");
      // Send initial ping to keep connection alive
      ws?.ping();
    });

    ws.on("ping", () => {
      writeLog("DEBUG", "WEBSOCKET_PING_RECEIVED");
      ws?.pong();
    });

    ws.on("pong", () => {
      writeLog("DEBUG", "WEBSOCKET_PONG_RECEIVED");
    });

    ws.on("message", (data: WebSocket.Data) => {
      try {
        const notification = JSON.parse(data.toString());
        writeLog("DEBUG", "WEBSOCKET_NOTIFICATION_RECEIVED", { notification });

        // Play notification sound
        playSound();
        lastNotificationId = notification.id;

        // Create notification window if it doesn't exist
        if (!notificationWindow) {
          notificationWindow = createNotificationWindow();
        }

        // Wait for window to be ready before sending notification
        if (notificationWindow.webContents.isLoading()) {
          notificationWindow.webContents.once("did-finish-load", () => {
            notificationWindow?.webContents.send(
              "show-notification",
              notification
            );
          });
        } else {
          notificationWindow.webContents.send(
            "show-notification",
            notification
          );
        }

        // Close specific notification after display time for non-permanent notifications
        if (!notification.isPermanent) {
          setTimeout(() => {
            if (notificationWindow) {
              notificationWindow.webContents.executeJavaScript(`
                const notification = document.querySelector('[data-id="${notification.id}"]');
                if (notification) {
                  notification.remove();
                }
              `);
            }
          }, notification.displayTime || 5000);
        }
      } catch (error) {
        writeLog("ERROR", "WEBSOCKET_MESSAGE_PROCESSING_ERROR", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    ws.on("error", (error: Error) => {
      writeLog("ERROR", "WEBSOCKET_ERROR", { error: error.message });
      // Try to reconnect immediately
      setTimeout(connectWebSocket, 1000);
    });

    ws.on("close", () => {
      writeLog("INFO", "WEBSOCKET_CLOSED");
      clearInterval(pingInterval);
      // Try to reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    });
  } catch (error) {
    writeLog("ERROR", "WEBSOCKET_CREATION_ERROR", {
      error: error instanceof Error ? error.message : String(error),
    });
    // Try to reconnect after 5 seconds
    setTimeout(connectWebSocket, 5000);
  }
}

// Handle power management events
powerMonitor.on("suspend", () => {
  writeLog("INFO", "SYSTEM_SUSPEND");
  // Keep the app running during sleep
  app.disableHardwareAcceleration();
});

powerMonitor.on("resume", () => {
  writeLog("INFO", "SYSTEM_RESUME");
  // Reconnect WebSocket after resume
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    writeLog("INFO", "RECONNECTING_AFTER_RESUME");
    connectWebSocket();
  }
});

// Prevent system from going to sleep
app.on("ready", () => {
  writeLog("INFO", "APP_READY");
  // Prevent system from going to sleep by keeping it active
  setInterval(() => {
    powerMonitor.getSystemIdleTime();
  }, 10000);
  // Start WebSocket connection
  connectWebSocket();
});

// Keep the app running even when all windows are closed
app.on("window-all-closed", () => {
  writeLog("INFO", "ALL_WINDOWS_CLOSED");
  // Don't quit the app, keep the WebSocket connection alive
});

// Reconnect WebSocket when app is activated
app.on("activate", () => {
  writeLog("INFO", "APP_ACTIVATED");
  if (!ws) {
    connectWebSocket();
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  writeLog("ERROR", "UNCAUGHT_EXCEPTION", {
    error: error.message,
    stack: error.stack,
  });
  // Don't crash the app, just log the error
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  writeLog("ERROR", "UNHANDLED_REJECTION", {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
  // Don't crash the app, just log the error
});
