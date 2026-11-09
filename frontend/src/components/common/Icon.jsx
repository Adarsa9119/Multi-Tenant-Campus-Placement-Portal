const MAP = {
  home: '🏠', clipboard: '📋', building: '🏛️', users: '👥', user: '👤', shield: '🛡️', briefcase: '💼', cap: '🎓', file: '📄', alert: '⚠️', help: '❓', gear: '⚙️',
  upload: '⬆️', check: '✅', plus: '➕', filter: '🔎', star: '⭐', calendar: '📅', trophy: '🏆', chart: '📊', bell: '🔔', mail: '✉️', lock: '🔒',
};
export default function Icon({ name }) { return <span className="ico" aria-hidden="true">{MAP[name] || '•'}</span>; }
