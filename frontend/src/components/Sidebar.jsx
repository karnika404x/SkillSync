import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentPage, onNavigate }) {
  const { user, logout } = useAuth();
  const userRole = user?.role || 'Employee';

  const getInitials = (name) => {
    if (!name) return 'SJ';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const allNavItems = [
    { id: 'dashboard', label: 'Overview', icon: '▦', roles: ['Employee', 'Project Manager', 'HR/Admin'] },
    { id: 'marketplace', label: 'Project Marketplace', icon: '⌕', roles: ['Employee', 'Project Manager', 'HR/Admin'] },
    { id: 'matching', label: 'AI Skill Matching', icon: '✧', roles: ['Employee', 'Project Manager', 'HR/Admin'] },
    { id: 'talent', label: 'Hidden Talent', icon: '◉', roles: ['HR/Admin'] },
    { id: 'upskilling', label: 'Skill Gaps', icon: '↗', roles: ['Employee', 'Project Manager', 'HR/Admin'] },
    { id: 'admin', label: 'HR & Projects', icon: '⚙', roles: ['Project Manager', 'HR/Admin'] }
  ];

  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="sidebar">
      <div className="brand" style={{ padding: '0 8px 24px' }}>
        <img src="/logo.png" alt="SkillSync Logo" />
        Skill<span>Sync</span>
      </div>
      <div className="nav-label">{userRole.toUpperCase()} PANEL</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {visibleNavItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="ico">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
      <div className="side-bottom">
        <div className="user-mini">
          <div className="avatar">{getInitials(user?.name)}</div>
          <div>
            <strong style={{ fontSize: '13px', display: 'block' }}>{user?.name || 'Sarah Johnson'}</strong>
            <small style={{ color: 'var(--muted)' }}>{userRole}</small>
          </div>
        </div>
        <button className="ghost" onClick={logout} style={{ width: '100%' }}>
          ↪ Log out
        </button>
      </div>
    </aside>
  );
}
