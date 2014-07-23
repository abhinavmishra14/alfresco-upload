//at click on browser action it opens up a new tab
chrome.browserAction.onClicked.addListener(function(activeTab){
	var newURL = "pages/upload.html";
	chrome.tabs.create({ url: newURL });
});

////vars
var data = new FormData(); //used to store data to upload in Alfresco
var resp; //stores ajax response
var SUCCESS = 0;
var FAILURE = 1;

////listeners
//document.addEventListener("DOMContentLoaded", restoreOptions);
//document.getElementById("send").addEventListener("click", sendToAlfresco);
//document.getElementById("files").addEventListener("change", storeFiles);
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
$("#submit").click(upload); //submit button upload to Alfresco
/////////////

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

/**
* Carico il file sulla repo Alfresco 
*/
function upload() {
	var alfrescoRoot = "http://intra.e-projectsrl.net/alfresco"; //ep alfresco
	var usr = {
		"username": $("#username").val(), 
		"password": $("#password").val()
	};
	
	//preparo i dati per l'upload prendendoli dal form in pagina
	var formData = new FormData(document.getElementById("upload-form"));
	
	//koopa: DEBUG-MODE ONLY
	if (document.getElementById('debug').checked) {
		alfrescoRoot = "http://localhost:8080/alfresco";
		console.log("DEBUG-MODE: ON");
	}
	////////
	
	//chiamata ajax per gestire il login-ticket
	$.ajax({
		type: "POST",
		url: alfrescoRoot + "/service/api/login",
		contentType: "application/json; charset=utf-8", //questo è fondamentale
		data: JSON.stringify(usr),
		success: function (json) {
			console.log("login-resp = " + JSON.stringify(json));
			resp = JSON.parse(JSON.stringify(json));
			showMessage("LOGIN OK!", SUCCESS);
			var ticket = resp.data.ticket; //salvo il ticket per effettuare il caricamento
			
			//carico file su Alfresco col ticket appena ricevuto
			$.ajax({
				type: "POST",
				url: alfrescoRoot + "/service/api/upload?alf_ticket=" + ticket,
				cache: false,
				contentType: false, //altrimenti jQuery manipola i dati
				processData: false,
				dataType: "json",
				//data: JSON.stringify(formData),
				data: formData,
				success: function (json) {     
					console.log("upload-resp = " + JSON.stringify(json) );
					console.log("UPLOAD OK");
					showMessage("UPLOAD OK", SUCCESS);
				},
				error: function (json) {
					//console.log("upload-resp = " + JSON.stringify(json));
					manageAjaxError(json);
				}
			});
		},
		error: function (json) {
			console.log("login-resp = " + JSON.stringify(json));
			manageAjaxError(json);
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
		message = "Unknown Error (maybe " + alfrescoRoot + " is not available";
	}
	console.log(message);
	showMessage(message, FAILURE);
}

//show message in page (type=0 means success, type=1 means error)
function showMessage(message, type) {
	if (type == SUCCESS)
		$("#upload-message").css("color", "green");
	else
		$("#upload-message").css("color", "red");
	$("#upload-message").html(message);
}

//restores input box state using the preferences stored in chrome.storage.
function restoreOptions() {
	// Use default values
	chrome.storage.sync.get({
		site: '',
		folder: '',
		file: '',
		description: '',
		overwrite: true
	}, function(items) {
		document.getElementById('site').value = items.site;
		document.getElementById('folder').value = items.folder;
		document.getElementById('file').value = items.file;
		document.getElementById('description').value = items.description;
		document.getElementById('overwrite').checked = items.overwrite;
	});
}

/** Uses alfresco.js */
function alfrescoAjax() {
	// Perform AJAX request to get form content from Forms Engine
	Alfresco.util.Ajax.request({
		url: Alfresco.constants.URL_SERVICECONTEXT + "components/form",
		dataObj:
		{
			htmlid: this.options.htmlid, // Ensure unique IDs
			itemKind : "node", // It is fixed at the moment but could be dynamic in the future
			itemId : this.options.itemId,
			mode: this.options.mode,
			submitType: "json",
			formUI: true,
			showCancelButton: true
		},
		successCallback : {

		},
		failureMessage : Alfresco.util.message("message.failure"), // Generic failure message
		scope: this,
		execScripts: true // Automatically executes script tags (<script>) returned in the forms engine's response
	});
}