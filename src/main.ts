import { app, BrowserWindow } from "electron";
import * as path from "path";

function createWindow() {
  const mainWindow = new BrowserWindow({
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

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Position the window in the bottom-right corner
  const { width, height } = mainWindow.getBounds();
  const { width: screenWidth, height: screenHeight } =
    require("electron").screen.getPrimaryDisplay().workAreaSize;
  mainWindow.setPosition(screenWidth - width - 20, screenHeight - height - 20);

  // Create test buttons after a short delay to ensure the page is loaded
  setTimeout(() => {
    mainWindow.webContents.executeJavaScript(`
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '10px';
      container.style.left = '10px';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '10px';

      const createButton = (text, type) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.padding = '8px 16px';
        button.style.cursor = 'pointer';
        button.onclick = () => window.showNotification(type, 'This is a ' + type + ' notification!');
        return button;
      };

      container.appendChild(createButton('Show INFO', 'INFO'));
      container.appendChild(createButton('Show ERROR', 'ERROR'));
      container.appendChild(createButton('Show COINS', 'COINS'));

      document.body.appendChild(container);
    `);
  }, 1000);
}

app.whenReady().then(createWindow);

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
