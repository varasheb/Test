import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "child_process";
import { decodeFrame } from "./decodeframe.js";
import { sendCanRequest, stopInterval } from "./sendRequest.js";
import { HexConverter } from "./decodeRawFrame.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
let mainWindow;
let cycleInterval = [];
let cyclicTime;

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
  cyclicTime = parseInt(rawData.cyclicTime);

  if (cyclicTime >= 1000) {
    const intervalID = setInterval(() => {
      sendCanRequest(rawData.id, hexdata);
    }, cyclicTime);

    cycleInterval.push(intervalID);
  }
});

ipcMain.on("stop-cyclic-request", (event, rowId) => {
  const intervalID = cycleInterval[rowId];

  if (intervalID) {
    clearInterval(intervalID);
    cycleInterval.splice(rowId, 1);
  } else {
    console.log(`No cyclic request found for row ID: ${rowId}`);
  }
});

ipcMain.on("stop-Obd2-request", (event, data) => {
  stopInterval();
  console.log("Stop The obd2 cycles");
});

//======================================================

const canChannel = "can0";
const candump = spawn("candump", [canChannel]);

candump.stdout.on("data", (data) => {
  const dataString = data.toString();
  const frames = dataString.split("\n").filter((line) => line.trim() !== "");
  frames.forEach((frame) => {
    const decodedResult = decodeFrame(frame);
    console.log(`CAN message: ${frame}`);
    if (mainWindow) {
      const timeStamp = new Date().toISOString();
      const binaryData = HexConverter.hexToBinary(frame);
      const decimalData = HexConverter.hexToDecimal(frame);
      mainWindow.webContents.send("can-data", {
        timeStamp,
        ...decodedResult,
        rawData: frame,
        binaryData,
        decimalData,
        cyclicTime,
      });
    }
  });
});

candump.stderr.on("data", (data) => {
  mainWindow.webContents.send("can-error", data.toString());
  console.error(`Error: ${data.toString()}`);
});

candump.on("close", (code) => {
  console.log(`candump process exited with code ${code}`);
});
