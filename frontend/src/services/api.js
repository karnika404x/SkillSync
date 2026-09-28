const API_BASE = '/api';

export const initialProjects = [
  { id: 1, title: "AI Customer Analytics Platform", department: "Data & AI", description: "Build a platform that turns customer data into actionable insights using machine learning.", required_skills: ["Python", "Machine Learning", "SQL", "Cloud"], status: "Open", owner: "Priya Mehta" },
  { id: 2, title: "Smart HR Insights Dashboard", department: "Human Resources", description: "Create analytics dashboards for workforce trends, skills, and internal mobility.", required_skills: ["React", "Data Analytics", "SQL", "Communication"], status: "Open", owner: "Arjun Rao" },
  { id: 3, title: "Internal Knowledge Assistant", department: "Engineering", description: "Build a searchable assistant for company documents and team knowledge.", required_skills: ["Python", "NLP", "APIs", "RAG"], status: "Open", owner: "Neha Kapoor" },
  { id: 4, title: "Cloud Migration Initiative", department: "Platform", description: "Support migration planning, cloud deployment, and reliability improvements.", required_skills: ["AWS", "Docker", "DevOps", "Networking"], status: "Open", owner: "Kabir Singh" },
  { id: 5, title: "Employee Experience Portal", department: "People Ops", description: "Improve employee self-service with a responsive internal web portal.", required_skills: ["React", "JavaScript", "UI/UX", "REST APIs"], status: "Open", owner: "Aditi Shah" }
];

export const initialEmployees = [
  { id: "EMP-1001", name: "Sarah Johnson", role: "Employee", job_title: "Frontend Developer", department: "Engineering", experience_years: 2, skills: ["React", "JavaScript", "Python", "NLP"], interests: ["AI/ML", "Data Analytics"], hidden_skills: ["Python", "NLP"], knowledge_score: 82, communication_score: 78, recommendation_score: 75, training_completed: ["React Advanced"] },
  { id: "EMP-1002", name: "Rohan Verma", role: "Project Manager", job_title: "Backend Developer", department: "Engineering", experience_years: 4, skills: ["Python", "SQL", "APIs", "Docker", "AWS"], interests: ["Cloud", "AI/ML"], hidden_skills: ["AWS", "Docker"], knowledge_score: 90, communication_score: 72, recommendation_score: 85, training_completed: ["AWS Fundamentals"] },
  { id: "EMP-1003", name: "Aisha Khan", role: "HR/Admin", job_title: "Data Analyst", department: "Data & AI", experience_years: 3, skills: ["SQL", "Data Analytics", "Python", "Statistics"], interests: ["AI/ML", "Analytics"], hidden_skills: ["Python"], knowledge_score: 88, communication_score: 91, recommendation_score: 80, training_completed: ["Machine Learning Basics"] },
  { id: "EMP-1004", name: "Dev Patel", role: "Employee", job_title: "UI/UX Designer", department: "Design", experience_years: 2, skills: ["UI/UX", "Figma", "Research", "Communication"], interests: ["Product", "Frontend"], hidden_skills: [], knowledge_score: 76, communication_score: 93, recommendation_score: 82, training_completed: ["Design Systems"] },
  { id: "EMP-1005", name: "Meera Iyer", role: "Employee", job_title: "Software Engineer", department: "Platform", experience_years: 5, skills: ["JavaScript", "React", "APIs", "Docker", "AWS"], interests: ["Cloud", "Product"], hidden_skills: ["AWS", "Docker"], knowledge_score: 86, communication_score: 80, recommendation_score: 88, training_completed: ["Cloud Practitioner"] }
];

async function parseResponseBody(res) {
  const text = await res.text();
  if (!text || !text.trim()) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return { detail: text };
  }
}

async function handleResponse(res, defaultMsg = 'Request failed') {
  const data = await parseResponseBody(res);
  if (!res.ok) {
    const detail = data && (data.detail || data.message || data.error);
    const msg = detail || `${defaultMsg} (HTTP ${res.status})`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return false;
    const data = await parseResponseBody(res);
    return Boolean(data && data.status === 'healthy');
  } catch (err) {
    return false;
  }
}

export async function apiLogin(employeeId, password, role) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_id: employeeId, password, role })
  });
  return handleResponse(res, 'Authentication failed');
}

export async function apiFetchProjects(token) {
  const res = await fetch(`${API_BASE}/projects`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return handleResponse(res, 'Failed to fetch projects');
}

export async function apiCreateProject(token, projectData) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(projectData)
  });
  return handleResponse(res, 'Failed to create project');
}

export async function apiDeleteProject(token, projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return handleResponse(res, 'Failed to delete project');
}

export async function apiFetchShortlist(token, projectId) {
  const res = await fetch(`${API_BASE}/matching/shortlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ project_id: projectId, top_n: 10 })
  });
  return handleResponse(res, 'Failed to run AI matching');
}

export async function apiFetchHiddenTalent(token) {
  const res = await fetch(`${API_BASE}/employees/hidden-talent`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return handleResponse(res, 'Failed to fetch hidden talent');
}

export async function apiFetchUpskilling(token) {
  const res = await fetch(`${API_BASE}/employees/upskilling`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return handleResponse(res, 'Failed to fetch upskilling matrix');
}

export async function apiUpdateLearning(token, employeeId, skill, status) {
  const res = await fetch(`${API_BASE}/employees/upskilling`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ employee_id: employeeId, skill, status })
  });
  return handleResponse(res, 'Failed to update learning progress');
}

export async function apiApplyProject(token, projectId) {
  const res = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ project_id: projectId })
  });
  return handleResponse(res, 'Failed to apply to project');
}

export async function apiResetDemo(token) {
  const res = await fetch(`${API_BASE}/auth/reset-demo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  return handleResponse(res, 'Failed to reset demo');
}
