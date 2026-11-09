import { useEffect, useState } from 'react';
import ResourcePage from '../../components/common/ResourcePage.jsx';
import { offerApi } from '../../api/offerApi.js';
import { applicationApi } from '../../api/applicationApi.js';
import Alert from '../../components/common/Alert.jsx';
import { errorMessage } from '../../api/axiosClient.js';

export default function Offers({ title = 'Offers & Placements', subtitle = 'Offers released to selected candidates' }) {
  const [apps, setApps] = useState([]);
  const [tick, setTick] = useState(0);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    applicationApi.list({ status: 'SELECTED', limit: 100 })
      .then((r) => { setApps(r.data); setLoadError(''); })
      .catch((e) => setLoadError(errorMessage(e)));
  }, [tick]);
  return (
    <ResourcePage
      title={title} subtitle={subtitle} before={loadError && <Alert>Unable to load selected candidates: {loadError}</Alert>} refreshKey={tick} load={(p) => offerApi.list(p)} filters={[{ name: 'status', label: 'All statuses', options: ['OFFERED', 'ACCEPTED', 'DECLINED'] }]}
      columns={[{ key: 'candidate', label: 'Candidate' }, { key: 'company', label: 'Company' }, { key: 'role', label: 'Role' }, { key: 'package', label: 'Package', type: 'money' }, { key: 'joiningDate', label: 'Joining', type: 'date' }, { key: 'status', label: 'Status', badge: true }, { key: 'createdAt', label: 'Released', type: 'date' }]}
      headerActions={[{ label: '+ Create Offer', title: 'Create offer', success: 'Offer created and candidate notified', submit: async (v) => { await offerApi.create(v); setTick((t) => t + 1); },
        fields: [{ name: 'applicationId', label: 'Selected candidate', type: 'select', required: true, full: true, options: apps.map((a) => ({ value: a._id, label: `${a.name} – ${a.drive}` })) },
          { name: 'role', label: 'Role (defaults to drive role)' }, { name: 'package', label: 'Package (LPA, defaults to drive)', type: 'number', step: '0.1' }, { name: 'joiningDate', label: 'Joining date', type: 'date' }] }]}
    />
  );
}
