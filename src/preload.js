const { contextBridge, ipcRenderer } = require("electron");

// Remove any existing handlers
ipcRenderer.removeAllListeners("open-config-folder");
ipcRenderer.removeAllListeners("restart-app");

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  openConfigFolder: () => {
    console.log("Sending open-config-folder event");
    ipcRenderer.send("open-config-folder");
  },
  restartApp: () => {
    console.log("Sending restart-app event");
    ipcRenderer.send("restart-app");
  },
});
