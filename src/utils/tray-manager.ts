import { Tray, Menu, nativeImage, dialog, app } from "electron";
import * as path from "path";
import { writeLog } from "./logger";
import { getWebSocket } from "./socket-manager";
import { loadConfig } from "./config-manager";
import { getNotificationWindow } from "./window-manager";
import { playSound } from "./sound";

let tray: Tray | null = null;
let isConnected = false;

// Read version from package.json
const { version: APP_VERSION } = require("../../package.json");

function getIconPath(iconName: string): string {
  // In development, use the src/assets directory
  if (!app.isPackaged) {
    return path.join(process.cwd(), "src/assets", iconName);
  }

  // In production, use the resources/assets directory
  return path.join(process.resourcesPath, "assets", iconName);
}

export function createTray(): Tray {
  try {
    // Create base tray icon using disconnected state PNG
    const iconPath = getIconPath("icon-disconnected.png");
    writeLog("DEBUG", "LOADING_TRAY_ICON", {
      path: iconPath,
      isPackaged: app.isPackaged,
      resourcesPath: process.resourcesPath,
      cwd: process.cwd(),
      execPath: process.execPath,
    });

    const icon = nativeImage
      .createFromPath(iconPath)
      .resize({ width: 160, height: 160 });
    tray = new Tray(icon);

    // Set initial tooltip
    tray.setToolTip("IDI Notifications - Disconnected");

    // Create initial context menu with disconnected status
    updateContextMenu(false);

    writeLog("INFO", "TRAY_CREATED");
    return tray;
  } catch (error) {
    writeLog("ERROR", "TRAY_CREATION_ERROR", {
      error: error instanceof Error ? error.message : String(error),
      iconPath: getIconPath("icon-disconnected.png"),
      isPackaged: app.isPackaged,
      resourcesPath: process.resourcesPath,
      cwd: process.cwd(),
      execPath: process.execPath,
    });
    throw error;
  }
}

function showAboutDialog() {
  const config = loadConfig();
  dialog.showMessageBox({
    type: "info",
    title: "About IDI Notifications",
    message: "IDI Notifications",
    detail: `Version: ${APP_VERSION}\nUser ID: ${
      config.userId
    }\nConnection Status: ${isConnected ? "Connected" : "Disconnected"}`,
    buttons: ["OK"],
  });
}

function sendTestNotification() {
  const window = getNotificationWindow();
  if (!window) {
    dialog.showErrorBox("Error", "Notification window not found");
    return;
  }

  const testNotification = {
    id: `test-${Date.now()}`,
    type: "INFO" as const,
    message: "This is a test notification",
    isPermanent: false,
    displayTime: 5000,
    sound: true,
  };

  try {
    // Play notification sound first
    playSound(testNotification.type);

    // Then send the notification to the window
    window.webContents.send("show-notification", testNotification);
    writeLog("INFO", "TEST_NOTIFICATION_SENT");
  } catch (error) {
    writeLog("ERROR", "TEST_NOTIFICATION_ERROR", {
      error: error instanceof Error ? error.message : String(error),
    });
    dialog.showErrorBox("Error", "Failed to send test notification");
  }
}

function updateContextMenu(connected: boolean) {
  if (!tray) return;

  isConnected = connected;
  const statusText = connected ? "🟢 Connected" : "🔴 Disconnected";
  const contextMenu = Menu.buildFromTemplate([
    { label: "IDI Notifications", enabled: false },
    { label: statusText, enabled: false },
    { type: "separator" },
    {
      label: "Test Notification",
      click: sendTestNotification,
      enabled: true, // Always enable test notifications
    },
    {
      label: "About",
      click: showAboutDialog,
    },
    { type: "separator" },
    { label: "Exit", click: () => process.exit(0) },
  ]);

  tray.setContextMenu(contextMenu);
}

export function updateConnectionStatus(connected: boolean): void {
  if (!tray) return;

  try {
    // Update tooltip
    tray.setToolTip(
      `IDI Notifications - ${connected ? "Connected" : "Disconnected"}`
    );

    // Update icon based on connection status
    const iconName = connected ? "icon-connected.png" : "icon-disconnected.png";
    const iconPath = getIconPath(iconName);
    writeLog("DEBUG", "UPDATING_TRAY_ICON", {
      path: iconPath,
      isPackaged: app.isPackaged,
      resourcesPath: process.resourcesPath,
      cwd: process.cwd(),
      execPath: process.execPath,
    });

    const icon = nativeImage
      .createFromPath(iconPath)
      .resize({ width: 160, height: 160 });
    tray.setImage(icon);

    // Update context menu with new status
    updateContextMenu(connected);

    writeLog("INFO", "TRAY_STATUS_UPDATED", { isConnected: connected });
  } catch (error) {
    writeLog("ERROR", "TRAY_STATUS_UPDATE_ERROR", {
      error: error instanceof Error ? error.message : String(error),
      iconPath: getIconPath(
        connected ? "icon-connected.png" : "icon-disconnected.png"
      ),
      isPackaged: app.isPackaged,
      resourcesPath: process.resourcesPath,
      cwd: process.cwd(),
      execPath: process.execPath,
    });
  }
}

export function getTray(): Tray | null {
  return tray;
}
