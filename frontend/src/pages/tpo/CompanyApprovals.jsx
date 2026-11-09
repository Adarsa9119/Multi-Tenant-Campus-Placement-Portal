import ResourcePage from '../../components/common/ResourcePage.jsx';
import { companyApi } from '../../api/companyApi.js';

export default function CompanyApprovals() {
  const decide = (a) => (r, t) => companyApi.decide(r.companyId._id, a, t);
  return (
    <ResourcePage
      title="College Approvals" subtitle="Companies requesting permission to recruit at your college"
      load={(p) => companyApi.approvals(p)} filters={[{ name: 'status', label: 'All statuses', options: ['REQUESTED', 'APPROVED', 'REJECTED', 'REVOKED'], default: 'REQUESTED' }]}
      columns={[{ key: 'companyId.name', label: 'Company' }, { key: 'companyId.industry', label: 'Industry' }, { key: 'companyId.verificationStatus', label: 'Platform Verification', badge: true }, { key: 'createdAt', label: 'Requested', type: 'date' }, { key: 'status', label: 'Status', badge: true }, { key: 'notes', label: 'Notes' }]}
      rowActions={[
        { label: 'Approve', variant: 'success', show: (r) => r.status !== 'APPROVED', ask: 'Notes (optional)', run: decide('approve'), success: 'Approved' },
        { label: 'Reject', variant: 'danger', show: (r) => r.status === 'REQUESTED', ask: 'Reason', run: decide('reject'), success: 'Rejected' },
        { label: 'Revoke', variant: 'danger', show: (r) => r.status === 'APPROVED', ask: 'Reason', run: decide('revoke'), success: 'Revoked' },
      ]}
    />
  );
}
