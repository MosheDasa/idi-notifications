import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FaExclamationCircle } from "react-icons/fa";
import { config } from "../../config";
import "./styles.css";
import "../common/styles.css";

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  message,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, config.notifications.timeouts.error);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      className="notification error"
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
    >
      <button className="close-button" onClick={onClose}>
        ×
      </button>
      <div className="notification-content">
        <div className="notification-icon">
          <FaExclamationCircle />
        </div>
        <div className="notification-message">{message}</div>
      </div>
    </motion.div>
  );
};

export default ErrorNotification;
