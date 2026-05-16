""" ai_models.py - Fichero que contiene todas las rutas del backend
que manejan la interacción entre usuario y modelo para adivinar o dibujar """

# pylint: disable=import-error
import json
import random
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from src.core.db_sqlite import get_sql_db
from src.core.models import User
from src.api.auth import get_current_user
from src.core.ai_service import AIGuesser
from src.core.db_redis import redis_db
from src.core.config import PENALTY_GUESS, PENALTY_REDRAW, GUESSING_MODEL_LIST, DRAWING_MODEL_LIST

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent
GUESSING_MODEL_PATH = BASE_DIR.parent / "src" / "api" / "ai_models" / "guessing"
GUESSING_MODEL_PATH_STR = str(GUESSING_MODEL_PATH.absolute())

ai_engine = AIGuesser(GUESSING_MODEL_PATH_STR)

# Rutas de manejo del modo de juego en el
# que el usuario dibuja y la IA adivina

@router.post("/draw/start")
async def start_drawing_game(payload: dict = Depends(get_current_user)):
    """ Inicializa una partida donde el usuario dibuja """
    username = payload.get("sub")
    target_word = random.choice(GUESSING_MODEL_LIST)

    game_state = {
        "word": target_word,
        "score": 100
    }

    redis_db.setex(f"game:draw:{username}", 600, json.dumps(game_state))
    return {"word": target_word}


@router.post("/draw/check")
async def check_drawing(file: UploadFile = File(...), payload: dict = Depends(get_current_user), 
                            db: Session = Depends(get_sql_db)):
    """ Recibe el lienzo cada 10s, la IA predice y se evalúa el acierto """

    username = payload.get("sub")
    is_guest = payload.get("is_guest", False)

    data = redis_db.get(f"game:draw:{username}")
    if not data:
        return {"error": "Partida no activa o tiempo expirado", "score": 0}

    state = json.loads(data)

    try:
        contents = await file.read()
        ai_label = ai_engine.guess(contents)
    except Exception as e: # pylint: disable=broad-exception-caught
        return {"error": "Error en el reconocimiento de la IA", "details": str(e)}

    word_normalized = state["word"].lower().replace("_", " ")
    label_normalized = ai_label.lower().strip().replace("_", " ")

    if label_normalized == word_normalized:
        final_score = state["score"]

        if not is_guest:
            user_record = db.query(User).filter(User.username == username).first()
            if user_record:
                user_record.drawing_points += final_score
                user_record.drawing_games += 1

                user_record.total_points += final_score
                user_record.total_games += 1

                db.commit()

        redis_db.delete(f"game:draw:{username}")
        return {"correct": True, "label": ai_label, "score": final_score}

    state["score"] = max(10, state["score"] - 10)
    redis_db.set(f"game:draw:{username}", json.dumps(state))

    return {"correct": False, "label": ai_label, "score": state["score"]}


@router.get("/draw/resume")
async def resume_drawing_game(payload: dict = Depends(get_current_user)):
    """ Permite al usuario continuar si refresca la página (F5) """
    username = payload.get("sub")
    data = redis_db.get(f"game:draw:{username}")

    if not data:
        return {"active": False}

    state = json.loads(data)
    return {"active": True, "word": state["word"], "score": state["score"]}


@router.post("/draw/abandon")
async def abandon_drawing_game(payload: dict = Depends(get_current_user),
                               db: Session = Depends(get_sql_db)):
    """ Limpia la partida si el usuario se rinde """
    username = payload.get("sub")
    is_guest = payload.get("is_guest", False)

    data = redis_db.get(f"game:draw:{username}")
    if data and not is_guest:
        user_record = db.query(User).filter(User.username == username).first()
        if user_record:
            user_record.drawing_games += 1
            user_record.total_games += 1
            db.commit()

    redis_db.delete(f"game:draw:{username}")
    return {"message": "Te has rendido"}







# Rutas de manejo del modo de juego en el
# que el usuario adivina y la IA dibuja

@router.post("/guess/start")
async def start_game(payload: dict = Depends(get_current_user)):
    """ Ruta que genera una nueva partida para el usuario """

    user_id = payload.get("sub")
    word = random.choice(DRAWING_MODEL_LIST)

    game_state = {
        "word": word,
        "attempts": 0,
        "redraws": 0,
        "score": 100
    }

    redis_db.setex(f"game:{user_id}", 600, json.dumps(game_state))

    return {"model_id": word}


@router.post("/guess/try")
async def check_guess(guess_data: dict, payload: dict = Depends(get_current_user),
                       db: Session = Depends(get_sql_db)):
    """ Ruta que gestiona los intentos del usuario en la partida actual """

    user_id = payload.get("sub")
    is_guest = payload.get("is_guest", False)
    guess = guess_data.get("guess", "")

    data = redis_db.get(f"game:{user_id}")

    if not data:
        return {"error": "¡Se acabó el tiempo o la partida no existe!", "score": 0}

    state = json.loads(data)
    word_real = state["word"].lower()

    word_normalized = word_real.replace("_", " ")
    guess_normalized = guess.replace("_", " ")

    # Acierto
    if guess_normalized == word_normalized:
        final_score = state["score"]

        if not is_guest:
            user_record = db.query(User).filter(User.username == user_id).first()
            if user_record:

                user_record.guessing_points += final_score
                user_record.guessing_games += 1

                user_record.total_points += final_score
                user_record.total_games += 1

                db.commit()

        redis_db.delete(f"game:{user_id}")
        return {"correct": True, "score": final_score, "word": state["word"]}

    # Fallo
    state["attempts"] += 1
    state["score"] = max(10, state["score"] - PENALTY_GUESS)
    redis_db.set(f"game:{user_id}", json.dumps(state))

    return {"correct": False, "score": state["score"]}

@router.post("/guess/redraw")
async def redraw_penalty(payload: dict = Depends(get_current_user)):
    """ Ruta que gestiona las indicaciones del usuario de generar un nuevo
    dibujo y penalizarle por ello en caso de que sea necesario """

    user_id = payload.get("sub")
    data = redis_db.get(f"game:{user_id}")
    state = json.loads(data)

    state["redraws"] += 1
    if state["redraws"] > 2:
        state["score"] = max(10, state["score"] - PENALTY_REDRAW)

    redis_db.set(f"game:{user_id}", json.dumps(state))
    return {"redraw_count": state["redraws"], "current_score": state["score"]}

@router.get("/guess/resume")
async def resume_game(payload: dict = Depends(get_current_user)):
    """ Ruta que se encarga de retomar la partida existente del usuario si
    por alguna razón es necesario recargar la página (por ejemplo, ante un
    error de conexión), sin tener que perder la partida en curso """

    user_id = payload.get("sub")
    data = redis_db.get(f"game:{user_id}")

    if not data:
        return {"active": False}

    state = json.loads(data)

    return {
        "active": True,
        "model_id": state["word"],
        "score": state["score"],
        "message": "¡Partida recuperada! Sigue intentándolo."
    }

@router.post("/guess/abandon")
async def abandon_game(payload: dict = Depends(get_current_user),db: Session = Depends(get_sql_db)):
    """ Ruta que gestiona el abandono de la partida por parte del usuario, ya que si no,
    si el usuario abandona la ruta, la partida no muere instantáneamente en caso de que 
    haya sido por un error de conexión, así especifica explícitamente que quiere rendirse """

    username = payload.get("sub")
    is_guest = payload.get("is_guest", False)

    data = redis_db.get(f"game:{username}")
    if not data:
        return {"message": "No había ninguna partida activa"}

    state = json.loads(data)
    revealed_word = state["word"]

    if not is_guest:
        user_record = db.query(User).filter(User.username == username).first()
        if user_record:
            user_record.guessing_games += 1
            user_record.total_games += 1
            db.commit()

    redis_db.delete(f"game:{username}")

    return {
        "message": "Partida cancelada",
        "word": revealed_word
    }
