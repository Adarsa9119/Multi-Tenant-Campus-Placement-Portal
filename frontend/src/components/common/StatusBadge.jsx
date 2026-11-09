import { STATUS_TONE } from '../../constants/statuses.js';
import { label } from '../../utils/formatters.js';

export default function StatusBadge({ value }) {
  if (!value) return <span>—</span>;
  return <span className={`badge badge-${STATUS_TONE[value] || 'gray'}`}>{label(value)}</span>;
}
