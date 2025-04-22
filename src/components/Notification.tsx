import React, { useEffect } from "react";
import { motion } from "framer-motion";
import "./Notification.css";

interface NotificationProps {
  type: "INFO" | "ERROR" | "COINS";
  message: string;
  onClose: () => void;
}

const NotificationIcon = ({ type }: { type: "INFO" | "ERROR" | "COINS" }) => {
  switch (type) {
    case "INFO":
      return <div className="icon info-icon">i</div>;
    case "ERROR":
      return <div className="icon error-icon">×</div>;
    case "COINS":
      return (
        <div className="icon coins-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#FFD700" />
            <path
              d="M8 10C8 8.61929 12.2386 7.5 17.3333 7.5C19.8158 7.5 22 7.94771 23.5 8.66019V16.5C23.5 17.8807 19.2614 19 14.1667 19C11.6842 19 9.5 18.5523 8 17.8398V10Z"
              fill="#FFB200"
            />
            <path
              d="M0.5 10C0.5 8.61929 4.73858 7.5 9.83333 7.5C12.3158 7.5 14.5 7.94771 16 8.66019V16.5C16 17.8807 11.7614 19 6.66667 19C4.18418 19 2 18.5523 0.5 17.8398V10Z"
              fill="#FFD04B"
            />
          </svg>
        </div>
      );
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

  const renderContent = () => {
    switch (type) {
      case "COINS":
        return (
          <>
            <div className="header">
              <span>הצלחת לצבור</span>
            </div>
            <div className="amount">
              <span className="amount-text">₪1,000</span>
              <NotificationIcon type="COINS" />
            </div>
            <div className="footer">כל הכבוד לך!</div>
          </>
        );
      case "INFO":
      case "ERROR":
        return (
          <div className="content">
            <NotificationIcon type={type} />
            <span className="message">{message}</span>
          </div>
        );
    }
  };

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
      {renderContent()}
    </motion.div>
  );
};

export default Notification;
