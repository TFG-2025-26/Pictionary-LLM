""" auth.py - Fichero que almacena las funciones de autenticación de la aplicación """

from src.core.db_sqlite import get_sql_db # pylint: disable=import-error, relative-beyond-top-level
from src.core.db_redis import redis_db # pylint: disable=import-error, relative-beyond-top-level
from src.core.models import User, Stats # pylint: disable=import-error, relative-beyond-top-level
from src.core.security import get_password_hash # pylint: disable=import-error, relative-beyond-top-level
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

router = APIRouter()

class UserRegister(BaseModel):
    username: str
    email: EmailStr
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
        # Log del error para ti (en el archivo de log que configuramos)
        print(f"Error en registro: {e}") 
        raise HTTPException(status_code=500, detail="Error crítico en la base de datos")




@router.post("/login")
async def login(data: dict):
    """asd"""
    # # LLAMADA A SQLITE para verificar credenciales
    # # GENERAR JWT
    return {"token": "jwt_token_aqui"}

@router.post("/guest")
async def login_guest():
    """asd"""
    # # GENERAR NOMBRE ALEATORIO (ej. "Pintor_Rápido_12")
    # # CREAR USUARIO TEMPORAL EN SQLITE
    # # GENERAR JWT
    return {"token": "jwt_guest_token", "username": "Pintor_Rápido_12"}




@router.get("/show")
async def show_users(db: Session = Depends(get_sql_db)):
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