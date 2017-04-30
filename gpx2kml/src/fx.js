function fx() {}

function loadFileFromFileInput(element, encoding, onLoaded, onError) {

	var file = element.files[0];
	if (file) {

	    var reader = new FileReader();
	    reader.readAsText(file, encoding);

		reader.onload = evt => { onLoaded(evt.target.result); };
	    reader.onerror = (evt) => { onError(evt); };
	}
}