import WebSocket from "ws";
import { writeLog } from "./logger";
import { playSound } from "./sound";
import {
  createNotificationWindow,
  getNotificationWindow,
} from "./window-manager";
import { updateConnectionStatus } from "./tray-manager";
import { Config } from "./config-manager";

export interface Notification {
  id: string;
  type: "INFO" | "ERROR" | "COINS" | "FREE_HTML" | "URL_HTML";
  message: string;
  isPermanent?: boolean;
  displayTime?: number;
  amount?: number;
}

let ws: WebSocket | null = null;
let lastNotificationId: string | null = null;
let pingInterval: NodeJS.Timeout | null = null;
let config: Config;

export function connectWebSocket(userId: string, appConfig: Config): void {
  config = appConfig;

  if (ws) {
    try {
      ws.close();
    } catch (error) {
      writeLog("ERROR", "WEBSOCKET_CLOSE_ERROR", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  try {
    const wsUrl = config.API_URL.replace("http://", "ws://").replace(
      "https://",
      "wss://"
    );
    ws = new WebSocket(`${wsUrl}?userId=${userId}`);

    // Set up ping/pong manually
    pingInterval = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, config.API_POLLING_INTERVAL);

    ws.on("open", () => {
      writeLog("INFO", "WEBSOCKET_CONNECTED", { url: wsUrl });
      updateConnectionStatus(true);
      // Send initial ping to keep connection alive
      ws?.ping();
    });

    ws.on("ping", () => {
      writeLog("DEBUG", "WEBSOCKET_PING_RECEIVED");
      ws?.pong();
    });

    ws.on("pong", () => {
      writeLog("DEBUG", "WEBSOCKET_PONG_RECEIVED");
    });

    ws.on("message", (data: WebSocket.Data) => {
      try {
        const notification = JSON.parse(data.toString()) as Notification;
        writeLog("DEBUG", "WEBSOCKET_NOTIFICATION_RECEIVED", { notification });

        // Play notification sound
        playSound(notification.type);
        lastNotificationId = notification.id;

        // Get or create notification window
        let notificationWindow = getNotificationWindow();
        if (!notificationWindow) {
          notificationWindow = createNotificationWindow();
        }

        // Make sure window is visible
        if (notificationWindow && !notificationWindow.isVisible()) {
          writeLog("INFO", "SHOWING_HIDDEN_WINDOW");
          notificationWindow.show();
          notificationWindow.focus();
        }

        // Wait for window to be ready before sending notification
        if (notificationWindow) {
          if (notificationWindow.webContents.isLoading()) {
            notificationWindow.webContents.once("did-finish-load", () => {
              notificationWindow?.webContents.send(
                "show-notification",
                notification
              );
            });
          } else {
            notificationWindow.webContents.send(
              "show-notification",
              notification
            );
          }

          // Close specific notification after display time for non-permanent notifications
          if (!notification.isPermanent) {
            setTimeout(() => {
              if (notificationWindow) {
                notificationWindow.webContents.executeJavaScript(`
                  const notification = document.querySelector('[data-id="${notification.id}"]');
                  if (notification) {
                    notification.remove();
                  }
                `);
              }
            }, notification.displayTime || config.API_POLLING_INTERVAL / 2);
          }
        }
      } catch (error) {
        writeLog("ERROR", "WEBSOCKET_MESSAGE_PROCESSING_ERROR", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    ws.on("error", (error: Error) => {
      writeLog("ERROR", "WEBSOCKET_ERROR", { error: error.message });
      updateConnectionStatus(false);
      // Try to reconnect immediately
      setTimeout(() => connectWebSocket(userId, config), 1000);
    });

    ws.on("close", () => {
      writeLog("INFO", "WEBSOCKET_CLOSED");
      updateConnectionStatus(false);
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }
      // Try to reconnect after 5 seconds
      setTimeout(() => connectWebSocket(userId, config), 5000);
    });
  } catch (error) {
    writeLog("ERROR", "WEBSOCKET_CREATION_ERROR", {
      error: error instanceof Error ? error.message : String(error),
    });
    updateConnectionStatus(false);
    // Try to reconnect after 5 seconds
    setTimeout(() => connectWebSocket(userId, config), 5000);
  }
}

export function getWebSocket(): WebSocket | null {
  return ws;
}
