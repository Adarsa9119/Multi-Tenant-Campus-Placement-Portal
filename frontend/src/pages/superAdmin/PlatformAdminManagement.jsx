import ResourcePage from '../../components/common/ResourcePage.jsx';
import { adminApi } from '../../api/adminApi.js';

export default function PlatformAdminManagement() {
  return (
    <ResourcePage
      title="Platform Administrators" subtitle="Additional Super Admins can only be invited by an existing Super Admin. There is no public Super Admin signup."
      load={(p) => adminApi.admins(p)}
      columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'lastLoginAt', label: 'Last Login', type: 'datetime' }, { key: 'status', label: 'Status', badge: true }]}
      rowActions={[
        { label: 'Suspend', variant: 'danger', show: (r) => r.status === 'ACTIVE', confirm: 'Suspend this administrator?', run: (r) => adminApi.setAdminStatus(r._id, 'SUSPENDED'), success: 'Administrator suspended' },
        { label: 'Reactivate', variant: 'success', show: (r) => r.status === 'SUSPENDED', run: (r) => adminApi.setAdminStatus(r._id, 'ACTIVE'), success: 'Administrator reactivated' },
      ]}
      headerActions={[{ label: '+ Invite Admin', title: 'Invite platform administrator', success: 'Invitation sent', submit: (v) => adminApi.inviteAdmin(v),
        fields: [{ name: 'name', label: 'Name', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'phone', label: 'Phone' }] }]}
    />
  );
}
