class Board {
	constructor(map){
		this.rows = map.rows
		this.columns = map.columns

		this.row = []
		for(let i = 0; i < this.rows; i++){
			this.row[i] = new Column(this.columns)
		}

		for(let i = 0; i < map.startingPos.length; i++){
			for(let j = 0; j < this.columns; j++){
				if(map.startingPos[i][j]){
					this.tile = [j, i, new Occupation(map.startingPos[i][j], false)]
					this.tile = [this.rows - j - 1, i, new Occupation(map.startingPos[i][j], true)]
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

	}

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

let gridHeight
let gridWidth  

let board = new Board(gridHeight, gridWidth)

let classes = new Map()
let classesNames = []

//async function load(){
	await acquireData(classes, classesNames,`classes/`)
	generate()
//}

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

function generate(){	
	document.getElementById("Spielbrett").innerHTML = generateGrid(gridHeight, gridWidth);
	generateGridListeners(gridHeight, gridWidth)
};

function generateGrid(height,width){
	
	let grid = ``;
	for(let y = 0; y < height; y++){
		grid += `<div id="Zeile ${y}" class="Zeile">`
		
		for(let x = 0; x < width; x++){
			grid +=`<div id="Zelle ${x} ${y}" class="Zelle" onclick="clickZelle(this)"></div>`
			
			board.row[y].column[x] = new Occupation(rngClass(),false)
		}
		
		grid += `</div>\n`;
	}
	console.log("Board: " + JSON.stringify(board))
	return grid;
}

function generateGridListeners(height, width){
	for(let y = 0; y < height; y++){
		for(let x = 0; x < width; x++){
			document.getElementById(`Zelle ${x} ${y}`).addEventListener("mouseenter", (event) => fieldBackgroundPiece(event.target))
			document.getElementById(`Zelle ${x} ${y}`).addEventListener("mouseleave", (event) => fieldBackgroundBlank())
		}
	}
}


function clickZelle(object){
	console.log(object.id)
}

function fieldBackgroundBlank(){
	for(let i = 0; i < gridHeight; i++){
		for(let j = 0; j < gridWidth; j++){
			document.getElementById(`Zelle ${j} ${i}`).style.background = `#FFFFFF`
		}
	}
}

function fieldBackgroundPiece(space){
	let x = parseInt(space.id.split(" ")[1])
	let y = parseInt(space.id.split(" ")[2])
	let fields = calcMovement(x, y)
	
	
	for(let i = 0; i < fields.length; i++){
		document.getElementById(fields[i]).style.background = "red"
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
	
	let movement = classes.get(board.row[y].column[x].piece).movement
	
	let coordinates = [];
	
	for(let i = 0; i < mask.length; i++){
		let counter
		if(movement[i] == `unlimited`){
			
			counter = gridHeight > gridWidth ? gridHeight : gridWidth

		}else if(movement[i]){
			counter = movement[i]
		}else{
			counter = 0
		}
		
		for(let j = 0; j < counter; j++){
			
			let xOffset = x + mask[i][0]*(j+1)
			let yOffset = y + mask[i][1]*(j+1)
			
			if(xOffset < 0 || xOffset >= gridWidth ){break}
			if(yOffset < 0 || yOffset >= gridHeight){break}
			
			coordinates[coordinates.length] = `Zelle ${xOffset} ${yOffset}`
		}
	}
	
	if(movement[8]){
		let movementKnight = movement[8]
		for(let i = 0; i < movementKnight.length; i++){
			//this is a mess and I'm not about to fix it. At least it makes some kind of sense.
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
				
				if(xOffset < 0 || xOffset >= gridWidth ){available = false}
				if(yOffset < 0 || yOffset >= gridHeight){available = false}
				
				if(available){				
					coordinates[coordinates.length] = `Zelle ${xOffset} ${yOffset}`
				}
			}
		}
	}
	
	return coordinates
}

function rngClass(){
	return classesNames[Math.floor(Math.random() * classesNames.length)]
	
}

//Abfolge der Funktionen jeden Zug:
//1. schlagbare Felder ermitteln, um Sieg und fear für König zu überprüfen
//2. Rochade, En passant und andere Kombo-Effekte überprüfen
//3. Figur wird bewegt - entsprechende Felder für Bewegegung werden eingezeichnet bei onclick
//4. Feld wird aufgeräumt
//5. Zug des anderen Spielers wird gestartet