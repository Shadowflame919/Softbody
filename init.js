/*

	Initalises the project
	Creates the main class and puts it's update/render in a loop

	Handles event listeners related to the mouse

	Also contains a bunch of random functions not specific to the program but still needed

*/

// == External Functions ==

// Fills canvas with a single colour
function fillCanvas(colour) {	
	ctx.fillStyle = colour;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draws text with certain attributes
function drawText(text, x, y, size, colour="black", align="left") {		
	ctx.textAlign = align;	// "left", "center", "right"
	ctx.font = size + "px Verdana";
	ctx.fillStyle = colour;
	ctx.fillText(text, x, y);
}

// Returns the length of text in pixels if it were to be rendered
function drawTextLength(text, size) {	
	ctx.font = size + "px Verdana";
	return ctx.measureText(text).width;
}

// Draws a rectangle with certain attributes
function drawRect(rect, strokeColour="black", strokeSize=1, fillColour=false, center=false, _ctx=ctx) {
	_ctx.beginPath();
	if (center) _ctx.rect(rect.x-rect.w/2, rect.y-rect.h/2, rect.w, rect.h);
	else _ctx.rect(rect.x, rect.y, rect.w, rect.h);
	if (fillColour) {	// Fills rect if fillColour was set
		_ctx.fillStyle = fillColour;
		_ctx.fill();
	}
	if (strokeColour) {	// Outlines if strokeColour was set
		_ctx.lineWidth = strokeSize;
		_ctx.strokeStyle = strokeColour;
		_ctx.stroke();
	}
}

// Draws a circle with certain attribules
function drawCircle(x, y, radius, strokeColour=false, strokeSize=1, fillColour="black", arc=[0,2*Math.PI]) {
	ctx.beginPath();
	ctx.arc(x, y, radius, arc[0], arc[1], false); 
	if (strokeColour) {	// Fills if fill type
		ctx.lineWidth = strokeSize;
		ctx.strokeStyle = strokeColour;
		ctx.stroke();
	}
	if (fillColour) {	// Outlines if stroke type
		ctx.fillStyle = fillColour;
		ctx.fill();
	}
}

// Draws a single line connecting 2 points
function drawLine(points, strokeColour="black", strokeSize=1) {		
	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y);
	ctx.lineTo(points[1].x, points[1].y);
	ctx.lineWidth = strokeSize;
	ctx.strokeStyle = strokeColour;
	ctx.stroke();
}

// Returns if point is within a rectangle (inclusive)
function pointInRect(point, rect) {
	if (rect.x <= point.x && point.x <= rect.x + rect.w) {		// Tests if within x boundaries
		if (rect.y <= point.y && point.y <= rect.y + rect.h) {		// Tests if within y boundaries
			return true;
		}
	}
	return false;
}

// Maps a value from one range to another range
function mapValue(val, oldMin, oldMax, newMin, newMax) {	
	return newMin + (newMax-newMin) * (val-oldMin) / (oldMax-oldMin);
}

// Returns a copy of a 1D array instead of a pointer
function shallowCopy(oldArr) {	
	let newArr = [];
	for (i in oldArr) {
		newArr.push(oldArr[i]);
	}
	return newArr;
}

function randArr(arr) {	// Returns a random value from an array
	return arr[Math.floor(arr.length * Math.random())];
}

function avgArr(arr) {
	let sum = 0;
	for (var i=0; i<arr.length; i++) {
		sum += arr[i];
	}
	return sum / arr.length;
}


// == Main Program Code ==

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var main = new Main();
main.init();

function mainLoop(timestamp) {	// Updates program once per frame	
	main.update(timestamp);
	main.render();
	window.requestAnimationFrame(mainLoop);
}
mainLoop();


// == Uploading data HTML tag ==
var uploadElement = document.createElement("input");
uploadElement.type = "file";
uploadElement.style.display = "none";
uploadElement.id = "uploadData"
uploadElement.onchange = function(e){	// Runs when file is uploaded
	if (uploadElement.files.length == 1) {
		let reader = new FileReader();
		reader.onload = function(e) { 	// Passed into main when file has been read
			main.uploadFile(reader.result);
		}
		reader.readAsText(uploadElement.files[0]);
	}
}
document.body.append(uploadElement);


// == User Event Listeners ==

// Detects when mouse button is pressed into down state
document.addEventListener("mousedown", function(evt) {
	var canvasRect = canvas.getBoundingClientRect();
	main.mouseDown = {
		x: evt.clientX - canvasRect.left,
		y: evt.clientY - canvasRect.top
	};
	main.mouseDown.state = true;

	// Stops mouse from highlighting page text on double click
	evt.preventDefault();	
	
	// Run functions relating to the mouseDown event
	main.testMouseDown();

	//console.log("Mouse down at (" + main.mouseDown.x + ", " + main.mouseDown.y + ")");
});

// Detects when mouse button is released
document.addEventListener("mouseup", function(evt) {
	var canvasRect = canvas.getBoundingClientRect();
	main.mousePos = {
		x: evt.clientX - canvasRect.left,
		y: evt.clientY - canvasRect.top
	};
	if (main.mouseDown.state) {
		main.mouseDown.state = false;
	}

	// Assumes mouse has just been clicked and tests for button presses.
	main.testButtons();		

	//console.log("Clicked at (" + main.mousePos.x + ", " + main.mousePos.y + ")");
});

// Detects when mouse cursor has mover
document.addEventListener('mousemove', function(evt) {
	var canvasRect = canvas.getBoundingClientRect();
	main.mousePos = {	// Position relative to top left corner
		x: evt.clientX - canvasRect.left,
		y: evt.clientY - canvasRect.top
	};
	main.mouseOffset = {	// Offset from middle of screen
		x: main.mousePos.x - canvas.width/2,
		y: -(main.mousePos.y - canvas.height/2)
	};
}, false);


// Keys
document.addEventListener("keydown", function(evt) {
	main.keyDown[evt.code] = true;
	if (evt.code == "Space") {
		evt.preventDefault();
	}
	//main.keyPressed[evt.code] = true;
});
document.addEventListener("keyup", function(evt) {
	main.keyDown[evt.code] = undefined;
});
