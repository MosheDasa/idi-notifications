import { BrowserWindow } from "electron";
import * as path from "path";
import { writeLog } from "./logger";
import { setNotificationWindow } from "./sound";

let notificationWindow: BrowserWindow | null = null;

export function createNotificationWindow(): BrowserWindow {
  writeLog("INFO", "CREATING_NOTIFICATION_WINDOW");

  const { height: screenHeight } =
    require("electron").screen.getPrimaryDisplay().workAreaSize;

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

  notificationWindow.loadFile(path.join(__dirname, "index.html"));

  notificationWindow.once("ready-to-show", () => {
    if (notificationWindow) {
      const { width } = notificationWindow.getBounds();
      const { width: screenWidth } =
        require("electron").screen.getPrimaryDisplay().workAreaSize;
      notificationWindow.setPosition(screenWidth - width - 20, 0);
      notificationWindow.show();

      // Make sure the window is visible and interactive
      notificationWindow.setVisibleOnAllWorkspaces(true);
      notificationWindow.focus();
    }
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
            error: error.message,
          });
        });
    }
  });

  notificationWindow.on("closed", () => {
    notificationWindow = null;
    writeLog("INFO", "NOTIFICATION_WINDOW_CLOSED");
  });

  return notificationWindow;
}

export function getNotificationWindow(): BrowserWindow | null {
  return notificationWindow;
}

export function setNotificationWindowInstance(window: BrowserWindow | null) {
  notificationWindow = window;
}
