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
		var profile = {}; //oggetto da salvare in storage
		profile[id] = data;
		
		//TODO
		var exists = isProfileStored(data.profilename, function(exists) {
			//non lo aggiungo alla lista su pagina perché sarebbe un doppione
		});
		
		//salvo su storage (se l'id è uguale sovrascrivo i dati)
		chrome.storage.sync.set(profile, function () {
			showMessage("Profilo " + data.profilename + " salvato", SUCCESS);
			
			//aggiungo il profilo appena salvato alla lista dei profili su storage
			updateProfilesList(data.profilename);
			
			/*
			chrome.storage.sync.get(id, function(result) {
				$.each(result, function( index, value ){
					console.log(value);
				});
			});
			*/
		});
		
	}
}

//salvo ultimo profilo usato (al click sul pulsante di upload)
function saveLastUsedProfile(profileName) {
	console.log("saveLastUsedProfile");
	if (!isProfileNameEmpty()) {

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
	/*
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
	*/

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

//restores input box state using the preferences stored in chrome.storage and update profile list.
function loadLastUsedProfile() {
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
