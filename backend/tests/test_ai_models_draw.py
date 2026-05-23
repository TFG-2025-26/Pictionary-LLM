# pylint: disable=import-error

import json
from io import BytesIO

from PIL import Image

from src.core.models import User
from src.core.security import get_password_hash
from tests.conftest import app


def seed_user(db_session, username="testuser", email="test@test.com", password="1234"):
    user = User(
        username=username,
        email=email,
        password_hash=get_password_hash(password)
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def make_png_bytes():
    img = Image.new("RGB", (20, 20), "white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()


def test_draw_start(client, mocker):
    mocker.patch("src.api.ai_models.random.choice", return_value="car")

    response = client.post("/draw/start")
    data = response.json()

    assert response.status_code == 200
    assert data["word"] == "car"

    from src.api.ai_models import redis_db
    stored = json.loads(redis_db.get("game:draw:testuser"))
    assert stored["word"] == "car"
    assert stored["score"] == 100


def test_draw_resume_active(client):
    from src.api.ai_models import redis_db
    redis_db.set("game:draw:testuser", json.dumps({
        "word": "tree",
        "score": 70
    }))

    response = client.get("/draw/resume")
    data = response.json()

    assert response.status_code == 200
    assert data["active"] is True
    assert data["word"] == "tree"
    assert data["score"] == 70


def test_draw_resume_inactive(client):
    response = client.get("/draw/resume")
    assert response.status_code == 200
    assert response.json() == {"active": False}


def test_draw_check_correct(client, db_session, mocker):
    seed_user(db_session)

    from src.api.ai_models import redis_db
    redis_db.set("game:draw:testuser", json.dumps({
        "word": "cat",
        "score": 100
    }))

    mocker.patch("src.api.ai_models.ai_engine.guess", return_value="Cat")

    response = client.post(
        "/draw/check",
        files={"file": ("canvas.png", make_png_bytes(), "image/png")}
    )
    data = response.json()

    assert response.status_code == 200
    assert data["correct"] is True
    assert data["label"] == "Cat"
    assert data["score"] == 100

    user = db_session.query(User).filter(User.username == "testuser").first()
    assert user.drawing_points == 100
    assert user.drawing_games == 1
    assert user.total_points == 100
    assert user.total_games == 1

    assert redis_db.get("game:draw:testuser") is None


def test_draw_check_wrong(client, db_session, mocker):
    seed_user(db_session)

    from src.api.ai_models import redis_db
    redis_db.set("game:draw:testuser", json.dumps({
        "word": "cat",
        "score": 100
    }))

    mocker.patch("src.api.ai_models.ai_engine.guess", return_value="Dog")

    response = client.post(
        "/draw/check",
        files={"file": ("canvas.png", make_png_bytes(), "image/png")}
    )
    data = response.json()

    assert response.status_code == 200
    assert data["correct"] is False
    assert data["score"] == 90

    stored = json.loads(redis_db.get("game:draw:testuser"))
    assert stored["score"] == 90


def test_draw_check_no_active_game(client):
    response = client.post(
        "/draw/check",
        files={"file": ("canvas.png", make_png_bytes(), "image/png")}
    )
    data = response.json()

    assert response.status_code == 200
    assert data["score"] == 0
    assert "partida" in data["error"].lower()


def test_draw_check_ai_error(client, mocker):
    from src.api.ai_models import redis_db
    redis_db.set("game:draw:testuser", json.dumps({
        "word": "cat",
        "score": 100
    }))

    mocker.patch("src.api.ai_models.ai_engine.guess", side_effect=Exception("boom"))

    response = client.post(
        "/draw/check",
        files={"file": ("canvas.png", make_png_bytes(), "image/png")}
    )
    data = response.json()

    assert response.status_code == 200
    assert data["error"] == "Error en el reconocimiento de la IA"
    assert "boom" in data["details"]


def test_draw_abandon_active(client, db_session):
    seed_user(db_session)

    from src.api.ai_models import redis_db
    redis_db.set("game:draw:testuser", json.dumps({
        "word": "cat",
        "score": 100
    }))

    response = client.post("/draw/abandon")
    data = response.json()

    assert response.status_code == 200
    assert data["message"] == "Te has rendido"

    user = db_session.query(User).filter(User.username == "testuser").first()
    assert user.drawing_games == 1
    assert user.total_games == 1

    assert redis_db.get("game:draw:testuser") is None


def test_draw_abandon_guest_does_not_update_db(client, db_session):
    from tests.conftest import app, api_get_current_user
    from src.api.ai_models import redis_db

    app.dependency_overrides[api_get_current_user] = lambda: {
        "sub": "Guest_1234",
        "id": "1234",
        "is_guest": True
    }

    redis_db.set("game:draw:Guest_1234", json.dumps({
        "word": "cat",
        "score": 100
    }))

    response = client.post("/draw/abandon")
    assert response.status_code == 200
    assert response.json()["message"] == "Te has rendido"
    assert redis_db.get("game:draw:Guest_1234") is None
