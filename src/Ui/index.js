const addRequestBtn = document.getElementById("home-navbar-btn2");
function openPopup() {
  popup.style.visibility = "visible";
}

function closePopup() {
  popup.style.visibility = "hidden";
}

addRequestBtn.addEventListener("click", function () {
  console.log("open");
  window.electron.sendRefreshRawCan();
  console.log("close");
  openPopup();
});

window.addEventListener("click", function (event) {
  if (event.target === popup) {
    closePopup();
  }
});
