import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const PATH = { SUPER_ADMIN: '/admin/dashboard', TPO: '/tpo/notifications', RECRUITER: '/recruiter/notifications', STUDENT: '/student/notifications' };
export default function NotificationBell({ count }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <button className="bell" onClick={() => navigate(PATH[user.role])} aria-label="Notifications">
      🔔{count > 0 && <span className="dot">{count}</span>}
    </button>
  );
}
