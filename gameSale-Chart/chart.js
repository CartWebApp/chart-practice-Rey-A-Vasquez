// change this to reference the dataset you chose to work with.
import { gameSales as chartData } from "../data/gameSales.js";

// --- DOM helpers ---
const yearSelect = document.getElementById("yearSelect");
const platformSelect = document.getElementById("platformSelect");
const metricSelect = document.getElementById("metricSelect");
const chartTypeSelect = document.getElementById("chartType");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");

let currentChart = null;

// --- Populate dropdowns from data ---
const years = [...new Set(chartData.map(r => r.year))]; //rework this to fit for repeating GameSale data
const cities = [...new Set(chartData.map(r => r.platform))]; //build list of unique entries

years.forEach(m => yearSelect.add(new Option(m, m)));
cities.forEach(h => platformSelect.add(new Option(h, h)));

yearSelect.value = years[0];
platformSelect.value = cities[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const chartType = chartTypeSelect.value;
  const year = yearSelect.value;
  const platform = platformSelect.value;
  const metric = metricSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, { year, platform, metric });

  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { year, platform, metric }) {
  if (type === "bar") return barByplatform(year, metric);
  if (type === "line") return lineOverTime(platform, ["unitsM"]);
  if (type === "scatter") return scatterReviewVSSales(platform);
  if (type === "doughnut") return doughnutMemberVsCasual(year, platform); //can't really do much with the pie chart with climate
  if (type === "radar") return radarCompareplatforms(year);
  return barByplatform(year, metric);
}

// Task A: BAR — compare platforms for a given year
function barByplatform(year, metric) {
  const rows = chartData.filter(r => r.year === Number(year));

  const labels = rows.map(r => r.platform);
  const values = rows.map(r => r[metric]);

  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${metric} in ${year}`,
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `platform comparison (${year})` }
      },
      scales: {
        y: { title: { display: true, text: metric } },
        x: { title: { display: true, text: "platform" } }
      }
    }
  };
}

// Task B: LINE — trend over time for one platform (2 datasets)
function lineOverTime(platform, metrics) {
  const rows = chartData.filter(r => r.platform === platform);

  const labels = rows.map(r => r.year);

  const datasets = metrics.map(m => ({
    label: m,
    data: rows.map(r => r[m])
  }));

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Units sold over time: ${platform}` }
      },
      scales: {
        y: { title: { display: true, text: "Value" } },
        x: { title: { display: true, text: "year" } }
      }
    }
  };
}

// SCATTER — relationship between Review Score and Maximum sales
function scatterReviewVSSales(platform) {
  const rows = chartData.filter(r => r.platform === platform);

  const points = rows.map(r => ({ x: r.reviewScore, y: r.unitsM }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `Review Score VS sales (${platform})`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Does Review Score affect sales? (${platform})` }
      },
      scales: {
        x: { title: { display: true, text: "Review Score" } },
        y: { title: { display: true, text: "sales (M)" } }
      }
    }
  };
}

// DOUGHNUT — region share per platform
function doughnutMemberVsCasual(year, platform) {
  const row = chartData.filter(r => r.year === Number(year) && r.platform === platform); //objects with same platform
  console.log(row);
  
  let NA = 0;
  let EU = 0;
  let JP = 0;
  let ASIA = 0;


  for (let game of row){
    if (game.region == "NA") NA++;
    if (game.region =="EU") EU++;
    if (game.region == "JP") JP++;
    if (game.region =="ASIA") ASIA++;
  }
  
  let percentNA = (NA / row.length) * 100;
  let percentEU = (EU / row.length) * 100;
  let percentJP = (JP / row.length) * 100;
  let percentASIA = (ASIA / row.length) * 100;

  return {
    type: "doughnut",
    data: {
      labels: ["North America (%)", "European (%)", "Japan(%)", "Asia(%)"],
      datasets: [{ label: "Region share", data: [percentNA, percentEU, percentJP, percentASIA] }]
    },
    options: {
      plugins: {
        title: { display: true, text: `platform share: ${platform} (${year})` }
      }
    }
  };
}

// RADAR — compare platforms across multiple metrics for one year
function radarCompareplatforms(year) {
  const rows = chartData.filter(r => r.year === Number(year));

  const metrics = ["revenueUSD", "priceUSD", "reviewScore"];
  const labels = metrics;

  const datasets = rows.map(r => ({
    label: r.platform,
    data: metrics.map(m => r[m])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        title: { display: true, text: `Multi-metric comparison (${year})` }
      }
    }
  };
}