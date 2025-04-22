import { app, BrowserWindow } from "electron";
import * as path from "path";
import axios from "axios";

interface NotificationResponse {
  hasNotification: boolean;
  notification?: {
    id: string;
    type: "INFO" | "ERROR" | "COINS";
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
    const response = await axios.get<NotificationResponse>(
      "http://localhost:3000/notifications/check"
    );
    const data = response.data;
    console.log("dasa", data);
    if (data.hasNotification && data.notification) {
      // Check if we haven't shown this notification before
      if (data.notification.id !== lastNotificationId) {
        const { type, message } = data.notification;

        // Update the last shown notification ID
        lastNotificationId = data.notification.id;

        // Send notification to renderer if window exists
        if (mainWindow) {
          mainWindow.webContents.send("show-notification", { type, message });
        }
      }
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

  // Start polling every 10 seconds
  pollingInterval = setInterval(checkForNotifications, 10000);

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
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Show window when ready
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
  mainWindow.setPosition(screenWidth - width - 20, screenHeight - height - 20);

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
        mainWindow.webContents.send("show-notification", { type, message });
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

  // Open DevTools in development
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

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
