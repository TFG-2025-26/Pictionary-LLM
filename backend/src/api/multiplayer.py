""" multiplayer.py - Fichero que contiene las rutas para trabajar con el sistema de salas """

from fastapi import APIRouter#, Depends

router = APIRouter()

@router.get("/rooms")
async def get_rooms():
    """asd"""
    # # LLAMADA A REDIS para ver qué salas están activas (Lobby)
    return [{"id": "ROOM_1", "players": 3, "status": "waiting"}]

@router.post("/rooms/create")
async def create_room(): #parametro que recibe: user_id: str = Depends(get_current_user)
    """asd"""
    # # GENERAR CÓDIGO DE SALA (6 letras)
    # # GUARDAR EN REDIS el estado inicial: {"status": "lobby", "players": []}
    return {"room_code": "XJ42LS"}

@router.get("/rooms/{room_id}")
async def get_room_details(): #parametro que recibe: room_id: str
    """asd"""
    # # CONSULTAR EN REDIS los detalles de la sala específica
    return {"room_details": "holakase"}
