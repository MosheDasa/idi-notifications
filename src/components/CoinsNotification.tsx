import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./CoinsNotification.css";

interface CoinsNotificationProps {
  message: string;
  onClose: () => void;
}

const CoinsNotification: React.FC<CoinsNotificationProps> = ({
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
    <AnimatePresence>
      <motion.div
        className="coins-notification"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        <div className="treasure-icon">
          <img src="/treasure-chest.png" alt="Treasure Chest" />
        </div>

        <div className="notification-content">
          <h2 className="title">וואו שיחקת!!</h2>
          <p className="subtext">הצלחת לצבור</p>
          <div className="amount-container">
            <span className="amount">{message}</span>
            <img src="/coins-icon.png" alt="Coins" className="coins-icon" />
          </div>
          <p className="closing-text">כל הכבוד לך!</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CoinsNotification;
