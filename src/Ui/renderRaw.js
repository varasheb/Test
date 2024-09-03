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
    data = Array.from(dataInputs).map((input) => {
      if (input.value) {
        return input.value;
      }

      return "00";
    });

    rawData.data = data;
    rawData.cyclicTime = cyclicTimeInput.value;
    console.log(rawData);
    window.electron.sendRawCANData(rawData);

    const existingRow = Array.from(transmitterTableBody.rows).find(
      (row) => row.cells[1].textContent === rawData.id
    );

    if (existingRow) {
      existingRow.cells[0].textContent = rawData.id;
      existingRow.cells[1].textContent = rawData.length;
      existingRow.cells[2].textContent = rawData.data.join(" ");
      existingRow.cells[3].textContent = rawData.cyclicTime;
    } else {
      const newRow = transmitterTableBody.insertRow();
      newRow.id = `transfer-data-row-${rawData.id}${rawData.data.join(" ")}`;
      newRow.insertCell(0).textContent = rawData.id;
      newRow.insertCell(1).textContent = rawData.length;
      newRow.insertCell(2).textContent = rawData.data.join(" ");
      newRow.insertCell(3).textContent = rawData.cyclicTime;
      const removeCell = newRow.insertCell(4);
      removeCell.innerHTML = `<p onclick="removetablerow('transfer-data-row-${
        rawData.id
      }${rawData.data.join(" ")}', this)">❌</p>`;
    }

    idInput.value = "";
    dataInputs.forEach((input) => (input.value = ""));
    cyclicTimeInput.value = "";

    closePopup();
  });

  //----------
  function updateReceiverTable(data) {
    const tableBody = document.getElementById("receiver-table-body");
    const typeOfResponse = document.getElementById("number-type-output").value;
    let value = null;

    const { id, timeStamp, binaryData, decimalData, rawData } = data;
    console.log(data);
    const idOfResponse = rawData.split("  ")[2];

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

    const rowId = `new-row-receive-${id}${idOfResponse}`;
    let existingRow = document.getElementById(rowId);

    if (existingRow) {
      let existingCountCell = document.getElementById(
        `receive-data-count-value-${id}${idOfResponse}`
      );
      if (!existingCountCell) {
        console.error("Count cell not found for ID:", rowId);
        return;
      }
      let existingCount = parseInt(existingCountCell.textContent, 10) || 0;

      existingRow.cells[0].textContent = timeStamp;
      existingRow.cells[2].textContent = rawData.split("  ")[3];
      existingRow.cells[3].textContent = value.includes("]")
        ? value.slice(value.indexOf("]") + 1).trim()
        : value;
      existingRow.cells[5].textContent = existingCount + 1;
    } else {
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
      dataCell.textContent = value.includes("]")
        ? value.slice(value.indexOf("]") + 1).trim()
        : value;
      newRow.appendChild(dataCell);

      const intervalCell = document.createElement("td");
      intervalCell.textContent = data.cyclicTime || "";
      newRow.appendChild(intervalCell);

      const countCell = document.createElement("td");
      countCell.textContent = "1";
      countCell.id = `receive-data-count-value-${id}${idOfResponse}`;
      newRow.appendChild(countCell);
      tableBody.appendChild(newRow);
    }
  }

  window.electron.onCANData((data) => {
    updateReceiverTable(data);
  });
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

function validateId(input) {
  input.value = input.value.toUpperCase();
  const hexPattern = /^[0-9A-F]{0,8}$/;
  if (!hexPattern.test(input.value)) {
    input.value = input.value.slice(0, -1);
  }
}
function removetablerow(row, element) {
  const rowToRemove = element.closest("tr");

  if (rowToRemove) {
    const rowIndex = Array.from(rowToRemove.parentElement.children).indexOf(
      rowToRemove
    );

    console.log(`Removing row at index: ${rowIndex}`);
    window.electron.sendRowNumber(rowIndex);

    rowToRemove.remove();
  } else {
    console.log(`Row not found.`);
  }
}
