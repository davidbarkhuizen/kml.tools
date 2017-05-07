function gpx2kml() {}

function cdata(s) {

	// idempotent
	//
	return (s.indexOf('![CDATA[') == -1)
		? `![CDATA[${s}]]`
		: s;
}

function newTextNode(doc, nodeName, textContent) {

	var node = doc.createElement(nodeName);
	node.textContent = textContent;
	return node;
};

function newVisibilityNode(doc, textContent) {
	return newTextNode(doc, 'visibility', textContent);
};

function newOpenNode (doc, textContent) {
	return newTextNode(doc, 'open', textContent);
};

function newSnippetNode(doc, textContent) {
	return newTextNode(doc, 'snippet', textContent);
};

function addNameVisibilityOpenNodes(doc, parentNode, name, isVisible, isOpen) {

	// Document.name
	//
	parentNode.appendChild(newTextNode(doc, 'name', name));

	// Document.visibility
	//                                                                                                                         ;'/////////////////*-+'
	parentNode.appendChild(newVisibilityNode(doc, isVisible));

	// Document.open
	//
	parentNode.appendChild(newOpenNode(doc, isOpen));
}


function newLineStyleNode(doc, color, width) {
	var node = doc.createElement('LineStyle');
	node.appendChild(newTextNode(doc, 'color', color));
	node.appendChild(newTextNode(doc, 'width', width));
	return node;
}


function newStyleNode(doc, lineColor, lineWidth) {
	var node = doc.createElement('Style');
	node.appendChild(newLineStyleNode(doc, lineColor, lineWidth));
	return node;
}

function getChildNodeByName(node, childNodeName) {

	var childNode =
		Array.from(node.childNodes)
		.filter((node => { return node.tagName == childNodeName; }))
		[0];

	return childNode;
}

function getChildNodeText(node, childNodeName) {

	var text = getChildNodeByName(node, childNodeName)
		.childNodes
		[0]
		.nodeValue;

	return text;
}

function newPointFromTrkPtNode(trkptNode) {

	/*
	<trkpt lat="-33.9627705049" lon="18.3843905758">
		<ele>50.13</ele>
		<time>2017-04-15T06:07:57Z</time>
	</trkpt>
	*/

	var latitude = trkptNode.getAttribute('lat');
	var longitude = trkptNode.getAttribute('lon');
	var elevation = getChildNodeText(trkptNode, 'ele');
	var time = getChildNodeText(trkptNode, 'time');

	return {
		lat: latitude,
		lon: longitude,
		ele: elevation,
		time: time
	};
}

function dateStringSort(a, b) {

	var 
		da = Date.parse(a.time),
		db = Date.parse(b.time);

	if (da < db)
		return -1;
	else if (da == db)
		return 0;
	else
		return 1;
}

function coordinatesStringFromTrkSegNode(trksegNode) {

	var points = Array.from(trksegNode.getElementsByTagName('trkpt'))
		.map(newPointFromTrkPtNode);

	/*
	<trkseg>
		<trkpt lat="-33.9627705049" lon="18.3843905758">
			<ele>50.13</ele>
			<time>2017-04-15T06:07:57Z</time>
		</trkpt>

		lon, lat, ele
		18.384390576,-33.962770505,50.13 18.384387055,-33.962797914,50.61
	*/

	return points
		.sort(dateStringSort)
		.map((pt) => { return `${pt.lon},${pt.lat},${pt.ele}`;})
		.join(' ');

}

function kmlMultiGeoLineStringNodeFromTrkSegNode(doc, trksegNode) {

/*
	<MultiGeometry>
		<LineString>
			<tessellate>1</tessellate>
			<altitudeMode>clampToGround</altitudeMode>
			<coordinates>
				18.384390576,-33.962770505,50.13 18.384387055,-33.962797914,50.61
*/

	var multiGeoNode = doc.createElement('MultiGeometry');

	// MultiGeometry.LineString
	//
	var lineStringNode = doc.createElement('LineString');

	// MultiGeometry.LineString.tesselate
	//
	var isTesselated = '1';
	lineStringNode.appendChild(newTextNode(doc, 'tessellate', isTesselated));	

	// MultiGeometry.LineString.altitudeMode
	//
	var altitudeMode = 'clampToGround';
	lineStringNode.appendChild(newTextNode(doc, 'altitudeMode', altitudeMode));

	// MultiGeometry.LineString.coordinates
	//
	var coordinates = coordinatesStringFromTrkSegNode(trksegNode);
	lineStringNode.appendChild(newTextNode(doc, 'coordinates', coordinates));

	multiGeoNode.appendChild(lineStringNode);

	return multiGeoNode;
}

function kmlPlaceMarkNodeFromGpxTrkSegNode(doc, trkSegNode, placemarkName) {

	var snippet = '';
	var description = 'trkSeg description';

	var styleId = 'gv_track';
	var styleUrl = '#' + styleId;
	var lineColor = 'fffffd22'; 
	var lineWidth = '4';

	var placemarkNode = doc.createElement('Placemark');

	// Placemark.name
	//
	placemarkNode.appendChild(newTextNode(doc, 'name', placemarkName));

	// Placemark.Snippet
	//
	placemarkNode.appendChild(newTextNode(doc, 'Snippet', snippet));

	// Placemark.Description
	//
	placemarkNode.appendChild(newTextNode(doc, 'description', description));

	// Placemark.styleUrl
	//
	placemarkNode.appendChild(newTextNode(doc, 'styleUrl', styleUrl));

	// Placemark.Style
	//
	placemarkNode.appendChild(newStyleNode(doc, lineColor, lineWidth));

	// Placemark.MultiGeometry.LineString
	//
	placemarkNode.appendChild(kmlMultiGeoLineStringNodeFromTrkSegNode(doc, trkSegNode));

	return placemarkNode;
}

function kmlFolderNodeFromGpxTrkNode(doc, trkNode) {

	var trackName = getChildNodeText(trkNode, 'name');

	var id = 'trackxxx';

	var folderNode = doc.createElement('Folder');
	folderNode.setAttribute('id', id);

	addNameVisibilityOpenNodes(doc, folderNode, trackName, '1', '0');

	Array.from(trkNode.getElementsByTagName('trkseg'))
		.forEach((trkSegNode, index, array) => {
			var placeMarkerName = array.length == 1
				? trackName
				: `${trackName} - ${index} of ${array.length}`;
			folderNode.appendChild(kmlPlaceMarkNodeFromGpxTrkSegNode(doc, trkSegNode, placeMarkerName));
		});

	return folderNode;
}

function kmlDocumentNodeFromGpxNode(doc, gpxNode) {

	var kmlDocumentNode = doc.createElement('Document');

	var documentName = 'convert gpx to kml @ gpxmaps.net'; 

	addNameVisibilityOpenNodes(doc, kmlDocumentNode, documentName, '1', '1');

	// Document.snippet
	//
	kmlDocumentNode.appendChild(newSnippetNode(doc, 'gpxmaps.net'));

	// gpx.trk -> Document.Folder
	//
	Array.from(gpxNode.getElementsByTagName('trk'))
		.forEach(function(trkNode){
			kmlDocumentNode.appendChild(kmlFolderNodeFromGpxTrkNode(doc, trkNode));
		});

	return kmlDocumentNode;
}

function kmlFromGpx(gpXml) {

	var kmlDoc = document
		.implementation
		.createDocument(null, 'kml', null);

	var kml = kmlDoc.createElement('kml');
	kml.setAttribute('xmlns', 'http://www.opengis.net/kml/2.2');

	// ----------------------------------------------------------

	var parser = new DOMParser();
	var doc = parser.parseFromString(gpXml, "text/xml");

	var gpxNodes = doc.getElementsByTagName('gpx');

	Array
		.from(gpxNodes)
		.forEach(function(gpxNode){ 
			var kmlDocumentNode = kmlDocumentNodeFromGpxNode(kmlDoc, gpxNode); 
			kml.appendChild(kmlDocumentNode);
		});

	var xmlHeader = '<?xml version="1.0"?>';
	var kmlText = new XMLSerializer().serializeToString(kml);

	return xmlHeader + kmlText;
}