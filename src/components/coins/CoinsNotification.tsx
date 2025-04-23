import React from "react";
import { FaCoins } from "react-icons/fa";
import BaseNotification, {
  BaseNotificationProps,
} from "../common/BaseNotification";

interface CoinsNotificationProps
  extends Omit<BaseNotificationProps, "className" | "children"> {}

const CoinsNotification: React.FC<CoinsNotificationProps> = ({
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
      className="coins-notification"
    >
      <div className="notification-content">
        <FaCoins className="notification-icon" />
        <p>{message}</p>
      </div>
    </BaseNotification>
  );
};

export default CoinsNotification;
