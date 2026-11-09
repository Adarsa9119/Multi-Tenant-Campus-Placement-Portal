export default function SecurityNotice({ title = 'Security & Access Control', items }) {
  return (
    <section className="panel" style={{ background: '#f2fbf5' }}>
      <div className="panel-head"><h3>🛡️ {title}</h3></div>
      <div className="panel-body"><ul className="sec-list">{items.map((t) => <li key={t}>{t}</li>)}</ul></div>
    </section>
  );
}
