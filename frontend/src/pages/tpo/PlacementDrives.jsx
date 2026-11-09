import { Link } from 'react-router-dom';
import ResourcePage from '../../components/common/ResourcePage.jsx';
import { driveApi } from '../../api/driveApi.js';
import { criteriaChips } from '../../utils/eligibility.js';

export default function PlacementDrives() {
  const act = (a) => (r) => driveApi.action(r._id, a);
  return (
    <ResourcePage
      title="Placement Drives" subtitle="Draft → Approved → Published → Closed. Suspended drives can be re-published."
      load={(p) => driveApi.list(p)} filters={[{ name: 'status', label: 'All statuses', options: ['DRAFT', 'APPROVED', 'PUBLISHED', 'CLOSED', 'SUSPENDED'] }]}
      columns={[{ key: 'companyId.name', label: 'Company' }, { key: 'title', label: 'Role' }, { key: 'package', label: 'Package', type: 'money' }, { key: 'criteria', label: 'Eligibility', render: (r) => criteriaChips(r.criteria).map((c) => <span key={c} className="chip chip-gray">{c}</span>) },
        { key: 'deadline', label: 'Deadline', type: 'datetime' }, { key: 'applicationCount', label: 'Applications' }, { key: 'status', label: 'Status', badge: true }]}
      rowActions={[
        { label: 'Approve', variant: 'light', show: (r) => r.status === 'DRAFT', run: act('approve'), success: 'Drive approved' },
        { label: 'Publish', variant: 'success', show: (r) => ['APPROVED', 'SUSPENDED'].includes(r.status), confirm: 'Publish this drive and notify eligible students?', run: act('publish'), success: 'Drive published' },
        { label: 'Close', variant: 'light', show: (r) => r.status === 'PUBLISHED', confirm: 'Close applications for this drive?', run: act('close'), success: 'Drive closed' },
        { label: 'Suspend', variant: 'danger', show: (r) => ['APPROVED', 'PUBLISHED'].includes(r.status), confirm: 'Suspend this drive?', run: act('suspend'), success: 'Drive suspended' },
        { label: 'Eligibility', variant: 'light', run: async (r) => { window.location.assign(`/tpo/eligibility?driveId=${r._id}`); } },
      ]}
      extraHeader={<Link className="btn" to="/tpo/drives/create">+ Create Drive</Link>}
    />
  );
}
