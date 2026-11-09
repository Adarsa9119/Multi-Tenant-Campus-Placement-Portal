import { Link, useParams } from 'react-router-dom';
import useApi from '../../hooks/useApi.js';
import { applicationApi } from '../../api/applicationApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Alert from '../../components/common/Alert.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Panel from '../../components/cards/Panel.jsx';
import { APPLICATION_FLOW } from '../../constants/statuses.js';
import { fmtDateTime, label } from '../../utils/formatters.js';

export default function ApplicationDetails() {
  const { id } = useParams();
  const { data: a, loading, error } = useApi(() => applicationApi.get(id), [id]);
  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;
  const idx = APPLICATION_FLOW.indexOf(a.status);
  return (
    <div>
      <PageHeader title={`${a.drive?.companyId?.name || ''} – ${a.drive?.title || ''}`} subtitle={`Applied ${fmtDateTime(a.appliedAt)}`}><StatusBadge value={a.status} /><Link className="btn btn-light" to="/student/applications">← Back</Link></PageHeader>
      <Panel title="Progress" flush={false}>
        <div className="steps">{APPLICATION_FLOW.map((s, i) => <div key={s} className={`s ${a.status !== 'REJECTED' && i < idx ? 'done' : a.status !== 'REJECTED' && i === idx ? 'cur' : ''}`}><i>{i + 1}</i><b>{label(s)}</b></div>)}</div>
        {a.status === 'REJECTED' && <Alert>This application was not taken forward.</Alert>}
      </Panel>
      <Panel title="History" flush={false}><ul className="timeline">{a.history?.map((h, i) => <li key={i}><b>{label(h.to)}</b><small style={{ display: 'block', color: 'var(--muted)' }}>{fmtDateTime(h.at)} {h.remarks && `· ${h.remarks}`}</small></li>)}</ul></Panel>
    </div>
  );
}
