# pylint: disable=import-error

from src.core.security import decode_access_token
from tests.conftest import fake_current_user_default, api_get_current_user, app


def test_register_ok(client):
    response = client.post(
        "/register",
        json={
            "username": "user1",
            "email": "user1@test.com",
            "password": "1234"
        }
    )

    assert response.status_code == 200
    assert response.json()["status"] == "success"


def test_register_duplicate_username(client):
    client.post(
        "/register",
        json={
            "username": "userdup",
            "email": "userdup1@test.com",
            "password": "1234"
        }
    )

    response = client.post(
        "/register",
        json={
            "username": "userdup",
            "email": "userdup2@test.com",
            "password": "1234"
        }
    )

    assert response.status_code == 400
    assert "nombre de usuario" in response.json()["detail"].lower()


def test_register_duplicate_email(client):
    client.post(
        "/register",
        json={
            "username": "usera",
            "email": "same@test.com",
            "password": "1234"
        }
    )

    response = client.post(
        "/register",
        json={
            "username": "userb",
            "email": "same@test.com",
            "password": "1234"
        }
    )

    assert response.status_code == 400
    assert "correo electrónico" in response.json()["detail"].lower()


def test_login_ok(client):
    client.post(
        "/register",
        json={
            "username": "loginuser",
            "email": "login@test.com",
            "password": "1234"
        }
    )

    response = client.post(
        "/login",
        json={
            "username": "loginuser",
            "password": "1234"
        }
    )

    data = response.json()
    assert response.status_code == 200
    assert data["status"] == "success"
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_user_not_found(client):
    response = client.post(
        "/login",
        json={
            "username": "inexistente",
            "password": "1234"
        }
    )

    assert response.status_code == 401


def test_login_wrong_password(client):
    client.post(
        "/register",
        json={
            "username": "userpass",
            "email": "pass@test.com",
            "password": "1234"
        }
    )

    response = client.post(
        "/login",
        json={
            "username": "userpass",
            "password": "mal"
        }
    )

    assert response.status_code == 401


def test_login_guest(client):
    response = client.post("/login_guest")
    data = response.json()

    assert response.status_code == 200
    assert data["status"] == "success"
    assert data["token_type"] == "bearer"
    assert data["user"]["username"].startswith("Guest_")
    assert len(data["user"]["username"]) == len("Guest_") + 4

    payload = decode_access_token(data["access_token"])
    assert payload is not None
    assert payload["is_guest"] is True
    assert payload["sub"] == data["user"]["username"]


def test_auth_route_with_overridden_user(client):
    response = client.get("/auth")
    assert response.status_code == 200
    assert response.json()["user"]["sub"] == "testuser"
