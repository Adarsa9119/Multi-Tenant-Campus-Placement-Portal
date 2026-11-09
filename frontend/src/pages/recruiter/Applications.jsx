import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ResourcePage from '../../components/common/ResourcePage.jsx';
import Alert from '../../components/common/Alert.jsx';
import { applicationApi } from '../../api/applicationApi.js';
import { recruiterApi } from '../../api/recruiterApi.js';
import { errorMessage } from '../../api/axiosClient.js';

export default function Applications({ title = 'Applications', subtitle = 'Candidates who applied to your authorized drives (minimum data only)', statuses }) {
  const [sp] = useSearchParams();
  const [drives, setDrives] = useState([]);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    recruiterApi.drives({ limit: 100 })
      .then((r) => { setDrives(r.data); setLoadError(''); })
      .catch((e) => setLoadError(errorMessage(e)));
  }, []);
  const set = (s, label) => ({ label, variant: s === 'REJECTED' ? 'danger' : 'success', ...(s === 'REJECTED' ? { ask: 'Remarks' } : {}), run: (r, t) => applicationApi.setStatus(r._id, s, t), success: `Marked ${s.toLowerCase().replace('_', ' ')}` });
  return (
    <ResourcePage
      key={sp.get('driveId') || 'all'} title={title} subtitle={subtitle} baseParams={{ ...(statuses ? { statuses } : {}), ...(sp.get('driveId') ? { driveId: sp.get('driveId') } : {}) }}
      before={loadError && <Alert>Unable to load authorized drives: {loadError}</Alert>}
      load={(p) => applicationApi.list(p)}
      filters={[{ name: 'status', label: 'All statuses', options: ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'TEST', 'INTERVIEW', 'SELECTED', 'OFFER', 'PLACED', 'REJECTED'] }]}
      columns={[{ key: 'name', label: 'Name' }, { key: 'branch', label: 'Branch' }, { key: 'cgpa', label: 'CGPA' }, { key: 'graduationYear', label: 'Grad Year' }, { key: 'skills', label: 'Skills' }, { key: 'drive', label: 'Drive' }, { key: 'status', label: 'Status', badge: true },
        { key: 'x', label: 'Details', render: (r) => <><Link className="btn btn-light btn-sm" to={`/recruiter/candidates/${r._id}`}>Profile</Link>{r.hasResume ? <Link className="btn btn-light btn-sm" style={{ marginLeft: 6 }} to={`/recruiter/candidates/${r._id}/resume`}>🔒 Resume</Link> : null}</> }]}
      rowActions={[set('UNDER_REVIEW', 'Review'), { ...set('SHORTLISTED', 'Shortlist') }, set('SELECTED', 'Select'), set('REJECTED', 'Reject')].map((a) => ({
        ...a, show: (r) => ({ Review: r.status === 'APPLIED', Shortlist: r.status === 'UNDER_REVIEW', Select: ['TEST', 'INTERVIEW'].includes(r.status), Reject: !['REJECTED', 'PLACED', 'OFFER'].includes(r.status) }[a.label]) }))}
      extraHeader={drives.length ? <span className="badge badge-blue">{drives.length} authorized drives</span> : null}
    />
  );
}
