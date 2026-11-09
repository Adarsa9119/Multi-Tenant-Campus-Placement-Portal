import ResourcePage from '../../components/common/ResourcePage.jsx';
import { companyApi } from '../../api/companyApi.js';

export default function RecruiterApprovals() {
  return (
    <ResourcePage
      title="Recruiter Authorizations" subtitle="Recruiters currently authorized for your college"
      load={(p) => companyApi.recruiterAuths(p)}
      columns={[{ key: 'recruiterId.userId.name', label: 'Recruiter' }, { key: 'recruiterId.userId.email', label: 'Email' }, { key: 'companyId.name', label: 'Company' }, { key: 'authorizedAt', label: 'Authorized On', type: 'date' }, { key: 'status', label: 'Status', badge: true }]}
      rowActions={[
        { label: 'Revoke', variant: 'danger', show: (r) => r.status === 'ACTIVE', confirm: 'Revoke this recruiter\'s authorization for your college?', run: (r) => companyApi.revokeRecruiter(r._id), success: 'Authorization revoked' },
      ]}
    />
  );
}
