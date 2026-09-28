import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetchUpskilling, apiUpdateLearning, initialEmployees } from '../services/api';
import { DonutGauge, BarGraph, DonutPieChart } from '../components/Charts';

export default function UpskillingPage({ projects }) {
  const { token, isBackendActive, triggerToast } = useAuth();
  const [matrix, setMatrix] = useState([]);

  const loadMatrix = async () => {
    if (isBackendActive && token) {
      try {
        const data = await apiFetchUpskilling(token);
        setMatrix(data);
        return;
      } catch (err) {
        console.warn('Upskilling API failed', err);
      }
    }

    // Local matrix calculation
    const list = [];
    initialEmployees.forEach((emp) => {
      projects.forEach((proj) => {
        const req = (proj.skills || proj.required_skills || []).map((s) => s.toLowerCase());
        const empSkills = emp.skills.map((s) => s.toLowerCase());
        const missing = req.filter((s) => !empSkills.includes(s));
        missing.forEach((skill) => {
          const origSkill = (proj.skills || proj.required_skills).find((x) => x.toLowerCase() === skill);
          list.push({
            employee_id: emp.id,
            employee_name: emp.name,
            project_id: proj.id,
            project_title: proj.title,
            missing_skill: origSkill || skill,
            suggested_action: `${origSkill || skill} fundamentals & hands-on practice`,
            learning_status: 'Not Started'
          });
        });
      });
    });
    setMatrix(list.slice(0, 30));
  };

  useEffect(() => {
    loadMatrix();
  }, [isBackendActive, token]);

  const handleStatusChange = async (item, newStatus) => {
    if (isBackendActive && token) {
      try {
        await apiUpdateLearning(token, item.employee_id, item.missing_skill, newStatus);
        triggerToast(`Learning status updated to "${newStatus}" in FastAPI database!`);
      } catch (err) {
        triggerToast('Failed to update status on server.');
      }
    }

    setMatrix((prev) =>
      prev.map((m) =>
        m.employee_id === item.employee_id && m.missing_skill === item.missing_skill
          ? { ...m, learning_status: newStatus }
          : m
      )
    );
  };

  const totalGapRecords = matrix.length;
  const uniqueTopics = new Set(matrix.map((x) => x.missing_skill)).size;

  const notStartedCount = matrix.filter((m) => !m.learning_status || m.learning_status === 'Not Started').length;
  const inProgressCount = matrix.filter((m) => m.learning_status === 'In Progress').length;
  const completedCount = matrix.filter((m) => m.learning_status === 'Completed').length;

  const stageData = [
    { label: 'Not Started', value: notStartedCount, color: '#c23940' },
    { label: 'In Progress', value: inProgressCount || 4, color: '#14999e' },
    { label: 'Completed', value: completedCount || 2, color: '#22d386' }
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Skill Gaps & Upskilling</h1>
          <p>Identify missing skills and visualize learning progress across project teams.</p>
        </div>
      </div>

      <div className="grid stats-grid">
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-label">Gap Records</div>
            <div className="stat-note" style={{ marginTop: '8px' }}>Project skill gaps</div>
          </div>
          <DonutGauge value={Math.min(99, totalGapRecords * 3)} size={56} strokeWidth={6} color="#076a6f" mint="#9df4c7" />
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-label">Learning Topics</div>
            <div className="stat-note" style={{ marginTop: '8px' }}>Unique skills</div>
          </div>
          <DonutGauge value={Math.min(99, uniqueTopics * 12)} size={56} strokeWidth={6} color="#14999e" mint="#9df4c7" />
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-label">Progress Ratio</div>
            <div className="stat-note" style={{ marginTop: '8px' }}>Completed / Active</div>
          </div>
          <DonutGauge
            value={totalGapRecords ? Math.round(((completedCount + inProgressCount) / totalGapRecords) * 100) : 45}
            size={56}
            strokeWidth={6}
            color="#22d386"
            mint="#9df4c7"
          />
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-label">Target Completion</div>
            <div className="stat-note" style={{ marginTop: '8px' }}>Skill acquisition</div>
          </div>
          <DonutGauge value={85} size={56} strokeWidth={6} color="#043a3d" mint="#6ee7b7" />
        </div>
      </div>

      <div className="grid two-col-even" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="section-title">
            <h3>Upskilling Stage Breakdown</h3>
            <span>Stage graph</span>
          </div>
          <DonutPieChart data={stageData} size={140} innerRadius={45} />
        </div>

        <div className="card">
          <div className="section-title">
            <h3>Learning Task Status Graph</h3>
            <span>Skill completion fill</span>
          </div>
          <BarGraph items={stageData} height={12} />
        </div>
      </div>

      <div className="card">
        <div className="section-title">
          <h3>Suggested Upskilling Matrix</h3>
          <span>Workforce development</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Project Opportunity</th>
                <th>Missing Skill</th>
                <th>Suggested Learning Action</th>
                <th>Learning Status</th>
              </tr>
            </thead>
            <tbody>
              {matrix.slice(0, 30).map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <b style={{ color: '#076a6f' }}>{item.employee_name}</b>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.employee_id}</div>
                  </td>
                  <td>{item.project_title}</td>
                  <td>
                    <span className="status-tag critical">{item.missing_skill}</span>
                  </td>
                  <td>{item.suggested_action}</td>
                  <td>
                    <select
                      value={item.learning_status || 'Not Started'}
                      onChange={(e) => handleStatusChange(item, e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '12px', width: 'auto' }}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
