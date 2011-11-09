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

var noDataToVisualize = true;
var noChangeInLayout = true;

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
var maxDistanceForRepulsiveCharges = 400;
var repulsionConstant = 0.5;
var attractionConstant = 0.005;
var springConstant = 0.05;
var centerAttractionTolerance = 50;
var defaultRadius = 30;
var defaultLength = 100;

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

function createEdgePath(nodeID1, nodeID2) {

	var p1 = nodes[nodeID1].node.position, p2 = nodes[nodeID2].node.position;
	var path = new Path.Line(p1, p2);
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
		eventMan.pub("sitenode_clicked",{message:nodes[nodeID].name});
	if(nodes[nodeID].type == countryType)
		eventMan.pub("countrynode_clicked",{message:nodes[nodeID].name});

}



//--------------------

// CUSTOM FUNCTIONS CALLED FROM OUTSIDE

function addSiteNode(site) {

	mainNode = createNode(siteType,site,new Point(0,0),defaultRadius);

}

function addCountryForSite(countryData) {

	var countryNode = createNode(countryType,countryData.country,new Point(0,0),defaultRadius);
	createEdge(mainNode,countryNode,defaultLength);
	var isps = countryData.isps;
	for(var i=0; i<isps.length; i++) {
		var isp = isps[i];
		var ispNode = createNode(ispType,isp,new Point(i,i),defaultRadius);
		createEdge(countryNode,ispNode,defaultLength);
	}

}

function removeCountryForSite(country) {

	// TODO

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






populateGraph();





