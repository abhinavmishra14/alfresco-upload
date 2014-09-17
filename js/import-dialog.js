//at click on browser action it opens up a new tab
/* 
//new tab
chrome.browserAction.onClicked.addListener(function(activeTab){
	var newURL = "pages/upload.html";
	chrome.tabs.create({ url: newURL });
});
*/

//on DOM content loaded
$(function() {
	$("#filedata-import").on("dragenter", function (e) {
		e.stopPropagation();
		e.preventDefault();
		$(this).css("border", "3px solid #0B85A1");
	});
	$("#filedata-import").change(function (e) {
		$("#filedata-import").css("border", "3px dotted #0B85A1");
		e.preventDefault();
		var files = event.target.files || event.originalEvent.dataTransfer.files;
		
		$("#import-btn").prop("disabled", false); //permetto di importare visto che c'è un file caricato
		
		console.log("[main.#filedata-import.change] Pronto a importare '" + files[0].name + "'");
		showImportMessage("Pronto a importare '" + files[0].name + "'", "green");
	});
	$("#import-btn").click(function (e) {
		console.log("[main.#import-btn.click] Clicco import");
		showImportMessage("Importo", "green");
	});	
});

//show message in page (type=0 means success, type=1 means error)
function showImportMessage(message, color) {	
	$("#import-status-message-wrap").finish(); //concludo tutte le animazioni sull'elemento
	$("#import-status-message").css("color", color);
	blinkBorder("import-status-message-wrap", color);
	$("#import-status-message").empty();
	$("#import-status-message").text(message);
}