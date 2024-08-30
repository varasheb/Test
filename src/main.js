import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { setupCAN } from "./canConnect.js";
import { spawn } from "child_process";
import { decodeFrame } from "./decodeframe.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { preload: path.join(__dirname, "./Ui/preload.js") },
  });

  mainWindow.loadFile("./Ui/index.html");
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

// Handle PID data from the renderer process
ipcMain.on("send-pid", (event, pid) => {
  console.log(`Received PID: ${pid}`);
  // You can perform additional actions with the PID data here
});
