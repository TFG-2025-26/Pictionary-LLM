""" ai_models.py - Fichero que contiene todas las rutas del backend
que manejan la interacción entre usuario y modelo para adivinar o dibujar """

from pathlib import Path
from fastapi import APIRouter, UploadFile, File
from src.core.ai_service import AIGuesser # pylint: disable=import-error

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent
GUESSING_MODEL_PATH = BASE_DIR.parent / "src" / "api" / "ai_models" / "guessing"
GUESSING_MODEL_PATH_STR = str(GUESSING_MODEL_PATH.absolute())

ai_engine = AIGuesser(GUESSING_MODEL_PATH_STR)

@router.post("/guess")
async def guess_drawing(file: UploadFile = File(...)):
    """ Ruta que maneja la interacción entre el usuario y el modelo de adivinación,
    al que se le pasa la imagen dibujada en el lienzo, y devuelve una etiqueta """
    try:
        contents = await file.read()
        label = ai_engine.guess(contents)
        return {"label": label}
    except Exception as e: # pylint: disable=broad-exception-caught
        print(e)
        return {"label": "Error", "details": str(e)}
