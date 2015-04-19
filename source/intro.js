/*********************************************************************
Author: Marian Gibala 
Github: https://github.com/mariangibala/ParticlesEngine
*********************************************************************/

/*

The MIT License (MIT)

Copyright (c) 2015 Marian Gibala

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

  


!(function(window){
    
    
generateParticles = function (id, userOptions) {

"use strict"

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
var modules = [];


// ----------------------------------------------------
// Init function //
//-----------------------------------------------------

var initAnimation = function(){

   
	// ----------------------------------------------------
	// Handle different instances and global window.particleEngine //
	//-----------------------------------------------------

	
	if (typeof window.particleEngine === "undefined") { 
    
        window.particleEngine = {};
		window.particleEngine.resizeHandler = {};

        
    } else if (typeof window.particleEngine["animation"+id] !== "undefined") {
        
        // if animation already exists - cancel animation and remove window listeners to delete connections for garbage collection
        cancelAnimation(window.particleEngine["animation"+id]);
		window.removeEventListener("resize",window.particleEngine.resizeHandler["animation"+id],false)
		
    
    }
	
	// create window.resize listener for current animation
	window.particleEngine.resizeHandler["animation"+id] = function(){initAnimation()} // new handler
	window.addEventListener("resize",window.particleEngine.resizeHandler["animation"+id],false)

 	
	canvas.width = container.clientWidth ;
    canvas.height = container.clientHeight ;
	
	
	if (options.background !== null) background.create(options.background);
   

    maximumPossibleDistance = Math.round(Math.sqrt((canvas.width * canvas.width) + (canvas.height * canvas.height)));  
    
    centerX = Math.floor( canvas.width / 2 );
    centerY = Math.floor( canvas.height / 2 );
    
    objects.length = 0;
    emitterPositions.length = 0;
   	
	
	emitter.createScene();
    loop();

};
