import React from "react";
import BaseNotification from "./BaseNotification";

interface ErrorNotificationProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = (props) => {
  return <BaseNotification type="ERROR" {...props} />;
};

export default ErrorNotification;
