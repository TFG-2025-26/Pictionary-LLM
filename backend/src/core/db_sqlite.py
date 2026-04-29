""" db_sqlite.py - Fichero que maneja la conexión y los métodos para conectar,
almacenar y consultar información de la BD persistente de SQLite """

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .config import URL_BD_SQLITE # pylint: disable=import-error, relative-beyond-top-level

engine = create_engine(URL_BD_SQLITE, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_sql_db():
    """ Dependencia para las rutas de FastAPI """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
