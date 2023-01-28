from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi_socketio import SocketManager

from .routers import syncPlayer
from .routers import quotation
from .routers import bingo

from .Functions.bingo import *
import requests
import json

app = FastAPI()
socket_manager = SocketManager(app=app)

app.mount("/static", StaticFiles(directory="app/static/"), name="static")
templates = Jinja2Templates(directory="app/templates/")

app.include_router(syncPlayer.router)
app.include_router(quotation.router)
app.include_router(bingo.router)

@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse('index.html', {"request": request})

## Socket
@app.sio.on('player')
async def handle_player_event(sid, data, **kwargs):
    if("room" in data):
        await app.sio.emit('player', data, room=data["room"])

@app.sio.on('roll')
async def handle_roll_event(sid, data, **kwargs):
    if("room" in data):
        await app.sio.emit('roll', data, room=data["room"])

@app.sio.on('join_room')
async def handle_room_creation(sid, room, **kwargs):
    app.sio.enter_room(sid, room)

@app.sio.on('leave_room')
async def handle_room_creation(sid, room, **kwargs):
    app.sio.leave_room(sid, room)

## Socket - Bingo
@app.sio.on('bingo')
async def handle_bingo_event(sid, data, **kwargs):
    if("room" in data):
        if data["action"] == "GENERATE":
            # We retrieve the configuration
            with open("app/config.json") as  f:
                config = json.load(f)
            
            # We retrieve the bingo data
            bingoData = requests.get(config['url_api']+"bingo", params={"id": config["bingo"], "name": data['bingo']}).json()
            bingoGrid = generateBingo(bingoData)

            # We send the data
            result = {"action": "GENERATE", "bingo": bingoGrid}
            await app.sio.emit('bingo', result, room=data["room"])

        elif data["action"] == "ADD_PLAYER" or data["action"] == "ASK_SYNC" or data["action"] == "SYNC" or data["action"] == "ADD_COLOR"  or data["action"] == "REMOVE_COLOR" or data["action"] == "DELETE_PLAYER":
            # We just return the data
            await app.sio.emit('bingo', data, room=data["room"])
