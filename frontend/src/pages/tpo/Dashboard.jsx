import { useState } from 'react';
import DashboardView from '../../components/common/DashboardView.jsx';
import { studentApi } from '../../api/studentApi.js';
import useTenant from '../../hooks/useTenant.js';

export default function Dashboard() {
  const t = useTenant();
  const [year] = useState(`${new Date().getFullYear() - 1} - ${new Date().getFullYear()}`);
  return <DashboardView load={studentApi.tpoDashboard} title="TPO Dashboard" subtitle={`Overview of placement activities for your college (${t?.tenantCode || ''})`} header={<span className="badge badge-blue">Academic Year {year}</span>} reportsTo="/tpo/reports" />;
}
