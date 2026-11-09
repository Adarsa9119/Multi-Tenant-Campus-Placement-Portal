import ResourcePage from '../../components/common/ResourcePage.jsx';
import { adminApi } from '../../api/adminApi.js';

export default function TenantManagement() {
  return (
    <ResourcePage
      title="All Tenants (Colleges)" subtitle="Each college is an isolated tenant. Deactivating a tenant blocks its TPO and students; data is preserved."
      load={(p) => adminApi.tenants(p)} search filters={[{ name: 'status', label: 'All statuses', options: ['ACTIVE', 'INACTIVE'] }]}
      columns={[{ key: 'tenantCode', label: 'Tenant ID' }, { key: 'collegeName', label: 'College Name' }, { key: 'city', label: 'Location', render: (r) => `${r.city || ''}${r.state ? `, ${r.state}` : ''}` }, { key: 'tpo.name', label: 'TPO' }, { key: 'studentCount', label: 'Students' }, { key: 'status', label: 'Status', badge: true }]}
      rowActions={[
        { label: 'Deactivate', variant: 'danger', show: (r) => r.status === 'ACTIVE', confirm: 'Users of this college will no longer be able to sign in.', run: (r) => adminApi.setTenant(r._id, 'deactivate'), success: 'Tenant deactivated' },
        { label: 'Activate', variant: 'success', show: (r) => r.status !== 'ACTIVE', run: (r) => adminApi.setTenant(r._id, 'activate'), success: 'Tenant activated' },
      ]}
    />
  );
}
