//verifica validità di un profilo
function isProfileNameEmpty() {
	return !$("#profile-name").val().trim();
}

//saves options to chrome.storage
function saveProfile() {
	if (isProfileNameEmpty()) {
		showMessage("Dai un nome al profilo prima di salvarlo!", FAILURE);
	}
	else {
		var id = "ep_" + $("#profile-name").val();
		var data = {
			profilename: $("#profile-name").val(),
			username: $("#username").val(),
			password: $("#password").val(),
			siteid: $("#siteid").val(),
			uploaddirectory: $("#uploaddirectory").val(),
			overwrite: $("#overwrite").val()
		};
		var profile = {}; //oggetto da salvare in chrome
		profile[id] = data;
		
		//salvo su storage (se l'id è uguale sovrascrivo i dati)
		chrome.storage.sync.set(profile, function () {
			showMessage("Profilo " + data.profilename + " salvato", SUCCESS);
			chrome.storage.sync.get(id, function(result) {
				$.each(result, function( index, value ){
					console.log(value);
				});
				
				//braso tutto
				//chrome.storage.sync.clear(function () { console.log("Brasato lo storage") });
			});
		});
	}
}

//salvo ultimo profilo usato (al click sul pulsante di upload)
function saveLastUsedProfile(profileName) {
	console.log("saveLastUsedProfile");
	if (!isProfileNameEmpty()) {
		/*
		if ( isProfileStored(profileName) ) {
			console.log("il profilo " + profileName + " esiste e lo salvo come ultimo usato");
			chrome.storage.sync.set("ep_last_used_profile", function(result) {
				console.log("salvato ultimo profilo usato: " + profileName);
			});
		}
		*/
		isProfileStored(profileName, function(exists) {
			if (exists) {				
				console.log("il profilo " + profileName + " esiste e lo salvo come ultimo usato");
				chrome.storage.sync.set({"ep_last_used_profile": "ep_" + profileName}, function(result) {
					console.log("salvato ultimo profilo usato: " + profileName);
					
					chrome.storage.sync.get("ep_last_used_profile", function(profile) {
						//console.log("eccolo: " + profile.ep_last_used_profile);
					});
					
				});
			}
		});
	}
}

//verifico l'esistenza di un profilo nello store
function isProfileStored(profileName, callback) {
	if (!isProfileNameEmpty()) {
		var id = "ep_" + profileName;
		chrome.storage.sync.get(id, function(result) {
			if ($.isEmptyObject(result)) {
				callback(false); //return false;
			}
			else {
				callback(true); //return true;
			}
		});
	}
}

//restores input box state using the preferences stored in chrome.storage.
function restoreProfile() {
	//use default values
	chrome.storage.sync.get("ep_last_used_profile", function(result) {
		var profileId = result.ep_last_used_profile;
		//console.log("id profilo da cercare nello store: " + profileId);
		chrome.storage.sync.get(profileId, function(data) {
			var d = JSON.stringify(data);
			//console.log("JSON.stringify(data) = " + d);
			
			$("#siteid").val(data[profileId].siteid);
			$("#username").val(data[profileId].username);
			$("#password").val(data[profileId].password);
			$("#uploaddirectory").val(data[profileId].uploaddirectory);
			$("#overwrite").val(data[profileId].overwrite);
			
			$("#profile-name").val(data[profileId].profilename);

			console.log("caricato profilo " + data[profileId].profilename);
		});
	});
}

/*
function saveFavoriteProfile() {
	if (!checkProfile) {
		showMessage("Non posso impostare come preferito un profilo senza nome!", FAILURE);
	}
	else {
		chrome.storage.sync.get(id, function(result) {
		});
	}
}
*/