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
    // First try the development path
    let soundDir = path.join(app.getAppPath(), "SOUND");

    // If not found, try the installed app path
    if (!fs.existsSync(soundDir)) {
      soundDir = path.join(process.resourcesPath, "SOUND");
    }

    if (!fs.existsSync(soundDir)) {
      console.error("Sound directory not found in either location:", soundDir);
      return;
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
