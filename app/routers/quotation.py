from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

import json
import requests
import random

router = APIRouter(
	prefix="/quote",
	tags=["Quote"],
	responses={404: {"description": "Not found"}},
)

templates = Jinja2Templates(directory="app/templates/")

@router.get("/manage/{id_quote}", response_class=HTMLResponse)
async def manageQuote(request: Request, id_quote: str = "", authKey: str = "", action: str = "", id: str = "", author: str = "", date: str = "", quote: str = ""):

	msgs = []

	# We retrieve the configuration
	with open("app/config.json") as  f:
		config = json.load(f)

	print(request.query_params)
	# If a request post is made
	if(action != ""):
		if action == "MODIFY_QUOTE":
			if id != "" and author != "" and date != "" and quote != "" and authKey != "":

				# We trie to modify the quote
				# request_quote = requests.get(config['url_api']+"quote", params={"id": id_quote})

				msgs.append({"type": "SUCCESS", "message": "Not implemented :/"})
			else:
				msgs.append({"type": "ERROR", "message": "One of the parameter is invalid"})
		elif action == "DELETE_QUOTE":
			if id != "" and authKey != "":
				request_quote = requests.delete(config['url_api']+"quote", params={"id": id_quote, "id_quote": id, "authKey": authKey})

				msgs.append({"type": "SUCCESS", "message": "Quote deleted"})
			else:
				msgs.append({"type": "ERROR", "message": "One of the parameter is invalid"})

	# We retrieve the quote list
	if(id_quote != ""):
		request_quote = requests.get(config['url_api']+"quote/all", params={"id": id_quote})
		quotes = request_quote.json()
	else:
		quotes = []

	return templates.TemplateResponse('manageQuote.html', {"request": request, "msgs": msgs, "quotes": quotes})

@router.get("/", response_class=HTMLResponse)
async def randomQuote(request: Request):
	# We retrieve the configuration
	with open("app/config.json") as  f:
		config = json.load(f)
	
	quotes = []
	# For each quote list, we take all quote
	for quoteList in config['random_quote_list']:
		request_quote = requests.get(config['url_api']+"quote/all", params={"id": quoteList})
		quotes += request_quote.json()['quote_list']

	# We take one quote
	quote = random.choice(quotes)

	# We count the number of quote
	nb_quote = len(quotes)

	return templates.TemplateResponse("randomQuote.html", {"request": request, "nb_quote": nb_quote, "quote": quote})
