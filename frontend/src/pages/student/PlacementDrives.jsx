import { Link } from 'react-router-dom';
import ResourcePage from '../../components/common/ResourcePage.jsx';
import { studentApi } from '../../api/studentApi.js';
import { criteriaChips } from '../../utils/eligibility.js';

export default function PlacementDrives() {
  return (
    <ResourcePage
      title="Placement Drives" subtitle="Showing only drives you are eligible for based on your profile, academics and criteria."
      load={() => studentApi.drives()}
      columns={[{ key: 'company', label: 'Company' }, { key: 'title', label: 'Role' }, { key: 'package', label: 'Package (CTC)', type: 'money' }, { key: 'criteria', label: 'Eligibility Criteria', render: (r) => criteriaChips(r.criteria).map((c) => <span key={c} className="chip">{c}</span>) }, { key: 'deadline', label: 'Deadline', type: 'date' },
        { key: 'x', label: 'Action', render: (r) => <Link className="btn btn-sm" to={`/student/drives/${r._id}`}>View Details</Link> }]}
      emptyText="No eligible drives are open right now."
    />
  );
}
