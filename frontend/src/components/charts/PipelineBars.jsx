// Funnel (recruiter) or indented bar rows (TPO) for pipeline counts.
export function Funnel({ steps }) {
  return <div className="funnel">{steps.map((s, i) => <div key={s.label} className={`step c${i % 7}`}><b>{s.value}</b><span>{s.label}</span></div>)}</div>;
}
export default function PipelineBars({ steps }) {
  return <div style={{ padding: '0 16px 14px' }}>{steps.map((s) => <div key={s.label} className="pipe-row"><span>{s.label}</span><b>{s.value}</b></div>)}</div>;
}
