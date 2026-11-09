import Shell from '../components/common/Shell.jsx';
import { ADMIN_NAV } from '../constants/routes.js';

export default function AdminLayout() {
  return <Shell dark brand="Campus Placement Portal" subtitle="Multi-Tenant Recruitment Platform" nav={ADMIN_NAV} topTitle="Platform Administration" footLabel="Current Role" footValue="Super Admin" footNote="Full Platform Access" />;
}
