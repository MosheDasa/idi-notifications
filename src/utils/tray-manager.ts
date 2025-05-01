import { Tray, Menu, nativeImage } from "electron";
import * as path from "path";
import { writeLog } from "./logger";

let tray: Tray | null = null;

export function createTray(): Tray {
  try {
    // Create base tray icon using ICO file
    const iconPath = path.join(process.cwd(), "src/assets/icon.ico");
    writeLog("DEBUG", "LOADING_TRAY_ICON", { path: iconPath });
    tray = new Tray(iconPath);

    // Set initial tooltip
    tray.setToolTip("IDI Notifications - Disconnected");

    // Create initial context menu with disconnected status
    updateContextMenu(false);

    writeLog("INFO", "TRAY_CREATED");
    return tray;
  } catch (error) {
    writeLog("ERROR", "TRAY_CREATION_ERROR", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

function updateContextMenu(isConnected: boolean) {
  if (!tray) return;

  const statusText = isConnected ? "🟢 Connected" : "🔴 Disconnected";
  const contextMenu = Menu.buildFromTemplate([
    { label: "IDI Notifications", enabled: false },
    { label: statusText, enabled: false },
    { type: "separator" },
    { label: "Exit", click: () => process.exit(0) },
  ]);

  tray.setContextMenu(contextMenu);
}

export function updateConnectionStatus(isConnected: boolean): void {
  if (!tray) return;

  try {
    // Update tooltip
    tray.setToolTip(
      `IDI Notifications - ${isConnected ? "Connected" : "Disconnected"}`
    );

    // Update context menu with new status
    updateContextMenu(isConnected);

    writeLog("INFO", "TRAY_STATUS_UPDATED", { isConnected });
  } catch (error) {
    writeLog("ERROR", "TRAY_STATUS_UPDATE_ERROR", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export function getTray(): Tray | null {
  return tray;
}
