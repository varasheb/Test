import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "child_process";
import { decodeFrame } from "./decodeframe.js";
import { sendCanRequest } from "./sendRequest.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
let mainWindow;
let cycleInterval;

function createWindow() {
  mainWindow = new BrowserWindow({
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

ipcMain.on("send-pid", (event, pid) => {
  console.log(`Received PID: ${pid}`);
  sendCanRequest("7DF", `0201${pid}0000000000`);
});

ipcMain.on("start-cycle", (event, pid, cycleTime) => {
  console.log(
    `Starting cycle with PID: ${pid} and Cycle Time: ${cycleTime} ms`
  );

  clearInterval(cycleInterval);

  cycleInterval = setInterval(() => {
    sendCanRequest("7DF", `0201${pid}0000000000`);
  }, cycleTime);
});

ipcMain.on("stop-cycle", () => {
  console.log("Stopping cycle");
  clearInterval(cycleInterval);
});

//======================================================

const canChannel = "can0";
const candump = spawn("candump", [canChannel]);

candump.stdout.on("data", (data) => {
  const decodedResult = decodeFrame(data.toString()); // Decode CAN data
  console.log(`CAN message: ${data.toString()}`);
  if (decodedResult) {
    if (mainWindow) {
      const timeStamp = new Date().toISOString();
      mainWindow.webContents.send("can-data", {
        timeStamp,
        ...decodedResult,
      });
    }
  }
});

candump.stderr.on("data", (data) => {
  console.error(`Error: ${data.toString()}`);
});

candump.on("close", (code) => {
  console.log(`candump process exited with code ${code}`);
});
