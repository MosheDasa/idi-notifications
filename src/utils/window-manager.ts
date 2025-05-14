import { BrowserWindow, screen, app } from "electron";
import * as path from "path";
import { writeLog } from "./logger";
import { setNotificationWindow } from "./sound";

let notificationWindow: BrowserWindow | null = null;

function getIndexHtmlPath(): string {
  // In development, use the dist directory in the project root
  if (!app.isPackaged) {
    return path.join(process.cwd(), "dist/index.html");
  }

  // In production, use the resources directory
  return path.join(process.resourcesPath, "dist/index.html");
}

export function createNotificationWindow(): BrowserWindow {
  try {
    writeLog("INFO", "CREATING_NOTIFICATION_WINDOW");

    const { height: screenHeight, width: screenWidth } =
      screen.getPrimaryDisplay().workAreaSize;

    notificationWindow = new BrowserWindow({
      width: 400,
      height: 100, // Start with a smaller initial height
      show: false,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        devTools: !app.isPackaged,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    // Set the notification window
    setNotificationWindow(notificationWindow);

    // Load index.html
    const indexPath = getIndexHtmlPath();
    writeLog("DEBUG", "LOADING_INDEX_HTML", {
      path: indexPath,
      isPackaged: app.isPackaged,
      resourcesPath: process.resourcesPath,
      cwd: process.cwd(),
      execPath: process.execPath,
    });

    notificationWindow.loadFile(indexPath).catch((error) => {
      writeLog("ERROR", "WINDOW_LOAD_ERROR", {
        error: error instanceof Error ? error.message : String(error),
        path: indexPath,
        isPackaged: app.isPackaged,
        resourcesPath: process.resourcesPath,
        cwd: process.cwd(),
        execPath: process.execPath,
      });
    });

    notificationWindow.once("ready-to-show", () => {
      if (notificationWindow) {
        const { width } = notificationWindow.getBounds();
        notificationWindow.setPosition(
          screenWidth - width - 20,
          screenHeight - 100
        ); // Position at bottom right
        notificationWindow.show();

        // Make sure the window is visible and interactive
        notificationWindow.setVisibleOnAllWorkspaces(true);
        notificationWindow.focus();
      }
    });

    // Handle window loading errors
    notificationWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription) => {
        writeLog("ERROR", "WINDOW_LOAD_FAILED", {
          errorCode,
          errorDescription,
          path: indexPath,
          isPackaged: app.isPackaged,
          resourcesPath: process.resourcesPath,
          cwd: process.cwd(),
          execPath: process.execPath,
        });
      }
    );

    // Prevent window from being closed
    notificationWindow.on("close", (event) => {
      event.preventDefault();
      if (notificationWindow) {
        notificationWindow.hide();
      }
      writeLog("INFO", "WINDOW_HIDDEN");
    });

    // Wait for window to be fully loaded before setting up mouse events
    notificationWindow.webContents.once("did-finish-load", () => {
      if (notificationWindow) {
        // Allow mouse events for the notification container
        notificationWindow.webContents
          .executeJavaScript(
            `
          try {
            document.body.style.pointerEvents = 'none';
            const container = document.querySelector('.notification-container');
            if (container) {
              container.style.pointerEvents = 'auto';
              container.style.zIndex = '1000';
              // Make sure close button is clickable
              const closeButtons = container.querySelectorAll('.close-button');
              closeButtons.forEach(button => {
                button.style.pointerEvents = 'auto';
                button.style.zIndex = '1001';
              });
            }
          } catch (error) {
            console.error('Error setting pointer events:', error);
          }
        `
          )
          .catch((error) => {
            writeLog("ERROR", "JAVASCRIPT_EXECUTION_ERROR", {
              error: error instanceof Error ? error.message : String(error),
            });
          });
      }
    });

    return notificationWindow;
  } catch (error) {
    writeLog("ERROR", "NOTIFICATION_WINDOW_CREATION_ERROR", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export function getNotificationWindow(): BrowserWindow | null {
  return notificationWindow;
}

export function setNotificationWindowInstance(
  window: BrowserWindow | null
): void {
  notificationWindow = window;
}

export function showNotificationWindow() {
  if (notificationWindow) {
    writeLog("INFO", "SHOWING_NOTIFICATION_WINDOW");
    notificationWindow.show();
  }
}

export function hideNotificationWindow() {
  if (notificationWindow) {
    writeLog("INFO", "HIDING_NOTIFICATION_WINDOW");
    notificationWindow.hide();
  }
}
