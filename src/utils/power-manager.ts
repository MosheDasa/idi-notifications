import { powerMonitor } from "electron";
import { writeLog } from "./logger";
import { getWebSocket } from "./socket-manager";

export function setupPowerManagement() {
  powerMonitor.on("suspend", () => {
    writeLog("INFO", "SYSTEM_SUSPENDED");
    const ws = getWebSocket();
    if (ws) {
      try {
        ws.close();
      } catch (error) {
        writeLog("ERROR", "WEBSOCKET_CLOSE_ERROR", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  });

  powerMonitor.on("resume", () => {
    writeLog("INFO", "SYSTEM_RESUMED");
    // WebSocket will automatically reconnect through the error handler
  });
}
