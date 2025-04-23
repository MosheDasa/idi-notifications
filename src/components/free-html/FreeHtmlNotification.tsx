import React, { useEffect } from "react";
import { motion } from "framer-motion";
import "./styles.css";
import "../common/styles.css";

interface FreeHtmlNotificationProps {
  message: string;
  onClose: () => void;
}

const FreeHtmlNotification: React.FC<FreeHtmlNotificationProps> = ({
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
      className="notification free-html"
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
    >
      <button className="close-button" onClick={onClose}>
        ×
      </button>
      <div
        className="notification-content"
        dangerouslySetInnerHTML={{ __html: message }}
      />
    </motion.div>
  );
};

export default FreeHtmlNotification;
