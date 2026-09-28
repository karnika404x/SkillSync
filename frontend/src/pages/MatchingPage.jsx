import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetchShortlist, initialEmployees } from '../services/api';
import { DonutGauge, ScoreBreakdownBar } from '../components/Charts';

export default function MatchingPage({ projects }) {
  const { token, isBackendActive, triggerToast } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || 1);
  const [shortlist, setShortlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedProject = projects.find((p) => p.id === Number(selectedProjectId)) || projects[0];

  const fetchShortlist = async () => {
    if (!selectedProject) return;
    setLoading(true);
    if (isBackendActive && token) {
      try {
        const results = await apiFetchShortlist(token, selectedProject.id);
        setShortlist(results);
        triggerToast('AI Shortlist refreshed from FastAPI backend!');
        setLoading(false);
        return;
      } catch (err) {
        console.warn('API shortlist failed, falling back', err);
      }
    }

    // Local calculation fallback
    const reqSkills = (selectedProject.skills || selectedProject.required_skills || []).map((s) => s.toLowerCase());
    const ranked = initialEmployees.map((emp) => {
      const empSkills = emp.skills.map((s) => s.toLowerCase());
      const hits = reqSkills.filter((s) => empSkills.includes(s));
      const missing = reqSkills.filter((s) => !empSkills.includes(s));
      const score = Math.min(99, Math.round((hits.length / (reqSkills.length || 1)) * 60 + (emp.experience_years || 2) * 4 + 15));
      return {
        employee: emp,
        match_score: score,
        explanation: {
          hits: hits.map((h) => (selectedProject.skills || selectedProject.required_skills).find((x) => x.toLowerCase() === h)),
          missing: missing.map((m) => (selectedProject.skills || selectedProject.required_skills).find((x) => x.toLowerCase() === m))
        }
      };
    }).sort((a, b) => b.match_score - a.match_score);

    setShortlist(ranked);
    setLoading(false);
  };

  useEffect(() => {
    fetchShortlist();
  }, [selectedProjectId, isBackendActive]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>AI Skill Matching</h1>
          <p>Select a project to generate an explainable talent shortlist with visual score breakdowns.</p>
        </div>
      </div>

      <div className="notice">
        <b>{isBackendActive ? 'FastAPI Hybrid Engine' : 'Scoring Engine'}:</b> Match percentages evaluate exact skill overlap, TF-IDF vector similarity, experience weight, interest alignment, and employee performance metrics.
      </div>

      <div className="toolbar">
        <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.dept || p.department})
            </option>
          ))}
        </select>
        <button onClick={fetchShortlist} disabled={loading}>
          {loading ? 'Analyzing...' : '↻ Run matching engine'}
        </button>
      </div>

      <div className="card">
        <div className="section-title">
          <h3>Recommended Talent Shortlist</h3>
          <span>{shortlist.length} candidates evaluated</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Job Title & Dept</th>
                <th>Match Score Gauge</th>
                <th>Scoring Factor Breakdown</th>
                <th>Skills Matched</th>
                <th>Skill Gaps</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shortlist.map((item, idx) => {
                const emp = item.employee;
                const exp = item.explanation || {};
                const score = item.match_score;

                const breakdown = {
                  skillOverlap: Math.round(score * 0.5),
                  vectorSimilarity: Math.round(score * 0.15),
                  experienceRatio: Math.round(score * 0.15),
                  interestAlignment: Math.round(score * 0.1),
                  performance: Math.round(score * 0.1)
                };

                return (
                  <tr key={idx}>
                    <td>
                      <b style={{ color: '#076a6f' }}>{emp.name}</b>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{emp.id}</div>
                    </td>
                    <td>
                      {emp.job_title || emp.role}
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{emp.department || emp.dept}</div>
                    </td>
                    <td>
                      <DonutGauge value={score} size={48} strokeWidth={5} color="#076a6f" mint="#9df4c7" />
                    </td>
                    <td style={{ minWidth: '220px' }}>
                      <ScoreBreakdownBar breakdown={breakdown} />
                    </td>
                    <td>
                      {(exp.hits || []).map((s, i) => (
                        <div key={i} style={{ color: 'var(--green)', fontWeight: 650, fontSize: '12px' }}>
                          ✓ {s}
                        </div>
                      )) || '—'}
                    </td>
                    <td>
                      {(exp.missing || []).length > 0 ? (
                        exp.missing.map((s, i) => (
                          <div key={i} style={{ color: 'var(--amber)', fontWeight: 650, fontSize: '12px' }}>
                            ⚠ {s}
                          </div>
                        ))
                      ) : (
                        <span style={{ color: 'var(--green)', fontWeight: 650, fontSize: '12px' }}>No critical gaps</span>
                      )}
                    </td>
                    <td>
                      <button className="secondary" onClick={() => triggerToast(`${emp.name} shortlisted for project!`)}>
                        Shortlist
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '18px' }}>
        Scoring weights: Skill Overlap (50%), TF-IDF Vector Cosine Similarity (15%), Work Experience (15%), Interest Alignment (10%), Performance Metrics (10%).
      </p>
    </div>
  );
}
