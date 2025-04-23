import { contextBridge, ipcRenderer } from "electron";
import { writeLog } from "./utils/logger";

contextBridge.exposeInMainWorld("electron", {
  receive: (channel: string, func: (...args: any[]) => void) => {
    writeLog("INFO", "SETUP_CHANNEL_LISTENER", { channel });
    ipcRenderer.on(channel, (event, ...args) => {
      writeLog("INFO", "CHANNEL_MESSAGE_RECEIVED", { channel, args });
      func(...args);
    });
  },
});
