import { app, BrowserWindow, ipcMain } from "electron";
import { writeLog, initLogger } from "./utils/logger";
import { loadConfig } from "./utils/config-manager";
import { connectWebSocket } from "./utils/socket-manager";
import { setupPowerManagement } from "./utils/power-manager";
import { createNotificationWindow } from "./utils/window-manager";

// Load configuration first
const config = loadConfig();

// Initialize logger with the user ID
initLogger(config.userId);

// Now we can safely write logs
writeLog("INFO", "APP_STARTING");

// Wait for app to be ready before creating windows
app.whenReady().then(() => {
  try {
    writeLog("INFO", "APP_READY");

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

// Handle app events
app.on("window-all-closed", () => {
  // if (process.platform !== "darwin") {
  //   app.quit();
  // }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createNotificationWindow();
  }
});

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
