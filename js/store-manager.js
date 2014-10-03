/**
 * Aggiorna il dato contenente la lista profili su storage aggiungendone uno
 *
 * id: il nome profilo da aggiungere
 *
 */
function appendToProfilesList(id, callback) {
	var values = [];
	chrome.storage.sync.get({"ep_profiles_list": []}, function(result) {
		values = result.ep_profiles_list;
		values.push(id);
		values.sort(); //ordino la lista
		
		//aggiorno lista nello storage
		chrome.storage.sync.set({"ep_profiles_list": values}, function() {
			if (chrome.runtime.lastError) {
				callback(chrome.runtime.lastError.message);
			}
			//console.log("[appendToProfilesList] aggiornata lista profili su store: [" + values + "]");
			callback("ok");
		});
	});
}

/**
 * Aggiorna il dato contenente la lista profili su storage togliendone uno
 *
 * id: il nome profilo da togliere
 *
 */
function removeFromProfilesList(id, callback) {
	var values = [];
	chrome.storage.sync.get({"ep_profiles_list": []}, function(result) {
		if (chrome.runtime.lastError) {
			callback(chrome.runtime.lastError.message);
		}	
		values = result.ep_profiles_list;
		var newValues = [];

		for (var i=0; i < values.length; i++) {
			if (values[i] != id) {
				newValues.push(values[i]);
			}
		}
		newValues.sort(); //ordino la lista
		
		//aggiorno lista nello storage
		chrome.storage.sync.set({"ep_profiles_list": newValues}, function() {
			if (chrome.runtime.lastError) {
				callback(chrome.runtime.lastError.message);
			}
			//console.log("[removeFromProfilesList] aggiornata lista profili su store: [" + newValues + "]");
			callback("ok");
		});
	});
}

/**
 * Restituisce in callback un array che rappresenta la lista profili oppure un messaggio d'errore
 *
 */
function getProfilesList(callback) {
	chrome.storage.sync.get({"ep_profiles_list": []}, function(result) {
		//in caso di errore restituisco il messaggio d'errore di chrome
		if (chrome.runtime.lastError) {
			callback(chrome.runtime.lastError.message); //restituisco errore
		}
		else {
			//console.log("[getProfilesList] restituisco lista: [" + result.ep_profiles_list + "]");
			callback(result.ep_profiles_list); //restituisco la lista
		}
	});
}

/**
 * Salva i dati di un profilo nello storage (chrome.storage). In input si aspetta un array con:
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
	var id = data.profilename;
	var profile = {}; //oggetto da salvare in storage
	profile[id] = data;
	
	//salvo profilo dopo aver verificato la sua esistenza
	existsProfile(id, function(exists) {
		//console.log("[saveProfile] profilo '" + id + "' esiste su storage? " + exists);
		//salvo su storage (se l'id è uguale sovrascrivo i dati)
		chrome.storage.sync.set(profile, function (result) {
			//in caso di errore restituisco il messaggio d'errore di chrome
			if (chrome.runtime.lastError) {
				callback(chrome.runtime.lastError.message);
			}
			if (exists) {
				//console.log("[saveProfile] il profilo '" + id + "' esiste, ritorno ok");
				callback("ok"); //ritorno
			}
			//se non esiste lo aggiugno alla lista profili su storage
			else {
				appendToProfilesList(id, function(result) {
					if (chrome.runtime.lastError) {
						callback(chrome.runtime.lastError.message);
					}
					if (result == "ok") {
						//console.log("[saveProfile] il profilo '" + id + "' non esiste, ma l'ho aggiunto in lista su storage e ritorno ok");						
						callback("ok"); //ritorno ok
					}	
				});
			}
		});
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
function saveProfileX(data, callback) {
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
 * Restituisce in callback un array con i dati di un profilo oppure un messaggio d'errore se qualcosa va storto
 *
 */
function getProfile(id, callback) {
	chrome.storage.sync.get(id, function(result) {
		//in caso di errore restituisco il messaggio d'errore di chrome
		if (chrome.runtime.lastError) {
			callback(chrome.runtime.lastError.message); //restituisco errore
		}
		else {
			//console.log("[getProfile] recupero profilo '" + id + "'");
			callback(result[id]); //restituisco i dati del profilo
		}
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
			chrome.storage.sync.remove(id, function () {
				//console.log("[deleteProfile] il profilo '" + id + "' esiste e l'ho eliminato");
				removeFromProfilesList(id, function(result) {
					if (chrome.runtime.lastError) {
						callback(chrome.runtime.lastError.message); //restituisco errore
					}
					else {
						//console.log("[deleteProfile] eliminato profilo '" + id + "' anche dalla lista");
						callback("ok");
					}				
				});
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
	chrome.storage.sync.set({"last_used_upload_data": data}, function() {
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
	chrome.storage.sync.get("last_used_upload_data", function(result) {
		if (chrome.runtime.lastError) {
			callback(chrome.runtime.lastError.message);
		}
		else {
			//console.log("[getLastUsedUploadData] recuperati ultimi dati di upload usati: " + JSON.stringify(result.last_used_upload_data));
			callback(result.last_used_upload_data);
		}
	});
}

/**
 * Verifico l'esistenza di un profilo nello store
 */
function existsProfile(id, callback) {
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
 * Importa tutti i dati nello store locale parsando un file json
 */
function importAll(json, callback) {
	//importo tutto il db
	//console.log("[importAll] import in corso su storage");
	chrome.storage.sync.set(json, function(result) { //null implies all items
		if (chrome.runtime.lastError) {
			//console.log("[importAll] errore nell'export: " + chrome.runtime.lastError.message);
			callback(chrome.runtime.lastError.message);
		}
		else {
			//console.log("[importAll] import ok");
			callback("ok");
		}
	});
}
	
/**
 * Quanti MB occupa il db?
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