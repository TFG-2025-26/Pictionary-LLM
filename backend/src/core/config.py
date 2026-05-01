""" Fichero que contiene las constantes que usará el resto de la aplicación """

# Constantes de configuración de la sesión
JWT_SECRET = "clave_secreta_del_tfg"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120 # 2h

GUEST_TOKEN_EXPIRE_SECONDS = 300 #6 1h

# Información de SQLite
URL_BD_SQLITE = "sqlite:///./pictionary.db"

# Información de Redis
URL_REDIS = "localhost"
PORT_REDIS = 6379
