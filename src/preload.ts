import { contextBridge, ipcRenderer } from "electron";
import { writeLog } from "./utils/logger";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  openConfigFolder: () => ipcRenderer.send("open-config-folder"),
  restartApp: () => ipcRenderer.send("restart-app"),
  ipcRenderer: {
    send: (channel: string, data?: any) => {
      // whitelist channels
      const validChannels = [
        "no-notifications", 
        "enable-mouse-events", 
        "disable-mouse-events",
        "open-config-folder",
        "restart-app"
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      const validChannels = ["show-notification"];
      if (validChannels.includes(channel)) {
        // Strip event as it includes `sender` and other internal electron stuff
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    removeAllListeners: (channel: string) => {
      const validChannels = ["show-notification"];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    },
  },
});
