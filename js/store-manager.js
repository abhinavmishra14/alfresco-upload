/**
 * Restituisce in callback un array con i dati di un profilo oppure un messaggio d'errore se qualcosa va storto
 *
 */
function getProfile(id, callback) {
	chrome.storage.sync.get("epau_profiles", function(result) {
		//in caso di errore restituisco il messaggio d'errore di chrome
		if (chrome.runtime.lastError) {
			callback(chrome.runtime.lastError.message); //restituisco errore
		}
		else {
			//console.log("[getProfile] ecuperato profilo '" + id + "': " + result.epau_profiles[id]);
			callback(result.epau_profiles[id]); //restituisco i dati del profilo
		}
	});
}

/**
 * Restituisce in callback un array che rappresenta la lista profili oppure un messaggio d'errore
 *
 */
function getProfilesList(callback) {	
	chrome.storage.sync.get({"epau_profiles": []}, function(result) {
		//in caso di errore restituisco il messaggio d'errore di chrome
		if (chrome.runtime.lastError) {
			callback(chrome.runtime.lastError.message); //restituisco errore
		}
		else {
			console.log("[getProfilesList] restituisco lista: [" + Object.keys(result.epau_profiles) + "]");
			callback(Object.keys(result.epau_profiles)); //restituisco la lista
		}
	});	
}

/**
 * Salva i dati di un profilo nello storage (chrome.storage). In input si aspetta un oggetto con:
 * profilename: stringa
 * username: stringa
 * password: stringa
 * siteid: stringa
 * uploaddirectory: stringa
 * overwrite: stringa (true o false)
 *
 * restituisce: "ok" se tutto bene, stringa d'errore se qualcosa va male 
 */
function saveProfile(data, callback) {
	var id = data.profilename; //salvo l'id del profilo
	
	chrome.storage.sync.get("epau_profiles", function(result) {
		//console.log("[saveProfileX] epau_profiles PRIMA: " + JSON.stringify(result));
		//console.log("[saveProfileX] result.epau_profiles = " + result.epau_profiles);
		if (isUndefined(result.epau_profiles)) {
			result.epau_profiles = {}; //inizializzo se undefined
		}
		result.epau_profiles[id] = data; //salvo indicizzando con l'id del profilo (se esistente sovrascrivo)
		
		chrome.storage.sync.set({"epau_profiles": result.epau_profiles}, function () {
			//in caso di errore restituisco il messaggio d'errore di chrome
			if (chrome.runtime.lastError) {
				callback(chrome.runtime.lastError.message);
			}
			else {
				/*
				chrome.storage.sync.get({"epau_profiles": []}, function(result) {
					console.log("[saveProfileX] epau_profiles DOPO: " + JSON.stringify(result));
					console.log("[saveProfileX] questi i nomi dei profili: " + Object.keys(result.epau_profiles));
				});
				*/
				callback("ok");
			}
		});
	});
}

/**
 * Cancella profilo da db chrome.
 * id: id del profilo da eliminare
 */
function deleteProfile(id, callback) {	
	existsProfile(id, function(exists) {
		if (chrome.runtime.lastError) {
			callback(chrome.runtime.lastError.message);
		}
		//se esiste lo elimino
		if (exists) {
			chrome.storage.sync.get("epau_profiles", function(result) {
				if (chrome.runtime.lastError) {
					callback(chrome.runtime.lastError.message);
				}
				else {
					//console.log("[deleteProfile] prima: " + Object.keys(result.epau_profiles));
					delete result.epau_profiles[id]; //elimino il profilo
					//console.log("[deleteProfile] dopo: " + Object.keys(result.epau_profiles));
					chrome.storage.sync.set({"epau_profiles": result.epau_profiles}, function() {
						callback("ok"); //ok;
					});
				}
			});	
		}
		else {
			//console.log("[deleteProfile] il profilo '" + id + "' NON esiste. Ritorno 'ne'");
			callback("ne"); //non esiste
		}
	});
}

/**
 * Salvo i dati utilizzati l'ultima volta in upload
 *
 * data: array con i metadati di upload
 * callback: dove ritorno il risultato
 */
function saveLastUsedUploadData(data, callback) {
	chrome.storage.sync.set({"epau_last_used_upload_data": data}, function() {
		if (chrome.runtime.lastError) {
			callback(chrome.runtime.lastError.message);
		}
		else {
			//console.log("[saveLastUsedUploadData] salvati ultimi dati di upload usati: [" + data + "]");
			callback("ok");
		}
	});
}

/**
 * Recupero i dati utilizzati l'ultima volta in upload
 *
 * callback: dove ritorno il risultato
 */
function getLastUsedUploadData(callback) {
	chrome.storage.sync.get("epau_last_used_upload_data", function(result) {
		if (chrome.runtime.lastError) {
			callback(chrome.runtime.lastError.message);
		}
		else {
			//console.log("[getLastUsedUploadData] recuperati ultimi dati di upload usati: " + JSON.stringify(result.last_used_upload_data));
			callback(result.epau_last_used_upload_data);
		}
	});
}

/**
 * Verifico l'esistenza di un profilo nello store
 */
function existsProfile(id, callback) {

	/*
	chrome.storage.sync.get(id, function(result) {
		if (chrome.runtime.lastError) {
			callback(chrome.runtime.lastError.message);
		}
		if ($.isEmptyObject(result)) {
			callback(false); //return false;
		}
		else {
			callback(true); //return true;
		}
	});
	*/
	
	chrome.storage.sync.get("epau_profiles", function(result) {
		if (chrome.runtime.lastError) {
			callback(chrome.runtime.lastError.message);
		}
		if ($.isEmptyObject(result.epau_profiles[id])) {
			callback(false); //return false;
		}
		else {
			callback(true); //return true;
		}
	});
}

/**
 * Resetto il db
 */
function clearDb() {
	//braso tutto
	chrome.storage.sync.clear(function () { 
		if (chrome.runtime.lastError) {
			console.log("[clearDb] errore nel clear del DB: " + chrome.runtime.lastError.message);
		}
		else {
			console.log("[clearDb] brasato lo storage");
		}
	});
}

/**
 * Tutti i dati su storage
 */
function getAll(callback) {
	chrome.storage.sync.get(null, function(items) {
		if (chrome.runtime.lastError) {
			callback(chrome.runtime.lastError.message);
		}
		if ($.isEmptyObject(items)) {
			callback("db vuoto");
		}
		else {
			var allKeys = Object.keys(items);
			var allValues = Object.values(items);
			console.log("[getAll] keys: [" + allKeys + "]");
			console.log("[getAll] values: [" + allValues + "]");
			callback(items);
		}
	});
}

/**
 * Esporta tutti i dati dello store locale su un file di backup
 */
function exportAll(callback) {
	//estraggo tutto il db
	chrome.storage.sync.get(null, function(items) { //null implies all items
		var result = JSON.stringify(items);
		var buff = btoa(result);
		
		//salvo come file 
		var url = "data:application/json;base64," + buff;
		chrome.downloads.download({
			url: url,
			filename: "alfresco-upload-backup.json",
			saveAs: true
		}, function(id) {
			console.log("[exportAll] chrome.downloads.download callback");
			if (chrome.runtime.lastError) {
				//console.log("[exportAll] errore nell'export: " + chrome.runtime.lastError.message);
				callback(chrome.runtime.lastError.message);
			}
			else {
				//console.log("[exportAll] export ok. downloadId = " + id);
				callback("ok");
			}
		});
	});
}

/**
 * Importa tutti i dati dei profili nello store locale parsando un oggetto json
 */
function importProfiles(json, callback) {
	//importo i profili
	//console.log("[importProfiles] import in corso su storage");
	var profiles = {};
	var newProfiles = {};
	chrome.storage.sync.get("epau_profiles", function(result) {
		
		if (isUndefined(result.epau_profiles)) {
			result.epau_profiles = {}; //inizializzo se undefined
		}
		
		profiles = result.epau_profiles;
		newProfiles = json.epau_profiles;
		
		//pusho i profili nuovi
		for (var profile in newProfiles) {
			profiles[profile] = newProfiles[profile];
		}
		
		chrome.storage.sync.set({"epau_profiles": profiles}, function(result) {
			if (chrome.runtime.lastError) {
				//console.log("[importProfiles] errore nell'export: " + chrome.runtime.lastError.message);
				callback(chrome.runtime.lastError.message);
			}
			else {
				//console.log("[importProfiles] import ok");
				callback("ok");
			}
		});
	});
}
	
/**
 * Quanti byte occupa il db?
 */
function getBytesInUse(callback) {
	chrome.storage.sync.getBytesInUse(null, function(result) {
		if (chrome.runtime.lastError) {
			callback(chrome.runtime.lastError.message);
		}
		else {
			console.log("[getBytesInUse] bytes used = " + result);
			callback(result);
		}
	});
}

//serve per estrarre tutti i valori di un oggetto con chiave-valore
Object.values = function(object) {
	var values = [];
	for (var property in object) {
		values.push(object[property]);
	}
	return values;
}