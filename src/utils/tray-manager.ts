import {
  Tray,
  Menu,
  nativeImage,
  dialog,
  app,
  shell,
  BrowserWindow,
  ipcMain,
} from "electron";
import * as path from "path";
import { writeLog } from "./logger";
import { loadConfig, getConfigPath } from "./config-manager";
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

async function showAboutDialog() {
  const config = loadConfig();
  const configPath = getConfigPath();

  const htmlContent = `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        margin: 0;
        padding: 24px;
        background: #f8f9fa;
        color: #212529;
        line-height: 1.6;
        overflow: hidden;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      h1 {
        margin: 0 0 8px 0;
        color: #1a73e8;
        font-size: 24px;
        font-weight: 500;
      }
      .version {
        color: #5f6368;
        font-size: 14px;
        margin-bottom: 20px;
      }
      .status {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${isConnected ? "#34a853" : "#ea4335"};
      }
      .section {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #e8eaed;
      }
      .section-title {
        color: #5f6368;
        font-size: 14px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
      }
      .config-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
      }
      .config-label {
        color: #5f6368;
      }
      .config-value {
        color: #1a73e8;
        font-family: 'SF Mono', 'Consolas', monospace;
      }
      .mode-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        background: ${app.isPackaged ? "#34a853" : "#fbbc04"};
        color: white;
      }
      .buttons {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #e8eaed;
      }
      button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      button.primary {
        background: #1a73e8;
        color: white;
      }
      button.primary:hover {
        background: #1557b0;
      }
      button.secondary {
        background: #f1f3f4;
        color: #1a73e8;
      }
      button.secondary:hover {
        background: #e8eaed;
      }
    </style>
    <div class="container">
      <h1>IDI Notifications</h1>
      <div class="version">Version ${APP_VERSION}</div>
      
      <div class="status">
        <div class="status-dot"></div>
        <span>${isConnected ? "Connected" : "Disconnected"}</span>
      </div>
      
      <div class="mode-badge">
        ${app.isPackaged ? "Production" : "Development"}
      </div>

      <div class="section">
        <div class="section-title">Configuration</div>
        <div class="config-item">
          <span class="config-label">User ID</span>
          <span class="config-value">${config.USER_ID}</span>
        </div>
         <div class="config-item">
          <span class="config-label">User Name</span>
          <span class="config-value">${config.USER_NAME}</span>
        </div>
        <div class="config-item">
          <span class="config-label">API URL</span>
          <span class="config-value">${config.API_URL}</span>
        </div>
        <div class="config-item">
          <span class="config-label">Polling Interval</span>
          <span class="config-value">${config.API_POLLING_INTERVAL}ms</span>
        </div>
        <div class="config-item">
          <span class="config-label">Logging</span>
          <span class="config-value">${
            config.LOG ? "Enabled" : "Disabled"
          }</span>
        </div>
          <div class="config-item">
          <span class="config-label">open dev tools</span>
          <span class="config-value">${config.OPEN_DEV_TOOLS}</span>
        </div>
        <div class="config-item">
          <span class="config-label">Config Path</span>
          <span class="config-value">${configPath}</span>
        </div>
      </div>

      <div class="buttons">
        <button class="secondary" onclick="window.electronAPI.openConfigFolder()">Open Config Folder</button>
        <button class="secondary" onclick="window.electronAPI.restartApp()">Restart</button>
        <button class="primary" onclick="window.close()">OK</button>
      </div>
    </div>
  `;

  const aboutWindow = new BrowserWindow({
    width: 600,
    height: 600,
    resizable: false,
    minimizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    backgroundColor: "#f8f9fa",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(
        app.getAppPath(),
        app.isPackaged ? "dist/preload.js" : "src/preload.js"
      ),
    },
  });

  // Set up IPC listeners
  ipcMain.on("open-config-folder", async (event) => {
    console.log("Received open-config-folder event");
    const configDir = path.dirname(configPath);
    try {
      await shell.openPath(configDir);
      console.log("Opened config folder:", configDir);
    } catch (error) {
      console.error("Failed to open config folder:", error);
    }
  });

  ipcMain.on("restart-app", (event) => {
    console.log("Received restart-app event");
    app.relaunch();
    app.exit();
  });

  // Load the HTML content
  await aboutWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
  );

  // Enable DevTools in development
  if (config.OPEN_DEV_TOOLS) {
    aboutWindow.webContents.openDevTools();
  }

  // Clean up when window is closed
  aboutWindow.on("closed", () => {
    console.log("About window closed, cleaning up listeners");
    ipcMain.removeAllListeners("open-config-folder");
    ipcMain.removeAllListeners("restart-app");
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
