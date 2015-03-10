// ----------------------------------------------------
// Use setTimeout if there is no support for requestAnimationFrame
//-----------------------------------------------------


var cancelAnimation = window.cancelAnimationFrame || window.clearTimeout;

var requestAnimationFrame = window.requestAnimationFrame || function(callback) {
   
    return setTimeout(callback,1000/60)
};
    


// ----------------------------------------------------
// Generate canvas element //
//-----------------------------------------------------

var container = document.getElementById(id);
if (container === null) return console.error("ParticlesEngine Error - Container is Null");


var canvas = document.createElement("canvas");
    canvas.id = "particles_" + id;
    canvas.style.display = "block";
	canvas.style.position = "absolute";

container.innerHTML = "";
container.style.overflow = "hidden";
container.appendChild(canvas);


var ctx = canvas.getContext("2d");

// ----------------------------------------------------
// Define local variables //
//-----------------------------------------------------

var maximumPossibleDistance;
var centerX;
var centerY;

var mousePositionX;
var mousePositionY;
var mouseElement;
var isRunning;

var lines = 0;
var objects = [];

var emitterPositions = [];
