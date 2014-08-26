function disableButtonById(id) {
	//disabilito pulsante di invio
	$("#" + id).prop("disabled", true);
}

function enableButtonById(id) {
	//abilito pulsante di invio
	$("#" + id).prop("disabled", false);
}

//verifica se la variabile è indefinita
function isUndefined(obj) {
	return typeof obj === 'undefined';
}