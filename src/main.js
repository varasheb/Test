import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "child_process";
import { decodeFrame } from "./decodeframe.js";
import { sendCanRequest } from "./sendRequest.js";
import { HexConverter } from "./decodeRawFrame.js";

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
//===============================================================

ipcMain.on("send-pid", (event, pid) => {
  console.log(`Received PID: ${pid}`);
  sendCanRequest("7DF", `0201${pid}0000000000`);
});

ipcMain.on("send-raw-can-data", (event, rawData) => {
  const hexdata = rawData.data.join("");
  if (parseInt(rawData.cyclicTime) >= 1000)
    cycleInterval = setInterval(() => {
      sendCanRequest(rawData.id, hexdata);
    }, rawData.cyclicTime);
});

//======================================================

const canChannel = "vcan0";
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
        rawData: data.toString(),
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
