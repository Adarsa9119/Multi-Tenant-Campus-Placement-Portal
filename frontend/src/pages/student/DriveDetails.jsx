import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useApi from '../../hooks/useApi.js';
import { studentApi } from '../../api/studentApi.js';
import { applicationApi } from '../../api/applicationApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Alert from '../../components/common/Alert.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Panel from '../../components/cards/Panel.jsx';
import { fmtDateTime } from '../../utils/formatters.js';
import { criteriaChips } from '../../utils/eligibility.js';

export default function DriveDetails() {
  const { id } = useParams();
  const { data: d, loading, error, reload } = useApi(() => studentApi.drive(id), [id]);
  const [err, setErr] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;
  const open = d.status === 'PUBLISHED' && new Date(d.deadline) > new Date();
  const apply = async () => { setBusy(true); setErr(''); try { await applicationApi.apply(id); setMsg('Application submitted'); await reload(); } catch (e) { setErr(errorMessage(e)); } finally { setBusy(false); } };
  return (
    <div>
      <PageHeader title={`${d.companyId?.name} – ${d.title}`} subtitle={`${d.location || 'Location not specified'} · ${d.package} LPA`}><Link className="btn btn-light" to="/student/drives">← All drives</Link></PageHeader>
      <Alert>{err}</Alert><Alert type="success">{msg}</Alert>
      <div className="grid-2e">
        <Panel title="Drive details" flush={false}>
          <dl className="kv"><dt>Company</dt><dd>{d.companyId?.name} ({d.companyId?.industry})</dd><dt>Role</dt><dd>{d.title}</dd><dt>Package</dt><dd>{d.package} LPA</dd><dt>Deadline</dt><dd>{fmtDateTime(d.deadline)}</dd><dt>Status</dt><dd><StatusBadge value={d.status} /></dd><dt>Description</dt><dd>{d.description || '—'}</dd></dl>
        </Panel>
        <Panel title="Your eligibility" flush={false}>
          <p>{criteriaChips(d.criteria).map((c) => <span key={c} className="chip chip-gray">{c}</span>)}</p>
          {d.eligibility.eligible ? <Alert type="success">You meet every criterion for this drive.</Alert> : <Alert>You are not eligible: <ul style={{ margin: '4px 0 0' }}>{d.eligibility.failures.map((f) => <li key={f}>{f}</li>)}</ul></Alert>}
          {!d.verified && <Alert type="warn">Your academic verification is pending; applications open after TPO verification.</Alert>}
          {d.application ? <p>Application status: <StatusBadge value={d.application.status} /></p>
            : <button className="btn btn-lg" disabled={busy || !open || !d.eligibility.eligible || !d.verified} onClick={apply}>{busy ? 'Applying…' : open ? 'Apply Now' : 'Applications closed'}</button>}
        </Panel>
      </div>
    </div>
  );
}
