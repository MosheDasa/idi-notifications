import React from "react";
import { motion } from "framer-motion";

interface CoinsNotificationProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

const CoinsNotification: React.FC<CoinsNotificationProps> = ({
  message,
  duration,
  onClose,
}) => {
  React.useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="coins-notification"
    >
      <button className="notification-close" onClick={onClose}>
        ×
      </button>
      <div className="coins-icon">
        <img
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMjQiIGZpbGw9IiNGRkYwQzQiLz4KPHBhdGggZD0iTTE2IDIwQzE2IDE3LjIzODYgMjQuNDc3MiAxNSAzNC42NjY3IDE1QzM5LjYzMTYgMTUgNDQgMTUuODk1NCA0NyAxNy4zMjA0VjMzQzQ3IDM1Ljc2MTQgMzguNTIyOCAzOCAyOC4zMzMzIDM4QzIzLjM2ODQgMzggMTkgMzcuMTA0NiAxNiAzNS42Nzk2VjIwWiIgZmlsbD0iI0ZGQjIwMCIvPgo8cGF0aCBkPSJNMSAyMEMxIDE3LjIzODYgOS40NzcxNyAxNSAxOS42NjY3IDE1QzI0LjYzMTYgMTUgMjkgMTUuODk1NCAzMiAxNy4zMjA0VjMzQzMyIDM1Ljc2MTQgMjMuNTIyOCAzOCAxMy4zMzMzIDM4QzguMzY4MzcgMzggNCAzNy4xMDQ2IDEgMzUuNjc5NlYyMFoiIGZpbGw9IiNGRkQwNEIiLz4KPC9zdmc+Cg=="
          alt="Coins"
        />
      </div>
      <div className="coins-content">
        <div className="coins-title">וואו שווה!</div>
        <div className="coins-message">{message}</div>
      </div>
    </motion.div>
  );
};

export default CoinsNotification;
