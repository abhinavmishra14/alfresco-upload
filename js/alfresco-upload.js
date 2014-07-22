var data = new FormData(); //used to store data to upload in Alfresco
var resp; //stores ajax response
var SUCCESS = 0;
var FAILURE = 1;

/////drag and drop file handler///////////////
var obj = $("#file-upload-wrapper");
obj.on('dragenter', function (e) {
	e.stopPropagation();
	e.preventDefault();
	$(this).css('border', '3px solid #0B85A1');
});
obj.on('dragover', function (e) {
	e.stopPropagation();
	e.preventDefault();
});
obj.on('drop', function (e) {
	$(this).css('border', '3px dotted #0B85A1');
	storeFiles(e);
});
////////////////////////////////

//store files on local variable
function storeFiles(event) {
	event.preventDefault();
	
	//store files data
	var files = event.target.files || event.originalEvent.dataTransfer.files;
	
	for (var i = 0, f; f = files[i]; i++) {
		console.log("f[" + i + "].name = " + f.name);
		console.log("f[" + i + "].size = " + f.size);
		console.log("f[" + i + "].lastModifiedDate = " + f.lastModifiedDate.toLocaleDateString());
		
		//data.append("file", f);
		data = f;
	}

	//SOLO PER LOG DEBUG
	for (var i = 0, d; d = data[i]; i++) {
		console.log("d[" + i + "] = " + d);
	}
	
	showMessage("stored " + files.length + " files", SUCCESS);
}

//mostra info su file caricati
function fileInfo(event) {
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

//upload file to Alfresco Site
function sendToAlfresco() {
	var alfrescoRoot = "http://intra.e-projectsrl.net/alfresco";
	var usr = {
		"username": document.getElementById('username').value, 
		"password": document.getElementById('password').value
	};
	var fileDataForm = {
		"filedata": data, //aggiungo l'oggetto contenente i file
		"siteid": "repository",
		"containerid": "documentLibrary",
		"uploaddirectory": "Rapportini",
		"description": "nuova versione",
		"contenttype": "cm:content",
		"filename": "puntamenti_utili.txt",
		"overwrite": "true"
	};
	console.log("data = " + data);
	console.log("JSON.stringify(data) = " + JSON.stringify(data));
	console.log("JSON.stringify(fileDataForm) = " + JSON.stringify(fileDataForm));
	
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
			console.log("resp = " + JSON.stringify(json));
			resp = JSON.parse(JSON.stringify(json));
			showMessage("LOGIN OK!", SUCCESS);

			var ticket = resp.data.ticket; //salvo il ticket per effettuare il caricamento
			
			//carico file su Alfresco col ticket appena ricevuto
			$.ajax({
				type: "POST",
				url: alfrescoRoot + "/service/api/upload?alf_ticket=" + ticket,
				cache: false,
				//contentType: "multipart/form-data",
				contentType: false, //altrimenti jQuery manipola i dati
				processData: false,
				dataType: "json",
				data: JSON.stringify(fileDataForm),
				success: function (json) {     
					console.log("resp = " + JSON.parse( JSON.stringify(json)) );
					console.log("UPLOAD OK");
					showMessage("UPLOAD OK", SUCCESS);
				},
				error: function (json) {
					console.log("resp = " + JSON.stringify(json) );
					console.log("UPLOAD KO");
					showMessage("UPLOAD KO", FAILURE);
				}
			});
		},
		error: function (json) {
			console.log("resp = " + JSON.stringify(json));
			resp = JSON.parse(JSON.stringify(json));
			var message;
			if (resp.responseJSON !== undefined ) {
				message = "code: " + resp.responseJSON.status.code + 
					"\nname: " + resp.responseJSON.status.name + "\ndescription: " + 
					resp.responseJSON.status.description;
			}
			else {
				message = "Unknown Error (maybe " + alfrescoRoot + " is not available";
			}
			console.log(message);
			showMessage(message, FAILURE);
		}
	});
	
}

function upload() {
	console.log("upload new!");
	var form = document.getElementById("upload-form");
	var formData = new FormData(form);
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

//add listener
//document.addEventListener("DOMContentLoaded", restoreOptions);
//document.getElementById("send").addEventListener("click", sendToAlfresco);
//document.getElementById("files").addEventListener("change", storeFiles);
document.getElementById("filedata").addEventListener("change", fileInfo);
document.getElementById("submit").addEventListener("click", upload); //submit button upload to Alfresco