import { Link } from 'react-router-dom';
import ResourcePage from '../../components/common/ResourcePage.jsx';
import { applicationApi } from '../../api/applicationApi.js';

export default function Applications() {
  return (
    <ResourcePage
      title="My Applications" subtitle="Track every application through test, interview, selection and offer"
      load={(p) => applicationApi.list(p)} filters={[{ name: 'status', label: 'All statuses', options: ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'TEST', 'INTERVIEW', 'SELECTED', 'OFFER', 'PLACED', 'REJECTED'] }]}
      columns={[{ key: 'company', label: 'Company' }, { key: 'drive', label: 'Role' }, { key: 'package', label: 'Package', type: 'money' }, { key: 'appliedAt', label: 'Applied', type: 'date' }, { key: 'status', label: 'Status', badge: true }, { key: 'x', label: '', render: (r) => <Link className="btn btn-light btn-sm" to={`/student/applications/${r._id}`}>Details</Link> }]}
    />
  );
}
