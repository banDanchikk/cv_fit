def test_get_workouts_authorized(client, auth_headers):
    res = client.get("/workouts/", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_get_workouts_unauthorized(client):
    res = client.get("/workouts/")
    assert res.status_code == 403

def test_create_workout(client, auth_headers):
    res = client.post("/workouts/", headers=auth_headers, json={
        "name": "Test Workout",
        "level": "beginner",
        "exercises": []
    })
    assert res.status_code == 200
    assert res.json()["name"] == "Test Workout"

def test_create_workout_with_exercises(client, auth_headers):
    res = client.post("/workouts/", headers=auth_headers, json={
        "name": "Full Workout",
        "level": "intermediate",
        "exercises": [
            {"exercise_id": 1, "sets": 3, "reps": 10}
        ]
    })
    assert res.status_code == 200
    assert res.json()["name"] == "Full Workout"

def test_get_workout_by_id(client, auth_headers):
    create = client.post("/workouts/", headers=auth_headers, json={
        "name": "Detail Workout",
        "level": "beginner",
        "exercises": []
    })
    workout_id = create.json()["id"]
    res = client.get(f"/workouts/{workout_id}", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["id"] == workout_id

def test_get_workout_not_found(client, auth_headers):
    res = client.get("/workouts/99999", headers=auth_headers)
    assert res.status_code == 404

def test_update_workout(client, auth_headers):
    create = client.post("/workouts/", headers=auth_headers, json={
        "name": "Old Name",
        "level": "beginner",
        "exercises": []
    })
    workout_id = create.json()["id"]
    res = client.put(f"/workouts/{workout_id}", headers=auth_headers, json={
        "name": "New Name",
        "level": "advanced",
        "exercises": []
    })
    assert res.status_code == 200
    assert res.json()["name"] == "New Name"

def test_delete_workout(client, auth_headers):
    create = client.post("/workouts/", headers=auth_headers, json={
        "name": "To Delete",
        "level": "beginner",
        "exercises": []
    })
    workout_id = create.json()["id"]
    res = client.delete(f"/workouts/{workout_id}", headers=auth_headers)
    assert res.status_code == 200

def test_delete_workout_not_found(client, auth_headers):
    res = client.delete("/workouts/99999", headers=auth_headers)
    assert res.status_code == 404