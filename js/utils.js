/**
 * Evidenzia bordi di un elemento da un colore al bianco per 1 secondo (ha bisogno di jquery-ui lib)
 */
function blinkBorder(elementId, color) {
	$("#" + elementId).finish(); //termino eventuali animazioni precedenti
	//console.log("[main.blinkBorder] blinko #" + elementId + ", colore " + color);
	$("#" + elementId).css("border-color", color).animate( {"border-color": "white"}, 1000);
}

function disableButtonById(id) {
	//disabilito pulsante di invio
	$("#" + id).prop("disabled", true);
}

function enableElementById(id) {
	$("#" + id).prop("disabled", false);
}
function disableElementById(id) {
	$("#" + id).prop("disabled", true);
}

//verifica se la variabile è indefinita
function isUndefined(obj) {
	return typeof obj === 'undefined';
}

//return true if string has length 0, false otherwise
function isEmptyString(s) {
	return s.trim().length == 0;
}
