import socketio

# --- CONFIGURACIÓN DEL SERVIDOR DE SOCKETS ---
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

@sio.event
async def connect(sid, environ):
    print(f"Usuario conectado: {sid}")

@sio.on("send_drawing")
async def handle_drawing(sid, data):
    # --- AQUÍ LÓGICA PARA REENVIAR EL DIBUJO A OTROS ---
    # # AQUÍ CONSULTA A REDIS para ver en qué sala está el usuario
    room = "sala_1" 
    await sio.emit("receive_drawing", data, room=room, skip_sid=sid)

@sio.on("guess_word")
async def handle_guess(sid, data):
    # --- AQUÍ COMPROBACIÓN DE SI HA ACERTADO ---
    # # AQUÍ LLAMADA A FUNCIÓN DE IA si es necesario
    pass