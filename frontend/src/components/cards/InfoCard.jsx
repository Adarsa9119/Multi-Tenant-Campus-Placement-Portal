export default function InfoCard({ title, items, tone = 'info' }) {
  return (
    <div className={tone === 'green' ? 'green-box' : 'info-box'}>
      <b style={tone === 'green' ? { color: '#0b6a33' } : undefined}>{title}</b>
      <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>{items.map((t) => <li key={t}>{t}</li>)}</ul>
    </div>
  );
}
