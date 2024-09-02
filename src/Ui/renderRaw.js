document.addEventListener("DOMContentLoaded", function () {
  const addRequestBtn = document.getElementById("rawdata-btn2");
  const popup = document.getElementById("popup");
  const startBtn = document.getElementById("rawdata-inp-btn1");
  const idInput = document.querySelector(".rawdata-inp1-data-cnt input");
  const lengthSelect = document.getElementById("number-select");
  const dataInputs = document.querySelectorAll(
    ".rawdata-inp3-data-inner-txt-cnt input"
  );
  const cyclicTimeInput = document.querySelector(
    ".rawdata-inp-inner-cycle-inner-cnt input"
  );
  const countInput = document.querySelector(
    ".rawdata-inp-inner-count-cnt input"
  );
  const transmitterTableBody = document.querySelector(
    ".rawdata-transfer-inp-main-cnt tbody"
  );

  const rawData = {};

  function openPopup() {
    popup.style.visibility = "visible";
  }

  function closePopup() {
    popup.style.visibility = "hidden";
  }

  addRequestBtn.addEventListener("click", function () {
    openPopup();
  });

  window.addEventListener("click", function (event) {
    if (event.target === popup) {
      closePopup();
    }
  });

  startBtn.addEventListener("click", function () {
    rawData.id = idInput.value;
    rawData.length = lengthSelect.value;
    rawData.data = Array.from(dataInputs).map((input) => input.value);
    rawData.cyclicTime = cyclicTimeInput.value;
    rawData.count = countInput.value;
    console.log(rawData);
    window.electron.sendRawCANData(rawData);

    const existingRow = Array.from(transmitterTableBody.rows).find(
      (row) => row.cells[1].textContent === rawData.id
    );

    if (existingRow) {
      existingRow.cells[0].textContent = rawData.id;
      existingRow.cells[1].textContent = "Tx";
      existingRow.cells[2].textContent = rawData.length;
      existingRow.cells[3].textContent = rawData.cyclicTime;
      existingRow.cells[4].textContent = rawData.data.join(" ");
    } else {
      const newRow = transmitterTableBody.insertRow();
      newRow.insertCell(0).textContent = rawData.id;
      newRow.insertCell(1).textContent = "Tx";
      newRow.insertCell(2).textContent = rawData.length;
      newRow.insertCell(3).textContent = rawData.cyclicTime;
      newRow.insertCell(4).textContent = rawData.data.join(" ");
    }

    idInput.value = "";
    dataInputs.forEach((input) => (input.value = ""));
    cyclicTimeInput.value = "";
    countInput.value = "";

    closePopup();
  });
  //----------
  function updateReceiverTable(data) {
    const tableBody = document.getElementById("receiver-table-body");

    const { timeStamp, rawData } = data;
    console.log(data);
    const newRow = document.createElement("tr");

    const timeCell = document.createElement("td");
    timeCell.textContent = timeStamp;
    newRow.appendChild(timeCell);

    const idCell = document.createElement("td");
    idCell.textContent = "N/A";
    newRow.appendChild(idCell);

    const txrxCell = document.createElement("td");
    txrxCell.textContent = "Rx";
    newRow.appendChild(txrxCell);

    const lengthCell = document.createElement("td");
    lengthCell.textContent = rawData.length;
    newRow.appendChild(lengthCell);

    const dataCell = document.createElement("td");
    dataCell.textContent = rawData;
    newRow.appendChild(dataCell);

    tableBody.appendChild(newRow);
  }

  window.electron.onCANData((data) => {
    updateReceiverTable(data);
  });
});

function validateHex(input) {
  input.value = input.value.toUpperCase();
  const hexPattern = /^[0-9A-F]{0,2}$/;
  if (!hexPattern.test(input.value)) {
    input.value = input.value.slice(0, -1);
  }
}
