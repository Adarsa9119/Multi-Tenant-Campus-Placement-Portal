import { useEffect, useState } from 'react';
import ResourcePage from '../../components/common/ResourcePage.jsx';
import Alert from '../../components/common/Alert.jsx';
import { applicationApi } from '../../api/applicationApi.js';
import { driveApi } from '../../api/driveApi.js';
import { openBlob } from '../../utils/file.js';
import api, { errorMessage } from '../../api/axiosClient.js';

export const tpoAppActions = [
  { label: 'Review', variant: 'light', show: (r) => r.status === 'APPLIED', run: (r) => applicationApi.setStatus(r._id, 'UNDER_REVIEW'), success: 'Under review' },
  { label: 'Shortlist', variant: 'success', show: (r) => r.status === 'UNDER_REVIEW', run: (r) => applicationApi.setStatus(r._id, 'SHORTLISTED'), success: 'Shortlisted' },
  { label: 'Select', variant: 'success', show: (r) => ['TEST', 'INTERVIEW'].includes(r.status), run: (r) => applicationApi.setStatus(r._id, 'SELECTED'), success: 'Selected' },
  { label: 'Reject', variant: 'danger', show: (r) => !['REJECTED', 'PLACED', 'OFFER'].includes(r.status), ask: 'Remarks', run: (r, t) => applicationApi.setStatus(r._id, 'REJECTED', t), success: 'Rejected' },
  { label: 'Resume', variant: 'light', show: (r) => r.hasResume, run: async (r) => openBlob((await api.get(`/files/applications/${r._id}/resume`, { responseType: 'blob' })).data) },
];
export const appColumns = [{ key: 'name', label: 'Student' }, { key: 'rollNo', label: 'Roll No' }, { key: 'branch', label: 'Branch' }, { key: 'cgpa', label: 'CGPA' }, { key: 'company', label: 'Company' }, { key: 'drive', label: 'Drive' }, { key: 'appliedAt', label: 'Applied', type: 'date' }, { key: 'status', label: 'Status', badge: true }];

export default function Applications({ title = 'All Applications', subtitle = 'Applications to drives of your college', statuses, hideStatusFilter }) {
  const [drives, setDrives] = useState([]);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    driveApi.list({ limit: 100 })
      .then((r) => { setDrives(r.data); setLoadError(''); })
      .catch((e) => setLoadError(errorMessage(e)));
  }, []);
  return (
    <ResourcePage
      title={title} subtitle={subtitle} before={loadError && <Alert>Unable to load drives for filtering: {loadError}</Alert>} baseParams={statuses ? { statuses } : {}}
      load={(p) => applicationApi.list(p)}
      filters={[{ name: 'driveId', label: 'All drives', options: drives.map((d) => ({ value: d._id, label: `${d.companyId?.name} – ${d.title}` })) }, ...(hideStatusFilter ? [] : [{ name: 'status', label: 'All statuses', options: ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'TEST', 'INTERVIEW', 'SELECTED', 'OFFER', 'PLACED', 'REJECTED'] }])]}
      columns={appColumns} rowActions={tpoAppActions}
    />
  );
}
