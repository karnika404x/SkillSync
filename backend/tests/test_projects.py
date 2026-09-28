def get_auth_token(client, role="Employee", emp_id="EMP-1001"):
    res = client.post("/api/auth/login", json={"employee_id": emp_id, "password": "demo123", "role": role})
    return res.json()["access_token"]

def test_list_projects(client):
    token = get_auth_token(client)
    response = client.get("/api/projects", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) >= 5
    assert projects[0]["title"] == "AI Customer Analytics Platform"

def test_create_project_as_manager(client):
    token = get_auth_token(client, role="Project Manager", emp_id="EMP-1002")
    payload = {
        "title": "Quantum ML Optimizer",
        "department": "R&D",
        "description": "Optimize resource allocation using quantum algorithms.",
        "required_skills": ["Quantum Computing", "Python", "Linear Algebra"],
        "status": "Open",
        "owner": "Rohan Verma"
    }
    response = client.post("/api/projects", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Quantum ML Optimizer"
    assert "Quantum Computing" in data["required_skills"]

def test_create_project_forbidden_as_employee(client):
    token = get_auth_token(client, role="Employee", emp_id="EMP-1001")
    payload = {
        "title": "Unauthorized Project",
        "department": "R&D",
        "description": "Should fail",
        "required_skills": ["Python"],
        "owner": "Sarah Johnson"
    }
    response = client.post("/api/projects", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
