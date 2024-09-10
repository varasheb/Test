document.addEventListener("DOMContentLoaded", function () {
  let count = 0;
  let idCount = 0;
  function getplotId() {
    if (idCount == 0) {
      idCount++;
      return 0;
    }
    return idCount++;
  }

  let isRunning = true;
  const plotsData = [];
  let graphData = [];
  const btn = document.getElementById("plots-add-btn");
  const popup = document.getElementById("popup");
  const addPlot = document.getElementById("plots-add-btn1");
  const startButton = document.getElementById("plots-start");
  const freezeButton = document.getElementById("plots-freez");

  addPlot.addEventListener("click", addValue);
  btn.addEventListener("click", openPopup);

  startButton.addEventListener("click", () => {
    isRunning = true;
    console.log("Graph updates resumed.");

    graphData = [];
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
      elementToRemove.remove();
    } else {
      console.error("Element not found.");
    }
  };

  function addNewPlot(data) {
    // const plotData = plotsData.find((plot) => plot.id === id);
    if (data) {
      // const comment = document.getElementById("add-plot-comment-data");
      const newPlot = document.createElement("div");
      newPlot.classList.add("plots-main-graph-inner-cnt");
      newPlot.id = `${++count}`;
      newPlot.innerHTML = `
        <div class="plots-main-graph-inner-comment-cnt">
            <p>${data.comment}</p>
        </div>
        <div class="plots-main-graph-inner-graph-cnt">
            <div class="card-body graph-main-cnt">
                <canvas id="myChart${data.id}${data.orbId}" class='mychart'></canvas>
            </div>
            <div class="plots-main-graph-inner-graph-edit-cnt">
                <button onclick="removeplot('${count}')">Close</button>
            </div>
        </div>
      `;
      closePopup();
      document.querySelector(".plots-main-graph-main-cnt").appendChild(newPlot);
      callChart(data);
    }
  }

  function openPopup() {
    popup.style.visibility = "visible";
  }

  function closePopup() {
    popup.style.visibility = "hidden";
  }

  function callChart(newData) {
    const ctx = document
      .getElementById(`myChart${newData.id}${newData.orbId}`)
      .getContext("2d");

    const down = (ctx) =>
      ctx.p0.parsed.y > ctx.p1.parsed.y ? "rgb(192, 57, 43)" : undefined;
    const up = (ctx) =>
      ctx.p0.parsed.y < ctx.p1.parsed.y ? "rgb(22, 160, 133)" : undefined;
    const stagnate = (ctx) =>
      ctx.p0.parsed.y === ctx.p1.parsed.y ? "rgb(149, 165, 166)" : undefined;

    const plotData = plotsData.find((plot) => plot.id === newData.id);
    if (!plotData) return;

    const data = {
      labels: [],
      datasets: [
        {
          label: newData.comment,
          data: [],
          borderWidth: 2,
          lineTension: 0.5,
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
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    function setAllIntervals() {
      const intervalID = setInterval(updateChart, 1000);
    }
    setAllIntervals();
    // function updateChart() {
    //   console.log(incomingData);
    // }
    function updateChart() {
      if (!isRunning) return;
      const id = newData.orbId;
      const dataValue = incomingData[id];
      if (dataValue) {
        const receivedData = dataValue?.binaryData;
        const value = processCANMessage(
          receivedData,
          newData.startBit,
          newData.length,
          newData.offset,
          newData.scaling,
          newData.byteOrder
        );
        console.log("id--", id);
        console.log("value--", value);

        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

        if (data.labels.length >= 60) {
          data.labels.shift();
          data.datasets[0].data.shift();
        }

        data.labels.push(timeStr);
        data.datasets[0].data.push(value);

        myChart.update();
      }
    }

    // window.electron.onCANData((data) => {
    //   const receivedData = data?.binaryData;
    //   const receivedId = receivedData?.split(" ")[1];
    //   if (!receivedId || !receivedData) {
    //     console.log("Invalid data received");
    //     return;
    //   }

    //   if (receivedId === id) {
    //     const processedValue = processCANMessage(
    //       receivedData,
    //       plotData.startBit,
    //       plotData.length,
    //       plotData.offset,
    //       plotData.scaling,
    //       plotData.byteOrder
    //     );
    //     updateChart(processedValue);
    //   }
    // });
  }

  function addingValue(id) {
    const data = graphData.find((item) => item.split(" ")[1] === id);
    if (data) {
      return data.split(" ")[3];
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
      option.value = plot.id;
      option.textContent = `${plot.comment}(${plot.orbId})`;
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
      document.getElementById("length-of-data").value
    );
    const startBit = parseInt(document.getElementById("Start-bit").value);

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

    plotsData.push({
      id: getplotId(),
      orbId: paddedOrbId,
      comment: comment,
      offset: offset,
      scaling: scaling,
      byteOrder: byteOrder,
      length: lengthOfData,
      startBit: startBit,
    });

    populateSelect();
    document.getElementById("new-orbId").value = "";

    closePopup();
  }

  function handleSelectChange(eventValue) {
    const selectedValue = eventValue;
    if (selectedValue && selectedValue != "Select the plot") {
      // console.log(plotsData);
      const plotDatas = plotsData.find((plot) => plot.id == eventValue);
      console.log(plotDatas);
      addNewPlot(plotDatas);
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
    const binaryData = canMessage.split(" ").slice(3).join("");

    if (!/^[01]+$/.test(binaryData)) {
      throw new Error("Invalid binary data. Must be a string of 0s and 1s.");
    }

    if (startBit < 0 || length <= 0 || startBit + length > binaryData.length) {
      throw new Error("Invalid startBit or length.");
    }
    let extractedBits = binaryData.slice(startBit, startBit + length);
    if (byteOrder === "little-endian") {
      let bytes = [];
      for (let i = 0; i < extractedBits.length; i += 8) {
        bytes.push(extractedBits.slice(i, i + 8));
      }
      bytes.reverse();
      extractedBits = bytes.join("");
    }
    let decimalValue = parseInt(extractedBits, 2);

    decimalValue = (decimalValue + offset) * scaling;

    return decimalValue;
  }

  let incomingData = {};
  window.electron.onCANData((data) => {
    // if (!isRunning) return;
    const receivedData = data?.binaryData;
    const id = receivedData?.split(" ")[1];
    incomingData[id] = data;
    // console.log(incomingData);

    // const receivedData = data?.binaryData;
    // const id = receivedData?.split(" ")[1];
    // const value = processCANMessage(receivedData, 0, 0, 0, 1, "big-endian");

    // if (!id || !value) {
    //   console.log("Invalid data received");
    //   return;
    // }
    // const index = graphData.findIndex((item) => item.split(" ")[1] === id);

    // if (index !== -1) {
    //   graphData[index] = value;
    // } else {
    //   graphData.push(value);
    // }

    // if (graphData.length > 60) {
    //   graphData.shift();
    // }

    // console.log(graphData);
  });

  populateSelect();
  document
    .getElementById("plots-data-select")
    .addEventListener("change", () => {
      const value = document.getElementById("plots-data-select");
      console.log(value);

      handleSelectChange(value.value);
    });

  function setupChartUpdateInterval() {
    setInterval(() => {
      if (isRunning) {
        const chartContainers = document.querySelectorAll(".mychart");

        chartContainers.forEach((chartContainer) => {
          const ctx = chartContainer.getContext("2d");
          const chartInstance = Chart.getChart(ctx);
          if (chartInstance) {
            // const plotId = chartInstance.options.title.text;
            const value = addingValue(plotId);
            if (value) {
              const now = new Date();
              const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
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
  const value = input.value;
  if (value < 0) {
    input.value = "";
  }

  if (value > 31) {
    input.value = "";
  }
}

function validateStartBit(input) {
  const value = input.value;
  if (value < 0) {
    input.value = "";
  }

  if (value > 63) {
    input.value = "";
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
