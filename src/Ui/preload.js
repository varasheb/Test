const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  sendPID: (pid) => {
    ipcRenderer.send("send-pid", pid);
  },
  onCANData: (callback) => {
    ipcRenderer.on("can-data", (event, data) => callback(data));
  },
});
