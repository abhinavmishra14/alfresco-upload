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
	//document.addEventListener("DOMContentLoaded", restoreOptions);
	
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
	//gestisce favoriti al click sul cuore
	$("#heart-icon").click(function(e) {
		//$(this).toggleClass(clHeartEmpty + " " + clHeart);
		isProfileStored($("#profile-name").val(), function(exists) {
			console.log($("#profile-name").val() + " esiste? " + exists);
		});
	});
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
	});
	$("#save-icon").click(saveProfile); //salva profilo
	$("#upload-icon").click(upload); //submit button upload to Alfresco
	
	//SOLO PER TEST!!!!!
	$("#clear-db").click(clearDb); //clear db
	//$("#save-prof").click(updateProfilesList); //save profiles
	$("#refresh").click(refreshProfilesList); //refresh profiles

	///////////////////////
	
	//inizializza parametri
	initParams();
	
	//carica la lista di profili esistenti in pagina
	refreshProfilesList();
	
	//carica dati dell'ultimo profilo usato (se esiste)
	loadLastUsedProfile();
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

function initParams() {
	console.log("init");
	$("#overwrite").val($("#overwrite").is(":checked"));
}

//mostra info su file caricati
function showFileInfo(event) {
	$("#filedata").css("border", "3px dotted #0B85A1");
	event.preventDefault();	
	//store files data
	var files = event.target.files || event.originalEvent.dataTransfer.files;
	
	for (var i = 0, f; f = files[i]; i++) {
		console.log("f[" + i + "].name = " + f.name);
		console.log("f[" + i + "].size = " + f.size);
		console.log("f[" + i + "].lastModifiedDate = " + f.lastModifiedDate.toLocaleDateString());
	}	
	showMessage("stored " + files.length + " files", SUCCESS);
}

function checkFormParam() {
	var report = "";
	$("input").each(function(input) {
		console.log($( this ).attr("id") + ": " + $( this ).val() );
		report += ($( this ).attr("id") + ": " + $( this ).val() + "<br>");
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
	saveLastUsedProfile($("#profile-name").val());
	$("#status-message").empty();
	disableButtonById("submit");
	
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
			console.log("login-resp = " + JSON.stringify(json));
			resp = JSON.parse(JSON.stringify(json));
			showMessage("LOGIN OK!", SUCCESS);
			var ticket = resp.data.ticket; //salvo il ticket per effettuare il caricamento
			
			//ajax per upload del form con il file
			alfrescoUpload(ticket);
		},	
		error: function (json) {
			console.log("login-resp = " + JSON.stringify(json));
			NProgress.done();
			manageAjaxError(json);
			
			enableButtonById("submit"); //riabilito pulsante invio
		}
	});
}

function alfrescoUpload(ticket) {
	var formData = new FormData(document.getElementById("upload-form"));
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
			console.log("Upload...");
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
			console.log("upload-success");
			showMessage("UPLOAD OK", SUCCESS);		
			console.log("upload-resp = " + JSON.stringify(json) );
			console.log("UPLOAD OK");
		},
		error: function (json) {
			//console.log("upload-resp = " + JSON.stringify(json));
			manageAjaxError(json);
		},
		complete: function () {
			console.log("upload-complete");
			$("#submit").prop("disabled", true); //riabilito pulsante invio
			NProgress.done();
		}
	});
}

function manageAjaxError(json) {
	console.log("upload-resp = " + JSON.stringify(json) );
	resp = JSON.parse(JSON.stringify(json));
	var message;
	if (resp.responseJSON !== undefined ) {
		//message = "code: " + resp.responseJSON.status.code + "\nname: " + resp.responseJSON.status.name + "\ndescription: " + resp.responseJSON.status.description + "\nmessage: " + resp.responseJSON.message;
		message = resp.responseJSON.message;;
	}
	else {
		message = "Unknown Error (maybe " + alfrescoRoot + " is not available)";
	}
	console.log(message);
	showMessage(message, FAILURE);
}

//show message in page (type=0 means success, type=1 means error)
function showMessage(message, type) {
	if (type == SUCCESS)
		$("#status-message").css("color", "green");
	else
		$("#status-message").css("color", "red");
	$("#status-message").empty();
	$("#status-message").append(message);
	
}