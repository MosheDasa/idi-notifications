import { app, BrowserWindow } from "electron";
import * as path from "path";
import axios from "axios";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { config } from "./config";

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

// Get USERID from Windows environment variables
const userId = process.env.USERID || process.env.USERNAME;
console.log("userId", userId, process.env);
if (!userId) {
  console.error("USERID or USERNAME environment variable is not set");
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
    console.log("Looking for config file at:", configPath);

    if (fs.existsSync(configPath)) {
      console.log("Loading config from:", configPath);
      const data = fs.readFileSync(configPath, "utf8");
      const config = JSON.parse(data);
      console.log("Loaded config:", config);
      return { ...defaultConfig, ...config };
    } else {
      console.log("Config file not found, using defaults");
    }
  } catch (error) {
    console.error("Failed to load config:", error);
  }

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
      console.log("Checking for notifications...");
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
      console.log("Server response:", data);
    }

    if (data.hasNotification && data.notification) {
      if (externalConfig.LOG) {
        console.log("Found new notification:", data.notification);
      }

      // בדיקה שזו לא התראה שכבר הוצגה
      if (data.notification.id === lastNotificationId) {
        if (externalConfig.LOG) {
          console.log("Notification already shown, skipping");
        }
        return;
      }

      if (externalConfig.LOG) {
        console.log("Notification is new, showing it...");
      }
      const { type, message } = data.notification;

      // Update the last shown notification ID
      lastNotificationId = data.notification.id;

      // Send notification to renderer if window exists
      if (mainWindow) {
        if (externalConfig.LOG) {
          console.log("Sending notification to renderer:", { type, message });
        }
        mainWindow.webContents.send("show-notification", { type, message });
      } else {
        console.error("Main window is not available");
      }
    } else if (externalConfig.LOG) {
      console.log("No new notifications");
    }
  } catch (error) {
    console.error("Failed to check for notifications:", error);
  }
}

function startPolling() {
  // Clear any existing interval
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }

  // Start polling with configured interval
  pollingInterval = setInterval(
    checkForNotifications,
    externalConfig.API_POLLING_INTERVAL
  );

  // Do an initial check immediately
  checkForNotifications();
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

function createWindow() {
  if (externalConfig.LOG) {
    console.log("Creating window...");
  }

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

  // Hide window if running in background mode
  const isBackground = process.argv.includes("--background");
  if (isBackground && externalConfig.LOG) {
    console.log("Running in background mode");
  }

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Show window when ready (only if not in background mode)
  mainWindow.once("ready-to-show", () => {
    if (externalConfig.LOG) {
      console.log("Window ready to show");
    }
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Position the window in the bottom-right corner
  const { width, height } = mainWindow.getBounds();
  const { width: screenWidth, height: screenHeight } =
    require("electron").screen.getPrimaryDisplay().workAreaSize;
  mainWindow.setPosition(screenWidth - width - 20, screenHeight - height - 20);

  // Send CLI parameters to renderer (if any)
  const args = process.argv.slice(process.defaultApp ? 2 : 1);
  if (externalConfig.LOG) {
    console.log("CLI args:", args);
  }

  if (args.length >= 2) {
    const type = args[0].toUpperCase();
    const message = decodeText(args.slice(1).join(" "));
    if (externalConfig.LOG) {
      console.log("Preparing to send notification:", { type, message });
    }

    const sendNotification = () => {
      if (externalConfig.LOG) {
        console.log("Window loaded, sending notification");
      }
      if (mainWindow) {
        // בדיקה אם זו התראת URL_HTML
        if (type === "URL_HTML") {
          // וידוא שה-URL תקין
          try {
            new URL(message);
            mainWindow.webContents.send("show-notification", { type, message });
          } catch (err) {
            console.error("Invalid URL provided:", message);
            mainWindow.webContents.send("show-notification", {
              type: "ERROR",
              message: "כתובת URL לא תקינה",
            });
          }
        } else {
          mainWindow.webContents.send("show-notification", { type, message });
        }
      }
    };

    if (mainWindow.webContents.isLoading()) {
      mainWindow.webContents.once("did-finish-load", sendNotification);
    } else {
      sendNotification();
    }
  }

  // Start polling for notifications when window is ready
  mainWindow.webContents.once("did-finish-load", () => {
    startPolling();
  });

  // Stop polling when window is closed
  mainWindow.on("closed", () => {
    stopPolling();
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  if (externalConfig.LOG) {
    console.log("App ready, creating window");
  }
  createWindow();
});

app.on("window-all-closed", () => {
  stopPolling();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
