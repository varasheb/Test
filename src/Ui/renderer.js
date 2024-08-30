window.onload = () => {
  const tableBody = document.getElementById("data-table-body");

  document.getElementById("obd-inp-start").addEventListener("click", () => {
    const selectedPID = document.getElementById("select-pids").value;
    console.log(`Selected PID: ${selectedPID}`);

    window.electron.sendPID(selectedPID);
  });

  window.electron.onCANData((data) => {
    const parsedData = data;
    console.log(parsedData);

    if (!tableBody) {
      console.error("tableBody is not defined");
      return;
    }

    let existingRow = document.getElementById(parsedData.id);

    if (existingRow) {
      //   existingRow.querySelector(".timestamp-cell").textContent =
      //     parsedData.timeStamp;
      existingRow.querySelector(".name-cell").textContent = parsedData.name;
      existingRow.querySelector(".value-cell").textContent = parsedData.value;
    } else {
      const row = document.createElement("tr");
      row.id = parsedData.id;

      const idCell = document.createElement("td");
      idCell.textContent = parsedData.id;

      //   const unitCell = document.createElement("td");
      //   unitCell.textContent = parsedData.timeStamp;
      //   unitCell.classList.add("timestamp-cell");

      const nameCell = document.createElement("td");
      nameCell.textContent = parsedData.name;
      nameCell.classList.add("name-cell");

      const valueCell = document.createElement("td");
      valueCell.textContent = parsedData.value;
      valueCell.classList.add("value-cell");

      row.appendChild(idCell);
      //   row.appendChild(unitCell);
      row.appendChild(nameCell);
      row.appendChild(valueCell);

      tableBody.appendChild(row);
    }
  });
};
