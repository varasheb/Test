document.addEventListener("DOMContentLoaded", function () {
  let count = 0;
  const plotsData = [];
  let graphData = [];
  const btn = document.getElementById("plots-add-btn");
  const popup = document.getElementById("popup");
  const addPlot = document.getElementById("plots-add-btn1");
  const freezeBtn = document.getElementById("plots-freeze-btn");
  const resumeBtn = document.getElementById("plots-resume-btn");
  let intervals = []; // Array to store interval IDs
  let isFrozen = false; // Flag to check if the graphs are frozen

  addPlot.addEventListener("click", addValue);
  btn.addEventListener("click", openPopup);
  freezeBtn.addEventListener("click", freezeGraphs);
  resumeBtn.addEventListener("click", resumeGraphs);

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
      callChart(plotData.orbId, plotData.interval);
    }
  }

  function openPopup() {
    popup.style.visibility = "visible";
  }

  function closePopup() {
    popup.style.visibility = "hidden";
  }

  function callChart(id, interval) {
    const ctx = document.getElementById(`myChart${id}`).getContext("2d");
    const down = (ctx) =>
      ctx.p0.parsed.y > ctx.p1.parsed.y ? "rgb(192, 57, 43)" : undefined;
    const up = (ctx) =>
      ctx.p0.parsed.y < ctx.p1.parsed.y ? "rgb(22, 160, 133)" : undefined;
    const stagnate = (ctx) =>
      ctx.p0.parsed.y === ctx.p1.parsed.y ? "rgb(149, 165, 166)" : undefined;

    const data = {
      labels: [0],
      datasets: [
        {
          label: id,
          data: [0],
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

    function updateChart() {
      const now = new Date();
      const value = addingValue(id);
      if (value) {
        const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

        if (data.datasets[0].data.length >= 60) {
          data.labels.shift();
          data.datasets[0].data.shift();
        }

        data.labels.push(timeStr);
        data.datasets[0].data.push(value);

        myChart.update();
      }
    }

    // Store the interval ID for potential later use
    const intervalId = window.setInterval(updateChart, parseInt(interval));
    intervals.push(intervalId);
  }

  function freezeGraphs() {
    if (isFrozen) return;
    isFrozen = true;
    intervals.forEach(clearInterval); // Stop all intervals
  }

  function resumeGraphs() {
    if (!isFrozen) return;
    isFrozen = false;
    // Restart intervals for all active charts
    document.querySelectorAll(".mychart").forEach((chart, index) => {
      const id = chart.id.replace("myChart", "");
      const interval =
        plotsData.find((plot) => plot.orbId === id)?.interval || 1000;
      const intervalId = window.setInterval(
        () => callChart(id, interval),
        parseInt(interval)
      );
      intervals.push(intervalId);
    });
  }

  function addingValue(id) {
    const data = graphData.find((item) => item.split(" ")[1] == id);
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
      option.textContent = plot.orbId;
      selectElement.appendChild(option);
    });
  }

  function addValue() {
    const newOrbId = document.getElementById("new-orbId").value;
    const interval = document.getElementById("plot-interval").value;
    const comment = document.getElementById("add-plot-comment-data").value;

    if (newOrbId.trim() === "") {
      alert("Please enter a valid orbId.");
      return;
    }
    plotsData.push({ orbId: newOrbId, interval: interval, comment: comment });
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
    const newValue = data?.decimalData;
    const id = data?.decimalData.split(" ")[1];

    if (!id || !newValue) {
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
  });

  populateSelect();
  document
    .getElementById("plots-data-select")
    .addEventListener("change", handleSelectChange);
});
