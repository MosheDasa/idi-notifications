import React from "react";
import { motion } from "framer-motion";

export type NotificationType = "INFO" | "ERROR" | "COINS";

interface BaseNotificationProps {
  type: NotificationType;
  message: string;
  duration?: number;
  onClose: () => void;
}

const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const getIcon = (type: NotificationType): string => {
  switch (type) {
    case "INFO":
      return "ℹ️";
    case "ERROR":
      return "⚠️";
    case "COINS":
      return "🪙";
    default:
      return "";
  }
};

const BaseNotification: React.FC<BaseNotificationProps> = ({
  type,
  message,
  duration = 5000,
  onClose,
}) => {
  const [timestamp] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`notification ${type.toLowerCase()}`}
    >
      <div className="notification-icon">{getIcon(type)}</div>
      <div className="notification-content">
        <div className="notification-header">
          <span className="notification-type">{type}</span>
          <span className="notification-time">{formatTime(timestamp)}</span>
        </div>
        <p className="notification-message">{message}</p>
      </div>
      <button className="notification-close" onClick={onClose}>
        ×
      </button>
    </motion.div>
  );
};

export default BaseNotification;
