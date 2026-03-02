// change this to reference the dataset you chose to work with.
import { gameSales as chartData } from "./data/gameSales.js";

// --- DOM helpers ---
const yearSelect = document.getElementById("yearSelect");
const genreSelect = document.getElementById("genreSelect");
const metricSelect = document.getElementById("metricSelect");
const chartTypeSelect = document.getElementById("chartType");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");

let currentChart = null;

// --- Populate dropdowns from data ---
const years = [...new Set(chartData.map(r => r.year))];
const genres = [...new Set(chartData.map(r => r.genre))];

years.forEach(m => yearSelect.add(new Option(m, m)));
genres.forEach(h => genreSelect.add(new Option(h, h)));

yearSelect.value = years[0];
genreSelect.value = genres[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const chartType = chartTypeSelect.value;
  const year = yearSelect.value;
  const genre = genreSelect.value;
  const metric = metricSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, { year, genre, metric });

  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { year, genre, metric }) {
  if (type === "bar") return barByGenre(year, metric);
  if (type === "line") return lineOverTime(genre, ["priceUSD", "revenueUSD"]);
  if (type === "scatter") return scatterUnitsVReview(genre);
  if (type === "doughnut") return doughnutPlatformShare(year, genre);
  if (type === "radar") return radarComparegenres(year);
  return barByGenre(year, metric);
}

// Task A: BAR — compare genres for a given year
function barByGenre(year, metric) {
  const rows = chartData.filter(r => r.year === year);

  const labels = rows.map(r => r.genre);
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
        genre: { display: true, text: `genre comparison (${year})` }
      },
      scales: {
        y: { genre: { display: true, text: metric } },
        x: { genre: { display: true, text: "genre" } }
      }
    }
  };
}

// Task B: LINE — trend over time for one genre (2 datasets)
function lineOverTime(genre, metrics) {
  const rows = chartData.filter(r => r.genre === genre);

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
        genre: { display: true, text: `Trends over time: ${genre}` }
      },
      scales: {
        y: { genre: { display: true, text: "Value" } },
        x: { genre: { display: true, text: "year" } }
      }
    }
  };
}

// SCATTER — relationship between Units and Review Score
function scatterUnitsVReview(genre) {
  const rows = chartData.filter(r => r.genre === genre);

  const points = rows.map(r => ({ x: r.unitsM, y: r.reviewScore }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `Units Sold(M) vs Review Score (${genre})`,
        data: points
      }]
    },
    options: {
      plugins: {
        genre: { display: true, text: `Does the review score affect sales? (${genre})` }
      },
      scales: {
        x: { genre: { display: true, text: "Units Sold (M)" } },
        y: { genre: { display: true, text: "Review Score" } }
      }
    }
  };
}

// DOUGHNUT — platform share for one genre + year
function doughnutPlatformShare(year, genre) {
  const row = chartData.filter(r => r.year === year);
  let x = 0;
  let y = 0;
  let z = 0;

  let total = x + y + z;

  console.log(row);

  let consoles = (x / total) * 100;
  let PC = (y / total) * 100;
  let mobile = (z / total) * 100;

  console.log(x);

  return {
    type: "doughnut",
    data: {
      labels: ["consoles (%)", "PC (%)", "Mobile (%)"],
      datasets: [{ label: "Platform mix", data: [consoles, PC, mobile] }]
    },
    options: {
      plugins: {
        genre: { display: true, text: `Platform Mix: ${genre} (${year})` }
      }
    }
  };
}

// RADAR — compare genres across multiple metrics for one year
function radarComparegenres(year) {
  const rows = chartData.filter(r => r.year === year);

  const metrics = ["trips", "revenueUSD", "avgDurationMin", "incidents"];
  const labels = metrics;

  const datasets = rows.map(r => ({
    label: r.genre,
    data: metrics.map(m => r[m])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        genre: { display: true, text: `Multi-metric comparison (${year})` }
      }
    }
  };
}