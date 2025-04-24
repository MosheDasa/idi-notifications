import React from "react";
import BaseNotification, {
  BaseNotificationProps,
} from "../common/BaseNotification";

interface FreeHtmlNotificationProps
  extends Omit<BaseNotificationProps, "className" | "children"> {
  id: string;
}

const FreeHtmlNotification: React.FC<FreeHtmlNotificationProps> = ({
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
      className="free-html-notification"
      id={id}
    >
      <div
        className="notification-content"
        dangerouslySetInnerHTML={{ __html: message }}
      />
    </BaseNotification>
  );
};

export default FreeHtmlNotification;
