class bingoSync
{

	// Variables
	roomCode = "";
	bingo = "";
	role = "";
	grid = "";

	socket = io('', {
		path: '/ws/socket.io'
	});

	constructor(bingo, role, code = "")
	{
		this.role = role;
		this.bingo = bingo;
		if(this.role == "HOST")
		{
			// We generate a code
			code = this.generateCode();

			// We set the code
			this.roomCode = code;

			// We join the room
			this.socket.emit("join_room", code)
		}
		else if(this.role == "PLAYER" && code != "")
		{
			// We set the code
			this.roomCode = code;

			// We join the room
			this.socket.emit("join_room", code)
		}
	}

	createRoom()
	{
		// We generate a code
		code = this.generateCode();

		// We set the code
		setCode(code);

		this.socket = io('', {
			path: '/ws/socket.io'
		});

		// We join the room
		this.socket.emit("join_room", code)
	}

	getBingo()
	{
		return this.bingo;
	}

	getCode()
	{
		return this.roomCode;
	}

	getRole()
	{
		return this.role;
	}

	getGrid()
	{
		return this.grid;
	}

	getSocket()
	{
		return this.socket;
	}

	setCode(code)
	{
		roomCode = code;
	}

	setGrid(grid, full = false)
	{
		let finalGrid = []

		if(full)
		{
			finalGrid = grid;
		}
		else
		{
			// We set the grid in 3 part
			// grid => The Grid with the objectives
			// colors => The colors of the objectives
			// others => Other misc infos on the objectives
			for (let i = 0; i < grid.length; i++)
			{
				let row = []
				for (let j = 0; j < grid[i].length; j++)
				{
					let box = 
					{
						objective: grid[i][j],
						colors: [],
						others: []
					};

					row.push(box);
				}
				finalGrid.push(row);
			}
		}
		this.grid = finalGrid;
	}

	addColor(color, x, y)
	{
		if(!this.grid[x][y]['colors'].includes(color))
		{
			this.grid[x][y]['colors'].push(color);

			// We sort the array in order to have always the same order for the colors
			this.grid[x][y]['colors'].sort();
		}
	}

	deleteColor(color, x, y)
	{
		for (let i = 0; i <this.grid[x][y]['colors'].length; i++)
		{
			if(this.grid[x][y]['colors'][i] == color)
			{
				// We remove it
				this.grid[x][y]['colors'].splice(i, 1);
				break;
			}
		}
	}

	deleteColorAll(color)
	{
		for(let i = 0; i < 5; i++)
		{
			for(let j = 0; j < 5; j++)
			{
				if(this.grid[i][j]['colors'].includes(color))
				{
					this.deleteColor(color, i, j);
				}
			}
		}
	}

	colorExist(color, x, y)
	{
		return this.grid[x][y]['colors'].includes(color);
	}

	generateCode()
	{
		let result = '';
		const characters  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		const charactersLength = characters.length;
		for ( var i = 0; i < 5; i++ ) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}

		return result;
	}
}
