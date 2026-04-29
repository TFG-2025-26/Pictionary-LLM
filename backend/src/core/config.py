""" Fichero que contiene las constantes que usarán el resto de ficheros """

# Constantes de configuración de la sesión
JWT_SECRET = "super_secreta_para_el_tfg"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

# Información de SQLite
URL_BD_SQLITE = "sqlite:///./pictionary.db"

# Información de Redis
URL_REDIS = "localhost"
PORT_REDIS = 6379
