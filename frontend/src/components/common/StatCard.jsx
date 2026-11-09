import { Link } from 'react-router-dom';

const ICONS = { blue: '📘', green: '✅', purple: '👥', orange: '🏢', red: '🛡️', teal: '🎧', amber: '⏳' };
export default function StatCard({ label, value, hint, tone = 'blue', link, to, icon }) {
  return (
    <div className={`stat tone-${tone}`}>
      <div className="ic">{icon || ICONS[tone]}</div>
      <div>
        <div className="v">{value}</div>
        <div className="l">{label}</div>
        {hint && <div className="h">{hint}</div>}
        {to && <Link to={to}>{link || 'View'} →</Link>}
      </div>
    </div>
  );
}
