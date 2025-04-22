import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { AnimatePresence } from "framer-motion";
import CoinsNotification from "./components/CoinsNotification";
import "./styles/notifications.css";

declare global {
  interface Window {
    electron: {
      receive: (channel: string, func: (...args: any[]) => void) => void;
    };
  }
}

interface Notification {
  type: "COINS" | "INFO" | "ERROR";
  message: string;
}

const App: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    console.log("Setting up IPC listener...");
    window.electron.receive("show-notification", (data: Notification) => {
      console.log("Received notification:", data);
      setNotifications((prev) => [...prev, data]);
    });
  }, []);

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="notification-container">
      <AnimatePresence>
        {notifications.map((notification, index) =>
          notification.type === "COINS" ? (
            <CoinsNotification
              key={index}
              message={notification.message}
              onClose={() => removeNotification(index)}
            />
          ) : null
        )}
      </AnimatePresence>
    </div>
  );
};

console.log("Starting renderer process...");
ReactDOM.render(<App />, document.getElementById("root"));
