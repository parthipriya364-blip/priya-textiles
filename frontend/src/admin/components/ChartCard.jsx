import "../style/ChartCard.css";

/**
 * Lightweight dependency-free chart card.
 * type: "bar" | "line" | "donut"
 * data: [{ label, value }]
 */
export default function ChartCard({ title, subtitle, type = "bar", data, formatValue }) {
  const chartData = data || [];
  const max = Math.max(...chartData.map((d) => d.value), 1);
  const fmt = formatValue || ((v) => v.toLocaleString("en-IN"));

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3>{title}</h3>
        {subtitle && <span>{subtitle}</span>}
      </div>

      {chartData.length === 0 ? (
        <div className="table-empty">No database data available yet.</div>
      ) : type === "bar" && (
        <div className="bar-chart">
          {chartData.map((d) => (
            <div className="bar-col" key={d.label}>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ height: `${(d.value / max) * 100}%` }}
                  title={fmt(d.value)}
                />
              </div>
              <span className="bar-label">{d.label}</span>
            </div>
          ))}
        </div>
      )}

      {chartData.length > 0 && type === "line" && (
        <LineChart data={chartData} max={max} fmt={fmt} />
      )}

      {chartData.length > 0 && type === "donut" && <DonutChart data={chartData} />}
    </div>
  );
}

function LineChart({ data, max, fmt }) {
  const width = 100;
  const height = 100;
  const step = width / (data.length - 1 || 1);

  const points = data.map((d, i) => {
    const x = i * step;
    const y = height - (d.value / max) * height;
    return `${x},${y}`;
  });

  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="line-svg">
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="var(--c-gold-deep)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => {
          const [x, y] = points[i].split(",");
          return <circle key={d.label} cx={x} cy={y} r="1.6" fill="var(--c-maroon)" />;
        })}
      </svg>
      <div className="line-labels">
        {data.map((d) => (
          <span key={d.label} title={fmt(d.value)}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const colors = ["var(--c-gold)", "var(--c-maroon)", "var(--c-ink)", "var(--c-gray-light)"];
  let cumulative = 0;

  const segments = data.map((d, i) => {
    const fraction = d.value / total;
    const start = cumulative;
    cumulative += fraction;
    return { ...d, start, end: cumulative, color: colors[i % colors.length] };
  });

  const gradient = segments
    .map((s) => `${s.color} ${(s.start * 100).toFixed(1)}% ${(s.end * 100).toFixed(1)}%`)
    .join(", ");

  return (
    <div className="donut-chart">
      <div className="donut-visual" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="donut-hole">
          <strong>{total}%</strong>
        </div>
      </div>
      <ul className="donut-legend">
        {segments.map((s) => (
          <li key={s.label}>
            <span className="dot" style={{ background: s.color }} />
            {s.label} <b>{s.value}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
