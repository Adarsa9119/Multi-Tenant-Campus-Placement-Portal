const COLORS = ['#1f6feb', '#16a34a', '#f59e0b', '#7c3aed'];

// Dependency-free grouped bar chart (SVG).
export default function BarChart({ labels = [], series = [], height = 220 }) {
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const nice = Math.ceil(max / 4 / (max > 40 ? 10 : 1)) * 4 * (max > 40 ? 10 : 1) || 4;
  const W = 560; const H = height; const pad = { l: 38, r: 8, t: 8, b: 24 };
  const gw = (W - pad.l - pad.r) / Math.max(1, labels.length);
  const bw = Math.max(4, (gw - 10) / Math.max(1, series.length));
  return (
    <div style={{ padding: '0 14px 14px' }}>
      <div className="legend">{series.map((s, i) => <span key={s.name}><i style={{ background: COLORS[i % 4] }} />{s.name}</span>)}</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Bar chart">
        {[0, 1, 2, 3, 4].map((t) => {
          const y = pad.t + ((H - pad.t - pad.b) * (4 - t)) / 4;
          return <g key={t}><line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#e5eaf3" /><text x={pad.l - 6} y={y + 4} fontSize="10" textAnchor="end" fill="#667">{Math.round((nice * t) / 4)}</text></g>;
        })}
        {labels.map((l, i) => (
          <g key={l + i}>
            {series.map((s, j) => {
              const h = ((H - pad.t - pad.b) * (s.values[i] || 0)) / nice;
              return <rect key={s.name} x={pad.l + i * gw + 5 + j * bw} y={H - pad.b - h} width={bw - 1} height={h} fill={COLORS[j % 4]} rx="2" />;
            })}
            <text x={pad.l + i * gw + gw / 2} y={H - 8} fontSize="11" textAnchor="middle" fill="#667">{l}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
