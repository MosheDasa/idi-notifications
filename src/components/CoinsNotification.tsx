import React from "react";
import BaseNotification from "./BaseNotification";

interface CoinsNotificationProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

const CoinsNotification: React.FC<CoinsNotificationProps> = (props) => {
  return <BaseNotification type="COINS" {...props} />;
};

export default CoinsNotification;
