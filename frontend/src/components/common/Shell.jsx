import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import NotificationBell from '../notifications/NotificationBell.jsx';
import Alert from './Alert.jsx';
import useAuth from '../../hooks/useAuth.js';
import useNotifications from '../../hooks/useNotifications.js';
import { ROLE_LABELS } from '../../constants/roles.js';

// Shared dashboard frame used by the four role layouts (sidebar + top bar).
export default function Shell({ brand, subtitle, nav, topTitle, tenantChip, dark = false, footLabel, footValue, footNote }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { count, error: notificationError } = useNotifications();
  const initials = (user?.name || '?').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
  const items = nav.map((g) => ({ ...g, items: g.items.filter((i) => !i.companyAdminOnly || user?.recruiter?.isCompanyAdmin) }));
  return (
    <div className={`shell ${collapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="brand"><div className="logo">🎓</div><div><b>{brand}</b><small>{subtitle}</small></div></div>
        <nav className="nav">
          {items.map((g, i) => (
            <div key={i}>
              {g.heading && <h4>{g.heading}</h4>}
              {g.items.map((it) => (
                <NavLink key={it.to} to={it.to} end={it.to.endsWith('/dashboard')} className={({ isActive }) => (isActive ? 'active' : '')}>
                  <Icon name={it.icon} /> <span>{it.label}</span>
                  {it.badgeKey === 'notifications' && count > 0 && <span className="count">{count}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="side-foot">
          <small>{footLabel || 'Current Role'}</small><b>{footValue || ROLE_LABELS[user?.role]}</b><small>{footNote}</small>
          <button className="logout" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </div>
      </aside>
      <div className="main">
        <header className={`topbar ${dark ? 'dark' : ''}`}>
          <button className="burger" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle menu">☰</button>
          <div className="title">{topTitle}{tenantChip && <span className="tenant-chip">{tenantChip}</span>}</div>
          <div className="spacer" />
          <NotificationBell count={count} />
          <div className="userbox"><div className="avatar">{initials}</div><div><b>{user?.name}</b><small>{ROLE_LABELS[user?.role]}</small></div></div>
        </header>
        <main className="content">
          {notificationError && <Alert>Unable to load notifications: {notificationError}</Alert>}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
