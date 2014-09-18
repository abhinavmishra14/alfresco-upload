//at click on browser action it opens up a new tab
/* 
//new tab
chrome.browserAction.onClicked.addListener(function(activeTab){
	var newURL = "pages/upload.html";
	chrome.tabs.create({ url: newURL });
});
*/
var fileReader = new FileReader();
var importContent; //oggetto con i dati da importare

//on DOM content loaded
$(function() {
	//carico funzioni del reader
	fileReader.onload = function(event) {
		//console.log("[main.$.fileReader.onload] file = " + event.target.result);
		try {
			importContent = JSON.parse(event.target.result);
		}
		catch (e) {
			showImportMessage("Il file caricato pare incompatibile. Sicuro che sia un export dell'estensione alfresco-upload?", "red");
			$("#import-btn").prop("disabled", true);
			return;
		}
		finally {
		}
		showImportMessage("File ok, puoi importare i dati", "green");
		$("#import-btn").prop("disabled", false); //permetto di importare visto che c'è un file caricato e i dati parsati
    };

	$("#filedata-import").on("dragenter", function (e) {
		e.stopPropagation();
		e.preventDefault();
		$(this).css("border", "3px solid #0B85A1");
	});
	$("#filedata-import").change(function (e) {
		$("#filedata-import").css("border", "3px dotted #0B85A1");
		e.preventDefault();
		var files = event.target.files || event.originalEvent.dataTransfer.files;		
		console.log("[main.#filedata-import.change] Pronto a importare '" + files[0].name + "'");
		showImportMessage("Sto importando '" + files[0].name + "'", "green");
		
		//converto il file e se è ok faccio l'import
		fileReader.readAsText(files[0]);
	});

	//eventi sul pulsante di import
	$("#import-btn").click(function (e) {		
		//importo, vedi store-manager.js
		importAll(importContent, function(result) {
			if (result === "ok") {
				console.log("[main.#import-btn.click] Import ok");		
				showImportMessage("Dati importati correttamente. Riavvia l'estensione per vederli", "green");
			}
			else {
				console.log("[main.#import-btn.click] Import ko: " + result);
				showImportMessage("Import ko: " + result, "red");
			}
			$("#import-btn").prop("disabled", true);
		});
	})
	
	//gestione colore pulsante di import
	$(".btn-blue").hover(function(e) {
		$(this).toggleClass("btn-azure btn-blue");
		$(this).removeClass("btn-green"); //gestisce il caso in cui si tiene premuto il pulsante sinistro del mouse e lo si rilascia fuori dall'elemento 
	}).mousedown(function(e) {
		$(this).toggleClass("btn-green");
	}).mouseup( function(e) {
		$(this).toggleClass("btn-green");
	});

});

//show message in page (type=0 means success, type=1 means error)
function showImportMessage(message, color) {	
	$("#import-status-message").css("color", color);
	blinkBorder("import-status-message-wrap", color);
	$("#import-status-message").empty();
	$("#import-status-message").text(message);
}