import WebSocket from "ws";
import { writeLog } from "./logger";
import { playSound } from "./sound";
import {
  createNotificationWindow,
  getNotificationWindow,
} from "./window-manager";

let ws: WebSocket | null = null;
let lastNotificationId: string | null = null;

export function connectWebSocket(userId: string) {
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
    ws = new WebSocket(`ws://localhost:3001?userId=${userId}`);

    // Set up ping/pong manually
    const pingInterval = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);

    ws.on("open", () => {
      writeLog("INFO", "WEBSOCKET_CONNECTED");
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
        const notification = JSON.parse(data.toString());
        writeLog("DEBUG", "WEBSOCKET_NOTIFICATION_RECEIVED", { notification });

        // Play notification sound
        playSound(notification.type);
        lastNotificationId = notification.id;

        // Create notification window if it doesn't exist
        if (!getNotificationWindow()) {
          createNotificationWindow();
        }

        // Wait for window to be ready before sending notification
        const notificationWindow = getNotificationWindow();
        if (notificationWindow) {
          if (notificationWindow.webContents.isLoading()) {
            notificationWindow.webContents.once("did-finish-load", () => {
              notificationWindow.webContents.send(
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
            }, notification.displayTime || 5000);
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
      // Try to reconnect immediately
      setTimeout(() => connectWebSocket(userId), 1000);
    });

    ws.on("close", () => {
      writeLog("INFO", "WEBSOCKET_CLOSED");
      clearInterval(pingInterval);
      // Try to reconnect after 5 seconds
      setTimeout(() => connectWebSocket(userId), 5000);
    });
  } catch (error) {
    writeLog("ERROR", "WEBSOCKET_CREATION_ERROR", {
      error: error instanceof Error ? error.message : String(error),
    });
    // Try to reconnect after 5 seconds
    setTimeout(() => connectWebSocket(userId), 5000);
  }
}

export function getWebSocket(): WebSocket | null {
  return ws;
}
