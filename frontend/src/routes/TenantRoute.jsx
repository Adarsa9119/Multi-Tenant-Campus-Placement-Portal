import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

// Tenant-bound roles (TPO, Student) must carry a tenant in their session.
export default function TenantRoute() {
  const { user } = useAuth();
  if (!user?.tenantId) return <Navigate to="/login" replace />;
  return <Outlet />;
}
