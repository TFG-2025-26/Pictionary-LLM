""" db_redis.py - Archivo que contiene la clase para el cliente de redis, para poder
almacenar y extraer información de la BD Redis que gestiona los datos no persistentes
(salas de juego, jugadores en una sala, etc.) """

import redis
from .config import URL_REDIS, PORT_REDIS # pylint: disable=import-error, relative-beyond-top-level

class RedisClient:
    """ Clase que maneja la conexión con la BD de Redis """
    def __init__(self):
        self.client = redis.Redis(
            host = URL_REDIS,
            port = PORT_REDIS,
            db = 0,
            decode_responses=True
        )

    def get_client(self):
        """ función que devuelve la conexión """
        return self.client

redis_db = RedisClient().get_client()
