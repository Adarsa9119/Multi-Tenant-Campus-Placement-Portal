import { Link } from 'react-router-dom';
import ResourcePage from '../../components/common/ResourcePage.jsx';
import { studentApi } from '../../api/studentApi.js';

export default function Eligibility() {
  return (
    <ResourcePage
      title="Eligibility" subtitle="Your eligibility for every open drive of your college, with the exact reason when you do not qualify."
      load={() => studentApi.eligibility()}
      columns={[{ key: 'company', label: 'Company' }, { key: 'title', label: 'Role' }, { key: 'criteria', label: 'Criteria', render: (r) => Object.values(r.criteria).join(' · ') }, { key: 'deadline', label: 'Deadline', type: 'date' },
        { key: 'eligible', label: 'Result', render: (r) => <span className={`badge ${r.eligible ? 'badge-green' : 'badge-red'}`}>{r.eligible ? 'Eligible' : 'Not eligible'}</span> }, { key: 'failures', label: 'Reason', render: (r) => r.failures.join('; ') || '—' },
        { key: 'x', label: '', render: (r) => <Link className="btn btn-light btn-sm" to={`/student/drives/${r._id}`}>Open</Link> }]}
    />
  );
}
