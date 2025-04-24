import React, { useEffect } from "react";
import { motion } from "framer-motion";
import "./styles.css";

export interface BaseNotificationProps {
  message: string;
  onClose: () => void;
  isPermanent: boolean;
  displayTime?: number;
  className?: string;
  children?: React.ReactNode;
}

const BaseNotification: React.FC<BaseNotificationProps> = ({
  onClose,
  isPermanent,
  displayTime,
  className = "",
  children,
}) => {
  useEffect(() => {
    if (!isPermanent && typeof displayTime === "number") {
      const timer = setTimeout(onClose, displayTime);
      return () => clearTimeout(timer);
    }
  }, [onClose, isPermanent, displayTime]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    // Send message to close the window
    window.postMessage("close-notification", "*");
  };

  return (
    <motion.div
      className={`notification ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
      <button className="close-button" onClick={handleClose}>
        ×
      </button>
    </motion.div>
  );
};

export default BaseNotification;
