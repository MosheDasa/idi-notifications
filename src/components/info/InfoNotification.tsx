import React from "react";
import { FaInfo } from "react-icons/fa";
import BaseNotification, {
  BaseNotificationProps,
} from "../common/BaseNotification";

interface InfoNotificationProps
  extends Omit<BaseNotificationProps, "className" | "children"> {
  id: string;
}

const InfoNotification: React.FC<InfoNotificationProps> = ({
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
      className="info-notification"
      id={id}
    >
      <div className="notification-content">
        <div className="notification-icon">
          <FaInfo />
        </div>
        <div className="notification-message">{message}</div>
      </div>
    </BaseNotification>
  );
};

export default InfoNotification;
