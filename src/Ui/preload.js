const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  sendPID: (pid) => {
    ipcRenderer.send("send-pid", pid);
  },
  sendRawCANData: (rawData) => {
    ipcRenderer.send("send-raw-can-data", rawData);
  },
  sendRowNumber: (rowId) => {
    ipcRenderer.send("stop-cyclic-request", rowId);
  },
  onCANData: (callback) => {
    ipcRenderer.on("can-data", (event, data) => callback(data));
  },
});
