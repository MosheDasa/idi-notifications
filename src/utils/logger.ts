import { app } from "electron";
import * as path from "path";
import * as fs from "fs";

let isLoggingEnabled = false;
let logFilePath: string;

export function initLogger(enabled: boolean): void {
  isLoggingEnabled = enabled;

  if (isLoggingEnabled) {
    // Set up log directory in user's app data
    const logDir = path.join(app.getPath("userData"), "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Create log file for this session
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    logFilePath = path.join(logDir, `idi-notifications-${timestamp}.log`);
  }
}

export function writeLog(
  level: "INFO" | "ERROR" | "DEBUG",
  event: string,
  data?: Record<string, any>
): void {
  if (!isLoggingEnabled) return;

  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    event,
    ...data,
  };

  const logString = JSON.stringify(logEntry);

  // Write to file
  if (logFilePath) {
    fs.appendFileSync(logFilePath, logString + "\n");
  }

  // Also write to console in development
  if (!app.isPackaged) {
    if (level === "ERROR") {
      console.error(logString);
    } else {
      console.log(logString);
    }
  }
}
