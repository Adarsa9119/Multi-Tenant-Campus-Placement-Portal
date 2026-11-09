import StatusBadge from '../common/StatusBadge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { fmtDate, fmtDateTime, fmtMoney, getPath } from '../../utils/formatters.js';

export function cell(col, row) {
  if (col.render) return col.render(row);
  const v = getPath(row, col.key);
  if (col.badge) return <StatusBadge value={v} />;
  if (col.type === 'date') return fmtDate(v);
  if (col.type === 'datetime') return fmtDateTime(v);
  if (col.type === 'money') return fmtMoney(v);
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return v === undefined || v === null || v === '' ? '—' : String(v);
}

export default function DataTable({ columns, rows, actions, emptyText, rowKey = '_id' }) {
  if (!rows || !rows.length) return <EmptyState text={emptyText} />;
  return (
    <div className="table-wrap">
      <table className="tbl">
        <thead><tr><th>#</th>{columns.map((c) => <th key={c.key + c.label}>{c.label}</th>)}{actions && <th>Actions</th>}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r[rowKey] || r.id || i}>
              <td>{i + 1}</td>
              {columns.map((c) => <td key={c.key + c.label}>{cell(c, r)}</td>)}
              {actions && <td><div className="actions">{actions(r)}</div></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
