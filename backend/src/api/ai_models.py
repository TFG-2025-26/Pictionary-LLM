"""asd"""

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
    try:
        contents = await file.read()
        label = ai_engine.guess(contents)
        return {"label": label}
    except Exception as e:
        print(e)
        return {"label": "Error", "details": str(e)}
