import { app, Tray, Menu } from "electron";
import path from "path";
import { writeLog } from "./logger";

let tray: Tray | null = null;

export const createTray = async (showAboutWindow: () => void) => {
  try {
    if (tray) {
      return;
    }

    const iconPath = path.join(process.env.PUBLIC || "public", "icon.ico");
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "About",
        click: showAboutWindow,
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          writeLog("INFO", "QUIT_FROM_TRAY");
          app.quit();
        },
      },
    ]);

    tray.setToolTip("IDI Notifications");
    tray.setContextMenu(contextMenu);

    writeLog("INFO", "TRAY_CREATED");
  } catch (error) {
    writeLog("ERROR", "TRAY_CREATION_ERROR", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};
