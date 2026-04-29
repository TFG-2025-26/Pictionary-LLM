""" security.py - Fichero que maneja las funciones relacionadas con las contraseñas """

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

ph = PasswordHasher()

def get_password_hash(password: str) -> str:
    # Argon2 genera automáticamente el salt y lo incluye en el hash resultante
    return ph.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # ph.verify devuelve True si coincide, o lanza una excepción si no
        return ph.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False
