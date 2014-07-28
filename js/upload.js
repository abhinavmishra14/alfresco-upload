//at click on browser action it opens up a new tab
/* 
//new tab
chrome.browserAction.onClicked.addListener(function(activeTab){
	var newURL = "pages/upload.html";
	chrome.tabs.create({ url: newURL });
});
*/

//apre pagina di popup
chrome.browserAction.onClicked.addListener(function() {
	var w = 500;
	var h = 500;
	var left = (screen.width/2) - (w/2);
	var top = (screen.height/2) - ( h/2);
	chrome.windows.create({'url': 'pages/upload.html', 'type': 'popup', 'width': w, 'height': h, 'left': left, 'top': top} , function(window) {
	});
});
initParams();

////vars
var data = new FormData(); //used to store data to upload in Alfresco
var resp; //stores ajax response
var SUCCESS = 0;
var FAILURE = 1;
var PERCENT_10 = 0.1; //login percentage
var PERCENT_90 = 0.9; //alfresco file upload
var alfrescoRoot = "http://intra.e-projectsrl.net/alfresco"; //ep alfresco
var bar = $("#bar");
//var percent = $(".percent");
var status = $("#status-message");

////listeners
//document.addEventListener("DOMContentLoaded", restoreOptions);
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
$("#overwrite").change(function (e) { 
	$(this).val($(this).is(":checked"));
});
$("#check-param").click(checkFormParam);
/////////////

//DEBUG-MODE ONLY
if (document.getElementById('debug').checked) {
	console.log("DEBUG-MODE: ON");
	alfrescoRoot = "http://localhost:8080/alfresco";
	$("#debug-div").show();
}
////////

function initParams() {
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
	$("input").each(function(input) {
		console.log($( this ).attr("id") + ": " + $( this ).val() );
		$("#status-message").append($( this ).attr("id") + ": " + $( this ).val() + "<br>");
	});
}

/**
* Login e carico il file sulla repo Alfresco 
*/
function upload() {
	//stoppo animazioni se ce ne sono attive
	$("#status").finish();
	//pulisco area messaggi
	$("#status-message").empty();
	
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
			$("#status").show();
			showMessage("Login...", SUCCESS);
		},

		success: function (json) {
			console.log("login-resp = " + JSON.stringify(json));
			resp = JSON.parse(JSON.stringify(json));
			$("#bar").val(PERCENT_10);
			showMessage("LOGIN OK!", SUCCESS);
			var ticket = resp.data.ticket; //salvo il ticket per effettuare il caricamento
			
			//ajax per upload del form con il file
			alfrescoUpload(ticket);
		},
		
		error: function (json) {
			console.log("login-resp = " + JSON.stringify(json));
			manageAjaxError(json);
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
				
		//aggiornamento barra durante l'upload dei dati
		xhr: function() {
			var xhr = new window.XMLHttpRequest();
			xhr.upload.addEventListener("progress", function(e) {
				if (e.lengthComputable) {
					var percentComplete = e.loaded / e.total;
					percentComplete = PERCENT_10 + percentComplete * PERCENT_90;
					$("#bar").val(percentComplete);
					console.log("percent = " + percentComplete);
					if (percentComplete === 1) {
						//percentComplete
					}
				}
			}, false);
			return xhr;
		},				
				
		success: function (json) {     
			console.log("upload-resp = " + JSON.stringify(json) );
			console.log("UPLOAD OK");
			showMessage("UPLOAD OK", SUCCESS);
		},
		
		error: function (json) {
			//console.log("upload-resp = " + JSON.stringify(json));
			manageAjaxError(json);
		},
		
		complete: function () {
			//faccio sparire la barra di caricamento
			$("#status").delay(4000).fadeOut("slow");
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
		$("#status-message").css("color", "green");
	else
		$("#status-message").css("color", "red");
	//$("#status-message").html(message);
	$("#status-message").append(message);
}

//restores input box state using the preferences stored in chrome.storage.
function restoreOptions() {
	// Use default values
	chrome.storage.sync.get({
		site: "",
		folder: "",
		file: "",
		overwrite: "true"
	}, function(items) {
		$("#site").value = items.site;
		$("#folder").value = items.folder;
		$("#file").value = items.file;
		$("#overwrite").value = items.overwrite;
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