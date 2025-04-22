import React, { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import InfoNotification from "./InfoNotification";
import ErrorNotification from "./ErrorNotification";
import CoinsNotification from "./CoinsNotification";
import { NotificationType } from "./BaseNotification";

interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationManagerProps {
  onInit?: (
    showNotification: (
      type: NotificationType,
      message: string,
      duration?: number
    ) => void
  ) => void;
}

// Create a global interface for the window object
declare global {
  interface Window {
    showNotification?: (
      type: NotificationType,
      message: string,
      duration?: number
    ) => void;
  }
}

const NotificationManager: React.FC<NotificationManagerProps> = ({
  onInit,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(
    (type: NotificationType, message: string, duration?: number) => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { id, type, message, duration }]);
    },
    []
  );

  // Initialize with callback if provided
  React.useEffect(() => {
    if (onInit) {
      onInit(showNotification);
    }
    // Also expose to window for backward compatibility
    window.showNotification = showNotification;
    return () => {
      delete window.showNotification;
    };
  }, [showNotification, onInit]);

  const removeNotification = (id: number) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const renderNotification = (notification: Notification) => {
    const props = {
      key: notification.id,
      message: notification.message,
      duration: notification.duration,
      onClose: () => removeNotification(notification.id),
    };

    switch (notification.type) {
      case "INFO":
        return <InfoNotification {...props} />;
      case "ERROR":
        return <ErrorNotification {...props} />;
      case "COINS":
        return <CoinsNotification {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="notification-container">
      <AnimatePresence>
        {notifications.map((notification) => renderNotification(notification))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationManager;
