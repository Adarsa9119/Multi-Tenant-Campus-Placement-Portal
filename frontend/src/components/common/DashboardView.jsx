import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi.js';
import PageHeader from './PageHeader.jsx';
import StatCard from './StatCard.jsx';
import Spinner from './Spinner.jsx';
import Alert from './Alert.jsx';
import Panel from '../cards/Panel.jsx';
import DataTable from '../tables/DataTable.jsx';
import BarChart from '../charts/BarChart.jsx';
import PipelineBars, { Funnel } from '../charts/PipelineBars.jsx';
import SecurityNotice from '../security/SecurityNotice.jsx';
import { fmtDateTime, timeAgo } from '../../utils/formatters.js';

const withLinks = (cols) => cols.map((c) => (c.type === 'link' ? { ...c, render: (r) => <Link className="btn btn-light btn-sm" to={`${c.to}${r[c.key]}`}>{c.text || 'View'}</Link> } : c));

function Notices({ data }) {
  if (!data) return null;
  return (
    <Panel title={data.title}>
      <ul className="notice-list" style={{ padding: '0 18px 12px' }}>
        {data.items.length === 0 && <li>Nothing here yet.</li>}
        {data.items.map((n, i) => <li key={i}><span className="dot" /><div>{n.text}<small>{timeAgo(n.at)} · {fmtDateTime(n.at)}</small></div></li>)}
      </ul>
    </Panel>
  );
}

/** Renders any dashboard payload: {stats, sections, pipeline, chart, notices, info, restricted...} */
export default function DashboardView({ load, title, subtitle, header, funnel = false, children, securityTitle, reportsTo }) {
  const { data, loading, error } = useApi(load, []);
  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;
  const d = data;
  const [first, ...rest] = d.sections || [];
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle}>{header}</PageHeader>
      {d.restricted && (
        <Alert type="warn">
          <b>{d.message}</b>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>{d.checks.map((c) => <li key={c.label}>{c.ok ? '✔' : '✖'} {c.label}</li>)}</ul>
        </Alert>
      )}
      {d.stats?.length > 0 && <div className="stats">{d.stats.map((s) => <StatCard key={s.label} {...s} />)}</div>}
      {children}
      {first && (
        <div className="grid-2">
          <Panel title={first.title} subtitle={first.subtitle} to={first.to}><DataTable columns={withLinks(first.columns)} rows={first.rows} emptyText={first.empty} rowKey="id" /></Panel>
          <div>
            {d.chart && <Panel title={d.chart.title} to={reportsTo} linkLabel="View Reports"><BarChart labels={d.chart.labels} series={d.chart.series} /></Panel>}
            {d.pipeline && !funnel && <Panel title="Application Pipeline"><PipelineBars steps={d.pipeline} /></Panel>}
          </div>
        </div>
      )}
      {d.pipeline && funnel && <Panel title="Recruitment Pipeline" subtitle="(All Authorized Drives)"><div style={{ padding: '0 16px 14px' }}><Funnel steps={d.pipeline} /></div></Panel>}
      <div className="grid-2e">
        {rest.map((s) => <Panel key={s.title} title={s.title} subtitle={s.subtitle} to={s.to}><DataTable columns={withLinks(s.columns)} rows={s.rows} emptyText={s.empty} rowKey="id" /></Panel>)}
      </div>
      <div className="grid-2e">
        <Notices data={d.notices} />
        <Notices data={d.extraNotices} />
        {d.info && <SecurityNotice title={securityTitle || 'Security & Access Control'} items={d.info} />}
      </div>
    </div>
  );
}
