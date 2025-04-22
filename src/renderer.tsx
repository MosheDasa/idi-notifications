import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
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
      console.log("Current notifications:", [...notifications, data]);
    });
  }, []);

  const removeNotification = (index: number) => {
    console.log("Removing notification at index:", index);
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="notification-container">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={index}
            className={`notification ${notification.type.toLowerCase()}`}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          >
            <div className="notification-content">
              <div className="notification-header">
                <span className="notification-type">{notification.type}</span>
                <button
                  className="notification-close"
                  onClick={() => removeNotification(index)}
                >
                  ×
                </button>
              </div>
              <p className="notification-message">{notification.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

console.log("Starting renderer process...");
ReactDOM.render(<App />, document.getElementById("root"));
