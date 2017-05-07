
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForDependenciesToBeLoaded(next) {

	while (true) {
		
		try { 
			fx();
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

function saveToTextFile(text) {

    location.href = "data:application/octet-stream," + encodeURIComponent(text);
}

function loadGpxFile(evt) {

	function handleFileContents(gpxText) {
		
		var kmlText = kmlFromGpx(gpxText);

		document
			.getElementById('gpxOut')
			.textContent = gpxText;
		
		document
			.getElementById('kmlOut')
			.textContent = kmlText;

		saveToTextFile(kmlText);
	}

	loadFileFromFileInput(evt.target, encoding = 'UTF-8', handleFileContents);
}

function bindDocument() {
	document.getElementById('fileInput').addEventListener('change', loadGpxFile, false);
}

waitForDependenciesToBeLoaded(bindDocument);