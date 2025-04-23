import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import axios from "axios";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { config } from "./config";

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

// Load configuration from external JSON file
function loadExternalConfig(): ExternalConfig {
  const defaultConfig: ExternalConfig = {
    API_URL: "http://localhost:3001/notifications/check",
    API_POLLING_INTERVAL: 10000,
    LOG: false,
  };

  try {
    const configPath = path.join(
      "C:",
      "Users",
      userId!,
      "idi-notifications-config.json"
    );
    writeLog("INFO", "LOAD_CONFIG_ATTEMPT", { configPath });

    if (fs.existsSync(configPath)) {
      writeLog("INFO", "LOAD_CONFIG_FILE", { configPath });
      const data = fs.readFileSync(configPath, "utf8");
      const config = JSON.parse(data);
      writeLog("INFO", "CONFIG_LOADED", { config });
      return { ...defaultConfig, ...config };
    } else {
      writeLog("WARN", "CONFIG_FILE_NOT_FOUND", { configPath });
    }
  } catch (error) {
    writeLog("ERROR", "CONFIG_LOAD_ERROR", { error: (error as Error).message });
  }

  writeLog("INFO", "USING_DEFAULT_CONFIG", { config: defaultConfig });
  return defaultConfig;
}

// Load the configuration
const externalConfig = loadExternalConfig();

interface NotificationResponse {
  hasNotification: boolean;
  notification?: {
    id: string;
    type: "INFO" | "ERROR" | "COINS" | "FREE_HTML" | "URL_HTML";
    message: string;
  };
}

let mainWindow: BrowserWindow | null = null;
let lastNotificationId: string | null = null;
let pollingInterval: NodeJS.Timeout | null = null;

function decodeText(text: string): string {
  try {
    return decodeURIComponent(escape(text));
  } catch {
    return text;
  }
}

async function checkForNotifications() {
  try {
    if (externalConfig.LOG) {
      writeLog("INFO", "CHECK_NOTIFICATIONS_START");
    }

    const response = await axios.get<NotificationResponse>(
      externalConfig.API_URL,
      {
        params: {
          userId: userId,
        },
      }
    );

    const data = response.data;
    if (externalConfig.LOG) {
      writeLog("INFO", "NOTIFICATION_RESPONSE", { response: data });
    }

    if (data.hasNotification && data.notification) {
      if (externalConfig.LOG) {
        writeLog("INFO", "NEW_NOTIFICATION_FOUND", {
          notification: data.notification,
        });
      }

      if (data.notification.id === lastNotificationId) {
        if (externalConfig.LOG) {
          writeLog("INFO", "DUPLICATE_NOTIFICATION_SKIPPED", {
            notificationId: lastNotificationId,
          });
        }
        return;
      }

      if (externalConfig.LOG) {
        writeLog("INFO", "PROCESSING_NEW_NOTIFICATION", {
          notification: data.notification,
        });
      }

      const { type, message } = data.notification;
      lastNotificationId = data.notification.id;

      if (mainWindow) {
        if (externalConfig.LOG) {
          writeLog("INFO", "SENDING_NOTIFICATION_TO_RENDERER", {
            type,
            message,
          });
        }
        mainWindow.webContents.send("show-notification", { type, message });
      } else {
        writeLog("ERROR", "MAIN_WINDOW_NOT_AVAILABLE");
      }
    } else if (externalConfig.LOG) {
      writeLog("INFO", "NO_NEW_NOTIFICATIONS");
    }
  } catch (error) {
    writeLog("ERROR", "NOTIFICATION_CHECK_ERROR", {
      error: (error as Error).message,
    });
  }
}

function startPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }

  writeLog("INFO", "STARTING_NOTIFICATION_POLLING", {
    interval: externalConfig.API_POLLING_INTERVAL,
  });
  pollingInterval = setInterval(
    checkForNotifications,
    externalConfig.API_POLLING_INTERVAL
  );
  checkForNotifications();
}

function stopPolling() {
  if (pollingInterval) {
    writeLog("INFO", "STOPPING_NOTIFICATION_POLLING");
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

function createWindow() {
  writeLog("INFO", "CREATING_MAIN_WINDOW");

  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    focusable: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
  });

  const isBackground = process.argv.includes("--background");
  if (isBackground) {
    writeLog("INFO", "RUNNING_IN_BACKGROUND_MODE");
  }

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.once("ready-to-show", () => {
    writeLog("INFO", "WINDOW_READY");
    if (mainWindow) {
      mainWindow.show();
    }
  });

  const { width, height } = mainWindow.getBounds();
  const { width: screenWidth, height: screenHeight } =
    require("electron").screen.getPrimaryDisplay().workAreaSize;
  mainWindow.setPosition(screenWidth - width - 20, screenHeight - height - 20);

  const args = process.argv.slice(process.defaultApp ? 2 : 1);
  writeLog("INFO", "CLI_ARGS_RECEIVED", { args });

  if (args.length >= 2) {
    const type = args[0].toUpperCase();
    const message = decodeText(args.slice(1).join(" "));
    writeLog("INFO", "PREPARING_CLI_NOTIFICATION", { type, message });

    const sendNotification = () => {
      writeLog("INFO", "SENDING_CLI_NOTIFICATION");
      if (mainWindow) {
        if (type === "URL_HTML") {
          try {
            new URL(message);
            mainWindow.webContents.send("show-notification", { type, message });
            writeLog("INFO", "URL_HTML_NOTIFICATION_SENT", { url: message });
          } catch (err) {
            writeLog("ERROR", "INVALID_URL_PROVIDED", { url: message });
            mainWindow.webContents.send("show-notification", {
              type: "ERROR",
              message: "כתובת URL לא תקינה",
            });
          }
        } else {
          mainWindow.webContents.send("show-notification", { type, message });
          writeLog("INFO", "NOTIFICATION_SENT", { type, message });
        }
      }
    };

    if (mainWindow.webContents.isLoading()) {
      mainWindow.webContents.once("did-finish-load", sendNotification);
    } else {
      sendNotification();
    }
  }

  mainWindow.webContents.once("did-finish-load", () => {
    startPolling();
  });

  mainWindow.on("closed", () => {
    stopPolling();
    mainWindow = null;
    writeLog("INFO", "WINDOW_CLOSED");
  });
}

// Add IPC handler for logging from renderer process
app.whenReady().then(() => {
  ipcMain.on(
    "write-log",
    (_, severity: LogEntry["severity"], event: string, data?: any) => {
      writeLog(severity, event, data);
    }
  );
  writeLog("INFO", "APP_READY");
  createWindow();
});

app.on("window-all-closed", () => {
  stopPolling();
  writeLog("INFO", "ALL_WINDOWS_CLOSED");
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
