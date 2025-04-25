import { shell } from "electron";

export function playSound() {
  try {
    // Play system beep sound
    shell.beep();
  } catch (error) {
    console.error("Error playing sound:", error);
  }
}
