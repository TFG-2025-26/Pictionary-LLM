""" auth.py - Fichero que almacena las funciones de autenticación de la aplicación """

# pylint: disable=import-error, relative-beyond-top-level
import uuid
from src.core.db_sqlite import get_sql_db
from src.core.db_redis import redis_db
from src.core.models import User, Stats
from src.core.security import get_password_hash, verify_password, create_access_token
from src.core.config import GUEST_TOKEN_EXPIRE_SECONDS
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

router = APIRouter()

class UserRegister(BaseModel):
    """ Clase para manejar los datos de registro """
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    """ Clase para dar forma a los datos de login """
    username: str
    password: str

# configuracion de ejemplo de una ruta
# @router.get("/register")
# async def register_get():
#     """asd"""
#     return {"mensaje": "de prueba"}

# @router.post("/register")
# async def register(data: dict):
#     """asd"""
#     # # LLAMADA A SQLITE para crear usuario permanente
#     # # LLAMADA A argon2 para hashear password
#     return {"message": "Usuario creado"}

@router.post("/register")
async def register(data: UserRegister, db: Session = Depends(get_sql_db)):
    """ Ruta que maneja el registro de un nuevo usuario """

    # 1. Comprobar disponibilidad de nombre de usuario
    user_exists = db.query(User).filter(User.username == data.username).first()
    if user_exists:
        # Este "detail" es el que aparecerá en el setError de React
        raise HTTPException(status_code=400, detail="Este nombre de usuario ya está en uso")

    # 2. Comprobar disponibilidad de email
    email_exists = db.query(User).filter(User.email == data.email).first()
    if email_exists:
        raise HTTPException(status_code=400, detail="Este correo electrónico ya tiene una cuenta")

    # 3. Crear usuario con Argon2
    try:
        new_user = User(
            username=data.username,
            email=data.email,
            password_hash=get_password_hash(data.password)
        )
        db.add(new_user)
        db.flush()

        # Crear stats iniciales
        db.add(Stats(user_id=new_user.id))
        db.commit()

        return {"status": "success", "message": "Usuario creado correctamente"}

    except Exception as e:
        db.rollback()
        print(f"Error en registro: {e}")
        raise HTTPException(status_code=500, detail="Error crítico en la base de datos") # pylint: disable=raise-missing-from


@router.post("/login")
async def login(data: UserLogin, db: Session = Depends(get_sql_db)):
    """ Ruta que maneja el login de los usuarios """

    # 1. Buscar al usuario por nombre de usuario
    user = db.query(User).filter(User.username == data.username).first()

    # 2. Si el usuario no existe, lanzamos error
    # Nota: Por seguridad, se usa el mismo mensaje para "usuario no existe"
    # y "pass incorrecta" para no dar pistas a atacantes.
    if not user:
        raise HTTPException(status_code=401, detail="El nombre de usuario no existe")

    # 3. Verificar si el usuario es un Guest
    # if user.password_hash is None:
    #      raise HTTPException(status_code=400, detail="Esta cuenta es de invitado")
    # detail="Esta cuenta no tiene contraseña (acceso como invitado)

    # 4. Comparar contraseñas con Argon2
    is_valid = verify_password(data.password, user.password_hash)

    if not is_valid:
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    access_token = create_access_token(data={"sub": user.username, "id": user.id})

    # 5. Si todo está bien, devolvemos la información que el frontend espera
    return {
        "status": "success",
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }

@router.post("/login_guest")
async def login_guest():
    """ Ruta que maneja la creación de una cuenta guest temporal """

    # 1. Generar identidad temporal
    guest_id = str(uuid.uuid4())[:8]
    guest_username = f"Guest_{guest_id}"

    # 2. Guardar en Redis (opcional: ponerle un tiempo de vida de 24h)
    # Clave: "online_guest:Guest_1234", Valor: "active"
    # redis_db.setex(f"online_guest:{guest_username}", GUEST_TOKEN_EXPIRE_SECONDS, "active")

    # 3. Crear el JWT (añadimos 'is_guest' para diferenciarlo en el frontend)
    access_token = create_access_token(
        data={"sub": guest_username, "id": guest_id, "is_guest": True}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": guest_username
    }





@router.get("/show")
async def show_users(db: Session = Depends(get_sql_db)):
    """ ruta de prueba para comprobar que los usuarios se registran bien """
    users = db.query(User).all()
    # Devolvemos una lista de diccionarios
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "created_at": u.created_at,
            "stats": {
                "games": u.stats.total_games if u.stats else 0,
                "wins": u.stats.total_wins if u.stats else 0
            }
        } for u in users
    ]
