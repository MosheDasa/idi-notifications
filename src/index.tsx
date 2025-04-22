import React from "react";
import ReactDOM from "react-dom/client";
import NotificationManager from "./components/NotificationManager";
import "./styles/notifications.css";
import { ipcRenderer } from "electron";
import { NotificationType } from "./components/BaseNotification";

console.log("Renderer process started");

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

// Create a ref to store the showNotification function
let showNotificationRef:
  | ((type: NotificationType, message: string, duration?: number) => void)
  | null = null;

// Listen for show-notification events
ipcRenderer.on("show-notification", (_, { type, message }) => {
  console.log("Received notification:", { type, message });
  if (showNotificationRef) {
    showNotificationRef(type as NotificationType, message);
  } else {
    console.error("showNotificationRef is not initialized");
  }
});

root.render(
  <React.StrictMode>
    <NotificationManager
      onInit={(showNotification) => {
        console.log("NotificationManager initialized");
        showNotificationRef = showNotification;
      }}
    />
  </React.StrictMode>
);
