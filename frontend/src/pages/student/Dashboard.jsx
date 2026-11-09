import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi.js';
import { studentApi } from '../../api/studentApi.js';
import Spinner from '../../components/common/Spinner.jsx';
import Alert from '../../components/common/Alert.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Panel from '../../components/cards/Panel.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import SecurityNotice from '../../components/security/SecurityNotice.jsx';
import { fmtDateTime, timeAgo } from '../../utils/formatters.js';

const link = (cols) => cols.map((c) => (c.type === 'link' ? { ...c, render: (r) => <Link className="btn btn-sm" to={`${c.to}${r[c.key]}`}>View Details</Link> } : c));
export default function Dashboard() {
  const { data: d, loading, error } = useApi(studentApi.dashboard, []);
  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;
  const [drives, tests, offers] = d.sections;
  return (
    <div>
      <div className="stats" style={{ gridTemplateColumns: '1.3fr repeat(4, 1fr)' }}>
        <div className="stat"><div className="profile-card"><div className="photo">{d.profile.name[0]}</div>
          <div><h2>{d.profile.name}</h2><div>B.Tech - {d.profile.department || d.profile.branch}</div><small style={{ color: 'var(--muted)' }}>Batch {d.profile.graduationYear} | Roll No: {d.profile.rollNo}</small>
            <div style={{ marginTop: 8 }}><span className="progress">Profile {d.profile.completion}% Complete</span> <Link to="/student/profile">Edit Profile →</Link></div></div></div></div>
        {d.stats.map((s) => <StatCard key={s.label} {...s} link="View Details" />)}
      </div>
      <div className="grid-2">
        <Panel title={drives.title} subtitle={drives.subtitle} to={drives.to} linkLabel="View All Drives"><DataTable rowKey="id" columns={link(drives.columns)} rows={drives.rows} emptyText="No eligible drives right now." /></Panel>
        <Panel title="My Applications" to="/student/applications" flush={false}><div className="app-counts">{d.applicationCounts.map((c) => <div key={c.label}><b>{c.value}</b>{c.label}</div>)}</div></Panel>
      </div>
      <div className="grid-3">
        <Panel title={tests.title} to={tests.to}><DataTable rowKey="id" columns={tests.columns} rows={tests.rows} emptyText="Nothing scheduled." /></Panel>
        <Panel title="🏆 Latest Offers" to={offers.to}><DataTable rowKey="id" columns={offers.columns} rows={offers.rows} emptyText={offers.empty} /></Panel>
        <Panel title="Notifications" to="/student/notifications"><ul className="notice-list" style={{ padding: '0 18px 12px' }}>{d.notices.items.map((n, i) => <li key={i}><span className="dot" /><div>{n.text}<small>{timeAgo(n.at)} · {fmtDateTime(n.at)}</small></div></li>)}{!d.notices.items.length && <li>No notifications.</li>}</ul></Panel>
      </div>
      <div className="grid-2e">
        <Panel title="⚡ Quick Actions" flush={false}><div className="quick"><Link className="qtile blue" to="/student/profile">Update Profile</Link><Link className="qtile purple" to="/student/resume">Manage Resume</Link><Link className="qtile green" to="/student/drives">Browse Drives</Link><Link className="qtile orange" to="/student/applications">My Applications</Link></div></Panel>
        <SecurityNotice title="Important Information" items={d.info} />
      </div>
    </div>
  );
}
