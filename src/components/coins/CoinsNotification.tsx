import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FaCoins } from "react-icons/fa";
import "./styles.css";

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
    <motion.div
      className="notification coins"
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
    >
      <button className="close-button" onClick={onClose}>
        ×
      </button>
      <div className="coins-content">
        <div className="main-text">הצלחת לצבור</div>
        <div className="amount-row">
          <span className="amount">1,000₪</span>
          <span className="separator">כל</span>
          <div className="coins-icon">
            <FaCoins />
          </div>
        </div>
        <div className="sub-text">כל הכבוד לך</div>
      </div>
    </motion.div>
  );
};

export default CoinsNotification;
