//verfica validità ed esistenza del nome della sessione
function checkSessionName() {
}

//saves options to chrome.storage
function saveSession() {
	var id = "ep_" + $("session-name").val(); //id della sessione
	var data = {
		username: $("#username").val(),
		password: $("#password").val();
		site: $("#site").val();
		folder = $("#folder").val();
		overwrite = $("#overwrite").val();
	};
	
	//save to chrome.store with sync
	chrome.storage.sync.set({id: data}, function() {
		//update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {status.textContent = '';}, 700);
	});
}

//restores input box state using the preferences stored in chrome.storage.
function restoreOptions() {
	//use default values
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

//add listener
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
