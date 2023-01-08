from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

router = APIRouter(
    prefix="/syncPlayer",
    tags=["syncPlayer"],
    responses={404: {"description": "Not found"}},
)

templates = Jinja2Templates(directory="app/templates/")

@router.get("/playlisteditor", response_class=HTMLResponse)
async def playlistEditor(request: Request):
    return templates.TemplateResponse('playlistEditor.html', {"request": request})

@router.get("/{room}", response_class=HTMLResponse)
async def player(request: Request, room: str):
    return templates.TemplateResponse("playerRoller.html", {"request": request, "room": room})

@router.get("/roll/{room}", response_class=HTMLResponse)
async def rollDice(request: Request, room: str):
    return templates.TemplateResponse("rollPage.html", {"request": request, "room": room})