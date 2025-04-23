import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./styles.css";
import "../common/styles.css";

interface UrlHtmlNotificationProps {
  url: string;
  onClose: () => void;
}

const UrlHtmlNotification: React.FC<UrlHtmlNotificationProps> = ({
  url,
  onClose,
}) => {
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        setContent(html);
      } catch (err: any) {
        setError(`Failed to load content: ${err.message}`);
        console.error("Error loading HTML content:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();

    // Close notification after 10 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [url, onClose]);

  return (
    <motion.div
      className="notification url-html"
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
    >
      <button className="close-button" onClick={onClose}>
        ×
      </button>
      <div className="notification-content">
        {isLoading ? (
          <div className="loading">טוען תוכן...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </div>
    </motion.div>
  );
};

export default UrlHtmlNotification;
