/**
 * Salva i dati di un profilo nello storage (chrome.storage). In input si aspetta un array con:
 * profilename: stringa
 * username: stringa
 * password: stringa
 * siteid: stringa
 * uploaddirectory: stringa
 * overwrite: stringa (true o false)
 */
function saveProfile(data) {
	var id = data.profilename;
	var profile = {}; //oggetto da salvare in storage
	profile[id] = data;
	var existsProfile;
	
	isProfileStored(id, function(exists) {
		console.log("profilo " + id + " esiste su storage? " + exists);
		existsProfile = exists;
		console.log("existsProfile = " + existsProfile);
	});
	
	//salvo su storage (se l'id è uguale sovrascrivo i dati)
	chrome.storage.sync.set(profile, function (result) {
		showMessage("Profilo " + id + " salvato", SUCCESS);
		//aggiungo il profilo appena salvato alla lista dei profili su storage
		if (!existsProfile) {
			updateProfilesList(id);
			console.log("aggiunto '" + id + "' alla lista profili su tendina");
		}
	});
}

/**
 * Cancella profilo da db chrome.
 * id: id del profilo da eliminare
 */
function deleteProfile(id) {
	console.log("sono dentro deleteProfile");
	
	isProfileStored(id, function(exists) {
		console.log(id + " esiste? " + exists);
		console.log("rimuovo");
		
		///////////////
		chrome.storage.sync.remove(id, function () {
			//console.log("remove result: " + JSON.stringify(result[0]));
			isProfileStored(id, function(exists) {
				console.log(id + " esiste? " + exists);
				showMessage("Profilo " + id + " rimosso con successo", SUCCESS);
			});
			
		});
		/////////////////////

	});


}

//salvo ultimo profilo usato (al click sul pulsante di upload)
function saveLastUsedProfile(profileName) {
	console.log("profileName empty? " + (profileName.trim().length == 0));
	if ( !(profileName.trim().length == 0)) {
		isProfileStored(profileName, function(exists) {
			if (exists) {				
				console.log("il profilo " + profileName + " esiste e lo salvo come ultimo usato");
				chrome.storage.sync.set({"ep_last_used_profile": profileName}, function(result) {
					console.log("salvato ultimo profilo usato: " + profileName);					
				});
			}
		});
	}
}

/**
 * verifico l'esistenza di un profilo nello store
*/
function isProfileStored(id, callback) {
	chrome.storage.sync.get(id, function(result) {
		if ($.isEmptyObject(result)) {
			callback(false); //return false;
		}
		else {
			callback(true); //return true;
		}
	});
}

//restores input box state using the preferences stored in chrome.storage and update profile list.
function loadLastUsedProfile() {
	//use default values
	chrome.storage.sync.get("ep_last_used_profile", function(result) {
		var profileId = result.ep_last_used_profile;
		//console.log("id profilo da cercare nello store: " + profileId);
		chrome.storage.sync.get(profileId, function(data) {
			if (!$.isEmptyObject(data)) { //se il pofilo esiste
				var d = JSON.stringify(data);
				//console.log("JSON.stringify(data) = " + d);
				
				$("#siteid").val(data[profileId].siteid);
				$("#username").val(data[profileId].username);
				$("#password").val(data[profileId].password);
				$("#uploaddirectory").val(data[profileId].uploaddirectory);
				$("#overwrite").val(data[profileId].overwrite);
				
				$("#profile-name").val(data[profileId].profilename);

				console.log("caricato profilo " + data[profileId].profilename);
			}
			else {
				console.log("Il profilo " + profileId + " non risulta presente sullo storage");
			}
		});
	});
}

//aggiorna la lista dei profili in pagina
function refreshProfilesList() {
	chrome.storage.sync.get({"ep_profiles_list": []}, function(result) {
		var profiles = result.ep_profiles_list;	

		$("#profiles").empty(); //svuoto la lista su pagina
		//aggiorno la lista lista su pagina
		for (var i = 0; i < profiles.length; i++) {
			$("#profiles").append("<option value='" + profiles[i] + "'>");
		}
	});
}

//salva la lista dei profili su storage aggiungendo il nome del nuovo profilo
function updateProfilesList(profileName) {
	var dataList = document.getElementById("profiles");
	//console.log("profiles.length = " + dataList.options.length);
	var values = [];
	chrome.storage.sync.get({"ep_profiles_list": []}, function(result) {
		values = result.ep_profiles_list;
		values.push(profileName);
		values.sort(); //ordino la lista
		
		//aggiorno oggetto nello storage
		chrome.storage.sync.set({"ep_profiles_list": values}, function(result) {
			console.log("aggiornata lista profili su store: " + values);
			
			//aggiorno lista profili su pagina
			refreshProfilesList();
		});
	});
}

//braso lo storage
function clearDb() {
	//braso tutto
	chrome.storage.sync.clear(function () { 
		console.log("Brasato lo storage")
	});
}
