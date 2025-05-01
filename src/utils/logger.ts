import * as path from "path";
import * as fs from "fs";

export interface LogEntry {
  timestamp: string;
  severity: "INFO" | "ERROR" | "DEBUG" | "WARN";
  event: string;
  data?: any;
}

let LOG_FILE: string | null = null;

export function initLogger(userId: string) {
  const LOG_DIR = path.join(
    "C:",
    "Users",
    userId,
    "idi-notifications-config",
    "log"
  );
  LOG_FILE = path.join(
    LOG_DIR,
    `idi-notifications-${new Date().toISOString().split("T")[0]}.log`
  );

  // Ensure log directory exists
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

export function writeLog(
  severity: LogEntry["severity"],
  event: string,
  data?: any
) {
  if (!LOG_FILE) {
    console.error("Logger not initialized. Call initLogger first.");
    return;
  }

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    severity,
    event,
    data,
  };

  const logLine = `${entry.timestamp} severity="${entry.severity}" event="${
    entry.event
  }" ${data ? `data="${JSON.stringify(data).replace(/"/g, '\\"')}"` : ""}\n`;

  fs.appendFileSync(LOG_FILE, logLine);
}
