import useAuth from './useAuth.js';
import { ROLE_PERMISSIONS } from '../constants/roles.js';

// UI convenience only. The backend enforces every permission independently.
export default function usePermissions() {
  const { user } = useAuth();
  const list = ROLE_PERMISSIONS[user?.role] || [];
  return { can: (p) => list.includes(p), role: user?.role, isCompanyAdmin: !!user?.recruiter?.isCompanyAdmin };
}
