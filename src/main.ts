import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import axios from "axios";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { config } from "./config";
import * as os from "os";
import WebSocket from "ws";

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

  notificationWindow = new BrowserWindow({
    width: 400,
    height: 600,
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
      const { width, height } = notificationWindow.getBounds();
      const { width: screenWidth, height: screenHeight } =
        require("electron").screen.getPrimaryDisplay().workAreaSize;
      notificationWindow.setPosition(
        screenWidth - width - 20,
        screenHeight - height - 20
      );
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
    ws.close();
  }

  ws = new WebSocket(`ws://localhost:3001?userId=${userId}`);

  ws.on("open", () => {
    writeLog("INFO", "WEBSOCKET_CONNECTED");
  });

  ws.on("message", (data: WebSocket.Data) => {
    try {
      const notification = JSON.parse(data.toString());
      writeLog("DEBUG", "WEBSOCKET_NOTIFICATION_RECEIVED", { notification });

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
        notificationWindow.webContents.send("show-notification", notification);
      }

      // If not permanent, close window after display time
      if (!notification.isPermanent) {
        setTimeout(() => {
          if (notificationWindow) {
            notificationWindow.close();
            notificationWindow = null;
          }
        }, notification.displayTime || 5000);
      }
    } catch (error) {
      writeLog("ERROR", "WEBSOCKET_MESSAGE_ERROR", {
        error: (error as Error).message,
      });
    }
  });

  ws.on("error", (error: Error) => {
    writeLog("ERROR", "WEBSOCKET_ERROR", { error: error.message });
  });

  ws.on("close", () => {
    writeLog("INFO", "WEBSOCKET_CLOSED");
    // Try to reconnect after 5 seconds
    setTimeout(connectWebSocket, 5000);
  });
}

// Start WebSocket connection when app is ready
app.whenReady().then(() => {
  writeLog("INFO", "APP_READY");
  connectWebSocket();
});

app.on("window-all-closed", () => {
  // Don't quit the app when all windows are closed
  // Keep the WebSocket connection alive
  writeLog("INFO", "ALL_WINDOWS_CLOSED");
});

app.on("activate", () => {
  if (!ws) {
    connectWebSocket();
  }
});
