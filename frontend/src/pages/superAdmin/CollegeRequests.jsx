import { Link } from 'react-router-dom';
import ResourcePage from '../../components/common/ResourcePage.jsx';
import { adminApi } from '../../api/adminApi.js';

export default function CollegeRequests() {
  const decide = (a) => (r, t) => adminApi.decideRegistration(r._id, a, t);
  const open = (r) => ['PENDING', 'UNDER_REVIEW'].includes(r.status);
  return (
    <ResourcePage
      title="College Registration Requests" subtitle="Review, approve or reject college onboarding requests. Approval creates a unique tenant and invites the TPO."
      load={(p) => adminApi.registrations(p)} search
      filters={[{ name: 'status', label: 'All statuses', options: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'], default: '' }]}
      columns={[{ key: 'collegeName', label: 'College Name' }, { key: 'city', label: 'City' }, { key: 'state', label: 'State' }, { key: 'proposedTpo.name', label: 'Proposed TPO' }, { key: 'createdAt', label: 'Submitted On', type: 'date' }, { key: 'status', label: 'Status', badge: true },
        { key: 'x', label: 'Details', render: (r) => <Link className="btn btn-light btn-sm" to={`/admin/college-requests/${r._id}`}>View</Link> }]}
      rowActions={[
        { label: 'Review', variant: 'light', show: (r) => r.status === 'PENDING', run: decide('review'), success: 'Moved to review' },
        { label: 'Approve', variant: 'success', show: open, ask: 'Notes (optional)', run: decide('approve'), success: 'College approved and tenant created' },
        { label: 'Reject', variant: 'danger', show: open, ask: 'Reason for rejection', run: decide('reject'), success: 'College rejected' },
      ]}
    />
  );
}
