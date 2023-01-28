from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

import json
import requests
import random

router = APIRouter(
	prefix="/bingo",
	tags=["Bingo"],
	responses={404: {"description": "Not found"}},
)

templates = Jinja2Templates(directory="app/templates/")

@router.get("/", response_class=HTMLResponse)
async def index(request: Request):
	# We retrieve the configuration
	with open("app/config.json") as  f:
		config = json.load(f)

	# We retrieve the Bingo available
	bingoList = requests.get(config['url_api']+"bingo/list", params={"id": config["bingo"]}).json()

	return templates.TemplateResponse("bingoIndex.html", {"request": request, "bingoList": bingoList})

@router.get("/play", response_class=HTMLResponse)
async def play(request: Request, action: str, bingo: str = "", code: str = ""):
	# We retrieve the configuration
	with open("app/config.json") as  f:
		config = json.load(f)

	role = "SOLO"
	if action != "":
		if action == "HOST":
			role = "HOST"

		if action == "JOIN":
			role = "PLAYER"

	return templates.TemplateResponse("bingoPlay.html", {"request": request, "bingo": bingo, "role": role, "code": code})

@router.get("/edit/{bingo}", response_class=HTMLResponse)
async def edit(request: Request, bingo: str, action: str = "", authKey: str = "", bingoUpdated: str = ""):
	# We retrieve the configuration
	with open("app/config.json") as  f:
		config = json.load(f)

	# We keep the bingo name
	bingoName = bingo

	# We retrieve the bingo data
	bingo = requests.get(config['url_api']+"bingo", params={"id": config["bingo"], "name": bingo}).json()

	msgs = []

	actionDone = False
	if(action != ""):
		if action == "EDIT":
			if bingo != "" and authKey != "":
				# We change the json to a dictonnary
				bingoData = json.loads(bingoUpdated)

				# We update the bingo objectives
				for i in range (1, 6):
					request_bingo = requests.post(config['url_api']+"bingo/objective", params={"id": config["bingo"], "authKey": authKey, "level": i, "id_bingo": bingo["id"]}, json=bingoData["objectives"][str(i)])

				# We update the bingo variables
				variablesListCurrent = bingo['variables'].keys()
				variablesListNew = bingoData['variables'].keys()
				variabletoDelete = list(set(variablesListCurrent) - set(variablesListNew))

				# We add / update variables
				for name, variables in bingoData["variables"].items():
					request_bingo = requests.post(config['url_api']+"bingo/variables", params={"id": config["bingo"], "authKey": authKey, "variable": name, "id_bingo": bingo["id"]}, json=variables)

				# We delete variables that doesn't exist anymore
				for variable in variabletoDelete:
					request_bingo = requests.delete(config['url_api']+"bingo/variables", params={"id": config["bingo"], "authKey": authKey, "variable": variable, "id_bingo": bingo["id"]})


				msgs.append({"type": "SUCCESS", "message": "Bingo updated"})
				actionDone = True
			else:
				msgs.append({"type": "ERROR", "message": "One of the parameter is invalid"})
		
		if action == "ADD":
			if bingo != "" and authKey != "":
				# We add the bingo
				request_bingo = requests.put(config['url_api']+"bingo", params={"id": config["bingo"], "authKey": authKey, "name": bingoName})

				msgs.append({"type": "SUCCESS", "message": "Bingo Added"})
				actionDone = True
			else:
				msgs.append({"type": "ERROR", "message": "One of the parameter is invalid"})
		
	if actionDone:
		bingo = requests.get(config['url_api']+"bingo", params={"id": config["bingo"], "name": bingo["name"]}).json()

	return templates.TemplateResponse("bingoEdit.html", {"request": request, "bingo": bingo, "msgs": msgs})