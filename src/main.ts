import { app, BrowserWindow, ipcMain } from "electron";
import { writeLog, initLogger } from "./utils/logger";
import { loadConfig } from "./utils/config-manager";
import { connectWebSocket } from "./utils/socket-manager";
import { setupPowerManagement } from "./utils/power-manager";
import { createNotificationWindow } from "./utils/window-manager";
import { createTray } from "./utils/tray-manager";

// Load configuration first
const config = loadConfig();

// Initialize logger with the user ID
initLogger(config.userId);

// Now we can safely write logs
writeLog("INFO", "APP_STARTING");

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  // Wait for app to be ready before creating windows
  app.whenReady().then(() => {
    try {
      writeLog("INFO", "APP_READY");

      // Create tray icon
      createTray();

      // Set up WebSocket connection
      connectWebSocket(config.userId);

      // Set up power management
      setupPowerManagement();

      // Create notification window
      createNotificationWindow();

      // Handle IPC messages
      ipcMain.on("show-notification", (event, notification) => {
        writeLog("DEBUG", "IPC_NOTIFICATION_RECEIVED", { notification });
        // Handle notification through WebSocket
      });
    } catch (error) {
      writeLog("ERROR", "APP_INITIALIZATION_ERROR", {
        error: error instanceof Error ? error.message : String(error),
      });
      app.quit();
    }
  });

  // Keep the app running even when all windows are closed
  app.on("window-all-closed", () => {
    writeLog("INFO", "ALL_WINDOWS_CLOSED");
    // Don't quit the app
  });

  // Handle app activation (e.g., clicking on the dock icon on macOS)
  app.on("activate", () => {
    writeLog("INFO", "APP_ACTIVATED");
    if (BrowserWindow.getAllWindows().length === 0) {
      createNotificationWindow();
    }
  });

  // Handle second instance
  app.on("second-instance", () => {
    writeLog("INFO", "SECOND_INSTANCE_DETECTED");
    // Focus the main window if it exists
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      const mainWindow = windows[0];
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Handle before quit
  app.on("before-quit", () => {
    writeLog("INFO", "APP_QUITTING");
  });
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  writeLog("ERROR", "UNCAUGHT_EXCEPTION", {
    error: error instanceof Error ? error.message : String(error),
    stack: error.stack,
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  writeLog("ERROR", "UNHANDLED_REJECTION", {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
});
