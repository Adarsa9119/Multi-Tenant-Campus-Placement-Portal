import { useEffect, useState } from 'react';
import ResourcePage from '../../components/common/ResourcePage.jsx';
import Alert from '../../components/common/Alert.jsx';
import { adminApi } from '../../api/adminApi.js';
import { errorMessage } from '../../api/axiosClient.js';

export default function TpoManagement() {
  const [tenants, setTenants] = useState([]);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    adminApi.tenants({ status: 'ACTIVE', limit: 100 })
      .then((r) => { setTenants(r.data); setLoadError(''); })
      .catch((e) => setLoadError(errorMessage(e)));
  }, []);
  return (
    <ResourcePage
      title="TPO Management" subtitle="Invite or replace the TPO of a college. Replacing a TPO never deletes college data."
      before={loadError && <Alert>Unable to load active colleges: {loadError}</Alert>}
      load={(p) => adminApi.tpos(p)} filters={[{ name: 'status', label: 'All statuses', options: ['INVITED', 'ACTIVE', 'SUSPENDED', 'INACTIVE'] }]}
      columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'tenantId.tenantCode', label: 'Tenant' }, { key: 'tenantId.collegeName', label: 'College' }, { key: 'lastLoginAt', label: 'Last Login', type: 'datetime' }, { key: 'status', label: 'Status', badge: true }]}
      rowActions={[
        { label: 'Suspend', variant: 'danger', show: (r) => r.status === 'ACTIVE', confirm: 'Suspend this TPO?', run: (r) => adminApi.setTpoStatus(r._id, 'SUSPENDED'), success: 'TPO suspended' },
        { label: 'Reactivate', variant: 'success', show: (r) => ['SUSPENDED', 'INACTIVE'].includes(r.status), run: (r) => adminApi.setTpoStatus(r._id, 'ACTIVE'), success: 'TPO reactivated' },
      ]}
      headerActions={[{ label: '+ Invite TPO', title: 'Invite / assign a TPO', success: 'TPO invited by email', submit: (v) => adminApi.inviteTpo(v),
        fields: [{ name: 'tenantId', label: 'College (tenant)', type: 'select', required: true, options: tenants.map((t) => ({ value: t._id, label: `${t.tenantCode} – ${t.collegeName}` })), full: true },
          { name: 'name', label: 'TPO name', required: true }, { name: 'email', label: 'Official email', type: 'email', required: true }, { name: 'phone', label: 'Phone (10 digits)' }] }]}
    />
  );
}
