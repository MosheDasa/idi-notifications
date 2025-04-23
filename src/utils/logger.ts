import { ipcRenderer } from "electron";

type Severity = "INFO" | "ERROR" | "DEBUG" | "WARN";

export function writeLog(severity: Severity, event: string, data?: any) {
  // Send log to main process
  ipcRenderer.send("write-log", severity, event, data);
}
