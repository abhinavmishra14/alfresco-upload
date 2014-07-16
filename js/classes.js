//CLASS alfresco data
function alfrescoData(site, folder, file, description, overwrite) {
	this.filedata = file;
	this.siteid = site;
	this.containerid = "documentLibrary";
	this.uploaddirectory = folder;
	this.description = description;
	this.overwrite = overwrite;
	this.toJson = function() { return JSON.stringify(this); };
}