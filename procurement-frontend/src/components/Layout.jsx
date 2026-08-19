import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getMyPendingApprovals } from '../api/endpoints';

const APPROVER_ROLES = ['MANAGER', 'SENIOR_MANAGER', 'DEPARTMENT_HEAD', 'FINANCE_APPROVER', 'CEO'];

const NAV = [
  {
    label: 'Workflow',
    items: [
      { to: '/', label: 'Dashboard', icon: IconGrid, end: true, showPendingBadge: true },
      { to: '/requisitions', label: 'Requisitions', icon: IconDoc },
      { to: '/purchase-orders', label: 'Purchase orders', icon: IconTruck },
    ],
  },
  {
    label: 'Reference',
    items: [
      { to: '/master-data', label: 'Master data', icon: IconLayers, adminOnly: true },
      { to: '/reports', label: 'Reports', icon: IconChart },
      { to: '/statistics', label: 'Statistics', icon: IconPie },
      { to: '/governance', label: 'Governance', icon: IconShield, adminOnly: true },
      { to: '/audit-trail', label: 'Audit Trail', icon: IconSearch, adminOnly: true },
    ],
  },
];

export default function Layout() {
  const { user, hasRole, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  // Stand-in for a notification system: whatever is sitting at your
  // approval level surfaces here the moment you log in - no email/SMS
  // layer, the pending-approval query itself is the notification.
  useEffect(() => {
    if (hasRole(...APPROVER_ROLES)) {
      getMyPendingApprovals().then((list) => setPendingCount(list.length)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="mark">EPS /</span>
          <span className="name">Procure</span>
        </div>

        {NAV.map((group) => {
          const items = group.items.filter((item) => !item.adminOnly || hasRole('ADMIN'));
          if (items.length === 0) return null;
          return (
            <div key={group.label}>
              <div className="nav-group-label">{group.label}</div>
              <nav className="nav">
                {items.map(({ to, label, icon: Icon, end, showPendingBadge }) => (
                  <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
                    <Icon />
                    {label}
                    {showPendingBadge && pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
                  </NavLink>
                ))}
              </nav>
            </div>
          );
        })}

        <div className="sidebar-foot">
          Employee → Manager → Sr. Mgr → Dept. Head → Finance → CEO → PO → Order
          <br />
          all state changes are ledgered.
        </div>

        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials(user.firstName, user.lastName)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.firstName} {user.lastName}</div>
              <div className="sidebar-user-role">{user.roles?.join(', ') || user.designation}</div>
            </div>
            <button className="sidebar-logout" onClick={handleLogout} title="Sign out">⏻</button>
          </div>
        )}
      </aside>

      <div className="main">
        <Outlet />
      </div>
    </div>
  );
}

function initials(first, last) {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
}

function IconGrid() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1" />
    </svg>
  );
}

function IconDoc() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 2.5h7l3 3v12H5z" />
      <path d="M12 2.5v3h3" />
      <path d="M7.5 10h5M7.5 13h5" strokeLinecap="round" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2.5 5.5h8v8h-8z" />
      <path d="M10.5 8.5h3.3l2.7 2.7v2.3h-6z" />
      <circle cx="6" cy="15" r="1.4" />
      <circle cx="14" cy="15" r="1.4" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 2.5 17.5 7 10 11.5 2.5 7z" />
      <path d="M2.5 11 10 15.5 17.5 11" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3 17V8M9.5 17V3M16 17v-6" />
    </svg>
  );
}

function IconPie() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 2.5v7.5h7.5A7.5 7.5 0 1 1 10 2.5z" />
      <path d="M13.2 2.9A7.5 7.5 0 0 1 17.1 6.8L10 10z" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 2.5 16.5 5v5.2c0 4-2.8 6.6-6.5 7.8-3.7-1.2-6.5-3.8-6.5-7.8V5z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="9" cy="9" r="6" />
      <path d="M13.5 13.5 17.5 17.5" strokeLinecap="round" />
    </svg>
  );
}
