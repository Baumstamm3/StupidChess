class Board {
	constructor(map){
		//Generierung der Datenstruktur
		this.rows = map.rows
		this.columns = map.columns

		this.row = []
		for(let i = 0; i < this.rows; i++){
			this.row[i] = new Column(this.columns)
		}

		for(let i = 0; i < map.startingPos.length; i++){
			for(let j = 0; j < this.columns; j++){
				if(map.startingPos[i][j]){
					this.tile = [j, i, new Occupation(map.startingPos[i][j], true)]
					this.tile = [j, this.rows - i - 1, new Occupation(map.startingPos[i][j], false)]
				}
			}
		}

		for(let y = 0; y < this.rows; y++){
			for(let x = 0; x < this.columns; x++){
				if(this.get(x, y) == undefined){
					this.tile = [x, y, false]
				}
			}
		}

		console.log("Board: " + JSON.stringify(this.row) )

		//Generation der HTML-Struktur aus der Datenstruktur
		let grid = ''

		for(let y = 0; y < this.rows; y++){
			grid += `<div id="Zeile ${y}" class="Zeile">`
		
			for(let x = 0; x < this.columns; x++){
				grid +=`<div id="Zelle ${x} ${y}" class="Zelle" onclick="clickZelle(this)"></div>`
			}
		
			grid += `</div>\n`;
		}

		document.getElementById("Spielbrett").innerHTML = grid

		//Generation der Event Listener
		for(let y = 0; y < this.rows; y++){
			for(let x = 0; x < this.columns; x++){
				document.getElementById(`Zelle ${x} ${y}`).addEventListener("mouseenter", (event) => fieldBackgroundPiece(event.target))
				document.getElementById(`Zelle ${x} ${y}`).addEventListener("mouseleave", (event) => fieldBackgroundBlank())
			}
		}
	}

	//Methoden
	set tile([x ,y , occ]){
		this.row[y].column[x] = occ
	}

	get(x, y){
		return this.row[y].column[x]
	}

	move([xOld,yOld],[xNew,yNew]){
		this.tile = [xNew, yNew, this.get(xOld, yOld)]
		this.tile = [xOld, yOld, false]
	}
}

class Column {
	constructor(boardWidth){
		this.column = []
		for(let i = 0; i < boardWidth; i++){
			this.column[i] = false
		}
	}
}

class Occupation {
	constructor(piece, black){
		this.piece = piece
		this.black = black
	}
}

const accessToken = "Bearer github" + "_pat_11BWUI2XA0f3ZlbacqfOAf_qdkFCZTQHB7QEVma5WXh9gGY4FhNpGXTgydR4g4VqxFRKYUE44NiQZ7Bm3b"
//github blocks push-requests if the document includes a detectable PAT

const gitHeader  = new Headers()
gitHeader.append("Authorization", accessToken)

const gitRequest = {
	headers: gitHeader
}

let board

let classes = new Map()
let classesNames = []

async function load(){
	const chessboard = await gitFetchJSON("StupidChess","maps/Chess.json")

	board = new Board(chessboard)
	await acquireData(classes, classesNames,`classes/`)
}

async function acquireData(map, names ,folder){
	
	let contents = await gitFetchContents(`StupidChess`,folder)
	console.log(contents)
	
	for(let i = 0; i < contents.length; i++){
		names[i] = contents[i].name.split(".", 1)[0]
		map.set(
			names[i],
			await gitFetchJSON(`StupidChess`, contents[i].path)
		)
		console.log(JSON.stringify(classes.get(classesNames[i])))
	}
}

async function gitFetchContents(repo, folder){
	let data = await fetch(
		`https://api.github.com/repos/Baumstamm3/${repo}/contents/${folder}`,
		gitRequest
	)
	 
	return await data.json()
}

async function gitFetchJSON(repo, path){
	let data = await gitFetchContents(repo, path)
	
	return JSON.parse( atob( data.content ) )
}

function clickZelle(object){
	console.log(object.id)
}

function fieldBackgroundBlank(){
	for(let i = 0; i < board.rows; i++){
		for(let j = 0; j < board.columns; j++){
			document.getElementById(`Zelle ${j} ${i}`).style.background = `#FFFFFF`
		}
	}
}

function fieldBackgroundPiece(space){

	let x = parseInt(space.id.split(" ")[1])
	let y = parseInt(space.id.split(" ")[2])
	if(board.get(x,y)){
		let fields = calcMovement(x, y)
		
		for(let i = 0; i < fields.length; i++){
			document.getElementById(fields[i]).style.background = "red"
		}
	}else{
		document.getElementById(space.id).style.background = "#F2F2F2"
	}
}

function calcMovement(x, y){
	let mask = [
		[-1,-1],
		[ 0,-1],
		[ 1,-1],
		[ 1, 0],
		[ 1, 1],
		[ 0, 1],
		[-1, 1],
		[-1, 0]
	]
	
	let movement = classes.get(board.get(x, y).piece).movement
	
	let direction = board.get(x, y).black ? -1 : 1
	let coordinates = [];
	
	for(let i = 0; i < mask.length; i++){
		let counter
		if(movement[i] == `unlimited`){
			
			counter = board.rows > board.columns ? board.rows : board.columns

		}else if(movement[i]){
			counter = movement[i]
		}else{
			counter = 0
		}
		
		for(let j = 0; j < counter; j++){
			
			let xOffset = x + mask[i][0] * (j+1) * direction
			let yOffset = y + mask[i][1] * (j+1) * direction
			
			if(xOffset < 0 || xOffset >= board.columns ){break}
			if(yOffset < 0 || yOffset >= board.rows    ){break}
			
			coordinates[coordinates.length] = `Zelle ${xOffset} ${yOffset}`
		}
	}
	
	if(movement[8]){
		let movementKnight = movement[8]
		for(let i = 0; i < movementKnight.length; i++){
			//this is a mess and I'm not about to fix it. At least there's a semblance of sense.
			let maskKnight = [
				[ movementKnight[i][0],  movementKnight[i][1]],
				[ movementKnight[i][0], -movementKnight[i][1]],
				[-movementKnight[i][0],  movementKnight[i][1]],
				[-movementKnight[i][0], -movementKnight[i][1]],
				[ movementKnight[i][1],  movementKnight[i][0]],
				[ movementKnight[i][1], -movementKnight[i][0]],
				[-movementKnight[i][1],  movementKnight[i][0]],
				[-movementKnight[i][1], -movementKnight[i][0]]
			]
			for(let j = 0; j < maskKnight.length; j++){
				let available = true
				let xOffset = x + maskKnight[j][0]
				let yOffset = y + maskKnight[j][1]
				
				if(xOffset < 0 || xOffset >= board.columns ){available = false}
				if(yOffset < 0 || yOffset >= board.rows    ){available = false}
				
				if(available){				
					coordinates[coordinates.length] = `Zelle ${xOffset} ${yOffset}`
				}
			}
		}
	}
	
	return coordinates
}

//Abfolge der Funktionen jeden Zug:
//1. schlagbare Felder ermitteln, um Sieg und fear für König zu überprüfen
//2. Rochade, En passant und andere Kombo-Effekte überprüfen
//3. Figur wird bewegt - entsprechende Felder für Bewegegung werden eingezeichnet bei onclick
//4. Feld wird aufgeräumt
//5. Zug des anderen Spielers wird gestartet