// graphdrawer.js - sharpnod.es


// GRAPH DATA STRUCTURE: TYPES, NODES, EDGES

// available types for graph nodes
var countryType = "country";
var siteType = "site";
var ispType = "isp";
var keywordType = "keyword";
// special type for edges
var edgeType = "edge";

// separator for node IDs
var sep = "/";

eventMan.sub("site_selected", function(a){addSiteNode(a)});
eventMan.sub("country_added", function(a){addCountryForSite(a)});
eventMan.sub("country_removed", function(a){removeCountryForSite(a)});


// nodes - contains all nodes in the graph.
// node IDs are in the form: type + sep + name.
// object structure as follows:
//	{
//		nodeid1: {
//			node: Path,
//			name: string,
//			type: string,
//			charge: int,
//			(additional fields based on type),
//			(parent: string)
//		}, 
//		...,
//		nodeidN: {...}
//	}
var nodes = {};

// edges - contains all edges in the graph.
// for each edge the two related node IDs are always ordered lexicographically.
// object structure as follows:
//	{
//		nodeid1: {
//			nodeid2: {
//				edge: Path,
//				length: int,
//				color: string
//			},
//			...,
//			nodeidN: {...}
//		}, 
//		...,
//		nodeidN: {...}
//	}
var edges = {};
var mainNode = null;

//--------------------

// CANVAS CONTROL FLAGS

var noDataToVisualize = false;
var noChangeInLayout = false;

//--------------------

// MOUSE EVENT CONTROL VARIABLES

var selectedNode = null;
var nodeWasDragged = false;
var hitOptions = {
    segments: true,
    stroke: true,
    fill: true,
    tolerance: 5
};


//--------------------

// LAYOUT ENGINE PARAMETERS

var centerOfScreen = view.center; // once for all! for scrolling and stuff.
var maxDistanceForRepulsiveCharges = 800;
var repulsionConstant = 3.0;
var attractionConstant = 0.002;
var springConstant = 0.05;
var centerAttractionTolerance = 50;
var defaultRadius = 30;
var defaultLength = 150;

//--------------------

// TEST STUFF

function populateGraph() {

	noDataToVisualize = false;
	noChangeInLayout = false;

	var 
		pathOneName = createNode(countryType, "Italy", centerOfScreen + [5,5], 30, "black"),
		pathTwoName = createNode(siteType, "youtube.com", centerOfScreen + [10,10], 30, "yellow"),
		pathThreeName = createNode(ispType,"Telecom Italia", centerOfScreen + [0,0],30, "blue");

	createEdge(pathOneName,pathThreeName,150,"black");
	createEdge(pathOneName,pathTwoName,200,"black");
	
	console.log(nodes);
	console.log(edges);

}

//--------------------

// CUSTOM FUNCTIONS

function calculateDeltas() {

	var deltas = {};
	for(node in nodes) {
		deltas[node] = new Point(0,0);
	}
	
	// repulsive charges: node1 pushed node2 away
	for(var node1 in nodes) {

		var p1 = nodes[node1].node.position;
		var charge1 = nodes[node1].charge;
		
		for(var node2 in nodes) {

			if(node1 == node2)
				continue;
			
			var p2 = nodes[node2].node.position;
			//fix coinciding points
			if(p1 == p2)
				p2 += [1, 1];
			
			var vector = (p2 - p1).normalize();
			var distance = p1.getDistance(p2);
			var charge2 = nodes[node2].charge;
			if(distance > maxDistanceForRepulsiveCharges)
				continue;
			var force = charge1 * charge2 * repulsionConstant / (distance * distance);
			var delta = [vector.x * force, vector.y * force];
	
			deltas[node2] += delta;
		}
	}
	
	// springs 
	for(var node1 in edges) {
	
		var p1 = nodes[node1].node.position;
		
		for(var node2 in edges[node1]) {
		
			var p2 = nodes[node2].node.position;
			//fix coinciding points
			if(p1 == p2)
				p2 += [1, 1];
			
			var vector = (p2 - p1).normalize();
			var distance = p1.getDistance(p2);
			var length = edges[node1][node2].length;
			var constant = springConstant; // TODO: handle smart dragging
			var force = (length - distance) * springConstant;
			var delta = [vector.x * force, vector.y * force];
			
			deltas[node1] -= delta;
			deltas[node2] += delta;
		}
	}
	
	// attracted by the center of the screen
	for(var node in nodes) {
	
		var p = nodes[node].node.position;
		var vector = (centerOfScreen - p).normalize();
		var distance = p.getDistance(centerOfScreen) - centerAttractionTolerance;
		
		if(distance > 0) {
			var force = attractionConstant * distance;
			var delta = [vector.x * force, vector.y * force];
		
			deltas[node] += delta;
		}
	
	}

	return deltas;
}

function updateNode(nodeID, deltas) {

	if(selectedNode!=null)
		if(selectedNode.name == nodeID)
			return;

	var delta = deltas[nodeID];
	var node = nodes[nodeID].node;
	var text = nodes[nodeID].text;
	node.position += delta;
	text.position += delta;

}

function createNode(type, id, center, radius, color) {

	var path = new Path.Circle(center, radius);
	var pathName = type + sep + id;
	if(color) {
		path.fillColor = color;
		path.strokeColor = color;
	}
	path.name = pathName;
	
	var text = new PointText(center);
	text.justification = "center";
	text.characterStyle = {
    	fontSize: 20,
    	fillColor: "red",
	};
	text.content = id;
	console.log("inserting text above path? " + path.insertBelow(text));
	nodes[pathName] = {
		node: path,
		//name: id,
		type: type,
		charge: radius,
		r: radius,
		text: text
	};
	
	return pathName;

}


function getVector(radians, length) {
    return new Point({
        // Convert radians to degrees:
        angle: radians * 180 / Math.PI,
        length: length
    });
}

function metaball(ball1, ball2, v, radius1, radius2, handle_len_rate) {
    var center1 = ball1.position;
    var center2 = ball2.position;
    //var radius1 = ball1.bounds.width / 2;
    //var radius2 = ball2.bounds.width / 2;
    var pi2 = Math.PI / 2;
    var d = center1.getDistance(center2);
    var u1, u2;

    if (radius1 == 0 || radius2 == 0)
        return;

    if (d <= Math.abs(radius1 - radius2)) {
        d = 1;
    } else if (d < radius1 + radius2) { // case circles are overlapping
        u1 = Math.acos((radius1 * radius1 + d * d - radius2 * radius2) /
                (2 * radius1 * d));
        u2 = Math.acos((radius2 * radius2 + d * d - radius1 * radius1) /
                (2 * radius2 * d));
    } else {
        u1 = 0;
        u2 = 0;
    }
        var angle1 = (center2 - center1).getAngleInRadians();
    var angle2 = Math.acos((radius1 - radius2) / d);
    var angle1a = angle1 + u1 + (angle2 - u1) * v;
    var angle1b = angle1 - u1 - (angle2 - u1) * v;
    var angle2a = angle1 + Math.PI - u2 - (Math.PI - u2 - angle2) * v;
    var angle2b = angle1 - Math.PI + u2 + (Math.PI - u2 - angle2) * v;
    var p1a = center1 + getVector(angle1a, radius1);
    var p1b = center1 + getVector(angle1b, radius1);
    var p2a = center2 + getVector(angle2a, radius2);
    var p2b = center2 + getVector(angle2b, radius2);

    // define handle length by the distance between
    // both ends of the curve to draw
    var totalRadius = (radius1 + radius2);
    var d2 = Math.min(v * handle_len_rate, (p1a - p2a).length / totalRadius);

    // case circles are overlapping:
    d2 *= Math.min(1, d * 2 / (radius1 + radius2));

    radius1 *= d2;
    radius2 *= d2;

    var path = new Path([p1a, p2a, p2b, p1b]);
    ball1.moveAbove(path);
    ball2.moveAbove(path);
    //path.style = ball1.style;
    path.closed = true;
    var segments = path.segments;
    segments[0].handleOut = getVector(angle1a - pi2, radius1);
    segments[1].handleIn = getVector(angle2a + pi2, radius2);
    segments[2].handleOut = getVector(angle2b - pi2, radius2);
    segments[3].handleIn = getVector(angle1b + pi2, radius1);
    return path;
}



function createEdgePath(nodeID1, nodeID2) {

	var circle1 = nodes[nodeID1].node, circle2 = nodes[nodeID2].node;
	var r1 = nodes[nodeID1].r, r2 = nodes[nodeID2].r;
	var path = metaball(circle1, circle2, 0.5, r1, r2, 2.4);

	//var p1 = nodes[nodeID1].node.position, p2 = nodes[nodeID2].node.position;
	//var path = new Path.Line(p1, p2);
	nodes[nodeID1].node.insertAbove(path);
	nodes[nodeID2].node.insertAbove(path);
	nodes[nodeID1].text.insertAbove(nodes[nodeID1].node);
	nodes[nodeID2].text.insertAbove(nodes[nodeID2].node);
	return path;

}

function createEdge(parentNodeID, childNodeID, edgeLength, color) {

	var firstNodeID = parentNodeID;
	var secondNodeID = childNodeID;

	//var firstNodeID = parentNodeID < childNodeID ? parentNodeID : childNodeID;
	//var secondNodeID = parentNodeID < childNodeID ? childNodeID : parentNodeID;
	
	var edgePath = createEdgePath(firstNodeID, secondNodeID);
	if(color!=null) {
		console.log("change link color to " + color);
		edgePath.fillColor = color;
		edgePath.strokeColor = color;
	}
	edgePath.name = edgeType + sep + firstNodeID + sep + secondNodeID;
	if(!edges[firstNodeID])
	edges[firstNodeID] = {};
	edges[firstNodeID][secondNodeID] = {
		edge: edgePath,
		length: edgeLength,
		color: color
	};
	nodes[childNodeID].parent = parentNodeID;

}

function updateEdge(parentNodeID, childNodeID, deltas) {

	var firstNodeID = parentNodeID;
	var secondNodeID = childNodeID;

	//var firstNodeID = nodeID1 < nodeID2 ? nodeID1 : nodeID2;
	//var secondNodeID = nodeID1 < nodeID2 ? nodeID2 : nodeID1;
	
	edges[firstNodeID][secondNodeID].edge.remove();
	var updatedPath = createEdgePath(firstNodeID, secondNodeID);
	updatedPath.fillColor = edges[firstNodeID][secondNodeID].color;
	updatedPath.strokeColor = edges[firstNodeID][secondNodeID].color;
	updatedPath.name = edgeType + sep + firstNodeID + sep + secondNodeID;
	edges[firstNodeID][secondNodeID].edge = updatedPath;

}

function handleNodeDrag(node,delta) {

	var name = node.name;

	node.position += delta;
	nodes[name].text.position += delta;
	
	// change spring length
	if(nodes[name].parent!=null) {
		
	}

}

function handleClick(where) {

	var hitResult = project.hitTest(where, hitOptions);
	
	if(hitResult==null)
		return null;
	
	var name = hitResult.item.name;
	console.log("selected: " + name + " (index of 'edge' = " + name.indexOf(edgeType)  + ") ");
	if(name.indexOf(edgeType) >= 0)
		return null;

	return hitResult.item;

}

function handleNodeClick(nodeID) {

	if(nodes[nodeID].type == siteType)
		eventMan.pub("sitenode_clicked",{message: nodes[nodeID].name});
	if(nodes[nodeID].type == countryType)
		eventMan.pub("countrynode_clicked",{message:nodes[nodeID].name});

}

function cleanUp() {

	for(var node in nodes) {
		nodes[node].node.remove();
		nodes[node].text.remove();
		delete nodes[node];
	}
	for(var node in edges) {
		for(var node2 in edges[node])
			edges[node][node2].edge.remove();
		delete edges[node];
	}

}



//--------------------

// CUSTOM FUNCTIONS CALLED FROM OUTSIDE

function addSiteNode(site) {

	cleanUp();
	mainNode = createNode(siteType,site.siteNode,view.center,defaultRadius*1.5,"grey");

}

function addCountryForSite(countryData) {

	var countryCenter = nodes[mainNode].node.position + [Math.random()*10-5,Math.random()*10-5];
	var countryNode = createNode(
		countryType,countryData.country,countryCenter,defaultRadius,'grey');
		
	console.log(countryNode);
	
	createEdge(mainNode,countryNode,defaultLength,'LightGrey');
	var isps = countryData.isps;
	for(var i=0; i<isps.length; i++) {
		var isp = isps[i];
		var ispNode = createNode(ispType,isp,
			countryCenter + [Math.random()*10-5,Math.random()*10-5],defaultRadius);
		createEdge(countryNode,ispNode,defaultLength,'LightGrey');
	}

}

function removeCountryForSite(country) {

	var countryNode = countryType + sep + country.countryName;
	
	console.log(countryNode);
	
	for(var ispNode in edges[countryNode]) {
		console.log(ispNode);
		nodes[ispNode].node.remove();
		nodes[ispNode].text.remove();
		delete nodes[ispNode];
		edges[countryNode][ispNode].edge.remove();
		delete edges[countryNode][ispNode];
	}
	
	
	delete edges[countryNode];
	edges[mainNode][countryNode].edge.remove();
	delete edges[mainNode][countryNode];
	nodes[countryNode].node.remove();
	nodes[countryNode].text.remove();
	delete nodes[countryNode];
	
console.log(nodes, edges);

}

//--------------------

// PAPER.JS FUNCTIONS

function onFrame(event) {

	if(noDataToVisualize || noChangeInLayout)
		return;
		
	var deltas = calculateDeltas();
	
	for(var node in nodes)
		updateNode(node, deltas);
		
	for(var node1 in edges)
		for(var node2 in edges[node1])
			updateEdge(node1, node2, deltas);

}

function onMouseDown(event) {

	selectedNode = handleClick(event.point);
        
}

function onMouseDrag(event) {
    
    if(selectedNode!=null) {
    	console.log("dragging " + selectedNode);
    	nodeWasDragged = true;
    	handleNodeDrag(selectedNode,event.delta);
    }
    else {
    	for(nodeID in nodes) {
    		nodes[nodeID].node.position += event.delta;
    		nodes[nodeID].text.position += event.delta;
    	}
    	for(nodeID1 in edges)
    		for(nodeID2 in edges[nodeID1])
    			edges[nodeID1][nodeID2].edge.position += event.delta;
    	centerOfScreen += event.delta;
    }
    
}

function onMouseUp(event) {

	if(selectedNode!=null)
		if(!nodeWasDragged) {
			console.log("alright, you clicked " + selectedNode.name);
			handleNodeClick(selectedNode.name);
		}
		
	selectedNode = null;
	nodeWasDragged = false;

}




//populateGraph();





