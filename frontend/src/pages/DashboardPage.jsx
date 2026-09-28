import React from 'react';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import { DonutGauge, BarGraph, DonutPieChart } from '../components/Charts';

export default function DashboardPage({ projects, applications, onNavigate, onViewDetails, onApply }) {
  const { user, isBackendActive } = useAuth();

  const userSkills = user?.skills || [];
  const userInterests = user?.interests || [];
  const hiddenSkills = user?.hidden_skills || user?.hidden || [];

  const getMatchScore = (proj) => {
    const req = (proj.skills || proj.required_skills || []).map((s) => s.toLowerCase());
    const emp = userSkills.map((s) => s.toLowerCase());
    const hits = req.filter((s) => emp.includes(s));
    const skillScore = req.length ? (hits.length / req.length) * 60 : 0;
    const expScore = Math.min(((user?.experience_years || user?.experience || 0) / 5), 1) * 20;
    return Math.min(99, Math.round(skillScore + expScore + 15));
  };

  const recommendedProjects = [...projects]
    .sort((a, b) => getMatchScore(b) - getMatchScore(a))
    .slice(0, 2);

  const userApplicationsCount = Object.values(applications).flat().filter((id) => id === user?.id).length;

  // Department distribution calculation for DonutPieChart
  const deptCounts = projects.reduce((acc, p) => {
    const d = p.dept || p.department || 'Other';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const deptChartData = Object.entries(deptCounts).map(([label, value]) => ({ label, value }));

  // Skills breakdown bar data
  const topSkillsData = [
    { label: 'Python & ML', value: 85 },
    { label: 'React & Frontend', value: 72 },
    { label: 'SQL & Data Analytics', value: 90 },
    { label: 'Cloud (AWS / DevOps)', value: 68 }
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Good morning, {(user?.name || 'Sarah').split(' ')[0]} 👋</h1>
          <p>Here’s your talent readiness snapshot and project opportunities.</p>
        </div>
      </div>

      <div className="grid stats-grid">
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-label">Profile Readiness</div>
            <div className="stat-note" style={{ marginTop: '8px' }}>{userSkills.length} skills listed</div>
          </div>
          <DonutGauge value={Math.min(95, userSkills.length * 20 + 20)} size={56} strokeWidth={6} />
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-label">Open Projects</div>
            <div className="stat-note" style={{ marginTop: '8px' }}>Across teams</div>
          </div>
          <DonutGauge value={Math.min(100, projects.length * 18)} size={56} strokeWidth={6} color="#059669" mint="#a7f3d0" />
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-label">Applications</div>
            <div className="stat-note" style={{ marginTop: '8px' }}>Internal mobility</div>
          </div>
          <DonutGauge value={userApplicationsCount ? 80 : 25} size={56} strokeWidth={6} color="#14999e" mint="#9df4c7" />
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-label">Growth Potential</div>
            <div className="stat-note" style={{ marginTop: '8px' }}>Discoverable skills</div>
          </div>
          <DonutGauge value={78} size={56} strokeWidth={6} color="#044b4e" mint="#6ee7b7" />
        </div>
      </div>

      <div className="grid two-col-even" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="section-title">
            <h3>Project Opportunities by Department</h3>
            <span>Distribution graph</span>
          </div>
          <DonutPieChart data={deptChartData} size={140} innerRadius={45} />
        </div>

        <div className="card">
          <div className="section-title">
            <h3>Top Capability Demand</h3>
            <span>Skill coverage graph</span>
          </div>
          <BarGraph items={topSkillsData} height={10} />
        </div>
      </div>

      <div className="grid two-col">
        <section className="card">
          <div className="section-title">
            <h3>Recommended for you</h3>
            <button className="ghost" onClick={() => onNavigate('marketplace')}>
              View all →
            </button>
          </div>
          <div className="project-grid">
            {recommendedProjects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                matchScore={getMatchScore(p)}
                applied={(applications[p.id] || []).includes(user?.id)}
                onViewDetails={onViewDetails}
                onApply={onApply}
              />
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-title">
            <h3>Your talent profile</h3>
            <span>{isBackendActive ? 'FastAPI DB' : 'Demo Profile'}</span>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '20px' }}>
            <div className="avatar" style={{ width: '52px', height: '52px', fontSize: '18px' }}>
              {(user?.name || 'SJ').split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <strong style={{ fontSize: '16px', display: 'block', color: '#076a6f' }}>{user?.name}</strong>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                {user?.job_title || user?.role} · {user?.experience_years || user?.experience || 0} years exp
              </div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>Skills</div>
          <div className="tag-row">
            {userSkills.map((s, i) => (
              <span key={i} className="tag">{s}</span>
            ))}
          </div>

          <div style={{ fontSize: '12px', color: 'var(--muted)', margin: '18px 0 8px' }}>Interests</div>
          <div className="tag-row">
            {userInterests.map((s, i) => (
              <span key={i} className="tag" style={{ background: 'var(--mint-bg)', color: 'var(--teal-dark)' }}>{s}</span>
            ))}
          </div>

          <div className="notice" style={{ margin: '20px 0 0' }}>
            💡 <b>Growth insight:</b> Explore projects that use {hiddenSkills[0] || 'new capabilities'} to make your skills visible to project leads.
          </div>
        </section>
      </div>

      <div className="grid feature-grid" style={{ marginTop: '20px' }}>
        <div className="card">
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eafaf3', border: '1px solid #bdf2d9', display: 'grid', placeItems: 'center', fontSize: '20px', marginBottom: '12px', color: '#076a6f' }}>✧</div>
          <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#076a6f' }}>AI Skill Matching</h3>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px', lineHeight: '1.5' }}>
            Multi-factor scoring formula analyzing TF-IDF text similarity and skill overlap.
          </p>
        </div>
        <div className="card">
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eafaf3', border: '1px solid #bdf2d9', display: 'grid', placeItems: 'center', fontSize: '20px', marginBottom: '12px', color: '#076a6f' }}>◉</div>
          <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#076a6f' }}>Hidden Talent Discovery</h3>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px', lineHeight: '1.5' }}>
            Surface employee capabilities beyond their standard job titles.
          </p>
        </div>
        <div className="card">
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eafaf3', border: '1px solid #bdf2d9', display: 'grid', placeItems: 'center', fontSize: '20px', marginBottom: '12px', color: '#076a6f' }}>↗</div>
          <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#076a6f' }}>Skill Gap Matrix</h3>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px', lineHeight: '1.5' }}>
            Turn missing project skills into targeted learning and upskilling actions.
          </p>
        </div>
      </div>
    </div>
  );
}
