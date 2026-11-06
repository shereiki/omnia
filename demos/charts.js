/* Charts for the workspace demo.
   Accurate first: every scale comes from the data it plots. Pretty second:
   monotone curves (no overshoot), one grid weight, one axis voice. */

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

/* Round a maximum up to a value that produces readable ticks. */
function niceStep(rough) {
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * pow >= rough) * pow;
  return step;
}

/* An axis that ends just above the data: 214 becomes 250 in 5 steps, not 400. */
export function niceScale(max, ticks = 4) {
  if (!Number.isFinite(max) || max <= 0) return { max: 1, step: 0.25, ticks: 4 };
  const step = niceStep(max / ticks);
  const top = Math.ceil(max / step) * step;
  return { max: top, step, ticks: Math.round(top / step) };
}

export function niceMax(max, ticks = 4) {
  return niceScale(max, ticks).max;
}

/* Fritsch-Carlson monotone cubic: smooth, but never overshoots the data. */
function monotonePath(points) {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M${points[0][0]} ${points[0][1]}`;
  const dx = [];
  const dy = [];
  const slope = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = points[i + 1][0] - points[i][0];
    dy[i] = points[i + 1][1] - points[i][1];
    slope[i] = dy[i] / dx[i];
  }
  const m = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) m[i] = 0;
    else {
      const w1 = 2 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2 * dx[i - 1];
      m[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]);
    }
  }
  m[n - 1] = slope[n - 2];

  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const h = dx[i] / 3;
    d += ` C${x0 + h} ${y0 + m[i] * h} ${x1 - h} ${y1 - m[i + 1] * h} ${x1} ${y1}`;
  }
  return d;
}

export function sparkline(values, { width = 84, height = 26, color = C.uv, fill = true } = {}) {
  if (!values.length) return "";
  const max = niceMax(Math.max(...values));
  const min = Math.min(0, Math.min(...values));
  const span = max - min || 1;
  const stepX = values.length > 1 ? (width - 2) / (values.length - 1) : width;
  const pts = values.map((v, i) => [1 + i * stepX, height - 2 - ((v - min) / span) * (height - 5)]);
  const d = monotonePath(pts);
  const uid = `s${Math.random().toString(36).slice(2, 7)}`;
  const [lx, ly] = pts[pts.length - 1];
  return `<svg class="spark" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-hidden="true">
    ${fill ? `<defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.13" />
      <stop offset="100%" stop-color="${color}" stop-opacity="0" /></linearGradient></defs>
    <path d="${d} L${width - 1} ${height} L1 ${height} Z" fill="url(#${uid})" />` : ""}
    <path d="${d}" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="${lx}" cy="${ly}" r="2.1" fill="${color}" />
  </svg>`;
}

/*
  data: [{ label, value, bar? }]
  - y axis with nice ticks and a unit
  - optional columns behind the line (same x scale, own scale)
*/
export function lineChart({
  data,
  width = 720,
  height = 240,
  unit = "",
  valueFormat = fmt.n,
  barFormat = fmt.n,
  ticks = 5,
  barLabel = "Orders",
  lineLabel = "Conversations",
}) {
  const padLeft = 46;
  const padRight = 12;
  const padTop = 14;
  const padBottom = 26;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const scale = niceScale(Math.max(...data.map((d) => d.value)), ticks);
  const max = scale.max;
  const steps = scale.ticks;
  const step = data.length > 1 ? plotW / (data.length - 1) : plotW;

  const x = (i) => padLeft + (data.length > 1 ? i * step : plotW / 2);
  const y = (v) => padTop + plotH - (v / max) * plotH;

  const pts = data.map((d, i) => [x(i), y(d.value)]);
  const line = monotonePath(pts);
  const area = `${line} L${x(data.length - 1)} ${padTop + plotH} L${x(0)} ${padTop + plotH} Z`;

  const barMax = niceMax(Math.max(...data.map((d) => d.bar ?? 0)) || 1, ticks) * 1.15;
  const barW = Math.min(18, step * 0.34);

  const grid = Array.from({ length: steps + 1 }, (_, i) => {
    const value = (max / steps) * i;
    const yy = y(value);
    return `<g>
      <path d="M${padLeft} ${yy}H${width - padRight}" stroke="${C.grid}" stroke-width="1" />
      <text x="${padLeft - 10}" y="${yy + 3.5}" text-anchor="end" class="axis-text">${valueFormat(value)}</text>
    </g>`;
  }).join("");

  const bars = data
    .map((d, i) => {
      if (d.bar === undefined || d.bar === null) return "";
      const h = (d.bar / barMax) * plotH * 0.52;
      return `<rect data-bar x="${x(i) - barW / 2}" y="${padTop + plotH}" width="${barW}" height="0"
        data-h="${h}" data-base="${padTop + plotH}" rx="4" fill="${C.mintSoft}" opacity="0.38">
        <title>${d.label}: ${barFormat(d.bar)} ${barLabel.toLowerCase()}</title></rect>`;
    })
    .join("");

  const xLabels = data
    .map((d, i) => `<text x="${x(i)}" y="${height - 8}" text-anchor="middle" class="axis-text">${d.label}</text>`)
    .join("");

  const dots = data
    .map(
      (d, i) =>
        `<circle class="dot" cx="${x(i)}" cy="${y(d.value)}" r="3" fill="#fff" stroke="${C.uv}" stroke-width="2" opacity="${i === data.length - 1 ? 1 : 0}" />`,
    )
    .join("");

  const hover = data
    .map(
      (d, i) =>
        `<rect data-hit x="${x(i) - step / 2}" y="${padTop}" width="${Math.max(step, 1)}" height="${plotH}"
          fill="transparent" data-label="${d.label}" data-value="${valueFormat(d.value)}${unit}"
          data-barlabel="${d.bar !== undefined ? `${barFormat(d.bar)} ${barLabel.toLowerCase()}` : ""}"></rect>`,
    )
    .join("");

  const uid = `l${Math.random().toString(36).slice(2, 7)}`;

  return `<svg class="chart" viewBox="0 0 ${width} ${height}" width="100%" height="${height}"
      preserveAspectRatio="none" role="img" aria-label="${lineLabel} by ${data.length} points">
    <defs>
      <linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${C.uv}" stop-opacity="0.16" />
        <stop offset="100%" stop-color="${C.uv}" stop-opacity="0" />
      </linearGradient>
    </defs>
    ${grid}
    ${bars}
    <path d="${area}" fill="url(#${uid})" />
    <path class="line" d="${line}" fill="none" stroke="${C.uv}" stroke-width="2.2"
      stroke-linecap="round" stroke-linejoin="round" />
    ${dots}
    <g class="hits">${hover}</g>
    ${xLabels}
    <g class="cursor" opacity="0"><line y1="${padTop}" y2="${padTop + plotH}" stroke="${C.lav}" stroke-width="1" /></g>
  </svg>`;
}

export function columns(data, { width = 320, height = 150, highlightLast = true, unit = "" } = {}) {
  const padTop = 18;
  const padBottom = 22;
  const padLeft = 4;
  const plotH = height - padTop - padBottom;
  const max = niceMax(Math.max(...data.map((d) => d.value)), 3);
  const gap = 12;
  const barW = (width - padLeft * 2 - gap * (data.length - 1)) / data.length;

  const bars = data
    .map((d, i) => {
      const h = (d.value / max) * plotH;
      const x = padLeft + i * (barW + gap);
      const strong = highlightLast && i === data.length - 1;
      return `<g>
        <rect data-bar x="${x}" y="${padTop + plotH}" width="${barW}" height="0"
          data-h="${h}" data-base="${padTop + plotH}" rx="4"
          fill="${strong ? C.uv : "#e6e0f7"}" />
        <text x="${x + barW / 2}" y="${padTop + plotH - h - 7}" text-anchor="middle" class="col-value">${fmt.n(d.value)}${unit}</text>
        <text x="${x + barW / 2}" y="${height - 5}" text-anchor="middle" class="axis-text">${d.label}</text>
      </g>`;
    })
    .join("");

  return `<svg class="columns" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img" aria-label="Columns">
    <path d="M0 ${padTop + plotH}H${width}" stroke="${C.grid}" stroke-width="1" />
    ${bars}
  </svg>`;
}

export function donut(items, { size = 148, thickness = 14, centerValue = "", centerLabel = "" } = {}) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segs = items
    .map((item) => {
      const len = (item.value / total) * circ - 2;
      const el = `<circle class="seg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none"
        stroke="${item.color}" stroke-width="${thickness}" stroke-linecap="round"
        stroke-dasharray="${Math.max(len, 1)} ${circ}" stroke-dashoffset="${-offset - 1}"
        transform="rotate(-90 ${size / 2} ${size / 2})"><title>${item.label}: ${fmt.n(item.value)}</title></circle>`;
      offset += (item.value / total) * circ;
      return el;
    })
    .join("");
  return `<svg class="donut" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Channel mix">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#f4f1fb" stroke-width="${thickness}" />
    ${segs}
    <text x="50%" y="47%" text-anchor="middle" class="donut-value">${centerValue}</text>
    <text x="50%" y="58%" text-anchor="middle" class="donut-label">${centerLabel}</text>
  </svg>`;
}

export function funnel(stages) {
  const max = stages[0].value || 1;
  return `<div class="funnel">${stages
    .map(
      (s, i) => `<div class="funnel-row">
        <span class="funnel-label">${s.label}</span>
        <span class="funnel-track"><i data-funnel="${(s.value / max) * 100}"></i></span>
        <span class="funnel-value">${fmt.n(s.value)}</span>
        <span class="funnel-drop">${i === 0 ? "" : `−${Math.round((1 - s.value / stages[i - 1].value) * 100)}%`}</span>
      </div>`,
    )
    .join("")}</div>`;
}
