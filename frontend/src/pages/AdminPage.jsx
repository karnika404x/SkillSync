import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiCreateProject, apiDeleteProject, apiResetDemo } from '../services/api';
import { BarGraph } from '../components/Charts';

export default function AdminPage({ projects, setProjects, onRefreshProjects }) {
  const { user, token, isBackendActive, triggerToast } = useAuth();
  const isEmployee = user?.role === 'Employee';

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [owner, setOwner] = useState(user?.name || 'Priya Mehta');
  const [loading, setLoading] = useState(false);

  if (isEmployee) {
    return (
      <div style={{ maxWidth: '680px', margin: '40px auto' }}>
        <div className="card" style={{ padding: '36px', textAlign: 'center', borderColor: '#fcd34d', background: '#fffdf5' }}>
          <div style={{ fontSize: '42px', marginBottom: '14px' }}>🔒</div>
          <h2 style={{ margin: '0 0 10px', color: '#92400e' }}>Access Restricted</h2>
          <p style={{ color: '#78350f', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
            Employees cannot create or delete projects. You can browse open projects in the Marketplace, view your AI skill match scores, and track your learning progress.
          </p>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
            Logged in as: <b>{user?.name}</b> ({user?.role})
          </div>
        </div>
      </div>
    );
  }

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const skillsArray = requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);

    const newProjData = {
      title: title.trim(),
      department: department.trim(),
      description: description.trim(),
      required_skills: skillsArray,
      status: 'Open',
      owner: owner.trim() || user?.name || 'Project Lead'
    };

    setLoading(true);
    if (isBackendActive && token) {
      try {
        await apiCreateProject(token, newProjData);
        triggerToast('Project created successfully in FastAPI backend!');
        onRefreshProjects();
        setTitle('');
        setDepartment('');
        setDescription('');
        setRequiredSkills('');
        setLoading(false);
        return;
      } catch (err) {
        triggerToast('Error creating project: ' + err.message);
      }
    }

    // Local fallback
    const localNewProj = {
      id: Date.now(),
      ...newProjData,
      skills: skillsArray,
      desc: newProjData.description,
      dept: newProjData.department
    };
    setProjects([localNewProj, ...projects]);
    triggerToast('Project created locally.');
    setTitle('');
    setDepartment('');
    setDescription('');
    setRequiredSkills('');
    setLoading(false);
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project opportunity?')) return;

    if (isBackendActive && token) {
      try {
        await apiDeleteProject(token, id);
        triggerToast('Project deleted from FastAPI backend.');
        onRefreshProjects();
        return;
      } catch (err) {
        triggerToast('Error deleting project: ' + err.message);
      }
    }

    setProjects(projects.filter((p) => p.id !== id));
    triggerToast('Project deleted.');
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all demo data to default baseline?')) return;

    if (isBackendActive && token) {
      try {
        await apiResetDemo(token);
        triggerToast('Database reset to defaults!');
        onRefreshProjects();
        return;
      } catch (err) {
        triggerToast('Reset error: ' + err.message);
      }
    }

    onRefreshProjects();
    triggerToast('Demo data reset.');
  };

  // Department distribution bar data
  const deptCounts = projects.reduce((acc, p) => {
    const d = p.dept || p.department || 'Other';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const deptBarData = Object.entries(deptCounts).map(([label, value]) => ({ label, value }));

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>HR & Project Management</h1>
          <p>Create new project opportunities and manage workforce capability with department breakdown graphs.</p>
        </div>
      </div>

      <div className="grid two-col-even">
        <div className="card">
          <div className="section-title">
            <h3>Create a Project</h3>
            <span>{isBackendActive ? 'FastAPI Endpoint' : 'Local Form'}</span>
          </div>

          <form onSubmit={handleCreateProject}>
            <label htmlFor="pTitle">Project Title</label>
            <input
              id="pTitle"
              placeholder="e.g. Predictive Maintenance AI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <label htmlFor="pDept">Department</label>
            <input
              id="pDept"
              placeholder="e.g. Data & AI"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />

            <label htmlFor="pDesc">Description</label>
            <textarea
              id="pDesc"
              rows={3}
              placeholder="Describe project scope and goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <label htmlFor="pSkills">Required Skills (comma-separated)</label>
            <input
              id="pSkills"
              placeholder="Python, SQL, Machine Learning"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              required
            />

            <label htmlFor="pOwner">Project Lead</label>
            <input
              id="pOwner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              required
            />

            <button type="submit" disabled={loading} style={{ marginTop: '18px' }}>
              {loading ? 'Creating...' : '＋ Create project'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="section-title">
            <h3>Workforce Department Snapshot</h3>
            <span>Projects per department graph</span>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div className="stat-value">{projects.length}</div>
            <div className="stat-label">Active Project Opportunities</div>
          </div>
          <BarGraph items={deptBarData} height={12} />
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="section-title">
          <h3>Manage Project Opportunities</h3>
          <span>{projects.length} total</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Department</th>
                <th>Required Skills</th>
                <th>Project Lead</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <b style={{ color: '#076a6f' }}>{p.title}</b>
                  </td>
                  <td>{p.dept || p.department}</td>
                  <td>{(p.skills || p.required_skills || []).join(', ')}</td>
                  <td>{p.owner}</td>
                  <td>
                    <button className="danger" onClick={() => handleDeleteProject(p.id)} style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="ghost" onClick={handleReset}>
          Reset demo database
        </button>
      </div>
    </div>
  );
}
