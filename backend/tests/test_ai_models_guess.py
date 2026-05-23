import json

from src.core.config import PENALTY_GUESS, PENALTY_REDRAW
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


def test_guess_start(client, db_session, mocker):
    mocker.patch("src.api.ai_models.random.choice", return_value="cat")

    response = client.post("/guess/start")
    data = response.json()

    assert response.status_code == 200
    assert data["model_id"] == "cat"

    raw = app.dependency_overrides
    from src.api.ai_models import redis_db
    stored = json.loads(redis_db.get("game:testuser"))
    assert stored["word"] == "cat"
    assert stored["attempts"] == 0
    assert stored["redraws"] == 0
    assert stored["score"] == 100


def test_guess_resume_active(client, mocker):
    from src.api.ai_models import redis_db
    redis_db.set("game:testuser", json.dumps({
        "word": "cat",
        "attempts": 0,
        "redraws": 0,
        "score": 80
    }))

    response = client.get("/guess/resume")
    data = response.json()

    assert response.status_code == 200
    assert data["active"] is True
    assert data["model_id"] == "cat"
    assert data["score"] == 80


def test_guess_resume_inactive(client):
    response = client.get("/guess/resume")
    assert response.status_code == 200
    assert response.json() == {"active": False}


def test_guess_try_correct(client, db_session):
    seed_user(db_session)

    from src.api.ai_models import redis_db
    redis_db.set("game:testuser", json.dumps({
        "word": "cat",
        "attempts": 0,
        "redraws": 0,
        "score": 100
    }))

    response = client.post("/guess/try", json={"guess": "cat"})
    data = response.json()

    assert response.status_code == 200
    assert data["correct"] is True
    assert data["score"] == 100
    assert data["word"] == "cat"

    user = db_session.query(User).filter(User.username == "testuser").first()
    assert user.guessing_points == 100
    assert user.guessing_games == 1
    assert user.total_points == 100
    assert user.total_games == 1

    assert redis_db.get("game:testuser") is None


def test_guess_try_wrong(client, db_session):
    seed_user(db_session)

    from src.api.ai_models import redis_db
    redis_db.set("game:testuser", json.dumps({
        "word": "cat",
        "attempts": 0,
        "redraws": 0,
        "score": 100
    }))

    response = client.post("/guess/try", json={"guess": "dog"})
    data = response.json()

    assert response.status_code == 200
    assert data["correct"] is False
    assert data["score"] == 100 - PENALTY_GUESS

    stored = json.loads(redis_db.get("game:testuser"))
    assert stored["attempts"] == 1
    assert stored["score"] == 100 - PENALTY_GUESS


def test_guess_try_no_active_game(client):
    response = client.post("/guess/try", json={"guess": "cat"})
    data = response.json()

    assert response.status_code == 200
    assert data["score"] == 0
    assert "partida" in data["error"].lower()


def test_guess_redraw_penalty_applied_on_third_redraw(client):
    from src.api.ai_models import redis_db

    redis_db.set("game:testuser", json.dumps({
        "word": "cat",
        "attempts": 0,
        "redraws": 2,
        "score": 15
    }))

    response = client.post("/guess/redraw")
    data = response.json()

    assert response.status_code == 200
    assert data["redraw_count"] == 3
    assert data["current_score"] == 10  # max(10, 15 - PENALTY_REDRAW)

    stored = json.loads(redis_db.get("game:testuser"))
    assert stored["redraws"] == 3
    assert stored["score"] == 10


def test_guess_abandon_active(client, db_session):
    seed_user(db_session)

    from src.api.ai_models import redis_db
    redis_db.set("game:testuser", json.dumps({
        "word": "cat",
        "attempts": 0,
        "redraws": 0,
        "score": 100
    }))

    response = client.post("/guess/abandon")
    data = response.json()

    assert response.status_code == 200
    assert data["message"] == "Partida cancelada"
    assert data["word"] == "cat"

    user = db_session.query(User).filter(User.username == "testuser").first()
    assert user.guessing_games == 1
    assert user.total_games == 1
    assert redis_db.get("game:testuser") is None


def test_guess_abandon_no_active_game(client):
    response = client.post("/guess/abandon")
    assert response.status_code == 200
    assert response.json()["message"] == "No había ninguna partida activa"
