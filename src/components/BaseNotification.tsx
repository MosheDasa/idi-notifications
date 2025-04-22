import React from "react";
import { motion } from "framer-motion";

export type NotificationType = "INFO" | "ERROR" | "COINS";

interface BaseNotificationProps {
  type: NotificationType;
  message: string;
  duration?: number;
  onClose: () => void;
}

const BaseNotification: React.FC<BaseNotificationProps> = ({
  type,
  message,
  duration = 5000,
  onClose,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
      className={`notification ${type.toLowerCase()}`}
    >
      <div className="notification-content">
        <span className="notification-message">{message}</span>
        <button className="notification-close" onClick={onClose}>
          ×
        </button>
      </div>
    </motion.div>
  );
};

export default BaseNotification;
