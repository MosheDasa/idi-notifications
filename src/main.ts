import { app, BrowserWindow } from "electron";
import * as path from "path";
import axios from "axios";
import * as dotenv from "dotenv";
import { config } from "./config";

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

// Define environment variables interface
interface EnvVars {
  VITE_API_URL: string;
  VITE_API_NOTIFICATIONS_ENDPOINT: string;
  VITE_API_POLLING_INTERVAL: string;
  [key: string]: string | undefined;
}

// Get environment variables with defaults
const env: EnvVars = {
  VITE_API_URL: process.env.VITE_API_URL || "http://localhost:3001",
  VITE_API_NOTIFICATIONS_ENDPOINT:
    process.env.VITE_API_NOTIFICATIONS_ENDPOINT || "/notifications/check",
  VITE_API_POLLING_INTERVAL: process.env.VITE_API_POLLING_INTERVAL || "10000",
};

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
    console.log("Checking for notifications...");
    const response = await axios.get<NotificationResponse>(
      `${config.api.baseUrl}${config.api.notificationsEndpoint}`,
      {
        params: {
          userId: config.api.userId,
        },
      }
    );
    const data = response.data;
    console.log("Server response:", data);

    if (data.hasNotification && data.notification) {
      console.log("Found new notification:", data.notification);

      // בדיקה שזו לא התראה שכבר הוצגה
      if (data.notification.id === lastNotificationId) {
        console.log("Notification already shown, skipping");
        return;
      }

      console.log("Notification is new, showing it...");
      const { type, message } = data.notification;

      // Update the last shown notification ID
      lastNotificationId = data.notification.id;

      // Send notification to renderer if window exists
      if (mainWindow) {
        console.log("Sending notification to renderer:", { type, message });
        mainWindow.webContents.send("show-notification", { type, message });
      } else {
        console.log("Main window is not available");
      }
    } else {
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
    parseInt(env.VITE_API_POLLING_INTERVAL)
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
  console.log("Creating window...");
  mainWindow = new BrowserWindow({
    width: config.window.width,
    height: config.window.height,
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
  if (isBackground) {
    console.log("Running in background mode");
  }

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Show window when ready (only if not in background mode)
  mainWindow.once("ready-to-show", () => {
    console.log("Window ready to show");
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Position the window in the bottom-right corner
  const { width, height } = mainWindow.getBounds();
  const { width: screenWidth, height: screenHeight } =
    require("electron").screen.getPrimaryDisplay().workAreaSize;
  mainWindow.setPosition(
    screenWidth - width - config.window.margin,
    screenHeight - height - config.window.margin
  );

  // Send CLI parameters to renderer (if any)
  const args = process.argv.slice(process.defaultApp ? 2 : 1);
  console.log("CLI args:", args);

  if (args.length >= 2) {
    const type = args[0].toUpperCase();
    const message = decodeText(args.slice(1).join(" "));
    console.log("Preparing to send notification:", { type, message });

    const sendNotification = () => {
      console.log("Window loaded, sending notification");
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
  console.log("App ready, creating window");
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
