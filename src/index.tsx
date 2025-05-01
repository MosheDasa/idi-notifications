import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { AnimatePresence } from "framer-motion";
import InfoNotification from "./components/info/InfoNotification";
import ErrorNotification from "./components/error/ErrorNotification";
import CoinsNotification from "./components/coins/CoinsNotification";
import FreeHtmlNotification from "./components/free-html/FreeHtmlNotification";
import UrlHtmlNotification from "./components/url-html/UrlHtmlNotification";
import "./components/common/styles.css";

// Add type declarations for the exposed electron API
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: string, data?: any): void;
        on(channel: string, func: (...args: any[]) => void): void;
        removeAllListeners(channel: string): void;
      };
    };
  }
}

interface NotificationItem {
  id: string;
  type: "INFO" | "ERROR" | "COINS" | "FREE_HTML" | "URL_HTML";
  message: string;
  isPermanent?: boolean;
  displayTime?: number;
  amount?: number;
}

const App: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    console.log("Setting up IPC listener");
    window.electron.ipcRenderer.on("show-notification", (data) => {
      console.log("Received notification:", data);
      const newNotification = {
        id: Date.now().toString(),
        type: data.type,
        message: data.message,
        isPermanent: data.isPermanent ?? true,
        displayTime: data.displayTime,
        amount: data.amount,
      };
      setNotifications((prev) => [...prev, newNotification]);
    });

    return () => {
      console.log("Cleaning up IPC listener");
      window.electron.ipcRenderer.removeAllListeners("show-notification");
    };
  }, []);

  const removeNotification = (id: string) => {
    console.log("Removing notification:", id);
    setNotifications((prev) => {
      const newNotifications = prev.filter(
        (notification) => notification.id !== id
      );
      // If no notifications left, send event to main process
      if (newNotifications.length === 0) {
        console.log("No notifications left");
        window.electron.ipcRenderer.send("no-notifications");
      }
      return newNotifications;
    });
  };

  return notifications.length > 0 ? (
    <div className="notification-container">
      <AnimatePresence>
        {notifications.map((notification) => {
          const commonProps = {
            isPermanent: notification.isPermanent ?? true,
            displayTime: notification.displayTime,
            onClose: () => removeNotification(notification.id),
          };

          switch (notification.type) {
            case "COINS":
              return (
                <CoinsNotification
                  amount={notification.amount ?? 0}
                  key={notification.id}
                  message={notification.message}
                  isPermanent={notification.isPermanent || false}
                  displayTime={notification.displayTime}
                  onClose={() => removeNotification(notification.id)}
                  id={notification.id}
                />
              );
            case "INFO":
              return (
                <InfoNotification
                  key={notification.id}
                  message={notification.message}
                  isPermanent={notification.isPermanent || false}
                  displayTime={notification.displayTime}
                  onClose={() => removeNotification(notification.id)}
                  id={notification.id}
                />
              );
            case "FREE_HTML":
              return (
                <FreeHtmlNotification
                  key={notification.id}
                  message={notification.message}
                  isPermanent={notification.isPermanent || false}
                  displayTime={notification.displayTime}
                  onClose={() => removeNotification(notification.id)}
                  id={notification.id}
                />
              );
            case "URL_HTML":
              return (
                <UrlHtmlNotification
                  key={notification.id}
                  message={notification.message}
                  isPermanent={notification.isPermanent || false}
                  displayTime={notification.displayTime}
                  url={notification.message}
                  onClose={() => removeNotification(notification.id)}
                  id={notification.id}
                />
              );
            case "ERROR":
              return (
                <ErrorNotification
                  key={notification.id}
                  message={notification.message}
                  isPermanent={notification.isPermanent || false}
                  displayTime={notification.displayTime}
                  onClose={() => removeNotification(notification.id)}
                  id={notification.id}
                />
              );
            default:
              return null;
          }
        })}
      </AnimatePresence>
    </div>
  ) : null;
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
