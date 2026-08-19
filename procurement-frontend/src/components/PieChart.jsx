const PALETTE = [
  'var(--ledger-blue)',
  'var(--moss)',
  'var(--amber)',
  'var(--brick)',
  '#6b5b95',
  '#3f8fa6',
];

export default function PieChart({ data, size = 200 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2;
  const cx = r;
  const cy = r;

  let angle = -90; // start at 12 o'clock
  const slices = data.map((d, i) => {
    const fraction = total ? d.value / total : 0;
    const sweep = fraction * 360;
    const start = angle;
    const end = angle + sweep;
    angle = end;

    const large = sweep > 180 ? 1 : 0;
    const x1 = cx + r * Math.cos((Math.PI * start) / 180);
    const y1 = cy + r * Math.sin((Math.PI * start) / 180);
    const x2 = cx + r * Math.cos((Math.PI * end) / 180);
    const y2 = cy + r * Math.sin((Math.PI * end) / 180);

    const path =
      fraction >= 0.9999
        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;

    return { path, color: PALETTE[i % PALETTE.length], label: d.label, value: d.value, pct: fraction * 100 };
  });

  return (
    <div className="pie-chart-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {slices.map((s) => (
          <path key={s.label} d={s.path} fill={s.color} stroke="var(--surface)" strokeWidth="1.5" />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.52} fill="var(--surface)" />
      </svg>
      <ul className="pie-legend">
        {slices.map((s) => (
          <li key={s.label}>
            <span className="swatch" style={{ background: s.color }} />
            <span className="pie-legend-label">{s.label}</span>
            <span className="pie-legend-pct mono">{s.pct.toFixed(1)}%</span>
          </li>
        ))}
        {total === 0 && <li className="muted">No spend recorded for this period yet.</li>}
      </ul>
    </div>
  );
}
