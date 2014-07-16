//saves options to chrome.storage
function saveOptions() {
	var site = document.getElementById('site').value;
	var folder = document.getElementById('folder').value;
	var file = document.getElementById('file').value;
	var description = document.getElementById('description').value;
	var overwrite = document.getElementById('overwrite').checked;
	
	//save to chrome.store
	chrome.storage.sync.set({
		site: site,
		folder: folder,
		file: file,
		description: description,
		overwrite: overwrite
	}, function() {
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
