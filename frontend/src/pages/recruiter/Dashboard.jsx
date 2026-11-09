import DashboardView from '../../components/common/DashboardView.jsx';
import { recruiterApi } from '../../api/recruiterApi.js';
import useAuth from '../../hooks/useAuth.js';

export default function Dashboard() {
  const { user } = useAuth();
  return <DashboardView funnel load={recruiterApi.dashboard} title="Recruiter Dashboard" subtitle="Manage your authorized placement drives, review applications and recruit top talent." securityTitle="Security & Access Control"
    header={<span className="badge badge-blue">{user?.company?.name}</span>} />;
}
