import { useEffect, useState } from 'react';
import ResourcePage from '../../components/common/ResourcePage.jsx';
import Alert from '../../components/common/Alert.jsx';
import { companyApi } from '../../api/companyApi.js';
import { errorMessage } from '../../api/axiosClient.js';

export default function CollegeAuthorizations() {
  const [colleges, setColleges] = useState([]);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    companyApi.directory()
      .then((r) => { setColleges(r.data); setLoadError(''); })
      .catch((e) => setLoadError(errorMessage(e)));
  }, []);
  return (
    <ResourcePage
      title="College Authorizations" subtitle="Each college authorizes your company separately. Request authorization and track its status."
      before={loadError && <Alert>Unable to load colleges: {loadError}</Alert>}
      load={(p) => companyApi.approvals(p)} filters={[{ name: 'status', label: 'All statuses', options: ['REQUESTED', 'APPROVED', 'REJECTED', 'REVOKED'] }]}
      columns={[{ key: 'tenantId.collegeName', label: 'College Name' }, { key: 'tenantId.city', label: 'City' }, { key: 'status', label: 'Status', badge: true }, { key: 'decidedBy.name', label: 'Authorized By' }, { key: 'decidedAt', label: 'Authorized On', type: 'date' }, { key: 'notes', label: 'Notes' }]}
      rowActions={[{ label: 'Request again', variant: 'light', show: (r) => ['REJECTED', 'REVOKED'].includes(r.status), run: (r) => companyApi.requestCollege(r.tenantId._id), success: 'Request sent' }]}
      headerActions={[{ label: 'Request New College', title: 'Request college authorization', success: 'Request sent to the college TPO', submit: (v) => companyApi.requestCollege(v.tenantId),
        fields: [{ name: 'tenantId', label: 'College', type: 'select', required: true, full: true, options: colleges.map((c) => ({ value: c._id, label: `${c.collegeName} – ${c.city || ''}` })) }] }]}
    />
  );
}
