""" main.py - El fichero principal que arranca el backend de la aplicación y
hace las llamadas pertinentes a los diferentes componentes de la misma """

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.api import auth, game_api
# from src.game_sockets import room_manager


# --- CONFIGURACIÓN DE LOGS ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("tfg_pictionary.log"), logging.StreamHandler()]
)

logger = logging.getLogger(__name__)

# Ejemplo de uso de logs
# @app.on_event("startup")
# async def startup_event():
@asynccontextmanager
async def lifespan():
    """ Función que ejecuta código al encendido y apagado del backend """

    logger.info("El servidor del TFG se ha iniciado correctamente.")
    yield
    logger.info("El servidor del TFG se está apagando")

app = FastAPI(lifespan=lifespan)

app.include_router(auth.router, prefix="/api/auth")
app.include_router(game_api.router, prefix="/api/game")

# Montar Sockets...
