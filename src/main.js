import { app, BrowserWindow } from "electron";
import path from "path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PIDS } from "../src/checkpid";

const __dirname = dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { preload: path.join(__dirname, "./Ui/preload.js") },
  });

  mainWindow.loadFile("./Ui/index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// ============================================

// let connectedClient = null;

// // CAN Channel and Process Initialization
// const canChannel = "can0";

// const candump = spawn("candump", [canChannel]);

// candump.stdout.on("data", (data) => {
//   const decodedResult = decodeFrame(data.toString()); // Decode CAN data
//   console.log(`CAN message: ${data.toString()}`);
//   console.log("------------------", decodedResult);
//   if (connectedClient) {
//     connectedClient.write(JSON.stringify(decodedResult));
//   }
// });

// candump.stderr.on("data", (data) => {
//   setupCAN();
//   console.error(`Error: ${data.toString()}`);
// });

// candump.on("close", (code) => {
//   console.log(`candump process exited with code ${code}`);
// });

// const server = net.createServer((socket) => {
//   console.log("Client connected");
//   connectedClient = socket;

//   socket.on("data", (data) => {
//     console.log(`Received from client: ${data.toString()}`);
//     socket.write(`Echo: ${data.toString()}`);
//   });

//   socket.on("end", () => {
//     console.log("Client disconnected");
//     connectedClient = null;
//   });

//   socket.on("error", (err) => {
//     console.error(`Socket error: ${err.message}`);
//   });
// });

// server.listen(8080, () => {
//   console.log("Server listening on port 8080");
// });
