import { Link } from 'react-router-dom';
import { useState } from 'react';
import useApi from '../../hooks/useApi.js';
import PageHeader from './PageHeader.jsx';
import Spinner from './Spinner.jsx';
import Alert from './Alert.jsx';
import Pagination from './Pagination.jsx';
import { notificationApi } from '../../api/notificationApi.js';
import { fmtDateTime, timeAgo } from '../../utils/formatters.js';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, meta, loading, error, reload } = useApi(() => notificationApi.list({ page }), [page]);
  const mark = async (id) => { await notificationApi.read(id); reload(); };
  return (
    <div>
      <PageHeader title="Notifications" subtitle={meta ? `${meta.unread} unread` : ''}>
        <button className="btn btn-light" onClick={async () => { await notificationApi.readAll(); reload(); }}>Mark all as read</button>
      </PageHeader>
      <Alert>{error}</Alert>
      <section className="panel"><div className="panel-body" style={{ paddingTop: 12 }}>
        {loading ? <Spinner /> : (
          <ul className="notice-list">
            {data.length === 0 && <li>No notifications.</li>}
            {data.map((n) => (
              <li key={n._id}><span className="dot" style={{ background: n.read ? '#c5cfe0' : undefined }} />
                <div style={{ flex: 1 }}><span className={n.read ? '' : 'unread'}>{n.message}</span><small>{timeAgo(n.createdAt)} · {fmtDateTime(n.createdAt)}</small></div>
                {n.link && <Link className="btn btn-light btn-sm" to={n.link} onClick={() => mark(n._id)}>Open</Link>}
                {!n.read && <button className="btn btn-light btn-sm" onClick={() => mark(n._id)}>Mark read</button>}
              </li>))}
          </ul>)}
        <Pagination meta={meta} onPage={setPage} />
      </div></section>
    </div>
  );
}
