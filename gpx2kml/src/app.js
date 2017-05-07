
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForDependenciesToBeLoaded(next) {

	while (true) {
		
		try { 
			gpx2kml();

			console.log('checked dependencies loaded');
			break;
		}
		catch (err) {
			console.log('some dependency not yet loaded');
			console.log(err);
			await sleep(250);
		}
	}

	next();
}

/*
function saveToTextFile(text) {

    location.href = "data:application/octet-stream," + encodeURIComponent(text);
}
*/

function saveToTextFile(xml, fileName, mimeType) {

	mimeType = (mimeType === undefined) ? 'text/xml' : mimeType;

	var blob = new Blob([xml], {type: mimeType});

	var dlBlobURL = window.URL.createObjectURL(blob);

	var dlLink = document.createElement('a');
	dlLink.download = fileName;
	dlLink.href = dlBlobURL;
	dlLink.dataset.downloadurl = [mimeType, dlLink.download, dlLink.href].join(':');

	document.body.appendChild(dlLink);
	dlLink.click();
	document.body.removeChild(dlLink);
};

function loadFileFromFileInput(element, encoding, onLoaded, onError) {

	var file = element.files[0];
	if (file) {

	    var reader = new FileReader();
	    reader.readAsText(file, encoding);

		reader.onload = evt => { onLoaded(evt.target.result); };
	    reader.onerror = (evt) => { onError(evt); };
	}
}

function loadGpxFile(evt) {

	var sourceFileName;

	function handleFileContents(gpxText) {
		
		var kmlText = kmlFromGpx(gpxText);

		document
			.getElementById('gpxOut')
			.textContent = gpxText;
		
		document
			.getElementById('kmlOut')
			.textContent = kmlText;

		var outFileName = sourceFileName.replace('.gpx', '.kml');

		saveToTextFile(kmlText, outFileName);
	}

	sourceFileName = evt.target.files[0].name;

	loadFileFromFileInput(evt.target, encoding = 'UTF-8', handleFileContents);
}

function bindDocument() {
	document.getElementById('fileInput').addEventListener('change', loadGpxFile, false);
}

waitForDependenciesToBeLoaded(bindDocument);