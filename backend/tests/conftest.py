import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_headers(client):
    client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@test.com",
        "password": "password123"
    })
    res = client.post("/auth/login", json={
        "email": "test@test.com",
        "password": "password123"
    })
    token = res.json()["token"]
    return {"Authorization": f"Bearer {token}"}