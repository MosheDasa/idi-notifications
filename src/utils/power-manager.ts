import { powerMonitor } from "electron";
import { writeLog } from "./logger";
import { getWebSocket } from "./socket-manager";

export function setupPowerManagement(): void {
  try {
    powerMonitor.on("suspend", () => {
      writeLog("INFO", "SYSTEM_SUSPENDED");
      const ws = getWebSocket();
      if (ws) {
        try {
          ws.deactivate();
        } catch (error) {
          writeLog("ERROR", "STOMP_DISCONNECT_ERROR", {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    });

    powerMonitor.on("resume", () => {
      writeLog("INFO", "SYSTEM_RESUMED");
      // WebSocket will automatically reconnect through the error handler
    });
  } catch (error) {
    writeLog("ERROR", "POWER_MANAGEMENT_SETUP_ERROR", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
