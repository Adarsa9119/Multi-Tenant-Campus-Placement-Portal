import ResourcePage from '../../components/common/ResourcePage.jsx';
import { adminApi } from '../../api/adminApi.js';

export default function CompanyVerification() {
  const act = (a, body) => (r, t) => adminApi.companyAction(r._id, a, { notes: t, reason: t, ...body });
  const pending = (r) => ['PENDING', 'UNDER_REVIEW'].includes(r.verificationStatus);
  return (
    <ResourcePage
      title="Companies (Verification)" subtitle="Company verification is platform-level trust. Colleges still authorize each company separately."
      load={(p) => adminApi.companies(p)} search
      filters={[{ name: 'verificationStatus', label: 'All verification', options: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'] }, { name: 'status', label: 'All operational', options: ['ACTIVE', 'SUSPENDED'] }]}
      columns={[{ key: 'companyCode', label: 'Code' }, { key: 'name', label: 'Company' }, { key: 'industry', label: 'Industry' }, { key: 'officialEmail', label: 'Official Email' }, { key: 'createdAt', label: 'Submitted', type: 'date' }, { key: 'verificationStatus', label: 'Verification', badge: true }, { key: 'status', label: 'Operational', badge: true }]}
      rowActions={[
        { label: 'Under review', variant: 'light', show: (r) => r.verificationStatus === 'PENDING', run: act('review'), success: 'Marked under review' },
        { label: 'Verify', variant: 'success', show: pending, ask: 'Review notes', run: act('verify'), success: 'Company verified' },
        { label: 'Verify + authorize admin', variant: 'success', show: pending, ask: 'Review notes', run: act('verify', { authorizeAdmin: true }), success: 'Verified; company admin authorized' },
        { label: 'Reject', variant: 'danger', show: pending, ask: 'Reason for rejection', run: act('reject'), success: 'Company rejected' },
        { label: 'Suspend', variant: 'danger', show: (r) => r.status === 'ACTIVE' && r.verificationStatus === 'VERIFIED', ask: 'Reason for suspension', run: act('suspend'), success: 'Company suspended; its drives are paused' },
        { label: 'Reinstate', variant: 'success', show: (r) => r.status === 'SUSPENDED', run: act('reinstate'), success: 'Company reinstated' },
      ]}
    />
  );
}
