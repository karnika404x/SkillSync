import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetchHiddenTalent, initialEmployees } from '../services/api';
import { DonutGauge } from '../components/Charts';

export default function HiddenTalentPage({ projects }) {
  const { token, isBackendActive } = useAuth();
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    async function loadTalent() {
      if (isBackendActive && token) {
        try {
          const data = await apiFetchHiddenTalent(token);
          setCandidates(data);
          return;
        } catch (err) {
          console.warn('Hidden talent API failed', err);
        }
      }

      // Fallback local discoverable skills calculations
      const list = initialEmployees
        .filter((emp) => emp.hidden_skills?.length || emp.hidden?.length)
        .map((emp) => ({
          employee: emp,
          discoverable_skills: emp.hidden_skills || emp.hidden || [],
          potential_project_matches: projects.slice(0, 2).map((p) => ({
            project_title: p.title,
            match_score: 75
          }))
        }));
      setCandidates(list);
    }

    loadTalent();
  }, [isBackendActive, token]);

  const getInitials = (name) => {
    if (!name) return 'SJ';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Hidden Talent Discovery</h1>
          <p>Explore capabilities employees may have beyond their primary job titles with match score graphs.</p>
        </div>
      </div>

      <div className="notice">
        SkillSync surfaces secondary & hidden capabilities from each employee profile and connects them to relevant project opportunities across departments.
      </div>

      <div className="grid two-col-even">
        {candidates.map((c, idx) => {
          const emp = c.employee;
          const skills = c.discoverable_skills || [];
          const matches = c.potential_project_matches || [];
          return (
            <div key={idx} className="card">
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div className="avatar" style={{ width: '48px', height: '48px' }}>
                  {getInitials(emp.name)}
                </div>
                <div>
                  <strong style={{ fontSize: '15px', display: 'block', color: '#076a6f' }}>{emp.name}</strong>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {emp.job_title || emp.role} · {emp.department || emp.dept}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--muted)', margin: '18px 0 8px' }}>
                Additional / Discoverable Skills
              </div>
              <div className="tag-row">
                {skills.map((s, i) => (
                  <span key={i} className="tag" style={{ background: '#e6f9f3', color: '#076a6f', border: '1px solid #bdf2d9' }}>
                    ✦ {s}
                  </span>
                ))}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--muted)', margin: '18px 0 8px' }}>
                Potential Project Matches & Visual Capability Meter
              </div>
              <div>
                {matches.length > 0 ? (
                  matches.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: i === matches.length - 1 ? 'none' : '1px solid #eaf6f0'
                      }}
                    >
                      <div>
                        <b style={{ fontSize: '13px', color: '#043a3d' }}>{m.project_title}</b>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{m.match_score}% capability match</div>
                      </div>
                      <DonutGauge value={m.match_score} size={42} strokeWidth={4} color="#076a6f" mint="#9df4c7" />
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>No close project matches found</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
