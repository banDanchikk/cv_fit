from datetime import datetime

def test_create_session(client, auth_headers):
    workout = client.post("/workouts/", headers=auth_headers, json={
        "name": "Session Workout",
        "level": "beginner",
        "exercises": []
    }).json()

    res = client.post("/workout_sessions/", headers=auth_headers, json={
        "workout_id": workout["id"],
        "started_at": datetime.now().isoformat()
    })
    assert res.status_code == 200
    assert "session_id" in res.json()

def test_create_session_invalid_workout(client, auth_headers):
    res = client.post("/workout_sessions/", headers=auth_headers, json={
        "workout_id": 99999,
        "started_at": datetime.now().isoformat()
    })
    assert res.status_code == 404

def test_finish_session(client, auth_headers):
    workout = client.post("/workouts/", headers=auth_headers, json={
        "name": "Finish Workout",
        "level": "beginner",
        "exercises": []
    }).json()

    session = client.post("/workout_sessions/", headers=auth_headers, json={
        "workout_id": workout["id"],
        "started_at": datetime.now().isoformat()
    }).json()

    res = client.post(f"/workout_sessions/{session['session_id']}/finish",
        headers=auth_headers,
        json={
            "sets": [],
            "ended_at": datetime.now().isoformat()
        }
    )
    assert res.status_code == 200

def test_delete_session(client, auth_headers):
    workout = client.post("/workouts/", headers=auth_headers, json={
        "name": "Delete Session Workout",
        "level": "beginner",
        "exercises": []
    }).json()

    session = client.post("/workout_sessions/", headers=auth_headers, json={
        "workout_id": workout["id"],
        "started_at": datetime.now().isoformat()
    }).json()

    res = client.delete(
        f"/workout_sessions/{session['session_id']}",
        headers=auth_headers
    )
    assert res.status_code == 200

def test_get_session_unauthorized(client):
    res = client.get("/workout_sessions/1")
    assert res.status_code == 403

def test_create_session_unauthorized(client):
    res = client.post("/workout_sessions/", json={
        "workout_id": 1,
        "started_at": datetime.now().isoformat()
    })
    assert res.status_code == 403

def test_get_session_not_found(client, auth_headers):
    res = client.get("/workout_sessions/99999", headers=auth_headers)
    assert res.status_code == 404

def test_get_my_stats(client, auth_headers):
    res = client.get("/workout_sessions/stats/me", headers=auth_headers)
    assert res.status_code == 200
    assert "recent_sessions" in res.json()
    assert "workout_days" in res.json()
    assert "chart_data" in res.json()

def test_finish_session_with_sets(client, auth_headers):
    workout = client.post("/workouts/", headers=auth_headers, json={
        "name": "Sets Workout",
        "level": "beginner",
        "exercises": []
    }).json()

    session = client.post("/workout_sessions/", headers=auth_headers, json={
        "workout_id": workout["id"],
        "started_at": datetime.now().isoformat()
    }).json()

    exercises = client.get("/exercises/").json()
    if not exercises:
        return

    res = client.post(
        f"/workout_sessions/{session['session_id']}/finish",
        headers=auth_headers,
        json={
            "sets": [
                {
                    "exercise_id": exercises[0]["id"],
                    "set_number": 1,
                    "reps": 10,
                    "weight": 50.0
                }
            ],
            "ended_at": datetime.now().isoformat()
        }
    )
    assert res.status_code == 200

def test_previous_session_none(client, auth_headers):
    workout = client.post("/workouts/", headers=auth_headers, json={
        "name": "Prev Test",
        "level": "beginner",
        "exercises": []
    }).json()

    session = client.post("/workout_sessions/", headers=auth_headers, json={
        "workout_id": workout["id"],
        "started_at": datetime.now().isoformat()
    }).json()

    res = client.get(
        f"/workout_sessions/{session['session_id']}/previous",
        headers=auth_headers
    )
    assert res.status_code == 200

def test_delete_session_not_found(client, auth_headers):
    res = client.delete("/workout_sessions/99999", headers=auth_headers)
    assert res.status_code == 200