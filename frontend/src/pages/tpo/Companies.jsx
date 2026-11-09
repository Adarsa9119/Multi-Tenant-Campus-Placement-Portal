import ResourcePage from '../../components/common/ResourcePage.jsx';
import { companyApi } from '../../api/companyApi.js';

export default function Companies() {
  return (
    <ResourcePage
      title="Verified Companies" subtitle="Platform-verified companies. You decide which of them may recruit at your college."
      load={(p) => companyApi.list(p)} search
      columns={[{ key: 'companyCode', label: 'Code' }, { key: 'name', label: 'Company' }, { key: 'industry', label: 'Industry' }, { key: 'verificationStatus', label: 'Platform', badge: true }, { key: 'status', label: 'Operational', badge: true }, { key: 'recruiterCount', label: 'Recruiters' }, { key: 'collegeApproval', label: 'College Approval', badge: true }]}
      rowActions={[
        { label: 'Approve for college', variant: 'success', show: (r) => r.collegeApproval !== 'APPROVED' && r.status === 'ACTIVE', ask: 'Notes (optional)', run: (r, t) => companyApi.decide(r._id, 'approve', t), success: 'Company approved for your college' },
        { label: 'Revoke', variant: 'danger', show: (r) => r.collegeApproval === 'APPROVED', ask: 'Reason', run: (r, t) => companyApi.decide(r._id, 'revoke', t), success: 'Authorization revoked; its drives are paused' },
      ]}
    />
  );
}
