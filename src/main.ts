import { app, BrowserWindow } from "electron";
import * as path from "path";

let mainWindow: BrowserWindow | null = null;

function decodeText(text: string): string {
  try {
    return decodeURIComponent(escape(text));
  } catch {
    return text;
  }
}

function createWindow() {
  console.log("Creating window...");
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    console.log("Window ready to show");
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Position the window in the bottom-right corner
  const { width, height } = mainWindow.getBounds();
  const { width: screenWidth, height: screenHeight } =
    require("electron").screen.getPrimaryDisplay().workAreaSize;
  mainWindow.setPosition(screenWidth - width - 20, screenHeight - height - 20);

  // Send CLI parameters to renderer (if any)
  const args = process.argv.slice(process.defaultApp ? 2 : 1);
  console.log("CLI args:", args);

  if (args.length >= 2) {
    const type = args[0].toUpperCase();
    const message = decodeText(args.slice(1).join(" "));
    console.log("Preparing to send notification:", { type, message });

    const sendNotification = () => {
      console.log("Window loaded, sending notification");
      if (mainWindow) {
        mainWindow.webContents.send("show-notification", { type, message });
      }
    };

    if (mainWindow.webContents.isLoading()) {
      mainWindow.webContents.once("did-finish-load", sendNotification);
    } else {
      sendNotification();
    }
  }

  // Open DevTools in development
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(() => {
  console.log("App ready, creating window");
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
