import React from "react";
import BaseNotification from "./BaseNotification";

interface InfoNotificationProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

const InfoNotification: React.FC<InfoNotificationProps> = (props) => {
  return <BaseNotification type="INFO" {...props} />;
};

export default InfoNotification;
