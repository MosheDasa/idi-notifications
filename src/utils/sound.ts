import { app } from "electron";
import * as path from "path";
import * as fs from "fs";
import { exec } from "child_process";

let notificationWindow: any = null;

export function setNotificationWindow(window: any) {
  notificationWindow = window;
}

export function playSound(notificationType?: string) {
  try {
    const soundDir = path.join(app.getAppPath(), "SOUND");

    if (!fs.existsSync(soundDir)) {
      fs.mkdirSync(soundDir, { recursive: true });
    }

    let soundFile = "default.wav";
    if (notificationType === "COINS") {
      soundFile = "coins.wav";
    } else if (notificationType === "ERROR") {
      soundFile = "error.wav";
    } else if (notificationType === "INFO") {
      soundFile = "info.wav";
    }

    const soundPath = path.join(soundDir, soundFile);

    if (fs.existsSync(soundPath)) {
      exec(
        `powershell -c (New-Object Media.SoundPlayer "${soundPath}").PlaySync()`
      );
    } else {
      console.error("Sound file not found:", soundPath);
    }
  } catch (error) {
    console.error("Error playing sound:", error);
  }
}
