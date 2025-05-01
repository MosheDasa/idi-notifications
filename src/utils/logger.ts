import * as path from "path";
import * as fs from "fs";

export type LogSeverity = "INFO" | "ERROR" | "DEBUG" | "WARN";

export interface LogEntry {
  timestamp: string;
  severity: LogSeverity;
  event: string;
  data?: unknown;
}

let LOG_FILE: string | null = null;

export function initLogger(userId: string): void {
  try {
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
  } catch (error) {
    console.error("Failed to initialize logger:", error);
    process.exit(1);
  }
}

export function writeLog(
  severity: LogSeverity,
  event: string,
  data?: unknown
): void {
  if (!LOG_FILE) {
    console.error("Logger not initialized. Call initLogger first.");
    return;
  }
  console.log("dasa log", severity, event, data);
  try {
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
  } catch (error) {
    console.error("Failed to write log:", error);
  }
}
