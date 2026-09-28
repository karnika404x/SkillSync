import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { apiFetchProjects, initialProjects, apiApplyProject } from './services/api';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import MatchingPage from './pages/MatchingPage';
import HiddenTalentPage from './pages/HiddenTalentPage';
import UpskillingPage from './pages/UpskillingPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const { user, token, isBackendActive, toastMessage, triggerToast } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [projects, setProjects] = useState(initialProjects);
  const [applications, setApplications] = useState({});

  const userRole = user?.role || 'Employee';

  const rolePermissions = {
    Employee: ['dashboard', 'marketplace', 'matching', 'upskilling'],
    'Project Manager': ['dashboard', 'marketplace', 'matching', 'upskilling', 'admin'],
    'HR/Admin': ['dashboard', 'marketplace', 'matching', 'talent', 'upskilling', 'admin']
  };

  const allowedPages = rolePermissions[userRole] || rolePermissions['Employee'];

  // Guard against navigating to prohibited page
  useEffect(() => {
    if (user && !allowedPages.includes(currentPage)) {
      setCurrentPage('dashboard');
    }
  }, [user, currentPage, userRole]);

  const loadProjects = async () => {
    if (isBackendActive && token) {
      try {
        const data = await apiFetchProjects(token);
        setProjects(data.map((p) => ({ ...p, skills: p.required_skills, desc: p.description })));
        return;
      } catch (err) {
        console.warn('API fetch projects failed, using fallback', err);
      }
    }
  };

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user, isBackendActive, token]);

  const handleApply = async (projectId) => {
    if (!user) return;
    if (isBackendActive && token) {
      try {
        await apiApplyProject(token, projectId);
        triggerToast('Interest submitted to FastAPI Backend!');
      } catch (err) {
        triggerToast('Submitted interest.');
      }
    } else {
      triggerToast('Interest submitted.');
    }

    setApplications((prev) => {
      const existing = prev[projectId] || [];
      if (!existing.includes(user.id)) {
        return { ...prev, [projectId]: [...existing, user.id] };
      }
      return prev;
    });
  };

  const handleViewDetails = (project) => {
    alert(
      `${project.title}\n\nDepartment: ${project.dept || project.department}\nLead: ${project.owner}\nDescription: ${project.description || project.desc}\nRequired Skills: ${(project.skills || project.required_skills || []).join(', ')}`
    );
  };

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="main-content">
        <Navbar currentPage={currentPage} />
        <main className="content-body">
          {currentPage === 'dashboard' && (
            <DashboardPage
              projects={projects}
              applications={applications}
              onNavigate={setCurrentPage}
              onViewDetails={handleViewDetails}
              onApply={handleApply}
            />
          )}

          {currentPage === 'marketplace' && (
            <MarketplacePage
              projects={projects}
              applications={applications}
              onViewDetails={handleViewDetails}
              onApply={handleApply}
            />
          )}

          {currentPage === 'matching' && (
            <MatchingPage projects={projects} />
          )}

          {currentPage === 'talent' && allowedPages.includes('talent') && (
            <HiddenTalentPage projects={projects} />
          )}

          {currentPage === 'upskilling' && (
            <UpskillingPage projects={projects} />
          )}

          {currentPage === 'admin' && allowedPages.includes('admin') && (
            <AdminPage
              projects={projects}
              setProjects={setProjects}
              onRefreshProjects={loadProjects}
            />
          )}
        </main>
      </div>

      {toastMessage && <div className="toast">{toastMessage}</div>}
    </div>
  );
}
