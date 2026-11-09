import DashboardView from '../../components/common/DashboardView.jsx';
import { adminApi } from '../../api/adminApi.js';
import { fmtDate } from '../../utils/formatters.js';

export default function Dashboard() {
  return <DashboardView load={adminApi.dashboard} title="Super Admin Dashboard" subtitle="Platform overview and governance for Multi-Tenant Campus Placement & Recruitment Portal" header={<span className="badge badge-blue">{fmtDate(new Date())}</span>} reportsTo="/admin/students" />;
}
