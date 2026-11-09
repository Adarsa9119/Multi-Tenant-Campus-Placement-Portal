import Shell from '../components/common/Shell.jsx';
import useTenant from '../hooks/useTenant.js';
import useAuth from '../hooks/useAuth.js';
import { STUDENT_NAV } from '../constants/routes.js';

export default function StudentLayout() {
  const t = useTenant();
  const { user } = useAuth();
  return <Shell brand="Campus Placement Portal" subtitle="Multi-Tenant Recruitment Platform" nav={STUDENT_NAV} topTitle={`Student Portal · ${t?.collegeName || ''}`} footLabel="My College" footValue={t?.tenantCode} footNote={`${user?.student?.branch || ''} ${user?.student?.graduationYear || ''}`} />;
}
