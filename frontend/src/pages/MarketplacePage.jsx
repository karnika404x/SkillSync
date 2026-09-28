import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';

export default function MarketplacePage({ projects, applications, onViewDetails, onApply }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const userSkills = user?.skills || [];

  const getMatchScore = (proj) => {
    const req = (proj.skills || proj.required_skills || []).map((s) => s.toLowerCase());
    const emp = userSkills.map((s) => s.toLowerCase());
    const hits = req.filter((s) => emp.includes(s));
    const skillScore = req.length ? (hits.length / req.length) * 60 : 0;
    return Math.min(99, Math.round(skillScore + 25));
  };

  const departments = [...new Set(projects.map((p) => p.dept || p.department))];

  const filteredProjects = projects.filter((p) => {
    const dept = p.dept || p.department || '';
    const skillsStr = (p.skills || p.required_skills || []).join(' ');
    const matchesDept = !deptFilter || dept === deptFilter;
    const matchesSearch =
      !search ||
      (p.title + ' ' + (p.description || p.desc) + ' ' + skillsStr + ' ' + dept)
        .toLowerCase()
        .includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Project Marketplace</h1>
          <p>Explore internal project opportunities and express interest.</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          placeholder="Search projects or skills…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d, i) => (
            <option key={i} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="project-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              matchScore={getMatchScore(p)}
              applied={(applications[p.id] || []).includes(user?.id)}
              onViewDetails={onViewDetails}
              onApply={onApply}
            />
          ))
        ) : (
          <div className="card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
            No projects match your search query.
          </div>
        )}
      </div>
    </div>
  );
}
