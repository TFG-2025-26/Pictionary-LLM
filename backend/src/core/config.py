""" Fichero que contiene las constantes que usará el resto de la aplicación """

# Constantes de configuración de la sesión
JWT_SECRET = "2119dd9e4320bb54dce5d5bb45244850007ffafed143d13a4ea45440511729d6"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 360 # 6h

GUEST_TOKEN_EXPIRE_SECONDS = 7200 # 2h

# Información de SQLite
URL_BD_SQLITE = "sqlite:///./pictionary.db"

# Información de Redis
URL_REDIS = "localhost"
PORT_REDIS = 6379


# Constantes de la lógica de juego
PENALTY_GUESS = 10
PENALTY_REDRAW = 5


# Lista de categorías para el modelo de adivinación
# (en el modo de juego /drawing en el que el usuario es el que dibuja)

GUESSING_MODEL_LIST = ["aircraft_carrier","alarm_clock","ant","anvil","axe","banana","basket", \
                    "bathtub","bear","bee","bird","bottlecap","bus","butterfly","cactus","cake", \
                    "calculator","camel","camera","canle","cannon","canoe","carrot","castle", \
                    "cat","ceiling_fan","cell_phone","cello","chair","chandelier","coffee_cup", \
                    "compass","computer","cow","crab","crocodile","cruise_ship","dog","dolphin", \
                    "dragon","drums","duck","dumbbell","elephant","eyeglasses","feather","fence", \
                    "fish","flamingo","flower","foot","fork","frog","giraffe","grapes","guitar", \
                    "hammer","helicopter","helmet","horse","kangaroo","lantern","laptop","leaf", \
                    "lion","lipstick","lobster","microphone","monkey","mosquito","mouse","mug", \
                    "mushroom","onion","panda","peanut","pear","peas","pencil","penguin","pig", \
                    "pillow","pineapple","potato","power_outlet","purse","rabbit","raccoon", \
                    "rhinoceros","rifle","saxophone","screwdriver","sea_turtle","see_saw","sheep", \
                    "shoe","skateboard","snake","speedboat","spider","squirrel","strawberry", \
                    "streetlight","submarine","swan","table","teapot","teddy_bear","television", \
                    "tiger","train","truck","umbrella","vase","watermelon","whale","zebra"]

# Lista de categorías para el modelo de dibujo 
# (en el modo de juego /guessing en el que el usuario es el que adivina)
DRAWING_MODEL_LIST = ["alarm_clock","ambulance","angel","ant","backpack","barn","basket","bear","bee", \
            "beeflower","bicycle","bird","book","brain","bridge","bulldozer","bus","butterfly", \
            "cactus","calendar","castle","cat","chair","couch","crab","cruise_ship","diving_board", \
            "dog","dolphin","duck","elephant","eye","face","fan","fire_hydrant","firetruck", \
            "flamingo","flower","frog","garden","hand","hedgeberry","hedgehog","helicopter", \
            "kangaroo","key","lantern","lighthouse","lion","lobster","map","mermaid","monkey", \
            "mosquito","octopus","owl","paintbrush","palm_tree","parrot","passport","peas", \
            "penguin","pig","pineapple","pool","postcard","power_outlet","rabbit","radio","rain", \
            "rhinoceros","rifle","roller_coaster","sandwich","scorpion","sea_turtle","sheep", \
            "skull","snail","snowflake","speedboat","spider","squirrel","steak","stove","strawberry", \
            "swan","tiger","toothbrush","toothpaste","tractor","trombone","truck","whale","windmill","yoga"]
