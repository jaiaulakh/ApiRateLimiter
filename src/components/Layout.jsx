import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const NAV_ITEMS = [
  { to: '/', icon: '📊', label: 'Dashboard' },
  { to: '/api-keys', icon: '🔑', label: 'API Keys' },
  { to: '/analytics', icon: '📈', label: 'Analytics' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="layout__overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar glass ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <span className="sidebar__logo-icon">⚡</span>
            <span className="sidebar__logo-text">RateLimiter</span>
          </div>
          <button
            className="sidebar__close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              <span className="sidebar__link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `sidebar__profile ${isActive ? 'sidebar__profile--active' : ''}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <div className="avatar avatar--sm">{initials}</div>
            <div className="sidebar__profile-info">
              <span className="sidebar__profile-name">{user?.name || 'User'}</span>
              <span className="sidebar__profile-plan">{user?.plan || 'Free'} Plan</span>
            </div>
          </NavLink>
          <button className="sidebar__logout" onClick={handleLogout} title="Logout">
            🚪
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="layout__main">
        {/* Topbar */}
        <header className="topbar glass">
          <button
            className="topbar__hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="topbar__spacer" />
          <button className="topbar__btn" onClick={handleLogout}>
            Logout
          </button>
        </header>

        {/* Page content */}
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
