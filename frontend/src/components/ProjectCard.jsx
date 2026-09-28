import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProjectCard({ project, matchScore, applied, onViewDetails, onApply }) {
  const skills = project.skills || project.required_skills || [];
  const dept = project.dept || project.department || '';

  return (
    <article className="project-card">
      <div className="project-top">
        <div>
          <h3>{project.title}</h3>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
            {dept} · Lead: {project.owner}
          </div>
        </div>
        <span className="status-tag">{project.status}</span>
      </div>

      <p>{project.description || project.desc}</p>

      <div className="tag-row">
        {skills.map((skill, i) => (
          <span key={i} className="tag">{skill}</span>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Match Score</span>
        <strong style={{ color: 'var(--blue)', fontSize: '14px' }}>{matchScore}%</strong>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${matchScore}%` }} />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button className="secondary" onClick={() => onViewDetails(project)} style={{ fontSize: '12px', padding: '9px 12px' }}>
          View details
        </button>
        <button
          onClick={() => onApply(project.id)}
          disabled={applied}
          style={{
            fontSize: '12px',
            padding: '9px 12px',
            ...(applied ? { background: '#dff5e9', color: '#16764e' } : {})
          }}
        >
          {applied ? "Interest sent" : "I'm interested"}
        </button>
      </div>
    </article>
  );
}
