""" main.py - El fichero principal que arranca el backend de la aplicación y
hace las llamadas pertinentes a los diferentes componentes de la misma """

import logging
from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api import auth, game_api
from src.game_sockets import room_manager


# --- CONFIGURACIÓN DE LOGS ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("tfg_pictionary.log"), logging.StreamHandler()]
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """ Función que ejecuta código al encendido y apagado del backend """

    logger.info("El servidor del TFG se ha iniciado correctamente.")
    yield
    logger.info("El servidor del TFG se está apagando")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(game_api.router, prefix="/api/game", tags=["Lógica de Juego"])

# Montar Sockets...

# room_manager.init_sockets(app)

@app.get("/")
async def root():
    return {"message": "Servidor del TFG funcionando"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
