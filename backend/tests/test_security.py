from src.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
)


def test_password_hash_and_verify():
    password = "1234"
    hashed = get_password_hash(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrong", hashed) is False


def test_create_and_decode_token():
    token = create_access_token({"sub": "alonso", "id": 7})
    payload = decode_access_token(token)

    assert payload is not None
    assert payload["sub"] == "alonso"
    assert payload["id"] == 7


def test_decode_invalid_token_returns_none():
    payload = decode_access_token("esto.no.es.un.jwt")
    assert payload is None
