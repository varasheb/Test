/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
// const { contextBridge, ipcRenderer } = require("electron");

// contextBridge.exposeInMainWorld("ipcRenderer", ipcRenderer);

// window.addEventListener("DOMContentLoaded", () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector);
//     if (element) element.innerText = text;
//   };

//   for (const type of ["chrome", "node", "electron"]) {
//     replaceText(`${type}-version`, process.versions[type]);
//   }
// });
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  sendPID: (pid) => {
    ipcRenderer.send("send-pid", pid);
  },
  onLoginResponse: (callback) => {
    ipcRenderer.on("login-response", (event, response) => callback(response));
  },
});
