import Shell from '../components/common/Shell.jsx';
import useTenant from '../hooks/useTenant.js';
import { TPO_NAV } from '../constants/routes.js';

export default function TpoLayout() {
  const t = useTenant();
  return <Shell brand="Campus Placement Portal" subtitle={`College – ${t?.tenantCode || ''}`} nav={TPO_NAV} topTitle={t?.collegeName || 'TPO'} tenantChip={t ? `Tenant: ${t.tenantCode}` : null} footLabel="My College" footValue={t?.tenantCode} footNote={t?.collegeName} />;
}
