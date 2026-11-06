/* Chart primitives for the workspace demo.
   Plain SVG with data attributes so GSAP can draw and scale them in. */

const NS = {
  uv: "#5b45d6",
  uvSoft: "#8d7bea",
  mint: "#69e3c0",
  mintDeep: "#2aa886",
  lav: "#c9c2f2",
  ink: "#1d1740",
  grid: "#f0ecfa",
};

export const fmt = {
  n: (value) => new Intl.NumberFormat("en-US").format(Math.round(value)),
  money: (value) =>
    new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(
      Math.round(value),
    ),
  pct: (value) => `${Math.round(value)}%`,
};

/* Smooth path through values using a Catmull-Rom style cubic. */
function smoothPath(values, xAt, yAt) {
  return values
    .map((value, index) => {
      const x = xAt(index);
      const y = yAt(value);
      if (index === 0) return `M${x} ${y}`;
      const px = xAt(index - 1);
      const py = yAt(values[index - 1]);
      const cx = px + (x - px) / 2;
      return `C${cx} ${py} ${cx} ${y} ${x} ${y}`;
    })
    .join(" ");
}

export function lineChart({
  series,
  labels = [],
  width = 640,
  height = 180,
  bars = null,
  dots = true,
  yTicks = 3,
  valueFormat = (v) => fmt.n(v),
}) {
  const primary = series[0];
  const flat = series.flatMap((s) => s.values);
  const pad = 16;
  const top = 10;
  const max = Math.max(...flat) * 1.12 || 1;
  const min = 0;
  const stepX = (width - pad * 2) / Math.max(1, primary.values.length - 1);
  const xAt = (i) => pad + i * stepX;
  const yAt = (v) => height - ((v - min) / (max - min)) * (height - top);
  const uid = `g${Math.random().toString(36).slice(2, 8)}`;
  const barW = Math.min(22, stepX * 0.42);

  const lineD = smoothPath(primary.values, xAt, yAt);
  const areaD = `${lineD} L${width - pad} ${height} L${pad} ${height} Z`;

  return `<svg class="chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img"
      aria-label="Activity chart">
    <defs>
      <linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${NS.uv}" stop-opacity="0.2" />
        <stop offset="100%" stop-color="${NS.uv}" stop-opacity="0" />
      </linearGradient>
    </defs>
    <g stroke="${NS.grid}" stroke-width="1">
      ${Array.from({ length: yTicks }, (_, i) => {
        const y = top + ((height - top) / (yTicks + 1)) * (i + 1);
        return `<path d="M0 ${y}H${width}" />`;
      }).join("")}
    </g>
    ${
      bars
        ? `<g class="chart-bars" fill="${NS.mint}" opacity="0.45">
            ${bars.values
              .map((value, index) => {
                const maxBar = Math.max(...bars.values) * 1.55 || 1;
                const h = (value / maxBar) * (height * 0.58);
                return `<rect data-bar x="${xAt(index) - barW / 2}" y="${height}" width="${barW}" height="0"
                  data-height="${h}" data-base="${height}" rx="4" />`;
              })
              .join("")}
          </g>`
        : ""
    }
    <path d="${areaD}" fill="url(#${uid})" class="chart-area" />
    <path d="${lineD}" fill="none" stroke="${NS.uv}" stroke-width="2.4" stroke-linecap="round"
      class="chart-line" data-length="1" />
    ${
      series[1]
        ? `<path d="${smoothPath(series[1].values, xAt, yAt)}" fill="none" stroke="${NS.mintDeep}"
            stroke-width="2" stroke-linecap="round" opacity="0.9" class="chart-line-2" />`
        : ""
    }
    ${
      dots
        ? primary.values
            .map(
              (value, index) =>
                `<g class="chart-dot" data-i="${index}">
                  <circle cx="${xAt(index)}" cy="${yAt(value)}" r="9" fill="transparent" />
                  <circle cx="${xAt(index)}" cy="${yAt(value)}" r="2.6" fill="#fff"
                    stroke="${NS.uv}" stroke-width="2" />
                  <title>${labels[index] || ""}: ${valueFormat(value)}</title>
                </g>`,
            )
            .join("")
        : ""
    }
    ${
      labels.length
        ? `<g class="chart-hit">${labels
            .map(
              (label, index) =>
                `<rect data-label="${label}" data-value="${valueFormat(primary.values[index])}"
                  x="${xAt(index) - stepX / 2}" y="0" width="${stepX}" height="${height}" fill="transparent" />`,
            )
            .join("")}</g>`
        : ""
    }
  </svg>`;
}

export function sparkline(values, { width = 92, height = 28, color = NS.uv } = {}) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const stepX = width / (values.length - 1);
  const yAt = (v) => height - 3 - ((v - min) / span) * (height - 6);
  const d = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * stepX).toFixed(1)} ${yAt(v).toFixed(1)}`)
    .join(" ");
  return `<svg class="spark" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"
      aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round" /></svg>`;
}

export function donut(items, { size = 168, thickness = 18, centerLabel = "", centerValue = "" } = {}) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = items
    .map((item) => {
      const length = (item.value / total) * circumference;
      const el = `<circle class="donut-seg" cx="${size / 2}" cy="${size / 2}" r="${radius}"
        fill="none" stroke="${item.color}" stroke-width="${thickness}"
        stroke-dasharray="${length} ${circumference - length}"
        stroke-dashoffset="${-offset}" stroke-linecap="butt"
        transform="rotate(-90 ${size / 2} ${size / 2})"><title>${item.label}: ${fmt.n(item.value)}</title></circle>`;
      offset += length;
      return el;
    })
    .join("");
  return `<svg class="donut" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img"
      aria-label="Channel mix">
    <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="#f4f1fb"
      stroke-width="${thickness}" />
    ${segments}
    <text x="50%" y="47%" text-anchor="middle" class="donut-value">${centerValue}</text>
    <text x="50%" y="58%" text-anchor="middle" class="donut-label">${centerLabel}</text>
  </svg>`;
}

export function columnChart(items, { width = 320, height = 150, color = NS.uv, secondary = null, showValues = false } = {}) {
  const max = Math.max(...items.map((i) => i.value)) * 1.18 || 1;
  const gap = 10;
  const barW = (width - gap * (items.length - 1)) / items.length;
  const bars = items
    .map((item, index) => {
      const h = (item.value / max) * (height - 26);
      const x = index * (barW + gap);
      return `<g class="col">
        <rect x="${x}" y="${height - 18}" width="${barW}" height="0" data-height="${h}" data-base="${height - 18}"
          rx="5" fill="${index === items.length - 1 ? color : "#e9e4f8"}" />
        ${
          secondary
            ? `<rect x="${x}" y="${height - 18}" width="${barW}" height="0" rx="5"
                fill="${secondary}" opacity="0.5" data-height="${(secondary.values?.[index] || 0) * 0.6}" />`
            : ""
        }
        <title>${item.label}: ${fmt.n(item.value)}</title>
      </g>`;
    })
    .join("");
  const values = showValues
    ? items
        .map(
          (item, index) =>
            `<text x="${index * (barW + gap) + barW / 2}" y="${height - 18 - (item.value / max) * (height - 26) - 6}"
              text-anchor="middle" class="col-value">${fmt.n(item.value)}</text>`,
        )
        .join("")
    : "";
  const labels = items
    .map(
      (item, index) =>
        `<text x="${index * (barW + gap) + barW / 2}" y="${height - 2}" text-anchor="middle"
          class="col-label">${item.label}</text>`,
    )
    .join("");
  return `<svg class="columns" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img"
      aria-label="Column chart">${bars}${values}${labels}</svg>`;
}

export function funnel(stages) {
  const max = stages[0].value || 1;
  return `<div class="funnel">${stages
    .map(
      (stage, index) => `
    <div class="funnel-row" style="--i:${index}">
      <span class="funnel-label">${stage.label}</span>
      <span class="funnel-track"><i data-funnel="${(stage.value / max) * 100}"></i></span>
      <span class="funnel-value">${fmt.n(stage.value)}</span>
    </div>`,
    )
    .join("")}</div>`;
}

export { NS };
