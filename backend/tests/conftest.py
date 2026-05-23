
# pylint: disable=import-error

from __future__ import annotations

from fnmatch import fnmatch
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine as real_create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


class FakeRedis:
    def __init__(self):
        self.store = {}

    def get(self, key):
        return self.store.get(key)

    def set(self, key, value):
        self.store[key] = value
        return True

    def setex(self, key, _seconds, value):
        self.store[key] = value
        return True

    def delete(self, key):
        return 1 if self.store.pop(key, None) is not None else 0

    def keys(self, pattern="*"):
        return [k for k in self.store.keys() if fnmatch(k, pattern)]


fake_redis = FakeRedis()


test_engine = real_create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


with patch("sqlalchemy.create_engine", return_value=test_engine), \
     patch("redis.Redis", return_value=fake_redis):

    import main
    from main import app


from src.api.auth import get_current_user as api_get_current_user
from src.core.db_sqlite import Base, get_sql_db
from src.core.models import User
from src.core.security import get_password_hash


TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine
)


def fake_current_user_default():
    return {
        "sub": "testuser",
        "id": "1",
        "is_guest": False
    }


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def clean_state():

    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    fake_redis.store.clear()

    app.dependency_overrides[get_sql_db] = override_get_db
    app.dependency_overrides[
        api_get_current_user
    ] = fake_current_user_default

    yield

    fake_redis.store.clear()
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def make_user(db_session):
    def _make_user(
        username="testuser",
        email="test@test.com",
        password="1234",
        **kwargs
    ):
        user = User(
            username=username,
            email=email,
            password_hash=get_password_hash(password),
            **kwargs
        )

        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        return user

    return _make_user
