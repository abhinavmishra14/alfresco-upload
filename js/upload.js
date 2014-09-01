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
	chrome.browserAction.onClicked.addListener(function() { //apre pagina di popup
		var w = 540;
		var h = 620;
		var left = (screen.width/2) - (w/2);
		var top = (screen.height/2) - ( h/2);
		chrome.windows.create({'url': 'pages/upload.html', 'type': 'popup', 'width': w, 'height': h, 'left': left, 'top': top} , function(window) {});
	});
	$("#filedata").on("dragenter", function (e) {
		e.stopPropagation();
		e.preventDefault();
		$(this).css("border", "3px solid #0B85A1");
	});
	$("#filedata").change(function (e) {
		$("#filedata").css("border", "3px dotted #0B85A1");
		e.preventDefault();
		var files = event.target.files || event.originalEvent.dataTransfer.files;
		showMessage("stored " + files.length + " files", SUCCESS);
	});

	//gestione dei colori delle icone
	$(".icon").hover( function(e) {
		$(this).toggleClass("icon icon-highlited"); 
		$(this).removeClass(clGreen); //gestisce il caso in cui si tiene premuto il pulsante sinistro del mouse e lo si rilascia fuori dall'elemento 
	}).mousedown(function(e) {
		$(this).toggleClass(clGreen); 
	}).mouseup( function(e) {
		$(this).toggleClass(clGreen); 
	});

	$("#overwrite").change(function (e) { 
		$(this).val($(this).is(":checked"));
		console.log("[main-overwrite_change] (#overwrite).val() = " + $("#overwrite").val());
	});
		
	//salva profilo
	$("#save-icon").click(function(e) {
		if (!$("#actual-profile").val().trim()) { //se non c'è il nome profilo (ha lunghezza 0)
			showMessage("Dai un nome al profilo prima di salvarlo!", FAILURE);
		}
		else {
			//preparo dati da salvare
			var data = {
				profilename: $("#actual-profile").val(),
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
					showMessage("Profilo '" + id + "' salvato con successo", SUCCESS);
					
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
							console.log("[main] tendina su pagina aggiornata con aggiunto: " + id);
							
							//$("#select-profile option:selected").text(id); //seleziono profilo appena salvato
						});
					}
					else {
						console.log("[main] il profilo '" + id + "' esiste in tendina, non lo aggiungo");
						//$("#select-profile option:selected").text(id); //seleziono profilo appena salvato
					}
				}
				else {
					showMessage("Errore nel salvataggio del profilo  '" + id + "': " + result, FAILURE);
				}						
			});
		}
	});

	//cancella profilo
	$("#trash-icon").click(function(e) {
		//var id = $("#actual-profile").val().trim();
		var id = $("#select-profile option:selected").text().trim();
		if (id.length > 0) {
			console.log("[main] elimino profilo '" + id + "'");
			
			//elimino profilo su storage (vedi store-manager.js)
			deleteProfile(id, function(result) {
				console.log("[main] elimina profilo result = " + result);
				if (result === "ok") {
					showMessage("Profilo '" + id + "' rimosso con successo", SUCCESS);
					refreshProfilesList(); //aggiorno lista profili su tendina
				}
				else if (result === "ne") {
					showMessage("Il profilo '" + id + "' non esiste, non posso eliminarlo", FAILURE);
				}
				else {
					showMessage("Errore nella cancellazione del profilo '" + id + "': " + result, FAILURE);
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
				showMessage("Errore nel recupero del profilo: '" + id + "'", FAILURE);
			}
			else if (!$.isEmptyObject(result)) {
				setUploadData(result);
				showMessage("Caricato profilo '" + id + "'", SUCCESS);
				console.log("[main.#select-profile.change] dati upload in form aggiornati");
			}
			else {
				showMessage("Il profilo '" + id + "' non esiste, mi dispiace", FAILURE);
				console.log("[main.#select-profile.change] profilo '" + id + "' inesistente o vuoto, non carico dati di upload su form");
			}
		});
		
	});	
	
	//carica su Alfresco
	$("#upload-icon").click(upload); //submit button upload to Alfresco
	
	//SOLO PER TEST!!!!!
	$("#clear-db").click(clearDb); //clear db
	//$("#save-prof").click(updateProfilesList); //save profiles
	$("#mbusati").click(getBytesInUse);
	///////////////////////
	
	//carica la lista di profili esistenti in pagina
	refreshProfilesList();
	
	//carica ultimi dati di upload utilizzati(se esistenti)
	loadLastUsedUploadData();

});

////vars
var data = new FormData(); //used to store data to upload in Alfresco
var resp; //stores ajax response
var SUCCESS = 0;
var FAILURE = 1;
var PERCENT_15 = 0.15; //login percentage
var PERCENT_75 = 0.75; //alfresco file upload
var alfrescoRoot = "http://intra.e-projectsrl.net/alfresco"; //ep alfresco
var clHeartEmpty = "icon-heart-empty";
var clHeart = "icon-heart";
var	clGreen = "icon-green";
var alfrescoRoot = "http://localhost:8080/alfresco";
var actualProfile;

//mostra info su file caricati
function showFileInfo(event) {
	$("#filedata").css("border", "3px dotted #0B85A1");
	event.preventDefault();	
	//store files data
	var files = event.target.files || event.originalEvent.dataTransfer.files;
	
	for (var i = 0, f; f = files[i]; i++) {
		console.log("[main] f[" + i + "].name = " + f.name);
		console.log("[main] f[" + i + "].size = " + f.size);
		console.log("[main] f[" + i + "].lastModifiedDate = " + f.lastModifiedDate.toLocaleDateString());
	}
	showMessage("[main] stored " + files.length + " files", SUCCESS);
}

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
	//stoppo animazioni se ce ne sono attive
	//$("#status").finish();
	//pulisco area messaggi
	$("#status-message").empty();
	$("#upload-icon").addClass("icon-not-clickable"); //rendo il pulsante di upload non cliccabile
	$("#overwrite").val($("#overwrite").is(":checked")); //setto il valore di overwrite (true o false)
	
	//salvo dati di upload per la prossima volta
	var toSave = {
		siteid: $("#siteid").val(),
		username: $("#username").val(),
		password: $("#password").val(),
		uploaddirectory: $("#uploaddirectory").val(),
		overwrite: $("#overwrite").val()
	}
	saveLastUsedUploadData(toSave, function(result) {
		if (result === "ok") {
			console.log("[main] dati di upload salvati per la prossima volta");
		}
		else {
			console.log("[main] errore nel salvataggio dei metadati di upload: " + result);
			showMessage("Errore nel salvataggio dei metadati di upload: " + result, FAILURE);
		}
	});
	
	//preparo i dati per l'upload prendendoli dal form in pagina
	var usr = {
		"username": $("#username").val(), 
		"password": $("#password").val()
	};
	
	//chiamata ajax per gestire il login-ticket
	$.ajax({
		type: "POST",
		url: alfrescoRoot + "/service/api/login",
		contentType: "application/json; charset=utf-8", //questo è fondamentale
		data: JSON.stringify(usr),
		
		//prima
		beforeSend: function() {
			//$("#status-bar").show();
			showMessage("Login...", SUCCESS);
			NProgress.start();
		},
		success: function (json) {
			NProgress.inc(PERCENT_15); //after login
			console.log("[main] login-resp = " + JSON.stringify(json));
			resp = JSON.parse(JSON.stringify(json));
			showMessage("LOGIN OK!", SUCCESS);
			var ticket = resp.data.ticket; //salvo il ticket per effettuare il caricamento
			
			//ajax per upload del form con il file
			alfrescoUpload(ticket);
		},	
		error: function (json) {
			console.log("[main] login-resp = " + JSON.stringify(json));
			NProgress.done();
			manageAjaxError(json);
			
			$("#upload-icon").removeClass("icon-not-clickable"); //riabilito il click sul pulsante di upload
		}
	});
}

function alfrescoUpload(ticket) {
	$("#uploaddirectory").val('/' + $("#uploaddirectory").val() + '/'); //metto le barre altrimenti ALfresco non riconosce la folder (vedi upload.post.js)
	var formData = new FormData(document.getElementById("upload-form"));
	console.log("[main-alfrescoUpload] formData = " + formData);
	$.ajax({
		type: "POST",
		url: alfrescoRoot + "/service/api/upload?alf_ticket=" + ticket,
		cache: false,
		contentType: false, //altrimenti jQuery manipola i dati
		processData: false,
		dataType: "json",
		data: formData,
				
		//prima
		beforeSend: function() {
			showMessage("Upload...", SUCCESS);
			console.log("[main] upload...");
			
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
			console.log("[main] upload-success");
			showMessage("UPLOAD OK", SUCCESS);		
			console.log("[main] upload-resp = " + JSON.stringify(json) );
		},
		error: function (json) {
			//console.log("[main] upload-resp = " + JSON.stringify(json));
			manageAjaxError(json);
		},
		complete: function () {
			console.log("[main] upload-complete");
			$("#upload-icon").removeClass("icon-not-clickable"); //riabilito il click sul pulsante di upload
			NProgress.done();
		}
	});
}

//gestisce errore nelle chiamate AJAX durante l'upload
function manageAjaxError(json) {
	console.log("[main] upload-resp = " + JSON.stringify(json) );
	resp = JSON.parse(JSON.stringify(json));
	var message;
	if (resp.responseJSON !== undefined ) {
		//message = "code: " + resp.responseJSON.status.code + "\nname: " + resp.responseJSON.status.name + "\ndescription: " + resp.responseJSON.status.description + "\nmessage: " + resp.responseJSON.message;
		message = resp.responseJSON.message;;
	}
	else {
		message = "Unknown Error (maybe '" + alfrescoRoot + "' is not available)";
	}
	console.log("[main]" + message);
	showMessage(message, FAILURE);
}

//aggiorna la lista dei profili in pagina
function refreshProfilesList(callback) {
	//recupero lista profili (vedi store-manager.js)
	getProfilesList(function(result) {
		if (typeof result === 'string' ) {
			//errore
			showMessage("Errore nel recupero lista profili: " + result, FAILURE);
			callback("ko");
		}
		else if ($.isEmptyObject(result)) {
			console.log("[main.refreshProfilesList] lista profili vuota su db");
		}
		else {		
			var profiles = result;	

			$("#select-profile").empty(); //svuoto la lista su pagina
			
			//aggiorno la lista lista su pagina
			for (var i = 0; i < profiles.length; i++) {
				$("#select-profile").append("<option value='" + profiles[i] + "'>" + profiles[i] + "</option>");
			}
			console.log("[main.refreshProfilesList] lista profili su pagina svuotata e ripopolata: [" + profiles + "]");
			$("#select-profile").prop("selectedIndex", -1); //default scelta vuota
			callback("ok");
		}
	});
}

//carica in form ultimi dati di upload usati
function loadLastUsedUploadData() {
	getLastUsedUploadData(function(data) {
		if (typeof data === 'string' ) {
			//errore
			showMessage("Errore nel recupero metadati di upload: " + data, FAILURE);
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
function showMessage(message, type) {
	if (type == SUCCESS) {
		$("#status-message").css("color", "green");
	}
	else {
		$("#status-message").css("color", "red");
	}
	$("#status-message").empty();
	$("#status-message").text(message);
}