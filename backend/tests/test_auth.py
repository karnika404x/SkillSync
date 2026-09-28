def test_login_success(client):
    response = client.post(
        "/api/auth/login",
        json={"employee_id": "EMP-1001", "password": "demo123", "role": "Employee"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["id"] == "EMP-1001"

def test_login_invalid_password(client):
    response = client.post(
        "/api/auth/login",
        json={"employee_id": "EMP-1001", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_get_me(client):
    login_res = client.post(
        "/api/auth/login",
        json={"employee_id": "EMP-1001", "password": "demo123"}
    )
    token = login_res.json()["access_token"]

    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["id"] == "EMP-1001"
    assert response.json()["name"] == "Sarah Johnson"
