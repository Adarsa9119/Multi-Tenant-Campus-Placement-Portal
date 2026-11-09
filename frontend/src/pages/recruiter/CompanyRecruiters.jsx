import ResourcePage from '../../components/common/ResourcePage.jsx';
import { recruiterApi } from '../../api/recruiterApi.js';

export default function CompanyRecruiters() {
  return (
    <ResourcePage
      title="Recruiters & Users" subtitle="Add recruiters of your company. Each recruiter must be authorized by the platform and by each college before accessing any candidate."
      load={(p) => recruiterApi.team(p)}
      columns={[{ key: 'userId.name', label: 'Name' }, { key: 'userId.email', label: 'Email' }, { key: 'isCompanyAdmin', label: 'Role', render: (r) => (r.isCompanyAdmin ? 'Company Admin' : 'Recruiter') }, { key: 'userId.status', label: 'Account', badge: true }, { key: 'authorizationStatus', label: 'Authorization', badge: true }, { key: 'status', label: 'Status', badge: true }, { key: 'createdAt', label: 'Joined', type: 'date' }]}
      headerActions={[{ label: '+ Add Recruiter', title: 'Add recruiter', success: 'Invitation sent. The recruiter must be authorized by the Super Admin.', submit: (v) => recruiterApi.addRecruiter(v),
        fields: [{ name: 'name', label: 'Name', required: true }, { name: 'email', label: 'Work email', type: 'email', required: true }, { name: 'phone', label: 'Phone (10 digits)' }, { name: 'designation', label: 'Designation' }] }]}
    />
  );
}
