""" Fichero que contiene la estructura de las tablas de la BD persistente de SQLite """

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from .db_sqlite import Base # pylint: disable=relative-beyond-top-level

# pylint: disable=too-few-public-methods

class User(Base):
    """ 
    Clase usuario simplificada para el TFG. 
    Almacena datos de perfil y estadísticas globales en la misma tabla.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    guessing_points = Column(Integer, default=0)
    guessing_games = Column(Integer, default=0)

    drawing_points = Column(Integer, default=0)
    drawing_games = Column(Integer, default=0)

    total_points = Column(Integer, default=0)
    total_games = Column(Integer, default=0)
