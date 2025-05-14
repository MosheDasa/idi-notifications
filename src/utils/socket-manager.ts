import SockJS from "sockjs-client";
import { Client, Message, Frame } from "@stomp/stompjs";
import { writeLog } from "./logger";
import { playSound } from "./sound";
import {
  createNotificationWindow,
  getNotificationWindow,
} from "./window-manager";
import { updateConnectionStatus } from "./tray-manager";
import { Config } from "./config-manager";

// Disable certificate validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export interface Notification {
  id: string;
  type: "INFO" | "ERROR" | "COINS" | "FREE_HTML" | "URL_HTML";
  message: string;
  isPermanent?: boolean;
  displayTime?: number;
  amount?: number;
}

let stompClient: Client | null = null;
let lastNotificationId: string | null = null;
let config: Config;

export function connectWebSocket(userId: string, appConfig: Config): void {
  config = appConfig;

  if (stompClient) {
    try {
      stompClient.deactivate();
    } catch (error) {
      writeLog("ERROR", "STOMP_DISCONNECT_ERROR", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  try {
    const socket = new SockJS(config.API_NOTIFICATIONS_ENDPOINT);
    stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        userId: userId,
        env: "dev", // You might want to make this configurable
      },
      reconnectDelay: 5000,
      heartbeatIncoming: config.API_POLLING_INTERVAL,
      heartbeatOutgoing: config.API_POLLING_INTERVAL,
    });

    stompClient.onConnect = () => {
      writeLog("INFO", "STOMP_CONNECTED", {
        url: config.API_NOTIFICATIONS_ENDPOINT,
      });
      updateConnectionStatus(true);

      // Subscribe to user-specific topic
      stompClient?.subscribe(
        `/topic/usertest.user-${userId}`,
        (message: Message) => {
          try {
            const notification = JSON.parse(message.body) as Notification;
            writeLog("DEBUG", "STOMP_NOTIFICATION_RECEIVED", { notification });

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
            writeLog("ERROR", "STOMP_MESSAGE_PROCESSING_ERROR", {
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      );
    };

    stompClient.onStompError = (frame: Frame) => {
      writeLog("ERROR", "STOMP_ERROR", { frame });
      updateConnectionStatus(false);
    };

    stompClient.onWebSocketError = (error: Event) => {
      writeLog("ERROR", "WEBSOCKET_ERROR", {
        error: error instanceof Error ? error.message : String(error),
      });
      updateConnectionStatus(false);
    };

    stompClient.onDisconnect = () => {
      writeLog("INFO", "STOMP_DISCONNECTED");
      updateConnectionStatus(false);
    };

    // Activate the client
    stompClient.activate();
  } catch (error) {
    writeLog("ERROR", "STOMP_CREATION_ERROR", {
      error: error instanceof Error ? error.message : String(error),
    });
    updateConnectionStatus(false);
    // Try to reconnect after 5 seconds
    setTimeout(() => connectWebSocket(userId, config), 5000);
  }
}

export function getWebSocket(): Client | null {
  return stompClient;
}
