document.addEventListener("DOMContentLoaded", function () {
  let count = 0;
  let isRunning = true;
  const plotsData = [];
  let graphData = {};
  const btn = document.getElementById("plots-add-btn");
  const popup = document.getElementById("popup");
  const addPlot = document.getElementById("plots-add-btn1");
  const startButton = document.getElementById("plots-start");
  const freezeButton = document.getElementById("plots-freez");

  let popupValues = {
    startBit: 0,
    length: 0,
    offset: 0,
    scaling: 1,
    byteOrder: "big-endian",
  };

  addPlot.addEventListener("click", addValue);
  btn.addEventListener("click", openPopup);

  startButton.addEventListener("click", () => {
    isRunning = true;
    console.log("Graph updates resumed.");

    // Reset graphData for all plots
    graphData = {};
    const chartContainers = document.querySelectorAll(".mychart");

    chartContainers.forEach((chartContainer) => {
      const ctx = chartContainer.getContext("2d");
      const chartInstance = Chart.getChart(ctx);
      if (chartInstance) {
        chartInstance.data.labels = [];
        chartInstance.data.datasets[0].data = [];
        chartInstance.update();
      }
    });

    setupChartUpdateInterval();
  });

  freezeButton.addEventListener("click", () => {
    isRunning = false;
    console.log("Graph updates paused.");
  });

  window.addEventListener("click", function (event) {
    if (event.target === popup) {
      closePopup();
    }
  });

  window.removeplot = function (id) {
    const elementToRemove = document.getElementById(id);
    if (elementToRemove) {
      // Also remove from plotsData
      const plotId = parseInt(id, 10);
      const plotIndex = plotsData.findIndex((plot) => plot.plotId === plotId);
      if (plotIndex !== -1) {
        plotsData.splice(plotIndex, 1);
        delete graphData[plotId];
      }

      // Destroy the chart instance to free resources
      const canvas = elementToRemove.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const chartInstance = Chart.getChart(ctx);
      if (chartInstance) {
        chartInstance.destroy();
      }

      elementToRemove.remove();
    } else {
      console.error("Element not found.");
    }
  };

  function addNewPlot(plotId) {
    const plotData = plotsData.find((plot) => plot.plotId === plotId);
    if (plotData) {
      const comment = plotData.comment;
      const newPlot = document.createElement("div");
      newPlot.classList.add("plots-main-graph-inner-cnt");
      newPlot.id = `${plotId}`; // Use plotId as the element ID
      newPlot.innerHTML = `
        <div class="plots-main-graph-inner-comment-cnt">
            <p>${comment}</p>
        </div>
        <div class="plots-main-graph-inner-graph-cnt">
            <div class="card-body graph-main-cnt">
                <canvas id="myChart${plotId}" class='mychart'></canvas>
            </div>
            <div class="plots-main-graph-inner-graph-edit-cnt">
                <button onclick="removeplot('${plotId}')">Close</button>
            </div>
        </div>
      `;
      closePopup();
      document.querySelector(".plots-main-graph-main-cnt").appendChild(newPlot);
      callChart(plotId);
    }
  }

  function openPopup() {
    popup.style.visibility = "visible";
  }

  function closePopup() {
    popup.style.visibility = "hidden";
  }

  function callChart(plotId) {
    const plotData = plotsData.find((plot) => plot.plotId === plotId);
    if (!plotData) return;

    const ctx = document.getElementById(`myChart${plotId}`).getContext("2d");

    const down = (ctx) =>
      ctx.p0.parsed.y > ctx.p1.parsed.y ? "rgb(192, 57, 43)" : undefined;
    const up = (ctx) =>
      ctx.p0.parsed.y < ctx.p1.parsed.y ? "rgb(22, 160, 133)" : undefined;
    const stagnate = (ctx) =>
      ctx.p0.parsed.y === ctx.p1.parsed.y ? "rgb(149, 165, 166)" : undefined;

    const data = {
      labels: [],
      datasets: [
        {
          label: `Plot ${plotId} (${plotData.orbId})`,
          data: [],
          borderWidth: 2,
          tension: 0.5,
          segment: {
            borderColor: (ctx) =>
              down(ctx) || up(ctx) || stagnate(ctx) || "rgb(149, 165, 149)", // Default color
          },
        },
      ],
    };

    const myChart = new Chart(ctx, {
      type: "line",
      data: data,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: true,
          },
        },
      },
    });

    // Initialize graphData for this plot
    if (!graphData[plotId]) {
      graphData[plotId] = [];
    }

    // No need for a separate updateChart function since we handle updates globally
  }

  function addingValue(plotId) {
    const dataArray = graphData[plotId];
    if (dataArray && dataArray.length > 0) {
      return dataArray[dataArray.length - 1].value;
    } else {
      return 0;
    }
  }

  function populateSelect() {
    const selectElement = document.getElementById("plots-data-select");
    selectElement.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select the plot";
    selectElement.appendChild(defaultOption);

    plotsData.forEach((plot) => {
      const option = document.createElement("option");
      option.value = plot.plotId;
      option.textContent = `${plot.comment} (${plot.orbId})`;
      selectElement.appendChild(option);
    });
  }

  function addValue() {
    const newOrbId = document.getElementById("new-orbId").value;
    const comment = document.getElementById("add-plot-comment-data").value;
    const offset = parseFloat(document.getElementById("Offset-input").value);
    const scaling = parseFloat(document.getElementById("scaling-input").value);
    const byteOrder = document.getElementById("byte-number-select").value;
    const lengthOfData = parseInt(
      document.getElementById("length-of-data").value,
      10
    );
    const startBit = parseInt(document.getElementById("Start-bit").value, 10);

    if (newOrbId.trim() === "") {
      alert("Please enter a valid orbId.");
      return;
    }
    let paddedOrbId = newOrbId;
    if (newOrbId.length < 3) {
      paddedOrbId = newOrbId.padStart(3, "0");
    } else if (newOrbId.length > 3 && newOrbId.length < 8) {
      paddedOrbId = newOrbId.padStart(8, "0");
    }

    count += 1; // Increment plot count for unique plotId

    plotsData.push({
      plotId: count, // Unique plot identifier
      orbId: paddedOrbId,
      comment: comment,
      offset: offset,
      scaling: scaling,
      byteOrder: byteOrder,
      length: lengthOfData,
      startBit: startBit,
    });

    // Initialize graphData for the new plot
    graphData[count] = [];

    popupValues = {
      startBit: startBit,
      length: lengthOfData,
      offset: offset,
      scaling: scaling,
      byteOrder: byteOrder,
    };

    populateSelect();
    document.getElementById("new-orbId").value = "";
    document.getElementById("add-plot-comment-data").value = "";
    document.getElementById("Offset-input").value = "";
    document.getElementById("scaling-input").value = "";
    document.getElementById("byte-number-select").value = "big-endian";
    document.getElementById("length-of-data").value = "";
    document.getElementById("Start-bit").value = "";

    closePopup();
  }

  function handleSelectChange(event) {
    const selectedPlotId = parseInt(event.target.value, 10);
    if (!isNaN(selectedPlotId) && selectedPlotId !== 0) {
      addNewPlot(selectedPlotId);
    }
  }

  function processCANMessage(
    canMessage,
    startBit,
    length,
    offset,
    scaling,
    byteOrder
  ) {
    const binaryData = canMessage
      .split(" ")
      .slice(3)
      .join("")
      .replace(/\s+/g, "");
    if (!/^[01]+$/.test(binaryData)) {
      throw new Error("Invalid binary data. Must be a string of 0s and 1s.");
    }
    if (startBit < 0 || length <= 0 || startBit + length > binaryData.length) {
      throw new Error("Invalid startBit or length.");
    }

    let extractedBits = binaryData.slice(startBit + 1, startBit + length + 1);

    if (byteOrder === "little-endian") {
      let bytes = [];
      for (let i = 0; i < extractedBits.length; i += 8) {
        bytes.push(extractedBits.slice(i, i + 8).padStart(8, "0"));
      }
      bytes.reverse();
      extractedBits = bytes.join("");
    }
    let decimalValue = parseInt(extractedBits, 2);
    decimalValue = (decimalValue + offset) * scaling;
    return decimalValue;
  }

  window.electron.onCANData((data) => {
    if (!isRunning) return;

    const receivedData = data?.binaryData;
    const id = receivedData?.split(" ")[1];

    if (!id) {
      console.log("Invalid data received: Missing ID");
      return;
    }

    try {
      const value = processCANMessage(
        receivedData,
        popupValues.startBit,
        popupValues.length,
        popupValues.offset,
        popupValues.scaling,
        popupValues.byteOrder
      );

      if (isNaN(value)) {
        console.log("Invalid data received: NaN value");
        return;
      }

      // Find all plots that match the received orbId
      const matchingPlots = plotsData.filter((plot) => plot.orbId === id);

      if (matchingPlots.length === 0) {
        console.log("No matching plots for received ID:", id);
        return;
      }

      // Update graphData for each matching plot
      matchingPlots.forEach((plot) => {
        const plotId = plot.plotId;
        if (!graphData[plotId]) {
          graphData[plotId] = [];
        }

        // Add the new value with timestamp
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        graphData[plotId].push({ time: timeStr, value: value });

        // Keep only the latest 60 entries
        if (graphData[plotId].length > 60) {
          graphData[plotId].shift();
        }
      });

      console.log("Updated graphData:", graphData);
    } catch (error) {
      console.error("Error processing CAN message:", error);
    }
  });

  populateSelect();
  document
    .getElementById("plots-data-select")
    .addEventListener("change", handleSelectChange);

  function setupChartUpdateInterval() {
    setInterval(() => {
      if (isRunning) {
        const chartContainers = document.querySelectorAll(".mychart");

        chartContainers.forEach((chartContainer) => {
          const ctx = chartContainer.getContext("2d");
          const chartInstance = Chart.getChart(ctx);
          if (chartInstance) {
            // Extract plotId from the dataset label
            const label = chartInstance.data.datasets[0].label;
            const plotIdMatch = label.match(/Plot (\d+)/);
            if (!plotIdMatch) return;
            const plotId = parseInt(plotIdMatch[1], 10);

            const dataEntries = graphData[plotId];
            if (dataEntries && dataEntries.length > 0) {
              const latestEntry = dataEntries[dataEntries.length - 1];
              const timeStr = latestEntry.time;
              const value = latestEntry.value;

              if (chartInstance.data.labels.length >= 60) {
                chartInstance.data.labels.shift();
                chartInstance.data.datasets[0].data.shift();
              }

              chartInstance.data.labels.push(timeStr);
              chartInstance.data.datasets[0].data.push(value);
              chartInstance.update();
            }
          }
        });
      }
    }, 1000); // Update every second
  }
});

function validateLength(input) {
  const value = parseInt(input.value, 10);
  if (isNaN(value) || value < 0 || value > 31) {
    input.value = "";
    alert("Length must be between 0 and 31.");
  }
}

function validateStartBit(input) {
  const value = parseInt(input.value, 10);
  if (isNaN(value) || value < 0 || value > 63) {
    input.value = "";
    alert("Start Bit must be between 0 and 63.");
  }
}
