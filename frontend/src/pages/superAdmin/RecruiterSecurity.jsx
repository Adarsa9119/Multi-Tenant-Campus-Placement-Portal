import ResourcePage from '../../components/common/ResourcePage.jsx';
import { adminApi } from '../../api/adminApi.js';

export default function RecruiterSecurity() {
  return (
    <ResourcePage
      title="Recruiters & Access" subtitle="A verified company does not make every individual a trusted recruiter: authorize, suspend or reinstate each recruiter."
      load={(p) => adminApi.recruiters(p)}
      filters={[{ name: 'authorizationStatus', label: 'All authorization', options: ['PENDING', 'AUTHORIZED', 'REVOKED'] }, { name: 'status', label: 'All statuses', options: ['ACTIVE', 'SUSPENDED'] }]}
      columns={[{ key: 'userId.name', label: 'Recruiter' }, { key: 'userId.email', label: 'Email' }, { key: 'companyId.name', label: 'Company' }, { key: 'companyId.verificationStatus', label: 'Company Verification', badge: true }, { key: 'isCompanyAdmin', label: 'Company Admin' }, { key: 'authorizationStatus', label: 'Authorization', badge: true }, { key: 'status', label: 'Status', badge: true }]}
      rowActions={[
        { label: 'Authorize', variant: 'success', show: (r) => r.authorizationStatus !== 'AUTHORIZED' && r.status === 'ACTIVE', run: (r) => adminApi.recruiterAction(r._id, 'authorize'), success: 'Recruiter authorized' },
        { label: 'Suspend', variant: 'danger', show: (r) => r.status === 'ACTIVE', ask: 'Reason for suspension', run: (r, t) => adminApi.recruiterAction(r._id, 'suspend', { reason: t }), success: 'Recruiter suspended' },
        { label: 'Reinstate', variant: 'success', show: (r) => r.status === 'SUSPENDED', run: (r) => adminApi.recruiterAction(r._id, 'reinstate'), success: 'Recruiter reinstated' },
      ]}
    />
  );
}
