const PALETTE = [
  'var(--ledger-blue)',
  'var(--moss)',
  'var(--amber)',
  'var(--brick)',
  '#6b5b95',
  '#3f8fa6',
];

// series: [{ label, points: [{ x: 'Feb 2026', y: 12000 }, ...] }]
export default function LineChart({ series, height = 260 }) {
  const width = 640;
  const padL = 56;
  const padR = 16;
  const padT = 16;
  const padB = 34;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const xLabels = series[0]?.points.map((p) => p.x) || [];
  const allValues = series.flatMap((s) => s.points.map((p) => p.y));
  const maxY = Math.max(1, ...allValues);
  const stepX = xLabels.length > 1 ? plotW / (xLabels.length - 1) : 0;

  const yTicks = 4;

  function coords(points) {
    return points.map((p, i) => {
      const x = padL + i * stepX;
      const y = padT + plotH - (p.y / maxY) * plotH;
      return { x, y };
    });
  }

  return (
    <div className="line-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        {/* gridlines + y labels */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const y = padT + (plotH / yTicks) * i;
          const value = maxY - (maxY / yTicks) * i;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="var(--line)" strokeWidth="1" />
              <text x={padL - 8} y={y + 4} fontSize="10" textAnchor="end" fill="var(--ink-soft)" fontFamily="var(--font-mono)">
                {value >= 1000 ? `${Math.round(value / 1000)}k` : Math.round(value)}
              </text>
            </g>
          );
        })}

        {/* x labels */}
        {xLabels.map((label, i) => (
          <text
            key={label}
            x={padL + i * stepX}
            y={height - 10}
            fontSize="10.5"
            textAnchor="middle"
            fill="var(--ink-soft)"
            fontFamily="var(--font-mono)"
          >
            {label}
          </text>
        ))}

        {/* lines */}
        {series.map((s, si) => {
          const pts = coords(s.points);
          const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
          const color = PALETTE[si % PALETTE.length];
          return (
            <g key={s.label}>
              <path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="2.8" fill={color} />
              ))}
            </g>
          );
        })}
      </svg>
      <ul className="line-legend">
        {series.map((s, i) => (
          <li key={s.label}>
            <span className="swatch" style={{ background: PALETTE[i % PALETTE.length] }} />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
