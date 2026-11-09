import { Link } from 'react-router-dom';

export default function Panel({ title, subtitle, to, linkLabel = 'View All', children, flush = true, right }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>{title}{subtitle && <small>{subtitle}</small>}</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{right}{to && <Link className="btn btn-light btn-sm" to={to}>{linkLabel}</Link>}</div>
      </div>
      <div className={`panel-body ${flush ? 'flush' : ''}`}>{children}</div>
    </section>
  );
}
