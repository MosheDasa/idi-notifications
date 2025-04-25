import { app, ipcMain, shell } from "electron";
import * as path from "path";
import * as fs from "fs";
import { exec } from "child_process";

// Sound file paths
const SOUND_FILES = {
  COINS: "https://assets.mixkit.co/sfx/preview/mixkit-coins-handling-1939.mp3",
  ERROR:
    "https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3",
  INFO: "https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3",
  DEFAULT:
    "https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3",
};

let notificationWindow: any = null;

export function setNotificationWindow(window: any) {
  notificationWindow = window;
}

export function playSound(notificationType?: string) {
  try {
    const soundDir = path.join(app.getAppPath(), "SOUND");

    // Ensure SOUND directory exists
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
      // Play the sound file using PowerShell
      const command = `powershell -c (New-Object Media.SoundPlayer "${soundPath}").PlaySync()`;
      exec(command, (error) => {
        if (error) {
          console.error("Error playing sound:", error);
        }
      });
    } else {
      console.error("Sound file not found:", soundPath);
    }
  } catch (error) {
    console.error("Error playing sound:", error);
  }
}
