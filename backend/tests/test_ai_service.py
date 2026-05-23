from io import BytesIO
from pathlib import Path

from PIL import Image

# pylint: disable=import-error
from src.core.ai_service import AIGuesser


MODEL_DIR = (
    Path(__file__).resolve().parent.parent
    / "src"
    / "api"
    / "ai_models"
    / "guessing"
)


def test_model_loads_real():
    """
    Comprueba que el modelo real carga correctamente.
    """

    guesser = AIGuesser(str(MODEL_DIR))

    assert guesser is not None
    assert guesser.model is not None
    assert guesser.processor is not None


def test_real_model_predicts_without_crashing():
    """
    Comprueba que una inferencia real funciona y
    devuelve texto sin lanzar excepción.
    """

    guesser = AIGuesser(str(MODEL_DIR))

    img = Image.new("RGB", (64, 64), "white")

    buffer = BytesIO()
    img.save(buffer, format="PNG")

    result = guesser.guess(buffer.getvalue())

    assert isinstance(result, str)
    assert len(result) > 0


def test_real_model_handles_invalid_input():
    """
    Comprueba que entradas corruptas no rompen el backend.
    """

    guesser = AIGuesser(str(MODEL_DIR))

    result = guesser.guess(b"esto_no_es_una_imagen")

    assert result == "Analizando..."
