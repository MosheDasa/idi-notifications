import { app, BrowserWindow, ipcMain, Event } from "electron";
import { writeLog, initLogger } from "./utils/logger";
import { loadConfig } from "./utils/config-manager";
import { connectWebSocket } from "./utils/socket-manager";
import { setupPowerManagement } from "./utils/power-manager";
import {
  createNotificationWindow,
  getNotificationWindow,
  showNotificationWindow,
  hideNotificationWindow,
  createAboutWindow,
} from "./utils/window-manager";
import { createTray } from "./utils/tray-manager";

// Load configuration first
const config = loadConfig();

// Initialize logger with configuration
initLogger(config.LOG);

// Now we can safely write logs
writeLog("INFO", "APP_STARTING", { config });

// Create a function to show the About window
const showAboutWindow = () => {
  createAboutWindow();
};

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  writeLog("INFO", "SECOND_INSTANCE_DETECTED");
  app.quit();
} else {
  // Wait for app to be ready before creating windows
  app.whenReady().then(async () => {
    try {
      writeLog("INFO", "APP_READY");

      // Create tray icon with the showAboutWindow function
      await createTray(showAboutWindow);

      // Set up WebSocket connection with userId and config
      connectWebSocket(config.userId, config);

      // Set up power management
      setupPowerManagement();

      // Create notification window
      createNotificationWindow();

      // Handle IPC messages
      ipcMain.on("no-notifications", () => {
        writeLog("INFO", "NO_NOTIFICATIONS");
        hideNotificationWindow();
      });

      // Show window when new notifications arrive
      ipcMain.on("show-notification", () => {
        writeLog("INFO", "NOTIFICATION_RECEIVED");
        showNotificationWindow();
      });

      // Handle About window requests
      ipcMain.on("get-about-data", (event) => {
        writeLog("INFO", "ABOUT_DATA_REQUESTED");
        event.reply("about-data", {
          config,
          version: app.getVersion(),
        });
      });
    } catch (error) {
      writeLog("ERROR", "APP_INITIALIZATION_ERROR", {
        error: error instanceof Error ? error.message : String(error),
      });
      app.quit();
    }
  });

  // Keep the app running even when all windows are closed
  app.on("window-all-closed", (e: Event) => {
    writeLog("INFO", "ALL_WINDOWS_CLOSED");
    e.preventDefault();
  });

  // Handle app activation (e.g., clicking on the dock icon on macOS)
  app.on("activate", () => {
    writeLog("INFO", "APP_ACTIVATED");
    if (!getNotificationWindow()) {
      createNotificationWindow();
    }
  });

  // Handle second instance
  app.on("second-instance", () => {
    writeLog("INFO", "SECOND_INSTANCE_FOCUS");
    const window = getNotificationWindow();
    if (window) {
      if (window.isMinimized()) window.restore();
      window.focus();
    }
  });

  // Handle before quit
  app.on("before-quit", () => {
    writeLog("INFO", "APP_QUITTING");
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    writeLog("ERROR", "UNCAUGHT_EXCEPTION", { error: error.message });
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason) => {
    writeLog("ERROR", "UNHANDLED_REJECTION", { reason: String(reason) });
  });
}
