
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForDependenciesToBeLoaded(next) {

	while (true) {
		try { 
			fx();
			gpx2kml();

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

function loadGpxFile(evt) {

	function handleFileContents(text) {
		
		console.log('text file loaded:');
		console.log(text);

		parser = new DOMParser();
		xmlDoc = parser.parseFromString(text, "text/xml");
	}

	loadFileFromFileInput(evt.target, encoding = 'UTF-8', handleFileContents);
}

function bindDocument() {
	document.getElementById('fileInput').addEventListener('change', loadGpxFile, false);
}

waitForDependenciesToBeLoaded(bindDocument);