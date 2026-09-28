import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentPage }) {
  const { user, isBackendActive } = useAuth();
  
  const pageTitles = {
    dashboard: 'Overview',
    marketplace: 'Project Marketplace',
    matching: 'AI Skill Matching',
    talent: 'Hidden Talent',
    upskilling: 'Skill Gaps',
    admin: 'HR & Projects'
  };

  const getInitials = (name) => {
    if (!name) return 'SJ';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <header className="topbar">
      <div>
        <div className="crumb">
          <img src="/logo.png" alt="SkillSync" style={{ height: '22px', width: '22px', objectFit: 'contain' }} />
          TechByte / <strong>{pageTitles[currentPage] || 'Overview'}</strong>
        </div>
      </div>
      <div className="top-right">
        {isBackendActive ? (
          <span className="status-badge">⚡ FastAPI Backend Active</span>
        ) : (
          <span className="status-badge" style={{ background: '#fff8e6', color: '#b77900', borderColor: '#ffe599' }}>
            Prototype Mode
          </span>
        )}
        <span className="role-tag">{user?.role || 'Employee'}</span>
        <span className="avatar">{getInitials(user?.name)}</span>
      </div>
    </header>
  );
}
