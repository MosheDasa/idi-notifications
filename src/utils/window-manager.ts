import { BrowserWindow, screen } from "electron";
import * as path from "path";
import { writeLog } from "./logger";
import { setNotificationWindow } from "./sound";

let notificationWindow: BrowserWindow | null = null;

export function createNotificationWindow(): BrowserWindow {
  try {
    writeLog("INFO", "CREATING_NOTIFICATION_WINDOW");

    const { height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

    notificationWindow = new BrowserWindow({
      width: 400,
      height: screenHeight,
      show: false,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        devTools: false,
      },
    });

    // Set the notification window
    setNotificationWindow(notificationWindow);

    // Load index.html
    const indexPath = path.join(process.cwd(), "dist/index.html");
    writeLog("DEBUG", "LOADING_INDEX_HTML", { path: indexPath });
    notificationWindow.loadFile(indexPath);

    notificationWindow.once("ready-to-show", () => {
      if (notificationWindow) {
        const { width } = notificationWindow.getBounds();
        const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
        notificationWindow.setPosition(screenWidth - width - 20, 0);
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
