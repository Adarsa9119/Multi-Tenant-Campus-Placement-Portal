import ResourcePage from '../../components/common/ResourcePage.jsx';
import { adminApi } from '../../api/adminApi.js';
import { companyApi } from '../../api/companyApi.js';

export default function Recruiters() {
  return (
    <ResourcePage
      title="Manage Recruiters" subtitle="Platform-authorized recruiters of companies approved by your college. Authorize each recruiter for your campus."
      load={(p) => adminApi.recruiters(p)}
      columns={[{ key: 'userId.name', label: 'Recruiter' }, { key: 'designation', label: 'Designation' }, { key: 'companyId.name', label: 'Company' }, { key: 'authorizationStatus', label: 'Platform', badge: true }, { key: 'collegeAuthorization', label: 'Your College', badge: true }]}
      rowActions={[
        { label: 'Authorize for my college', variant: 'success', show: (r) => r.collegeAuthorization !== 'ACTIVE', run: (r) => companyApi.authorizeRecruiter(r._id), success: 'Recruiter authorized for your college' },
        { label: 'Revoke', variant: 'danger', show: (r) => r.collegeAuthorization === 'ACTIVE', confirm: 'Remove this recruiter\'s access to your college?', run: (r) => companyApi.revokeRecruiter(r.collegeAuthorizationId), success: 'Authorization revoked' },
      ]}
    />
  );
}
