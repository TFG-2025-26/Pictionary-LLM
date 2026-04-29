""" Fichero que contiene la estructura de las tablas de la BD persistente de SQLite """

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey #, Boolean
from sqlalchemy.orm import relationship #, declarative_base
from .db_sqlite import Base # pylint: disable=relative-beyond-top-level

class User(Base):
    """ Clase usuario, almacena los datos de los 
    usuarios que se registren en la aplicación """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    stats = relationship("Stats", back_populates="user", uselist=False, cascade="all, delete-orphan")
    # matches_won = relationship("MatchHistory", back_populates="winner")

class Stats(Base):
    """ Estadísticas del jugador. Separado de la clase User 
    para mantener la estructura limpia y clara """

    __tablename__ = "stats"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    total_games = Column(Integer, default=0)
    total_wins = Column(Integer, default=0)
    total_time_played = Column(Integer, default=0) # Almacenado en segundos
    high_score = Column(Integer, default=0)

    # Relación inversa
    user = relationship("User", back_populates="stats")

class MatchHistory(Base):
    """ Historial de partidas finalizadas """

    __tablename__ = "match_history"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    room_code = Column(String, index=True)
    
    winner_id = Column(Integer, ForeignKey("users.id"))
    
    # winner = relationship("User", back_populates="matches_won")
