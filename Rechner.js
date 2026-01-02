function acquireFormula(formula){
	//let in JavaScript eine alternative zu var und const zum deklarieren von Variablen. 
	//let sorgt aber im Gegensatz zu den anderen beiden dafür, dass die Variable aus dem RAM gelöscht wird, sobald sie nicht mehr benötigt wird. 
	//Die V8-Engine, auf der JavaScript läuft, ermöglicht soetwas problemlos. Gleichzeitig ist let block-scoped und hoisted die Variable auch nicht.
	//--> für genauere Informationen zu den Vorteilen von let, siehe Blockscope und Globalscope, Hoisting und Garbage Collection.
	let formApart = formula.split(" ")
	let formClean = []
	
	sortFormula(formApart)
	
	return false
}

function sortFormula(formula){
	for(let i = 0; i < formula.length(); i++){
		if(Number.isFinite(formula[i])){
			formClean[formClean.length] = parseFloat(formula[i])
		}else if(formula[i].length == 1){
			switch(formula[i]){
				case "+":
					
				break
				case "-":
				
				break
				case "*":
					
				break
				case "/":
					
				break
				case "+":
					
				break
				case "+":
					
				break
				case "+":
					
				break
			}
		}else{
			sortFormula(formula[i].split(""))
		}
	}
}