""" security.py - Fichero que maneja las funciones relacionadas con las contraseñas """

# pylint: disable=relative-beyond-top-level
from datetime import datetime, timedelta
from typing import Optional
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .config import JWT_SECRET, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


# Sección de código de Argon2

ph = PasswordHasher()

def get_password_hash(password: str) -> str:
    """ función para hashear (con sal) una contraseña """
    return ph.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """ función para verificar si la contraseña dada por
    el usuario coincide con la almacenada en la BD """
    try:
        return ph.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False


# Sección de código de JWT

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crea un token JWT firmado"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    """Decodifica el token y verifica si es válido o ha expirado"""
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return decoded_token if decoded_token["exp"] >= datetime.utcnow().timestamp() else None
    except: # pylint: disable=bare-except
        return None

# Esto le dice a FastAPI que busque el token en el header "Authorization"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login") 

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Esta función actúa como filtro. Si el token no es válido,
    el usuario ni siquiera llega a ejecutar la lógica de la ruta.
    """
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión inválida o expirada",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload