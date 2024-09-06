document.addEventListener("DOMContentLoaded", function () {
  let count = 0;
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

  function addNewPlot(id) {
    const plotData = plotsData.find((plot) => plot.orbId === id);
    if (plotData) {
      const comment = document.getElementById("add-plot-comment-data");
      const newPlot = document.createElement("div");
      newPlot.classList.add("plots-main-graph-inner-cnt");
      newPlot.id = `${++count}`;
      newPlot.innerHTML = `
                <div class="plots-main-graph-inner-comment-cnt">
                    <p>${plotData.comment}</p>
                </div>
                <div class="plots-main-graph-inner-graph-cnt">
                    <div class="card-body graph-main-cnt">
                        <canvas id="myChart${plotData.orbId}" class='mychart'></canvas>
                    </div>
                    <div class="plots-main-graph-inner-graph-edit-cnt">
                        <button onclick="removeplot('${count}')">Close</button>
                    </div>
                </div>
            `;
      closePopup();
      document.querySelector(".plots-main-graph-main-cnt").appendChild(newPlot);
      callChart(plotData.orbId);
    }
  }

  function openPopup() {
    popup.style.visibility = "visible";
  }

  function closePopup() {
    popup.style.visibility = "hidden";
  }
  function callChart(id) {
    const ctx = document.getElementById(`myChart${id}`).getContext("2d");
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
          label: id,
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

    function updateChart(value) {
      if (!isRunning) return;

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

    window.electron.onCANData((data) => {
      const receivedData = data?.decimalData;
      const receivedId = receivedData.split(" ")[1];

      if (!receivedId || !receivedData) {
        console.log("Invalid data received");
        return;
      }

      if (receivedId === id) {
        const value = addingValue(receivedId);
        if (value) {
          updateChart(value);
        }
      }
    });
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
      option.value = plot.orbId;
      option.textContent = plot.comment;
      selectElement.appendChild(option);
    });
  }

  function addValue() {
    const newOrbId = document.getElementById("new-orbId").value;
    const comment = document.getElementById("add-plot-comment-data").value;

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

    plotsData.push({ orbId: paddedOrbId, comment: comment });
    populateSelect();
    document.getElementById("new-orbId").value = "";
    closePopup();
  }

  function handleSelectChange(event) {
    const selectedValue = event.target.value;
    if (selectedValue && selectedValue !== "Select the plot") {
      addNewPlot(selectedValue);
    }
  }

  window.electron.onCANData((data) => {
    if (!isRunning) return;

    const newValue = data?.decimalData;
    const id = data?.decimalData.split(" ")[1];

    if (!id || !newValue) {
      console.log("Invalid data received");
      return;
    }
    const index = graphData.findIndex((item) => item.split(" ")[1] === id);

    if (index !== -1) {
      graphData[index] = newValue;
    } else {
      graphData.push(newValue);
    }

    if (graphData.length > 60) {
      graphData.shift();
    }

    console.log(graphData);
  });

  populateSelect();
  document
    .getElementById("plots-data-select")
    .addEventListener("change", handleSelectChange);
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
