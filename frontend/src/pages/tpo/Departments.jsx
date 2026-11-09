import ResourcePage from '../../components/common/ResourcePage.jsx';
import { studentApi } from '../../api/studentApi.js';

export default function Departments() {
  return (
    <ResourcePage
      title="Departments" subtitle="Departments of your college"
      load={(p) => studentApi.departments(p)}
      columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'status', label: 'Status', badge: true }]}
      headerActions={[{ label: '+ Add Department', title: 'Add department', success: 'Department added', submit: (v) => studentApi.createDepartment(v), fields: [{ name: 'name', label: 'Name', required: true }, { name: 'code', label: 'Code', required: true }] }]}
    />
  );
}
