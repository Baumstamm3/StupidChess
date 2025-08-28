function load(){
	generate()
}

function generate(){
	//let gridHeight = Math.floor((Math.random() * 10) + 5);
	//let gridWidth  = Math.floor((Math.random() * 20) + 5);
	
	let gridHeight = 8;
	let gridWidth  = 8;

	document.getElementById("Spielbrett").innerHTML = generateGrid(gridHeight, gridWidth);
	
	fetch("./Pawn.json")
	.then(x => x.text())
	.then(y => console.log(y))
};

generateGrid(gridHeight,gridWidth){

	let grid = ``;
	for(let i = 0; i < gridHeight; i++){
		grid += `<div id="Zeile ${i}" class="Zeile">`
		for(let j = 0; j < gridWidth; j++){
			grid +=`<div id="Zelle ${i} ${j}" class="Zelle" onclick="clickZelle(this)"></div>`
		}
		grid += `</div>\n`;
	}
	
	return grid;
}

function clickZelle(object){
	object.style =`background: rgb(${testRGB()} ${testRGB()} ${testRGB()});`
}

function testRGB(){
	let a = Math.floor(Math.random()*256)
	console.log(a)
	return a
}

//Abfolge der Funktionen jeden Zug:
//1. schlagbare Felder ermitteln, um Sieg und fear für König zu überprüfen
//2. Rochade, En passant und andere Kombo-Effekte überprüfen
//3. Figur wird bewegt - entsprechende Felder für Bewegegung werden eingezeichnet bei onclick
//4. Feld wird aufgeräumt
//5. Zug des anderen Spielers wird gestartet