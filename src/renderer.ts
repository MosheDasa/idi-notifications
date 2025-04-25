import { ipcRenderer } from "electron";

// Handle sound playback
ipcRenderer.on("play-sound", (event, soundPath) => {
  console.log("Playing sound:", soundPath);
  try {
    const audio = new Audio();
    audio.src = soundPath;
    audio.play().catch((error) => {
      console.error("Error playing sound:", error);
    });
  } catch (error) {
    console.error("Error creating audio:", error);
  }
});
