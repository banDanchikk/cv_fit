def test_register_success(client):
    res = client.post("/auth/register", json={
        "username": "newuser",
        "email": "new@test.com",
        "password": "password123"
    })
    assert res.status_code == 200
    assert "token" in res.json()
    assert res.json()["username"] == "newuser"

def test_register_duplicate_email(client):
    client.post("/auth/register", json={
        "username": "user1",
        "email": "dup@test.com",
        "password": "password123"
    })
    res = client.post("/auth/register", json={
        "username": "user2",
        "email": "dup@test.com",
        "password": "password123"
    })
    assert res.status_code == 400
    assert res.json()["detail"] == "Email already in use"

def test_login_success(client):
    client.post("/auth/register", json={
        "username": "loginuser",
        "email": "login@test.com",
        "password": "password123"
    })
    res = client.post("/auth/login", json={
        "email": "login@test.com",
        "password": "password123"
    })
    assert res.status_code == 200
    assert "token" in res.json()

def test_login_wrong_password(client):
    res = client.post("/auth/login", json={
        "email": "login@test.com",
        "password": "wrongpass"
    })
    assert res.status_code == 401

def test_login_nonexistent_user(client):
    res = client.post("/auth/login", json={
        "email": "nobody@test.com",
        "password": "password123"
    })
    assert res.status_code == 401

def test_get_me_authorized(client, auth_headers):
    res = client.get("/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert "email" in res.json()

def test_get_me_unauthorized(client):
    res = client.get("/auth/me")
    assert res.status_code == 403

def test_update_profile(client, auth_headers):
    res = client.put("/auth/me", headers=auth_headers, json={
        "username": "updateduser",
        "email": "updated@test.com",
        "height": 180.0,
        "weight": 75.0
    })
    assert res.status_code == 200
    assert res.json()["username"] == "updateduser"

def test_update_profile_unauthorized(client):
    res = client.put("/auth/me", json={
        "username": "hacker",
        "email": "hack@test.com"
    })
    assert res.status_code == 403