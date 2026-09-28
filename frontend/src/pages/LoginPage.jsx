import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, isBackendActive } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(employeeId, password, role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <section className="login-hero">
        <div className="login-logo-header">
          <img src="/logo.png" alt="SkillSync Logo" className="login-logo-img" />
          <div className="brand">
            Skill<span>Sync</span>
          </div>
        </div>
        <div className="hero-title">
          Discover talent.<br />
          <span style={{ color: '#9df4c7' }}>Build better teams.</span>
        </div>
        <p className="hero-copy">
          An AI-powered internal talent marketplace that connects employee skills, interests, and experience with project opportunities across enterprise teams.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '28px' }}>
          <span className="tag" style={{ padding: '8px 14px', borderRadius: '99px', fontSize: '12px', background: 'rgba(157, 244, 199, 0.2)', color: '#9df4c7', borderColor: 'rgba(157, 244, 199, 0.4)' }}>
            ✦ AI Skill Matching
          </span>
          <span className="tag" style={{ padding: '8px 14px', borderRadius: '99px', fontSize: '12px', background: 'rgba(157, 244, 199, 0.2)', color: '#9df4c7', borderColor: 'rgba(157, 244, 199, 0.4)' }}>
            ↗ Hidden Talent Discovery
          </span>
          <span className="tag" style={{ padding: '8px 14px', borderRadius: '99px', fontSize: '12px', background: 'rgba(157, 244, 199, 0.2)', color: '#9df4c7', borderColor: 'rgba(157, 244, 199, 0.4)' }}>
            ◎ Skill Gap Insights
          </span>
        </div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <img src="/logo.png" alt="SkillSync" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <h2 style={{ margin: 0, fontSize: '24px', color: '#043a3d' }}>Welcome back</h2>
          </div>
          <p style={{ color: 'var(--muted)', margin: '0 0 24px' }}>Sign in to your SkillSync workspace.</p>

          <label htmlFor="empId">Employee ID</label>
          <input
            id="empId"
            placeholder="e.g. EMP-1001"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
          />

          <label htmlFor="pass">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="pass"
              type={showPass ? 'text' : 'password'}
              placeholder="Enter demo password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="ghost"
              onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: '6px', top: '6px', padding: '6px 10px', fontSize: '11px' }}
            >
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>

          <label htmlFor="role">Login as</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Employee">Employee</option>
            <option value="Project Manager">Project Manager</option>
            <option value="HR/Admin">HR/Admin</option>
          </select>

          <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '22px', padding: '13px', background: 'var(--teal)' }}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>

          {error && <div style={{ color: 'var(--red)', fontSize: '13px', marginTop: '12px' }}>{error}</div>}

          <div className="demo-box">
            <strong>Demo access</strong>
            <br />
            Employee ID: <b>EMP-1001</b>
            <br />
            Password: <b>demo123</b>
            <br />
            <span style={{ color: 'var(--muted)' }}>Use the same demo credentials for any role.</span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '18px' }}>
            {isBackendActive ? '⚡ Connected to FastAPI Backend (SQLite & TF-IDF AI Engine)' : 'Prototype mode · Sample data only'}
          </p>
        </form>
      </section>
    </div>
  );
}
