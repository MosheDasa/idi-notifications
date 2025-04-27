import React from "react";
import BaseNotification, {
  BaseNotificationProps,
} from "../common/BaseNotification";
import chestImg from "../../assets/chest.png";
import coinsImg from "../../assets/coins.png";
import "./styles.css";

interface ChestCoinsNotificationProps
  extends Omit<BaseNotificationProps, "className" | "children"> {
  amount: number;
  id: string;
}

const CoinsNotification: React.FC<ChestCoinsNotificationProps> = ({
  amount,
  onClose,
  isPermanent,
  displayTime,
  id,
}) => {
  return (
    <BaseNotification
      onClose={onClose}
      isPermanent={isPermanent}
      displayTime={displayTime}
      className="chest-coins-notification"
      message={`וואו שווה! הצלחת לצבור ${amount.toLocaleString()} שקלים`}
      id={id}
    >
      <div className="chest-coins-content">
        <img src={chestImg} alt="תיבה" className="chest-img" />
        <div className="chest-coins-title">וואו שירה!!</div>
        <div className="chest-coins-sub">הצלחת לצבור</div>
        <div className="chest-coins-amount-row">
          <span className="chest-coins-amount">₪{amount.toLocaleString()}</span>
          <img src={coinsImg} alt="מטבעות" className="coins-img" />
        </div>
        <div className="chest-coins-footer">כל הכבוד לך!</div>
      </div>
    </BaseNotification>
  );
};

export default CoinsNotification;
