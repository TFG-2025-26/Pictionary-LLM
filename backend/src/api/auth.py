""" auth.py - Fichero que almacena las funciones de autenticación de la aplicación """

from fastapi import APIRouter #, HTTPException
# from pydantic import BaseModel

router = APIRouter()

@router.post("/register")
async def register(data: dict):
    """asd"""
    # # LLAMADA A SQLITE para crear usuario permanente
    # # LLAMADA A SECURITY para hashear password
    return {"message": "Usuario creado"}

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
