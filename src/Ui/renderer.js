window.onload = () => {
  // Define and initialize tableBody
  const tableBody = document.getElementById("data-table-body");

  // Add event listener to the Start button
  document.getElementById("obd-inp-start").addEventListener("click", () => {
    // Get the selected PID from the dropdown
    const selectedPID = document.getElementById("select-pids").value;
    console.log(`Selected PID: ${selectedPID}`);

    // Send the selected PID to the main process
    window.electron.sendPID(selectedPID);
  });

  // Handle incoming CAN data
  window.electron.onCANData((data) => {
    const parsedData = data;
    console.log(parsedData);

    // Ensure tableBody is defined
    if (!tableBody) {
      console.error("tableBody is not defined");
      return;
    }

    // Check if a row with the same ID already exists
    let existingRow = document.getElementById(parsedData.id);

    if (existingRow) {
      // Update existing row
      existingRow.querySelector(".name-cell").textContent = parsedData.name;
      existingRow.querySelector(".value-cell").textContent = parsedData.value;
      existingRow.querySelector(".unit-cell").textContent = parsedData.unit;
    } else {
      // Create a new row
      const row = document.createElement("tr");
      row.id = parsedData.id;

      const idCell = document.createElement("td");
      idCell.textContent = parsedData.id;

      const nameCell = document.createElement("td");
      nameCell.textContent = parsedData.name;
      nameCell.classList.add("name-cell");

      const valueCell = document.createElement("td");
      valueCell.textContent = parsedData.value;
      valueCell.classList.add("value-cell");

      const unitCell = document.createElement("td");
      unitCell.textContent = parsedData.unit;
      unitCell.classList.add("unit-cell");

      row.appendChild(idCell);
      row.appendChild(nameCell);
      row.appendChild(valueCell);
      row.appendChild(unitCell);

      tableBody.appendChild(row);
    }
  });
};
