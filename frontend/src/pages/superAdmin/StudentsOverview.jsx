import ResourcePage from '../../components/common/ResourcePage.jsx';
import { adminApi } from '../../api/adminApi.js';

// Aggregate counts only: the Super Admin does not browse individual student records.
export default function StudentsOverview() {
  return (
    <ResourcePage
      title="Students (Overview)" subtitle="Aggregate numbers per college. Individual student records stay inside each college tenant."
      load={(p) => adminApi.studentsOverview(p)}
      columns={[{ key: 'tenantCode', label: 'Tenant' }, { key: 'collegeName', label: 'College' }, { key: 'total', label: 'Students' }, { key: 'verified', label: 'Verified' }, { key: 'placed', label: 'Placed' }, { key: 'status', label: 'Tenant Status', badge: true }]}
    />
  );
}
