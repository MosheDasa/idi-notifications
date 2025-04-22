import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { AnimatePresence } from "framer-motion";
import Notification from "./components/Notification";
import CoinsNotification from "./components/CoinsNotification";
import "./styles/notifications.css";
import { ipcRenderer } from "electron";

interface NotificationItem {
  id: string;
  type: "INFO" | "ERROR" | "COINS";
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

  return (
    <div className="notification-container">
      <AnimatePresence>
        {notifications.map((notification) =>
          notification.type === "COINS" ? (
            <CoinsNotification
              key={notification.id}
              message={notification.message}
              onClose={() => removeNotification(notification.id)}
            />
          ) : (
            <Notification
              key={notification.id}
              type={notification.type as "INFO" | "ERROR"}
              message={notification.message}
              onClose={() => removeNotification(notification.id)}
            />
          )
        )}
      </AnimatePresence>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
