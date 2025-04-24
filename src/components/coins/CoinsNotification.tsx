import React from "react";
import { FaCoins } from "react-icons/fa";
import BaseNotification, {
  BaseNotificationProps,
} from "../common/BaseNotification";

interface CoinsNotificationProps
  extends Omit<BaseNotificationProps, "className" | "children"> {
  id: string;
}

const CoinsNotification: React.FC<CoinsNotificationProps> = ({
  message,
  onClose,
  isPermanent,
  displayTime,
  id,
}) => {
  return (
    <BaseNotification
      message={message}
      onClose={onClose}
      isPermanent={isPermanent}
      displayTime={displayTime}
      className="coins-notification"
      id={id}
    >
      <div className="notification-content">
        <FaCoins className="notification-icon" />
        <p>{message}</p>
      </div>
    </BaseNotification>
  );
};

export default CoinsNotification;
