import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  receive: (channel: string, func: (...args: any[]) => void) => {
    console.log(`Setting up listener for channel: ${channel}`);
    ipcRenderer.on(channel, (event, ...args) => {
      console.log(`Received message on channel ${channel}:`, args);
      func(...args);
    });
  },
});
