def get_auth_token(client):
    res = client.post("/api/auth/login", json={"employee_id": "EMP-1001", "password": "demo123"})
    return res.json()["access_token"]

def test_generate_shortlist(client):
    token = get_auth_token(client)
    response = client.post(
        "/api/matching/shortlist",
        json={"project_id": 1, "top_n": 5},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
    assert results[0]["match_score"] >= results[-1]["match_score"]
    assert "explanation" in results[0]
    assert "hits" in results[0]["explanation"]
    assert "missing" in results[0]["explanation"]

def test_explain_match(client):
    token = get_auth_token(client)
    response = client.get(
        "/api/matching/explain?project_id=1&employee_id=EMP-1001",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    exp = response.json()
    assert "score" in exp
    assert "status_label" in exp
    assert "components" in exp
    assert "skill_overlap_score" in exp["components"]
