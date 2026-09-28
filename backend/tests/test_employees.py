def get_auth_token(client):
    res = client.post("/api/auth/login", json={"employee_id": "EMP-1001", "password": "demo123"})
    return res.json()["access_token"]

def test_list_employees(client):
    token = get_auth_token(client)
    response = client.get("/api/employees", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    employees = response.json()
    assert len(employees) >= 5

def test_hidden_talent(client):
    token = get_auth_token(client)
    response = client.get("/api/employees/hidden-talent", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    candidates = response.json()
    assert isinstance(candidates, list)
    if len(candidates) > 0:
        assert "discoverable_skills" in candidates[0]

def test_upskilling_matrix_and_update(client):
    token = get_auth_token(client)
    # Get upskilling matrix
    response = client.get("/api/employees/upskilling", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    matrix = response.json()
    assert isinstance(matrix, list)

    # Update a learning status
    update_res = client.post(
        "/api/employees/upskilling",
        json={"employee_id": "EMP-1001", "skill": "Machine Learning", "status": "In Progress"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "In Progress"
