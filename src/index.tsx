import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { AnimatePresence } from "framer-motion";
import InfoNotification from "./components/info/InfoNotification";
import ErrorNotification from "./components/error/ErrorNotification";
import CoinsNotification from "./components/coins/CoinsNotification";
import FreeHtmlNotification from "./components/free-html/FreeHtmlNotification";
import "./components/common/styles.css";
import { ipcRenderer } from "electron";

interface NotificationItem {
  id: string;
  type: "INFO" | "ERROR" | "COINS" | "FREE_HTML";
  message: string;
}

const App: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    console.log("Setting up IPC listener");
    ipcRenderer.on("show-notification", (_, data) => {
      console.log("Received notification:", data);
      const newNotification = {
        id: Date.now().toString(),
        type: data.type,
        message: data.message,
      };
      setNotifications((prev) => [...prev, newNotification]);
    });

    return () => {
      ipcRenderer.removeAllListeners("show-notification");
    };
  }, []);

  const removeNotification = (id: string) => {
    console.log("Removing notification:", id);
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return notifications.length > 0 ? (
    <div className="notification-container">
      <AnimatePresence>
        {notifications.map((notification) => {
          switch (notification.type) {
            case "COINS":
              return (
                <CoinsNotification
                  key={notification.id}
                  message={notification.message}
                  onClose={() => removeNotification(notification.id)}
                />
              );
            case "INFO":
              return (
                <InfoNotification
                  key={notification.id}
                  message={notification.message}
                  onClose={() => removeNotification(notification.id)}
                />
              );
            case "FREE_HTML":
              return (
                <FreeHtmlNotification
                  key={notification.id}
                  message={notification.message}
                  onClose={() => removeNotification(notification.id)}
                />
              );
            default:
              return (
                <ErrorNotification
                  key={notification.id}
                  message={notification.message}
                  onClose={() => removeNotification(notification.id)}
                />
              );
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
