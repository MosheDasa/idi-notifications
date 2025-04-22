import React, { useEffect } from "react";
import { motion } from "framer-motion";
import "./Notification.css";

interface NotificationProps {
  type: "INFO" | "ERROR";
  message: string;
  onClose: () => void;
}

const NotificationIcon = ({ type }: { type: "INFO" | "ERROR" }) => {
  switch (type) {
    case "INFO":
      return <div className="icon info-icon">i</div>;
    case "ERROR":
      return <div className="icon error-icon">×</div>;
  }
};

const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      className={`notification ${type.toLowerCase()}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <button className="close-button" onClick={onClose}>
        ×
      </button>
      <div className="content">
        <NotificationIcon type={type} />
        <span className="message">{message}</span>
      </div>
    </motion.div>
  );
};

export default Notification;
