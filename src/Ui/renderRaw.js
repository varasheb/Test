//start

let transferRows = [];
function storeOrUpdateTransferRow(rowId, rawData) {
  const existingRowIndex = transferRows.findIndex((row) => row.rowId === rowId);

  if (existingRowIndex !== -1) {
    transferRows[existingRowIndex] = rawData;
  } else {
    transferRows.push(rawData);
  }

  console.log("Updated transferRows array:", transferRows);
}

let countid = 0;
function getRowId() {
  if (countid == 0) {
    countid++;
    return 0;
  }
  return countid++;
}

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

  let rawData = {};
  let editingRow = null;
  function openPopup() {
    popup.style.visibility = "visible";
  }

  function closePopup() {
    popup.style.visibility = "hidden";
  }

  addRequestBtn.addEventListener("click", function () {
    editingRow = null;
    idInput.value = "";
    lengthSelect.value = "";
    dataInputs.forEach((input) => (input.value = ""));
    cyclicTimeInput.value = "";
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
    rawData.data = Array.from(dataInputs).map((input) => {
      if (input.value) {
        return input.value;
      }
      return "00";
    });
    rawData.cyclicTime = cyclicTimeInput.value;
    //-----------------------------------------------------------------------------
    if (editingRow) {
      editingRow.cells[0].textContent = rawData.id;
      editingRow.cells[1].textContent = rawData.length;
      editingRow.cells[2].textContent = rawData.data.join(" ");
      editingRow.cells[3].textContent = rawData.cyclicTime;

      const updatedRowData = {
        rowId: editingRow.id,
        id: rawData.id,
        length: rawData.length,
        hexdata: rawData.data.join(" "),
        cyclicTime: rawData.cyclicTime,
      };
      storeOrUpdateTransferRow(editingRow.id, updatedRowData);

      editCycle(editingRow);
    } else {
      const newRow = transmitterTableBody.insertRow();
      newRow.id = getRowId();
      newRow.insertCell(0).textContent = rawData.id;
      newRow.insertCell(1).textContent = rawData.length;
      newRow.insertCell(2).textContent = rawData.data.join(" ");
      newRow.insertCell(3).textContent = rawData.cyclicTime;
      const removeCell = newRow.insertCell(4);
      removeCell.innerHTML = `<p onclick="removetablerow('${newRow.id}', this)">❌</p>`;
      const newRowData = {
        rowId: newRow.id,
        id: rawData.id,
        length: rawData.length,
        hexdata: rawData.data.join(" "),
        cyclicTime: rawData.cyclicTime,
      };
      storeOrUpdateTransferRow(newRow.id, newRowData);
      startCycle(rawData);
      newRow.cells[2].addEventListener("click", () => {
        populatePopupForEdit(newRow);
        console.log(newRow);
      });
      console.log(newRow);
    }

    closePopup();
  });

  function populatePopupForEdit(row) {
    editingRow = row;
    idInput.value = row.cells[0].textContent;
    lengthSelect.value = row.cells[1].textContent;
    const data = row.cells[2].textContent.split(" ");
    dataInputs.forEach((input, index) => {
      input.value = data[index] || "";
    });
    cyclicTimeInput.value = row.cells[3].textContent;

    console.log(`Editing row index: ${row.id}`);

    openPopup();
  }

  function stopCycle(row) {
    window.electron.sendRowNumber(row.id);
  }

  function startCycle(rawData) {
    window.electron.sendRawCANData(rawData);
  }
  function editCycle(row) {
    const rawdata = {
      rowId: row.id,
      cyclicTime: row.cells[3].textContent.trim(),
      id: row.cells[0].textContent.trim(),
      hexdata: row.cells[2].textContent.trim(),
    };
    console.log(rawdata);
    window.electron.sendRowNumberEditing(rawdata);
  }
});

//----------
function updateReceiverTable(data) {
  const tableBody = document.getElementById("receiver-table-body");
  const typeOfResponse = document.getElementById("number-type-output").value;
  let value = null;

  const { id, timeStamp, binaryData, decimalData, rawData } = data;
  console.log("-->", data);

  const idOfResponse = rawData.split("  ")[2];
  const rowId = `new-row-receive-${id}${idOfResponse}`;
  let existingRow = document.getElementById(rowId);
  let timeDifference = null;

  switch (typeOfResponse) {
    case "binaryData":
      value = binaryData;
      break;
    case "decimalData":
      value = decimalData;
      break;
    case "rawData":
      value = rawData;
      break;
    default:
      console.error("Invalid typeOfResponse:", typeOfResponse);
      return;
  }

  if (existingRow) {
    const previousTime = new Date(existingRow.cells[0].textContent);
    const currentTime = new Date(timeStamp);
    timeDifference = currentTime - previousTime;

    const existingValueCell = existingRow.cells[3];
    const existingValue = existingValueCell.textContent;

    const newValue = value.includes("]")
      ? value.slice(value.indexOf("]") + 1).trim()
      : value;

    existingRow.cells[0].textContent = timeStamp;
    existingRow.cells[2].textContent = rawData.split("  ")[3];
    existingRow.cells[4].textContent = `${timeDifference} ms`;
    existingRow.cells[5].textContent =
      parseInt(existingRow.cells[5].textContent, 10) + 1;

    if (existingValue !== newValue) {
      const changedPart = getChangedPart(existingValue, newValue);
      existingValueCell.innerHTML = changedPart;
    }
  } else {
    // Create new row
    const newRow = document.createElement("tr");
    newRow.id = rowId;

    const timeCell = document.createElement("td");
    timeCell.textContent = timeStamp;
    newRow.appendChild(timeCell);

    const idCell = document.createElement("td");
    idCell.textContent = idOfResponse;
    newRow.appendChild(idCell);

    const lengthCell = document.createElement("td");
    lengthCell.textContent = rawData.split("  ")[3];
    newRow.appendChild(lengthCell);

    const dataCell = document.createElement("td");
    dataCell.innerHTML = value.includes("]")
      ? value.slice(value.indexOf("]") + 1).trim()
      : value;
    newRow.appendChild(dataCell);

    const intervalCell = document.createElement("td");
    intervalCell.textContent = "N/A";
    newRow.appendChild(intervalCell);

    const countCell = document.createElement("td");
    countCell.classList.add("count-class");
    countCell.textContent = "1";
    countCell.id = `receive-data-count-value-${id}${idOfResponse}`;
    newRow.appendChild(countCell);

    tableBody.appendChild(newRow);
  }
}

function getChangedPart(oldValue, newValue) {
  let html = "";
  const maxLength = Math.max(oldValue.length, newValue.length);

  for (let i = 0; i < maxLength; i++) {
    const oldChar = oldValue[i] || "";
    const newChar = newValue[i] || "";

    if (oldChar === newChar) {
      html += newChar;
    } else {
      html += `<span class="twinkle">${newChar}</span>`;
    }
  }
  return html;
}

window.electron.onCANData((data) => {
  updateReceiverTable(data);
});

window.electron.onCANerror((data) => {
  alert(data);
});

function validateHex(input) {
  input.value = input.value.toUpperCase();
  const hexPattern = /^[0-9A-F]{0,2}$/;
  if (!hexPattern.test(input.value)) {
    input.value = input.value.slice(0, -1);
  }
}
let idTimeout;
function validateId(input) {
  input.value = input.value.toUpperCase();

  const hexPattern = /^[0-9A-F]{0,8}$/;
  if (!hexPattern.test(input.value)) {
    input.value = input.value.slice(0, -1);
  }

  clearTimeout(idTimeout);
  idTimeout = setTimeout(() => {
    if (input.value.length > 0 && input.value.length < 3) {
      input.value = input.value.padStart(3, "0");
    } else if (input.value.length > 3 && input.value.length < 8) {
      input.value = input.value.padStart(8, "0");
    }
  }, 1000);
}

function removetablerow(row, element) {
  const rowToRemove = element.closest("tr");
  console.log("0--", row);
  if (rowToRemove) {
    window.electron.sendRowNumber(row);
    // console.log(`Removing row at index: ${rowIndex}`);
    rowToRemove.remove();
  } else {
    console.log(`Row not found.`);
  }
}

document
  .querySelector(".rawdata-refresh-btn")
  .addEventListener("click", function () {
    console.log("refresh button is clicked");
    const allCounts = document.querySelectorAll(
      " #receiver-table-body .count-class"
    );
    allCounts.forEach(function (ele) {
      ele.textContent = "0";
    });
  });

const toggleAction = document.querySelector(".rawdata-toggle-btn");
const toggleText = document.querySelector(".rawdata-toggle-btn-txt");

toggleAction.addEventListener("click", function () {
  if (toggleText.textContent === "⏸︎ Pause") {
    toggleText.textContent = "⏵︎ Resume";
    window.electron.sendRefreshRawCan();
    console.log("pause button is clicked");
  } else {
    toggleText.textContent = "⏸︎ Pause";
    unfreezData();
    console.log("resume button is clicked");
  }
});

function unfreezData() {
  transferRows.map((data) => {
    console.log(data);
    window.electron.sendRowNumberEditing(data);
  });
}
