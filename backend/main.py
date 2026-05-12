""" main.py - El fichero principal que arranca el backend de la aplicación y
hace las llamadas pertinentes a los diferentes componentes de la misma """

import logging
from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api import auth, ai_models #, multiplayer
from src.core.db_sqlite import engine, Base
# from src.core import models
# from src.game_sockets import room_manager


# --- CONFIGURACIÓN DE LOGS ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("tfg_pictionary.log"), logging.StreamHandler()]
)

logger = logging.getLogger(__name__)

@asynccontextmanager
# pylint: disable=unused-argument, redefined-outer-name
async def lifespan(app: FastAPI):
    """ Función que ejecuta código al encendido y apagado del backend """

    logger.info("El backend se ha iniciado correctamente.")
    yield
    logger.info("El backend se está apagando")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:5173"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router, tags=["auth"])
app.include_router(ai_models.router, tags=["ai_models"])
# app.include_router(multiplayer.router, tags=["multiplayer"])

# Montar Sockets...

# room_manager.init_sockets(app)

@app.get("/")
async def root():
    """ Ruta de prueba para comprobar que el servidor está en funcionamiento """
    return {"message": "backend funcionando"}

if __name__ == "__main__":
    # uvicorn.run("main:app", host="localhost", port=8000, reload=True)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
