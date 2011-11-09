var repulsionConstant = 0.50
hookeConstant = 0.05
charge = 100.0
edgeLength = 100
var attractionConstant = 0.005;
var distanceFromCenter = 0;

eventMan.sub("paperEvent", function(a){alert(a.message)});


var dioCenter = new Point(50,50),
	madonnaCenter = new Point(30,80),
	gesuCenter = new Point(200,200);

var edges = {
	"dio": {"madonna": new Path.Line(dioCenter, madonnaCenter)},
	"gesu": {"madonna": new Path.Line(gesuCenter, madonnaCenter)}
};

var dioPath = new Path.Circle(dioCenter,30),
	madonnaPath = new Path.Circle(madonnaCenter,30),
	gesuPath = new Path.Circle(gesuCenter,30);
	
dioPath.name = "dio";
madonnaPath.name = "madonna";
gesuPath.name = "gesu";


var nodes = {
	"dio": {
		"circle": dioPath,
		"expanded": false
	},
	"madonna": {
		"circle": madonnaPath,
		"expanded": false
	},
	"gesu": {
		"circle": gesuPath,
		"expanded": false
	}
};

var circleToNode = {
	dioPath: "dio",
	madonnaPath: "madonna",
	gesuPath: "gesu"
};

console.log("initial positions: ");
for(var node in nodes) {
	console.log("   " + node  + ": " + nodes[node].circle.position);
}
for(var node1 in edges) {
	for(var node2 in edges[node1]) {
		console.log("   (" + node1 + "," + node2 + ": " + edges[node1][node2].segments);
	}
}

for(var node1 in edges) {
	for(var node2 in edges[node1]) {
		edges[node1][node2].strokeColor = "black";
	}
}
for(var node in nodes) {
	nodes[node].circle.strokeColor = "black";
	nodes[node].circle.fillColor = "grey";
}


var hitOptions = {
    segments: true,
    stroke: true,
    fill: true,
    tolerance: 5
};
var selectedNode = null;


function expandOrCollapse(hitResult) {


	console.log("clicked item: " + hitResult.item);

	var node = hitResult.item.name;

	//var node = circleToNode[hitResult.item];
	
	console.log("clicked node: " + node);
	
	if(nodes[node].expanded)
		return;
		
	nodes[node].expanded = true;
		
	for(var i=0; i<3; i++) {
	
		var newnode = "" + i + "_" + node;
		var sign = i%2 == 0 ? 1 : -1;
		var newnodeCircle = new Path.Circle(nodes[node].circle.position + [sign*i, -sign*i],30);
		newnodeCircle.strokeColor = "black";
		newnodeCircle.fillColor = "grey";
		newnodeCircle.name = newnode;
		nodes[newnode] = {
			"circle": newnodeCircle,
			"expanded": false
		};
		circleToNode[newnodeCircle] = newnode;
		if(!edges[node])
			edges[node] = {};
		edges[node][newnode] = new Path.Line(hitResult.item.position, newnodeCircle.position);
		edges[node][newnode].strokeColor = "black";
		edges[node][newnode].insertBelow(newnodeCircle);
		edges[node][newnode].insertBelow(hitResult.item);
		
	}

	hitResult.item.fillColor = "white";
}

function onDblclick() {

	console.log("sss");
}

TrapClicksForHowManySeconds = 0.5;
var myArray = new Array(10);
ClickCounter = 0;

function myDoubleClickTrapperAction() {

    var tDate = new Date;
	clickTime = tDate.valueOf();
	myArray[ClickCounter] = clickTime;
    
    console.log("clickcounter" + ClickCounter);

    if (ClickCounter > 1) {
    
  		console.log("current time" + myArray[ClickCounter]);
	  	console.log("prev time" + myArray[ClickCounter-1]);
		console.log("difference " + (myArray[ClickCounter] - myArray[ClickCounter-1]));

	    if((myArray[ClickCounter] - myArray[ClickCounter-1]) < (TrapClicksForHowManySeconds * 1000)) { 
	    	eventMan.pub("myEvent", {message:'myEvent has been triggered'});
			return true;
		}
	}
	
	if(ClickCounter > 9) {
		ClickCounter = 0;	
	} else {
		ClickCounter++;
	}
	
	return false;	
	
}


function onMouseDown(event) {

    var hitResult = project.hitTest(event.point, hitOptions);
	
	if(hitResult==null)
		return;
		
	if (myDoubleClickTrapperAction())
		expandOrCollapse(hitResult);

    
    selectedNode = hitResult.item;
        
}



function onMouseDrag(event) {

    if(selectedNode) {
    	selectedNode.position += event.delta;
    }
    
}

function onMouseUp(event) {
	selectedNode = null;
}


function calculateDeltas() {

	//console.log("calculating deltas");

	var deltas = {};
	for(node in nodes) {
		deltas[node] = new Point(0,0);
	}
	
	// repulsive charges
	for(var node1 in nodes) {
	
		
		var p1 = nodes[node1].circle.position;
		
		
		for(var node2 in nodes) {

			if(node1==node2)
				continue;
			
			//console.log(node1 + " " + node2);
			
			var p2 = nodes[node2].circle.position;
			
			var vector = (p2 - p1).normalize();
			
			var distance = Math.max(10,p1.getDistance(p2));
			
			if(distance > 2*edgeLength)
				continue;
			
			
			var force = charge*charge*repulsionConstant/(distance*distance);
			var delta = [vector.x * force, vector.y * force];
			
			//console.log("   vector = " + vector + ", distance = " + distance + ", delta = " + delta);
			
			deltas[node2] += delta;
		}
	}
	
	// springs 
	for(var node1 in edges) {
	
		var p1 = nodes[node1].circle.position;
		
		for(var node2 in edges[node1]) {
		
			
			var p2 = nodes[node2].circle.position;
			
			var vector = (p2 - p1).normalize();
			
			var distance = Math.max(10,p1.getDistance(p2));
			
			var force = (edgeLength - distance)*hookeConstant;
			var delta = [vector.x * force, vector.y * force];
			
			deltas[node1] -= delta;
			deltas[node2] += delta;
				
		}
	}
	
	// attracted by the center of the screen
	for(var node in nodes) {
	
		var p = nodes[node].circle.position;
		var vector = (view.center - p).normalize();
		var distance = Math.max(10,p.getDistance(view.center) - distanceFromCenter);
		
		if(distance > 0) {
			var force = attractionConstant * distance;
			var delta = [vector.x * force, vector.y * force];
		
			deltas[node] += delta;
		}
		
	
	}
	

	return deltas;

}


var timeFromLastRefresh = 0;

function onFrame(event) {


	//timeFromLastRefresh += event.delta;
	//if(timeFromLastRefresh < 1./40.)
	//	return;
	//timeFromLastRefresh = 0;

	deltas = calculateDeltas(nodes);
	
	//console.log("deltas:");
	for(var node in deltas) {
		//console.log("   " + node  + ": " + deltas[node]);
	}
	
	//console.log("updating positions:");

	for(var node in nodes) {
		if(nodes[node].circle!=selectedNode)
			nodes[node].circle.position += deltas[node];
		//console.log("   " + node + ": " + nodes[node].position);
	}
	for(var node1 in edges) {
		for(var node2 in edges[node1]) {
			edges[node1][node2].segments[0].point = nodes[node1].circle.position;
			edges[node1][node2].segments[1].point = nodes[node2].circle.position;
			//console.log("   (" + node1 + "," + node2 + "): " + edges[node1][node2].segments);
		}
	}

    // the number of times the frame event was fired:
    //console.log(event.count);

    // The total amount of time passed since
    // the first frame event in seconds:
    //console.log(event.time);

    // The time passed in seconds since the last frame event:
    //console.log(event.delta);
}


