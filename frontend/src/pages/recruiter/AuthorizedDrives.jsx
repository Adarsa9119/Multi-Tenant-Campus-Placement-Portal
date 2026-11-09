import { Link } from 'react-router-dom';
import ResourcePage from '../../components/common/ResourcePage.jsx';
import { recruiterApi } from '../../api/recruiterApi.js';
import { criteriaChips } from '../../utils/eligibility.js';

export default function AuthorizedDrives() {
  return (
    <ResourcePage
      title="Authorized Drives" subtitle="Only drives you are authorized for (assigned recruiter + authorized college)"
      load={(p) => recruiterApi.drives(p)} filters={[{ name: 'status', label: 'All statuses', options: ['PUBLISHED', 'CLOSED'] }]}
      columns={[{ key: 'title', label: 'Job Title' }, { key: 'package', label: 'Package (LPA)' }, { key: 'criteria', label: 'Eligibility', render: (r) => criteriaChips(r.criteria).map((c) => <span key={c} className="chip chip-gray">{c}</span>) }, { key: 'tenantId.collegeName', label: 'College' }, { key: 'deadline', label: 'Application Deadline', type: 'date' }, { key: 'status', label: 'Status', badge: true },
        { key: 'x', label: 'Candidates', render: (r) => <Link className="btn btn-light btn-sm" to={`/recruiter/applications?driveId=${r._id}`}>Candidates</Link> }]}
    />
  );
}
