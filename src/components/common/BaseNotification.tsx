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

  return (
    <motion.div
      className={`notification ${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
    >
      {children}
      <button className="close-button" onClick={onClose}>
        ×
      </button>
    </motion.div>
  );
};

export default BaseNotification;
