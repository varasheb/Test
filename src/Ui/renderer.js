// /**
//  * This file is loaded via the <script> tag in the index.html file and will
//  * be executed in the renderer process for that window. No Node.js APIs are
//  * available in this process because `nodeIntegration` is turned off and
//  * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
//  * to expose Node.js functionality from the main process.
//  */
// document.getElementById("obd-inp-start").addEventListener("click", () => {
//   const selectedPID = document.getElementById("select-pids").value;

//   // Send selected PID to the main process
//   window.elect
// });

document.getElementById("obd-inp-start").addEventListener("click", () => {
  const selectedPID = document.getElementById("select-pids").value;
  console.log(selectedPID);
  // Send selected PID to the main process
  window.electron.sendPID(selectedPID);
});
