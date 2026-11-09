import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { driveApi } from '../../api/driveApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Alert from '../../components/common/Alert.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Panel from '../../components/cards/Panel.jsx';
import { criteriaChips } from '../../utils/eligibility.js';

export default function Eligibility() {
  const [params, setParams] = useSearchParams();
  const driveId = params.get('driveId') || '';
  const [drives, setDrives] = useState([]);
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => { driveApi.list({ limit: 100 }).then((r) => setDrives(r.data)).catch((e) => setErr(errorMessage(e))); }, []);
  useEffect(() => {
    if (!driveId) { setRes(null); return; }
    setLoading(true); setErr('');
    driveApi.eligibility(driveId).then(setRes).catch((e) => setErr(errorMessage(e))).finally(() => setLoading(false));
  }, [driveId]);
  const drive = drives.find((d) => d._id === driveId);
  return (
    <div>
      <PageHeader title="Manage Eligibility" subtitle="See exactly who qualifies for a drive and why others do not (rule-based, no AI)." />
      <Alert>{err}</Alert>
      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="field" style={{ margin: 0, maxWidth: 480 }}><label>Placement drive</label>
          <select value={driveId} onChange={(e) => setParams(e.target.value ? { driveId: e.target.value } : {})}><option value="">Select a drive…</option>{drives.map((d) => <option key={d._id} value={d._id}>{d.companyId?.name} – {d.title} ({d.status})</option>)}</select></div>
        {drive && <p style={{ marginBottom: 0 }}>{criteriaChips(drive.criteria).map((c) => <span key={c} className="chip">{c}</span>)}</p>}
      </div>
      {loading && <Spinner />}
      {res && <Panel title="Students" subtitle={`${res.meta.eligible} eligible of ${res.meta.total}`}>
        <DataTable rowKey="_id" rows={res.data} columns={[{ key: 'rollNo', label: 'Roll No' }, { key: 'name', label: 'Name' }, { key: 'branch', label: 'Branch' }, { key: 'cgpa', label: 'CGPA' }, { key: 'backlogs', label: 'Backlogs' }, { key: 'graduationYear', label: 'Year' }, { key: 'verificationStatus', label: 'Verification', badge: true },
          { key: 'eligible', label: 'Eligible', render: (r) => <span className={`badge ${r.eligible ? 'badge-green' : 'badge-red'}`}>{r.eligible ? 'Eligible' : 'Not eligible'}</span> }, { key: 'reasons', label: 'Reason' }]} />
      </Panel>}
    </div>
  );
}
