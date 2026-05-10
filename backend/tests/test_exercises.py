def test_get_all_exercises(client):
    res = client.get("/exercises/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_get_exercise_by_id(client):
    # спочатку отримуємо список щоб взяти реальний id
    exercises = client.get("/exercises/").json()
    if not exercises:
        return
    first_id = exercises[0]["id"]
    res = client.get(f"/exercises/{first_id}")
    assert res.status_code == 200
    assert res.json()["id"] == first_id

def test_get_exercise_not_found(client):
    res = client.get("/exercises/99999")
    assert res.status_code == 404

def test_get_exercise_stats_authorized(client, auth_headers):
    exercises = client.get("/exercises/").json()
    if not exercises:
        return
    first_id = exercises[0]["id"]
    res = client.get(f"/exercises/{first_id}/stats", headers=auth_headers)
    assert res.status_code == 200
    assert "stats" in res.json()

def test_get_exercise_stats_unauthorized(client):
    res = client.get("/exercises/1/stats")
    assert res.status_code == 403

def test_get_exercise_progress_authorized(client, auth_headers):
    exercises = client.get("/exercises/").json()
    if not exercises:
        return
    first_id = exercises[0]["id"]
    res = client.get(f"/exercises/stats/{first_id}", headers=auth_headers)
    assert res.status_code == 200

def test_get_exercise_progress_unauthorized(client):
    res = client.get("/exercises/stats/1")
    assert res.status_code == 403