import { BrowserWindow, screen, app, ipcMain } from "electron";
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

    // Configure the window to ignore mouse events except on specific elements
    // This is a simpler way to make the window click-through except for notifications
    notificationWindow.setIgnoreMouseEvents(true, { forward: true });

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
        // Add CSS class to elements that should receive mouse events
        notificationWindow.webContents
          .executeJavaScript(
            `
          try {
            // Add a class to all notifications for the mouseenterleave handler
            const style = document.createElement('style');
            style.textContent = '.notification { -webkit-app-region: no-drag; }';
            document.head.appendChild(style);
            
            // Set up event listeners to toggle ignoreMouseEvents
            document.addEventListener('mouseenter', (e) => {
              // Check if mouse is over a notification
              if (e.target.closest('.notification')) {
                // Tell the main process to start accepting mouse events
                window.electron.ipcRenderer.send('enable-mouse-events');
              }
            }, true);
            
            document.addEventListener('mouseleave', (e) => {
              // Check if we're leaving a notification
              if (e.target.closest('.notification')) {
                // Tell the main process to stop accepting mouse events
                window.electron.ipcRenderer.send('disable-mouse-events');
              }
            }, true);
            
            console.log('Set up mouse event handling for notifications');
          } catch (error) {
            console.error('Error setting up mouse events:', error);
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

    // Set up IPC handlers for mouse events
    setupMouseEventHandlers();

    return notificationWindow;
  } catch (error) {
    writeLog("ERROR", "NOTIFICATION_WINDOW_CREATION_ERROR", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Set up IPC handlers for mouse events
function setupMouseEventHandlers() {
  // Clean up any existing listeners
  ipcMain.removeAllListeners('enable-mouse-events');
  ipcMain.removeAllListeners('disable-mouse-events');
  
  // Handle enabling mouse events (when hovering over a notification)
  ipcMain.on('enable-mouse-events', () => {
    if (notificationWindow) {
      notificationWindow.setIgnoreMouseEvents(false);
    }
  });
  
  // Handle disabling mouse events (when leaving a notification)
  ipcMain.on('disable-mouse-events', () => {
    if (notificationWindow) {
      notificationWindow.setIgnoreMouseEvents(true, { forward: true });
    }
  });
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
