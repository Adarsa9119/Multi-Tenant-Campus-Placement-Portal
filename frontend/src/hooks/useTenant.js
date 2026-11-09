import useAuth from './useAuth.js';

// Tenant info comes from the authenticated session (server-provided); the UI never lets the user choose it.
export default function useTenant() {
  const { user } = useAuth();
  return user?.tenant || null;
}
