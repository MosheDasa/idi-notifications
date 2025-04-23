import React, { useEffect, useState } from "react";
import axios from "axios";
import BaseNotification, {
  BaseNotificationProps,
} from "../common/BaseNotification";

interface UrlHtmlNotificationProps
  extends Omit<BaseNotificationProps, "className" | "children"> {
  url: string;
}

const UrlHtmlNotification: React.FC<UrlHtmlNotificationProps> = ({
  message = "Loading content...",
  onClose,
  isPermanent,
  displayTime,
  url,
}) => {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHtmlContent = async () => {
      try {
        const response = await axios.get(url);
        setHtmlContent(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load content from URL");
        console.error("Error fetching HTML content:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHtmlContent();
  }, [url]);

  if (isLoading) {
    return (
      <BaseNotification
        message={message}
        onClose={onClose}
        isPermanent={isPermanent}
        displayTime={displayTime}
        className="url-html-notification loading"
      >
        <div className="notification-content">
          <div className="loading-spinner">Loading...</div>
        </div>
      </BaseNotification>
    );
  }

  if (error) {
    return (
      <BaseNotification
        message={message}
        onClose={onClose}
        isPermanent={isPermanent}
        displayTime={displayTime}
        className="url-html-notification error"
      >
        <div className="notification-content">
          <div className="error-message">{error}</div>
        </div>
      </BaseNotification>
    );
  }

  return (
    <BaseNotification
      message={message}
      onClose={onClose}
      isPermanent={isPermanent}
      displayTime={displayTime}
      className="url-html-notification"
    >
      <div
        className="notification-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </BaseNotification>
  );
};

export default UrlHtmlNotification;
