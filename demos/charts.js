/* Charts, on Chart.js. One place configures how Omnia's data looks, so every
   chart in the demo shares the same weight, colour and motion. */

export const C = {
  uv: "#5b45d6",
  uvSoft: "#8b79ea",
  mint: "#3bbfa0",
  mintSoft: "#69e3c0",
  lav: "#c9c2f2",
  ink: "#1d1740",
  grid: "#f1edfa",
  axis: "#a09ab9",
};

export const fmt = {
  n: (v) => new Intl.NumberFormat("en-US").format(Math.round(v)),
  money: (v) =>
    new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(Math.round(v)),
};

export function niceScale(max, ticks = 4) {
  if (!Number.isFinite(max) || max <= 0) return { max: 1, step: 0.25, ticks: 4 };
  const rough = max / ticks;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * pow >= rough) * pow;
  const top = Math.ceil(max / step) * step;
  return { max: top, step, ticks: Math.round(top / step) };
}

export function niceMax(max, ticks = 4) {
  return niceScale(max, ticks).max;
}

const registry = new Map();

export function destroyChart(id) {
  const chart = registry.get(id);
  if (chart) {
    chart.destroy();
    registry.delete(id);
  }
}

const font = () => ({ family: "Manrope, Arial, sans-serif" });

const tooltipStyle = () => ({
  backgroundColor: "#1d1740",
  padding: 10,
  cornerRadius: 10,
  displayColors: false,
  titleFont: { ...font(), size: 11, weight: "700" },
  bodyFont: { ...font(), size: 10 },
});

function gradient(ctx, area, from, to) {
  const g = ctx.createLinearGradient(0, area.top, 0, area.bottom);
  g.addColorStop(0, from);
  g.addColorStop(1, to);
  return g;
}

export function lineChart({ id, height = 260 }) {
  return '<div class="chart-box" style="height:' + height + 'px"><canvas id="' + id + '"></canvas></div>';
}

export function initLine({ id, data, barLabel = "Orders" }) {
  const canvas = document.getElementById(id);
  if (!canvas || !window.Chart) return;
  destroyChart(id);
  const barMax = Math.max(...data.map((d) => d.bar ?? 0)) * 2.6 || 1;
  const chart = new window.Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        {
          label: "Conversations",
          data: data.map((d) => d.value),
          borderColor: C.uv,
          borderWidth: 2.6,
          tension: 0.38,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: C.uv,
          pointHoverBorderWidth: 3,
          fill: true,
          backgroundColor: (context) => {
            const { ctx, chartArea } = context.chart;
            if (!chartArea) return "transparent";
            return gradient(ctx, chartArea, "rgba(91,69,214,0.26)", "rgba(91,69,214,0)");
          },
        },
        {
          label: barLabel,
          data: data.map((d) => d.bar ?? null),
          type: "bar",
          backgroundColor: "rgba(105,227,192,0.55)",
          hoverBackgroundColor: "rgba(59,191,160,0.9)",
          borderRadius: 7,
          barThickness: 13,
          yAxisID: "y2",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 650, easing: "easeOutQuart" },
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { display: false }, tooltip: tooltipStyle() },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: C.axis, font: { ...font(), size: 10 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: C.grid, drawTicks: false },
          border: { display: false },
          ticks: { color: C.axis, font: { ...font(), size: 10 }, padding: 8, maxTicksLimit: 5 },
        },
        y2: { display: false, beginAtZero: true, suggestedMax: barMax },
      },
    },
  });
  registry.set(id, chart);
}

export function columnChart({ id, height = 180 }) {
  return '<div class="chart-box" style="height:' + height + 'px"><canvas id="' + id + '"></canvas></div>';
}

export function initColumns({ id, data }) {
  const canvas = document.getElementById(id);
  if (!canvas || !window.Chart) return;
  destroyChart(id);
  const chart = new window.Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        {
          data: data.map((d) => d.value),
          backgroundColor: data.map((_, i) => (i === data.length - 1 ? C.uv : "#e3daf9")),
          hoverBackgroundColor: C.uv,
          borderRadius: 9,
          maxBarThickness: 38,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600, easing: "easeOutQuart" },
      plugins: { legend: { display: false }, tooltip: tooltipStyle() },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: C.axis, font: { ...font(), size: 10 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: C.grid, drawTicks: false },
          border: { display: false },
          ticks: { color: C.axis, font: { ...font(), size: 10 }, padding: 8, maxTicksLimit: 4 },
        },
      },
    },
  });
  registry.set(id, chart);
}

export function donutChart({ id, size = 148 }) {
  return (
    '<div class="chart-box donut-box" style="height:' +
    size +
    'px;width:' +
    size +
    'px"><canvas id="' +
    id +
    '"></canvas></div>'
  );
}

export function initDonut({ id, items }) {
  const canvas = document.getElementById(id);
  if (!canvas || !window.Chart) return;
  destroyChart(id);
  const chart = new window.Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: items.map((i) => i.label),
      datasets: [
        {
          data: items.map((i) => i.value),
          backgroundColor: items.map((i) => i.color),
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "72%",
      animation: { animateRotate: true, duration: 700 },
      plugins: { legend: { display: false }, tooltip: tooltipStyle() },
    },
  });
  registry.set(id, chart);
}

export function sparkline(values, { width = 92, height = 26, color = C.uv } = {}) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const stepX = width / (values.length - 1);
  const d = values
    .map(
      (v, i) =>
        (i === 0 ? "M" : "L") +
        (i * stepX).toFixed(1) +
        " " +
        (height - 3 - ((v - min) / span) * (height - 6)).toFixed(1),
    )
    .join(" ");
  return (
    '<svg class="spark" viewBox="0 0 ' +
    width +
    " " +
    height +
    '" width="' +
    width +
    '" height="' +
    height +
    '" aria-hidden="true"><path d="' +
    d +
    '" fill="none" stroke="' +
    color +
    '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>'
  );
}

export function funnel(stages) {
  const max = stages[0].value || 1;
  return (
    '<div class="funnel">' +
    stages
      .map(function (s, i) {
        return (
          '<div class="funnel-row">' +
          '<span class="funnel-label">' + s.label + "</span>" +
          '<span class="funnel-track"><i data-funnel="' + (s.value / max) * 100 + '"></i></span>' +
          '<span class="funnel-value">' + fmt.n(s.value) + "</span>" +
          '<span class="funnel-drop">' +
          (i === 0 ? "" : "−" + Math.round((1 - s.value / stages[i - 1].value) * 100) + "%") +
          "</span></div>"
        );
      })
      .join("") +
    "</div>"
  );
}
