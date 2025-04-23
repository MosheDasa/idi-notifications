import React from "react";
import BaseNotification, {
  BaseNotificationProps,
} from "../common/BaseNotification";

interface FreeHtmlNotificationProps
  extends Omit<BaseNotificationProps, "className" | "children"> {}

const FreeHtmlNotification: React.FC<FreeHtmlNotificationProps> = ({
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
      className="free-html-notification"
    >
      <div
        className="notification-content"
        dangerouslySetInnerHTML={{ __html: message }}
      />
    </BaseNotification>
  );
};

export default FreeHtmlNotification;
