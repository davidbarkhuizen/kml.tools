function gpx2kml() {}

/*
.xml
	.gpx
		.metadata
			.link
			.text
			.time
		.trk
			.name
			.extensions
				...
			.trkseg
				.trkpt: lat, lon
					.ele
					.time
*/

/*
kml
	.Document
		.name
		.visibility = 1
		.open = 1
		.Snippet
		.Style, id="gv_track"
			.LineStyle
				.color
				.width

		.Folder, id="Tracks"
			.name
			.visibility = 1
			.open = 1
			.Placemark
				.name
				.Snippet
					.description
					.styleUrl = #gv_track
					.Style
						.LineStyle
							.color
							.width
				.MultiGeometry
					.LineString
						.coordinates
*/


function newNode(doc, tagName, attributes) {

    var node = doc.createElement(tagName);

    for(var attr in attributes) {
    	node.setAttribute(attr, attributes[attr]);
    };	    

    return node;
}

function kmlFromGpx(gpXml) {

	document
		.getElementById('gpxOut')
		.textContent = gpXml;

	var kmlDoc = document
		.implementation
		.createDocument('http://www.opengis.net/kml/2.2', 'kml', null);

	var kml = kmlDoc.createElement('kml');

	var kmlDocumentNode = kmlDoc.createElement('Document');
	kml.appendChild(kmlDocumentNode);

	var parser = new DOMParser();
	var doc = parser.parseFromString(gpXml, "text/xml");

	var gpxs = doc.getElementsByTagName('gpx');
	var gpxCount = gpxs.length.toString() + ' gpx elements';
	console.log(gpxCount);

	Array.from(gpxs).forEach(gpx => { console.log('xxxs'); });

	var trks = gpxs[0].getElementsByTagName('trk');
	var trkCount = trks.length.toString() + ' trk elements';
	console.log(trkCount);

	var trksegs = trks[0].getElementsByTagName('trkseg');
	var trkSegCount = trksegs.length.toString() + ' trkseg elements';
	console.log(trkSegCount);

	var trkpts = trksegs[0].getElementsByTagName('trkpt');
	var trkptCount = trkpts.length.toString() + ' trkpts elements';
	console.log(trkptCount);

	var kmlXml = new XMLSerializer().serializeToString(kml);
	
	document
		.getElementById('kmlOut')
		.textContent = kmlXml;
}