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
	//ADD LISTENERS
	
	//Chrome listeners
	chrome.browserAction.onClicked.addListener(function() { //apre pagina di popup
		var w = 540;
		var h = 640;
		var left = (screen.width/2) - (w/2);
		var top = (screen.height/2) - ( h/2);
		chrome.windows.create(
			{'url': 'pages/upload.html', 'type': 'popup', 'width': w, 'height': h, 'left': left, 'top': top}, 
			function(window) {
				console.log("[main.chrome.browserAction.onClicked] pagina upload.html aperta")
		});
	});	
	/* Listen for messages from pages */
	chrome.runtime.onMessage.addListener(function (msg) {
		if (msg.action === "import-settings") {
			console.log("[main.#chrome.runtime.onMessage] catchato il messaggio " + msg.action);
		}
		if (msg.msg === "file_input") {
			console.log("[main.#chrome.runtime.onMessage] catchato il messaggio " + msg.msg);
		}
	});
	
	$("#export-icon").click(function (e) {
		console.log("[main.#export-icon.click] esporto dati su file");
		exportAll(function(result) {
			if (result === "ok") {
				console.log("[main.#export-icon.click] export ok");
				//showMessage("Dati esportati correttamente", GREEN_COLOR);
			}
			else {
				console.log("[main.#export-icon.click] export KO: " + result);
				//showMessage("Errore nell'export dei dati su file: " + result, RED_COLOR);
				showMessage(chrome.i18n.getMessage("msg_error_export_on_file") + ": "  + result, RED_COLOR);
			}
		});
	});
	
	/*
	$("#import-icon").click(function (e) {
		console.log("[main.#import-icon.click] importo dati");
		//chrome.runtime.sendMessage({action: "import-settings"});
		
		//creo nuovo popup
		chrome.windows.create({url: "pages/import-dialog.html", type: "popup", width: 450, height: 320, focused: true}, function(window) {
			//console.log("[main.chrome.browserAction.onClicked] pagina upload.html aperta");
		});
	});
	*/
	$("#filedata").on("dragenter", function (e) {
		e.stopPropagation();
		e.preventDefault();
		$(this).css("border", "3px solid #0B85A1");
	});
	$("#filedata").change(function (e) {
		$("#filedata").css("border", "3px dotted #0B85A1");
		e.preventDefault();
		var files = event.target.files || event.originalEvent.dataTransfer.files;
		
		$("#upload-icon").removeClass("icon-not-clickable"); //permetto di inviare visto che c'è un file caricato
		
		console.log("[main.#filedata.change] Pronto a spedire '" + files[0].name + "'");
		//showMessage("Pronto a spedire '" + files[0].name + "'", GREEN_COLOR);
		showMessage(chrome.i18n.getMessage("msg_ready_to_send_file") + " '" + files[0].name + "'", GREEN_COLOR);
	});

	//gestione dei colori delle icone
	$(".icon").hover( function(e) {
		$(this).toggleClass("icon icon-highlited");
		$(this).removeClass(clGreen); 
	}).mousedown(function(e) {
		$(this).toggleClass(clGreen);
	}).mouseup( function(e) {
		$(this).toggleClass(clGreen); 
	});

	$("#overwrite").change(function (e) { 
		$(this).val($(this).is(":checked"));
		console.log("[main.#overwrite.change] (#overwrite).val() = " + $("#overwrite").val());
	});
		
	//salva profilo
	$("#save-icon").click(function(e) {
		if (!$("#actual-profile").val().trim()) { //se non c'è il nome profilo (ha lunghezza 0)
			//showMessage("Dai un nome al profilo prima di salvarlo!", RED_COLOR);
			showMessage(chrome.i18n.getMessage("msg_error_naming_profile") + "!", RED_COLOR);
		}
		else {
			//preparo dati da salvare
			var data = {
				profilename: $("#actual-profile").val(),
				alfroot: $("#alfroot").val(),
				username: $("#username").val(),
				password: $("#password").val(),
				siteid: $("#siteid").val(),
				uploaddirectory: $("#uploaddirectory").val(),
				overwrite: $("#overwrite").val()
			};
			var id = data.profilename;
			
			//salva profilo su storage (vedi store-manager.js)
			saveProfile(data, function(result) {			
				if (result == "ok") {
					showMessage("Profilo '" + id + "' salvato con successo", GREEN_COLOR);
					showMessage(chrome.i18n.getMessage("msg_save_profile", id), GREEN_COLOR);
					
					//aggiorno lista profili su pagina solo se il profilo non è già elencato
					var exists = false;
					$("#select-profile option").each(function(option) {
						//console.log("[main] this.value = " + $(this).attr("value"));
						if ($(this).attr("value") == id) {
							exists = true;
						}
					});
					if (!exists) {
						refreshProfilesList(function(result) {
							//aggiorno tendina su pagina
							console.log("[main.#save-icon.click] tendina su pagina aggiornata con aggiunto: " + id);
							
							//$("#select-profile option:selected").text(id); //seleziono profilo appena salvato
						});
					}
					else {
						console.log("[main.#save-icon.click] il profilo '" + id + "' esiste in tendina, non lo aggiungo");
						//$("#select-profile option:selected").text(id); //seleziono profilo appena salvato
					}
				}
				else {
					showMessage("Errore nel salvataggio del profilo  '" + id + "': " + result, RED_COLOR);
				}						
			});			
		}
	});

	//cancella profilo
	$("#trash-icon").click(function(e) {
		//var id = $("#actual-profile").val().trim();
		var id = $("#select-profile option:selected").text().trim();
		if (id.length > 0) {
			console.log("[main.#trash-icon.click] elimino profilo '" + id + "'");
			
			//elimino profilo su storage (vedi store-manager.js)
			deleteProfile(id, function(result) {
				console.log("[main.#trash-icon.click] elimina profilo result = " + result);
				if (result === "ok") {
					showMessage("Profilo '" + id + "' rimosso con successo", GREEN_COLOR);
					refreshProfilesList(); //aggiorno lista profili su tendina
				}
				else if (result === "ne") {
					showMessage("Il profilo '" + id + "' non esiste, non posso eliminarlo", RED_COLOR);
				}
				else {
					showMessage("Errore nella cancellazione del profilo '" + id + "': " + result, RED_COLOR);
				}
			});
		}
	});
	
	//cambia dati quando cambia il profilo scelto
	$("#select-profile").change(function(e) {
		$("#actual-profile").val($("#select-profile option:selected").text());
		var id = $("#actual-profile").val();
		if (id.trim().length == 0) {
			return;
		}
		console.log("[main.#select-profile.change] recupero del profilo: '" + id + "'");
		getProfile(id, function(result) {
			if (typeof result === 'string' ) {
				//errore
				console.log("[main#select-profile.change] errore nel recupero del profilo: '" + id + "'");
				showMessage("Errore nel recupero del profilo: '" + id + "'", RED_COLOR);
			}
			else if (!$.isEmptyObject(result)) {
				setUploadData(result);
				showMessage("Caricato profilo '" + id + "'", GREEN_COLOR);
				console.log("[main.#select-profile.change] dati upload in form aggiornati");
			}
			else {
				showMessage("Il profilo '" + id + "' non esiste, mi dispiace", RED_COLOR);
				console.log("[main.#select-profile.change] profilo '" + id + "' inesistente o vuoto, non carico dati di upload su form");
			}
		});
		
	});	
	
	//apro popup
	$(".open-popup-link").magnificPopup({
		type: "inline",
		midClick: true,		
		callbacks: {
			elementParse: function(item) {
				// Function will fire for each target element "item.el" is a target DOM element (if present)
				// "item.src" is a source that you may modify
				
				//pulisco area di output e file caricato
				$("#import-status-message").empty();
				$("#filedata-import").val("");
			}
		}
	});	
	
	//carica su Alfresco
	$("#upload-icon").click(upload); //submit button upload to Alfresco
	
	//SOLO PER TEST!!!!!
	$("#clear-db").click(clearDb); //clear db
	$("#mostra").click(getAll); //mostra tutto
	//$("#save-prof").click(updateProfilesList); //save profiles
	//$("#mbusati").click(getBytesInUse);
	//$("#showpath").click(saveFile);
	///////////////////////
	
	//carica la lista di profili esistenti in pagina
	refreshProfilesList();
	
	//carica ultimi dati di upload utilizzati(se esistenti)
	loadLastUsedUploadData();

});

////vars
var data = new FormData(); //used to store data to upload in Alfresco
var resp; //stores ajax response
var GREEN_COLOR = "green";
var RED_COLOR = "red";
var SUCCESS = 0;
var FAILURE = 1;
var PERCENT_15 = 0.15; //login percentage
var PERCENT_75 = 0.75; //alfresco file upload
var clHeartEmpty = "icon-heart-empty";
var clHeart = "icon-heart";
var	clGreen = "icon-green";
//var alfrescoRoot = "http://intra.e-projectsrl.net/alfresco"; //ep alfresco
var alfrescoRoot = "http://localhost:8080/alfresco";
var actualProfile;

//mostra info su file caricati (usato per TEST)
function showFileInfo(event) {
	$("#filedata").css("border", "3px dotted #0B85A1"); //segnalo la cosa con un po' di css
	event.preventDefault();	
	//store files data
	var files = event.target.files || event.originalEvent.dataTransfer.files;
	
	/*
	for (var i = 0, f; f = files[i]; i++) {
		console.log("[main] f[" + i + "].name = " + f.name);
		console.log("[main] f[" + i + "].size = " + f.size);
		console.log("[main] f[" + i + "].lastModifiedDate = " + f.lastModifiedDate.toLocaleDateString());
	}
	*/
	console.log("[main.showFileInfo] Pronto a spedire '" + files[0].name + "'", GREEN_COLOR);
}

//usata a scopo di test
function checkFormParam() {
	var report = "";
	$("input").each(function(input) {
		console.log("[main]" + $( this ).attr("id") + ": " + $( this ).val() );
		report += ("[main]" + $( this ).attr("id") + ": " + $( this ).val() + "<br>");
	});
	$("status-message").html(report);
}

/**
* Login e carico il file sulla repo Alfresco 
*/
function upload() {
	$("#status-message").empty(); //pulisco area messaggi

	var missingParameters = false;
	$("#upload-form-wrapper input").each(function (index) {
		if (isEmptyString( $(this).val() )) {
			missingParameters = true;
			return;
		}
	});
	if (missingParameters) {
		console.log("[main.upload] mancano dati per l'upload, quindi non lo eseguo");
		showMessage("Compila tutti i dati del form o non posso caricare il file", RED_COLOR);
		return;
	}
	
	$("#upload-icon").addClass("icon-not-clickable"); //rendo il pulsante di upload non cliccabile
	$("#overwrite").val($("#overwrite").is(":checked")); //setto il valore di overwrite (true o false)
	
	//salvo dati di upload per la prossima volta
	var toSave = {
		alfroot: $("#alfroot").val(),
		siteid: $("#siteid").val(),
		username: $("#username").val(),
		password: $("#password").val(),
		uploaddirectory: $("#uploaddirectory").val(),
		overwrite: $("#overwrite").val()
	}
	
	saveLastUsedUploadData(toSave, function(result) {
		if (result === "ok") {
			console.log("[main.upload] dati di upload salvati per la prossima volta");
		}
		else {
			console.log("[main.upload] errore nel salvataggio dei metadati di upload: " + result);
			showMessage("Errore nel salvataggio dei metadati di upload: " + result, RED_COLOR);
		}
	});
	
	//preparo i dati per l'upload prendendoli dal form in pagina
	var usr = {
		"username": $("#username").val(), 
		"password": $("#password").val()
	};
	console.log("[main.upload] login via POST su: " + $("#alfroot").val().trim() + "/service/api/login/"+ JSON.stringify(usr));
	
	//chiamata ajax per gestire il login-ticket
	$.ajax({
		type: "POST",
		//url: alfrescoRoot + "/service/api/login",
		url: $("#alfroot").val().trim() + "/service/api/login",
		contentType: "application/json; charset=utf-8", //questo è fondamentale
		data: JSON.stringify(usr),
		
		//prima
		beforeSend: function() {
			//disabilito la possibilità di modificare i dati di upload
			$("#upload-form-wrapper input").each(function (index) {
				$(this).prop("readonly", true);
			});
			showMessage("Login...", GREEN_COLOR);
			NProgress.start();
		},
		success: function (json) {
			NProgress.inc(PERCENT_15); //after login
			console.log("[main.upload] login-resp = " + JSON.stringify(json));
			resp = JSON.parse(JSON.stringify(json));
			showMessage("LOGIN OK!", GREEN_COLOR);
			var ticket = resp.data.ticket; //salvo il ticket per effettuare il caricamento
			
			//ajax per upload del form con il file
			alfrescoUpload(ticket);
		},	
		error: function (json) {
			console.log("[main.upload] login-resp = " + JSON.stringify(json));
			NProgress.done();
			manageAjaxError(json);
			
			$("#upload-icon").removeClass("icon-not-clickable"); //riabilito il click sul pulsante di upload
			
			//riabilito la possibilità di modificare i dati di upload
			$("#upload-form-wrapper input").each(function (index) {
				$(this).prop("readonly", false);
			});
		}
	});
}

function alfrescoUpload(ticket) {
	$("#uploaddirectory").val('/' + $("#uploaddirectory").val() + '/'); //metto le barre altrimenti ALfresco non riconosce la folder (vedi upload.post.js)
	var formData = new FormData(document.getElementById("upload-form"));
	console.log("[main.alfrescoUpload] formData = " + formData);
	$.ajax({
		type: "POST",
		url: $("#alfroot").val().trim() + "/service/api/upload?alf_ticket=" + ticket,
		cache: false,
		contentType: false, //altrimenti jQuery manipola i dati
		processData: false,
		dataType: "json",
		data: formData,
				
		//prima di spedire sistemo i dati
		beforeSend: function() {
			showMessage("Upload...", GREEN_COLOR);
			console.log("[main.alfrescoUpload] upload...");
			
			var uploadDir = $("#uploaddirectory").val();
			$("#uploaddirectory").val(uploadDir.substring(1, uploadDir.length - 1)); //tolgo le barre
		},				
				
		//aggiornamento progress-bar durante l'upload dei dati
		xhr: function() {
			var xhr = new window.XMLHttpRequest();
			xhr.upload.addEventListener("progress", function(e) {
				if (e.lengthComputable) {
					var percentComplete = e.loaded / e.total;
					percentComplete = PERCENT_15 + percentComplete * PERCENT_75;
					NProgress.set(percentComplete);
				}
			}, false);
			return xhr;
		},						
		success: function (json) {   
			console.log("[main.alfrescoUpload] upload-success");
			showMessage("UPLOAD OK", GREEN_COLOR);		
			console.log("[main.alfrescoUpload] upload-resp = " + JSON.stringify(json) );
		},
		error: function (json) {
			//console.log("[main] upload-resp = " + JSON.stringify(json));
			manageAjaxError(json);
		},
		complete: function () {
			console.log("[main.alfrescoUpload] upload-complete");
			
			$("#upload-icon").removeClass("icon-not-clickable"); //riabilito il click sul pulsante di upload

			//riabilito la possibilità di modificare i dati di upload
			$("#upload-form-wrapper input").each(function (index) {
				$(this).prop("readonly", false);
			});
			
			NProgress.done();
		}
	});
}

//gestisce errore nelle chiamate AJAX durante l'upload
function manageAjaxError(json) {
	console.log("[main.manageAjaxError] upload-resp = " + JSON.stringify(json) );
	resp = JSON.parse(JSON.stringify(json));
	var message;
	if (resp.responseJSON !== undefined ) {
		//message = "code: " + resp.responseJSON.status.code + "\nname: " + resp.responseJSON.status.name + "\ndescription: " + resp.responseJSON.status.description + "\nmessage: " + resp.responseJSON.message;
		message = resp.responseJSON.message;;
	}
	else {
		message = "Unknown Error (maybe '" + $("#alfroot").val() + "' is not available)";
	}
	console.log("[main.manageAjaxError]" + message);
	showMessage(message, RED_COLOR);
}

//aggiorna la lista dei profili in pagina
function refreshProfilesList(callback) {
	//recupero lista profili (vedi store-manager.js)
	getProfilesList(function(result) {
		if (typeof result === 'string' ) {
			//errore
			showMessage("Errore nel recupero lista profili: " + result, RED_COLOR);
			callback("ko");
		}
		else {		
			$("#select-profile").empty(); //svuoto la lista su pagina
			if (!$.isEmptyObject(result)) {
				var profiles = result;
				
				//aggiorno la lista lista su pagina
				for (var i = 0; i < profiles.length; i++) {
					$("#select-profile").append("<option value='" + profiles[i] + "'>" + profiles[i] + "</option>");
				}
				console.log("[main.refreshProfilesList] lista profili su pagina svuotata e ripopolata: [" + profiles + "]");
				$("#select-profile").prop("selectedIndex", -1); //default scelta vuota				
			}
			else {
				console.log("[main.refreshProfilesList] lista profili vuota su db");
			}
			callback("ok");
		}
	});
}

//carica in form ultimi dati di upload usati
function loadLastUsedUploadData() {
	getLastUsedUploadData(function(data) {
		if (typeof data === 'string' ) {
			//errore
			showMessage("Errore nel recupero metadati di upload: " + data, RED_COLOR);
		}
		else if (isUndefined(data) || $.isEmptyObject(data)) {
			console.log("[main.loadLastUsedUploadData] nessun dato di upload salvato (mai tentato un upload?)");
		}
		else {
			setUploadData(data);
			console.log("[main.loadLastUsedUploadData] dati di upload caricati in form");
		}
	});
}

//carica dati di upload nel form in pagina
function setUploadData(data) {

	$("#alfroot").val(data.alfroot);
	$("#siteid").val(data.siteid);
	$("#username").val(data.username);
	$("#password").val(data.password);
	$("#uploaddirectory").val(data.uploaddirectory);
	$("#overwrite").val(data.overwrite);
	
	//imposto o no la spunta sul checkbox di overwrite
	if (data.overwrite === "false") {
		$("#overwrite").prop('checked', false);
	}
	else {
		$("#overwrite").prop('checked', true);
	}
}

//show message in page (type=0 means success, type=1 means error)
function showMessage(message, color) {	
	$("#status-message").css("color", color);
	blinkBorder("status-message-wrap", color);
	$("#status-message").empty();
	$("#status-message").text(message);
}

///////////TEST////////////////