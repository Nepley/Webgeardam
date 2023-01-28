import random
import re

def generateVector():
	"""
		Generate an array of 3 Vector
	"""
	vector3 = 1
	vector1 = []
	vector2 = []

	# for i in range(0, 5):
	# 	coin = random.randint(0,1)
	# 	if(coin):
	# 		val = random.randint(1,2)
	# 	else:
	# 		val = 0
	# 	vector1.append(val)

	# for i in range(0, 5):
	# 	coin = random.randint(0,1)
	# 	if(coin):
	# 		val = random.randint(1,2)
	# 	else:
	# 		val = 0
	# 	vector2.append(val)

	for i in range(0, 5):
		val = random.randint(0,2)
		vector1.append(val)

	for i in range(0, 5):
		val = random.randint(0,2)
		vector2.append(val)

	return [vector1, vector2, vector3]

def generateSquare(v1, v2, v3):
	"""
	Generate a random magic square
	"""
	if max(v1)+max(v2)+v3 > 5 or min(v1)+min(v2)+v3 < 1:
		print("Invalid Vectors")
		print("Check 1 : "+str(max(v1)+max(v2)+v3))
		print("Check 2 : "+str(min(v1)+min(v2)+v3))
		return False

	Square = [ [ 0 for i in range(5) ] for j in range(5) ]

	Pos = [random.randint(0,4), random.randint(0,4)]
	Dp = random.choice([[1,2], [-1,2], [1,-2], [-1,-2], [2,1], [2,-1], [-2,1], [-2,-1]])
	Da = [round(Dp[0]/2)*-1, round(Dp[1]/2)*-1]

	for j in range(0,5):
		for i in range(0,5):
			Square[Pos[0]%5][Pos[1]%5] += v1[i]
			Pos[0] += Da[0]
			Pos[1] += Da[1]
		Pos[0] += Dp[0]
		Pos[1] += Dp[1]

	Pos = [random.randint(0,4), random.randint(0,4)]
	Dp = random.choice([[1,2], [-1,2], [1,-2], [-1,-2], [2,1], [2,-1], [-2,1], [-2,-1]])
	Da = [round(Dp[0]/2)*-1, round(Dp[1]/2)*-1]
	
	for j in range(0,5):
		for i in range(0,5):
			Square[Pos[0]%5][Pos[1]%5] += v2[i]
			Pos[0] += Da[0]
			Pos[1] += Da[1]
		Pos[0] += Dp[0]
		Pos[1] += Dp[1]

	for i in range(0,5):
		for j in range(0,5):
			Square[i][j] += v3

	return Square

def chooseObjective(bingo: dict, level: str) -> str:
	"""
		Choose/Generate a random objective from the bingo
	"""
	# We select a random objective of the level
	obj = random.choice(bingo["objectives"][level])

	variableChoosen = []

	# If there one or more variable, we put a corresponding variable
	found = re.findall(r"\[\[.+?\]\]", obj)

	# For each variable found
	if found != []:
		for var in found:
			nameVar = re.sub(r"\[|\]", "", var)

			# We choose a random variable that has not been already be choose (in the case where the variable is written multiple time)
			variable = ""
			maxTry = 10
			tryDone = 0
			found = False
			while(not found or tryDone > maxTry):
				variable = random.choice(bingo["variables"][nameVar])
				if not variable in variableChoosen:
					found = True
					variableChoosen.append(variable)
				maxTry += 1

			# We put the variable into the objective
			obj = obj.replace(var, variable, 1)

	return obj

def generateBingo(bingoData: dict):
	"""
		Generate a bingo grid
	"""
	# We generate the vectors
	vectors = generateVector()

	# We generate the magic square
	grid = generateSquare(vectors[0], vectors[1], vectors[2])

	# We create the bingo grid
	bingo = []
	objectives = []
	for line in grid:
		row = []
		for case in line:
			b = True
			nb_try = 0

			# We check if the objective has alreayd been chosen, if it is, we retry
			while(b):
				obj = chooseObjective(bingoData, str(case))
				if ((obj not in objectives) or nb_try > 1000):
					b = False
				nb_try += 1

			objectives.append(obj)
			row.append(obj)

		bingo.append(row)

	return bingo