import { Link, NavLink, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { ROLE_HOME } from '../constants/roles.js';

export default function PublicLayout({ dark = false }) {
  const { user } = useAuth();
  return (
    <div>
      <header className={`pub-nav ${dark ? 'dark' : ''}`}>
        <Link to="/" className="brand" style={{ textDecoration: 'none' }}><div className="logo">🎓</div><div><b>Placement Portal</b><small style={{ display: 'block', opacity: .8 }}>Multi-Tenant Campus Recruitment</small></div></Link>
        <nav className="links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'on' : '')}>Home</NavLink>
          <NavLink to="/register-college" className={({ isActive }) => (isActive ? 'on' : '')}>For Colleges</NavLink>
          <NavLink to="/register-company" className={({ isActive }) => (isActive ? 'on' : '')}>For Companies</NavLink>
          <NavLink to="/support" className={({ isActive }) => (isActive ? 'on' : '')}>Help</NavLink>
        </nav>
        {user ? <Link className="btn" to={ROLE_HOME[user.role]}>Open Dashboard</Link> : <><Link className="btn btn-outline" to="/login">Login</Link><Link className="btn" to="/register-college">Register</Link></>}
      </header>
      <Outlet />
      <footer className="pub-foot">
        <span>© {new Date().getFullYear()} Multi-Tenant Campus Placement & Recruitment Portal. All rights reserved.</span>
        <span><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Service</Link><Link to="/support">Support</Link></span>
      </footer>
    </div>
  );
}
