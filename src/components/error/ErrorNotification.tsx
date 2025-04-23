import React from "react";
import { FaExclamationCircle } from "react-icons/fa";
import BaseNotification, {
  BaseNotificationProps,
} from "../common/BaseNotification";

interface ErrorNotificationProps
  extends Omit<BaseNotificationProps, "className" | "children"> {}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  message,
  onClose,
  isPermanent,
  displayTime,
}) => {
  return (
    <BaseNotification
      message={message}
      onClose={onClose}
      isPermanent={isPermanent}
      displayTime={displayTime}
      className="error-notification"
    >
      <div className="notification-content">
        <div className="notification-icon">
          <FaExclamationCircle />
        </div>
        <div className="notification-message">{message}</div>
      </div>
    </BaseNotification>
  );
};

export default ErrorNotification;
