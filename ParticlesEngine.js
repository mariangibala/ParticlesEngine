/*********************************************************************
Author: Marian Gibala - www.mgibala.com
Github: https://github.com/mariangibala/Particles
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
// Defaults //
//-----------------------------------------------------

var options = {

    particleType:"square", // square, text
    particleText:"☆",
   
	emitterShape:":)",
    emitterFontSize:150,
	emitterType:"random", // random, point, text
    emitterPositionX:50,
    emitterPositionY:50,
    particlesNumber: 250,
    initialSize: 3,
    randomSize: true,
    minimumSize:2,
    maximumSize:4,
    moveLimit: 50,
    durationMin: 10,
    durationMax: 70,
    
    lifeTime:false,
    lifeTimeMin:100,
    lifeTimeMax:100,
    
    // particles color
    red:255,
    green:0,
    blue:255,
    opacity:1,
    randomOpacity: true,
    particleMinimumOpacity:0.1,
    particleMaximumOpacity:0.9,
    
    // connections between particles
    drawConnections: false,
    connectionRed:255,
    connectionGreen:255,
    connectionBlue:255,
    connectionOpacity:0.1,
    
    // mouse connections
    mouseInteraction:false,
    mouseInteractionType:"gravity", // initial, gravity
	
	
    drawMouseConnections:false,
    mouseInteractionDistance:300,
    mouseConnectionRed:255,
    mouseConnectionGreen:255,
    mouseConnectionBlue:255,
    mouseConnectionOpacity:0.1,
    
    showStatistics: true,
	backgroundMode:"gradient", // gradient,image
    backgroundImage:"img/wallpaper.jpg",
	
    
    // Use object with property names, to easy identify values in color picker

	backgroundSolid: {r:0,g:0,b:0},
	backgroundColors: {
		
		"color1": 	{positionX:0,positionY:0,r:240,g:30,b:2,radious:100},
		"color2": 	{positionX:100,positionY:100,r:33,g:30,b:70,radious:100}
		
	}
    
}

// overwrite default options

var extendOptions = function(options, userOptions){
    
    for(var key in userOptions) {
        
        if(userOptions.hasOwnProperty(key))
        options[key] = userOptions[key];
    
    }
    
    return options;
}

extendOptions(options,userOptions)
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
	
	centerX = Math.floor( canvas.width / 2 );
    centerY = Math.floor( canvas.height / 2 );

    maximumPossibleDistance = Math.round(Math.sqrt((canvas.width * canvas.width) + (canvas.height * canvas.height)));  
    
	createBackground(options.backgroundMode);
    
    objects.length = 0;
    emitterPositions.length = 0;
   	
	
	createScene();
    loop();

};



// ----------------------------------------------------
// Helper functions //
//-----------------------------------------------------

var getRandomBetween = function(a, b) {
   
    return Math.floor(Math.random() * ( b - a + 1)) + a;

};


var getRandomDecimalBetween = function(a, b) {
   
    var b = b*100;
    var a = a*100;
    
    var randomNumber = getRandomBetween(a, b);
    var finalNumber = randomNumber/100;
    
    return finalNumber;

};



var hitTest = function(object1, object2) {


    if ((object1.positionX < object2.positionX + object2.size) && (object1.positionX + object2.size > object2.positionX) &&
        (object1.positionY < object2.positionY + object2.size) && (object1.positionY > object2.positionY)) {

        return true;


    } else {

        return false;

    }


};

// Get distance between particles by using Pythagorean theorem

var getDistance = function(element1, element2) {


    var difX = Math.round(Math.abs(element1.positionX - element2.positionX));
    var difY = Math.round(Math.abs(element1.positionY - element2.positionY));

    return Math.round(Math.sqrt((difX * difX) + (difY * difY)));


};


// ----------------------------------------------------
// Fading    //
//-----------------------------------------------------
// helper function do not use without facade
Particle.prototype.fadeTo = function(value){
	
    if ( this.opacity < value ) {
	
		
		this.opacity = this.opacity + 0.02;	
       
        
        if (this.opacity > 1) this.opacity = 1;
		
		
		
	} else if ( this.opacity > value ) {
	
		
		this.opacity = this.opacity - 0.02;	

    }
	

};

// Facade fadeIn
Particle.prototype.fadeIn = function(){
 
    
    
    this.active = true;
	
    if (this.actions.indexOf("fadeIn") == -1) {
	
		this.actions.push("fadeIn");

	}
    
    
 	// Fade in to initial opacity
    this.fadeTo(this.initialOpacity);
    
    // remove fading action if opacty reach initial
      
    if ((this.initialOpacity - this.opacity) <= 0)  this.actions.splice(this.actions.indexOf("fadeIn"),1);
	
	
   
  

};

// Facade FadeOut
Particle.prototype.fadeOut = function(){
 
	this.isFading = true;
    
    if (this.actions.indexOf("fadeOut") == -1) {
	
		this.actions.push("fadeOut");

	}
	
	// 0.05 is safe value to prevent negative opacity 
    if (this.opacity < 0.05) {

		this.opacity = 0;
      
   
        // deactivate particle, remove from particles array
		this.isFading = false;
		this.active = false;
        this.actions.splice(this.actions.indexOf("fadeOut"),1)
	
		
	}
    
    
    this.fadeTo(0);

};


// ----------------------------------------------------
// Particle constructor function //
//-----------------------------------------------------
function Particle (positionX, positionY) {

    this.positionX = positionX;
    this.positionY = positionY;
    this.initialPositionX = positionX;
    this.initialPositionY = positionY;
   
}

// ----------------------------------------------------
// Mouse Object constructor function //
//-----------------------------------------------------
function Mouse (positionX, positionY, size, red, green, blue, opacity) {

    this.positionX = mousePositionX;
    this.positionY = mousePositionY;
    this.size = size;

    this.red = red;
    this.green = green;
    this.blue = blue;
    this.opacity = opacity;


    this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + ",+" + this.opacity + ")";

}


Particle.prototype.doActions = function(){

    for (var x=0; x<this.actions.length; x++) {
    
    
        var action = this.actions[x];
        this[action]();
    
    
    }

};



Particle.prototype.animateTo = function(newX, newY) {

    var step;
	var duration = this.duration;

    var animatePosition = function(newPosition, currentPosition) {

        if (newPosition > currentPosition) {

            step = (newPosition - currentPosition) / duration;
            newPosition = currentPosition + step;

        } else {

            step = (currentPosition - newPosition) / duration;
            newPosition = currentPosition - step;

        }

        return newPosition;

    };

    this.positionX = animatePosition(newX, this.positionX);
    this.positionY = animatePosition(newY, this.positionY);



    // generate new vector

    if (this.timer == this.duration) {

        this.calculateVector();
        this.timer = 0;

    } else {

        this.timer++;

    }


};

Particle.prototype.updateColor = function() {

    this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.opacity + ")";

};

Particle.prototype.init = function(){

	this.initOpacity();
	this.initSize();
	
	
	this.red = options.red;
	this.green = options.green; 
	this.blue = options.blue;
	
	this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.opacity + ")"
	
	this.duration = getRandomBetween(options.durationMin, options.durationMax);
    this.limit = options.moveLimit;
    this.timer = 0;

   
	this.lifeTime = getRandomBetween(options.lifeTimeMin,options.lifeTimeMax)
  
	this.actions = []; // container for temporary effects
	
    this.calculateVector();
		
	this.active = true;
    this.closestDistance = maximumPossibleDistance;
	
	objects.push(this);
    this.index = objects.indexOf(this);


}

Particle.prototype.initOpacity = function(){

	if ( options.randomOpacity ) {
	
		this.opacity = getRandomDecimalBetween( options.particleMinimumOpacity, options.particleMaximumOpacity );
	
	} else {
	
		this.opacity = options.opacity;
	
	}
	
	this.initialOpacity = this.opacity;

};

Particle.prototype.initSize = function(){

	if ( options.randomSize ) {
	
		this.size = getRandomBetween( options.minimumSize, options.maximumSize );
	
	} else {
	
		this.size = options.initialSize;
	
	}

};




Particle.prototype.calculateVector = function() {


    var distance;
    var newPosition = {};
    var particle = this;

    var getCoordinates = function() {

		
		// limit coordinates to look for (distance limit)
		
		var minPX = particle.positionX - particle.limit;
		var maxPX = particle.positionX + particle.limit;
		
		if (maxPX > canvas.width) maxPX = canvas.width;
		if (minPX < 0) minPX = 0;
				
		var minPY = particle.positionY - particle.limit;
		var maxPY = particle.positionY + particle.limit 
		
		if (maxPY > canvas.height) maxPY = canvas.height;
		if (minPY < 0) minPY = 0;
		
		newPosition.positionX = getRandomBetween(minPX, maxPX);
        newPosition.positionY = getRandomBetween(minPY, maxPY);

        distance = getDistance(particle, newPosition);

    };

    while ((typeof distance === "undefined") || (distance > this.limit)) {

        getCoordinates();

    }


    this.vectorX = newPosition.positionX;
    this.vectorY = newPosition.positionY;


};


// ----------------------------------------------------
// Test interaction //
//-----------------------------------------------------
// Brute-force method to test interactions between particles
// We are are starting loop from particle.index value to avoid double tests.

Particle.prototype.testInteraction = function() {

    for (var x = this.index+1; x < objects.length; x++) {

     
        var testedObject = objects[x];
     
        var distance = getDistance(this, testedObject);


        if (distance < this.closestDistance) {

            this.closestDistance = distance;
            this.closestElement = testedObject;

        }
        
        if (distance < testedObject.closestDistance ) {
        
            testedObject.closestDistance = distance;
            testedObject.closestElement = this;
        
        }

    }

    if (this.closestElement) {

        ctx.beginPath();
        ctx.moveTo(this.positionX + this.size / 2, this.positionY + this.size / 2);
        ctx.lineTo(this.closestElement.positionX + this.closestElement.size * 0.5, this.closestElement.positionY + this.closestElement.size * 0.5);
        ctx.strokeStyle = "rgba(" + options.connectionRed + ","+ options.connectionGreen +","+ options.connectionBlue +"," + options.connectionOpacity + ")";
        ctx.stroke();
        lines++;
    }

};

Mouse.prototype.testInteraction = function() {  

    if (options.mouseInteractionDistance === 0) return;
        
    var closestElements = [];
    var distanceToClosestElement = maximumPossibleDistance;

    for (var x = 0; x < objects.length; x++) {

        var testedObject = objects[x];
        var distance = getDistance(this, testedObject);


        if ((distance < options.mouseInteractionDistance) && (testedObject !== this)) {

            
            closestElements.push(objects[x]);

        }
        
    }

    
    for (var x = 0; x < closestElements.length; x++) {
       
       
        if (options.drawMouseConnections) {
        
            var element = closestElements[x];
            ctx.beginPath();
            ctx.moveTo(this.positionX, this.positionY);
            ctx.lineTo(element.positionX + element.size * 0.5, element.positionY + element.size * 0.5);
            ctx.strokeStyle = "rgba(" + options.mouseConnectionRed + ","+ options.mouseConnectionGreen +","+ options.mouseConnectionBlue +"," + options.mouseConnectionOpacity + ")";
            ctx.stroke();
            lines++ ;
        
        }
        
       if (options.mouseInteraction) {
            
            if (options.mouseInteractionType == "gravity") {
				
				closestElements[x].vectorX = this.positionX;
            	closestElements[x].vectorY = this.positionY;
				
			} else if (options.mouseInteractionType == "initial"){

		
				closestElements[x].vectorX = closestElements[x].initialPositionX;
				closestElements[x].vectorY = closestElements[x].initialPositionY;
				
			}
     
    	}
        
        
    }
};

Particle.prototype.updateLifeTime = function() {
    
    this.lifeTime--;
	
	if ( this.lifeTime < 0 )  {
      
        this.fadeOut()
       

	}

};


Particle.prototype.updateAnimation = function() {

    // calculate changes
    this.animateTo(this.vectorX, this.vectorY);
  
    // draw particle
	this.updateColor();
    ctx.fillStyle = this.color;
   
    if (options.particleType == "square") {
        
        
        ctx.fillRect(this.positionX, this.positionY, this.size, this.size);
    
    } else if (options.particleType == "text") {
    
        ctx.font = this.size + "px Verdana"
        ctx.fillText(options.particleText, this.positionX, this.positionY)
    }
   

};



Mouse.prototype.updateAnimation = function() {
    
    
    this.positionX = mousePositionX;
    this.positionY = mousePositionY;

    this.testInteraction();
    

};

// ----------------------------------------------------
// Emitters //
//-----------------------------------------------------


var createTextEmitter = function(config){


    var positionX = (canvas.width/100)*config.positionX
    var positionY = (canvas.height/100)*config.positionY
    
    
    ctx.fillStyle = "#fff";
    ctx.font = config.emitterFontSize + "px Verdana";
    ctx.fillText( config.text, positionX, positionY );
    
    // scan all pixels and generate possible positions array
	
	var particleData = ctx.getImageData( 0 ,0 , canvas.width, canvas.height ) 
    var data = particleData.data; 
    
    
    var x = 0;
    var y = 0;
    
    for (var i=0; i<data.length; i+=4) {
        
           x++;
         
         if (x == canvas.width) {
         
            x = 0;
            y++;
    
         }
   
         // if pixel isnt't empty (standard transparent) then push position into emitter 
         if (data[i] === 255) {
          
             emitterPositions.push([x,y])

         }   
   
    }

};

var createTextEmitterParticles = function(config){

	
	
	for (var x=0; x<config.particlesNumber; x++) {
	 
		// do not create particle if there is no avalaible emitter position
		if ( emitterPositions.length < 2 ) return;
		
		var randomNumber = getRandomBetween(1,emitterPositions.length-1);
		var position = emitterPositions[randomNumber];

		var particle = new Particle(position[0], position[1]);
		particle.init();
	
		emitterPositions.splice(randomNumber,1); 
	
	 
	 }


};


var createRandomEmitter = function(config){

	for (var x = 0; x < config.particlesNumber; x++) {

        var randomX = Math.floor((Math.random() * canvas.width) + 1);
        var randomY = Math.floor((Math.random() * canvas.height) + 1);

        var particle = new Particle(randomX, randomY );
        particle.init()
		
	}

};


var createPointEmitter = function(config){

	for (var x = 0; x < config.particlesNumber; x++) {

        
        var positionX = (canvas.width/100)*config.positionX
        var positionY = (canvas.height/100)*config.positionY
        
        var particle = new Particle(positionX, positionY );
        particle.init()
		
	}

};


var addEmitter = function(type, config){

	if (type === "text") {
	
		createTextEmitter(config)
		createTextEmitterParticles(config)
	
	} else if (type === "point") {
	
		createPointEmitter(config)
	
	
	} else if (type === "random") {
		
		
		createRandomEmitter(config)

	}

};


var createScene = function() {

    // create mouse particle
    mouseElement = new Mouse(0, 0, options.initialSize, 255, 255, 255);
 	
	if (options.emitterType === "text") {
	
		addEmitter("text",{
		
			positionX:			options.emitterPositionX,
			positionY:			options.emitterPositionY,
			particlesNumber:	options.particlesNumber,
			text:				options.emitterShape,
            emitterFontSize:    options.emitterFontSize
		
		
			});
	
	} else if (options.emitterType === "point") {
	
	
		addEmitter("point",{
			
			positionX:			options.emitterPositionX,
			positionY:			options.emitterPositionY,
			particlesNumber:	options.particlesNumber

			});
	
	
	} else if (options.emitterType === "random") {
	
	
		addEmitter("random",{
			
			particlesNumber:	options.particlesNumber

			});

	}
	
	
};
 

var updateScene = function() {

    
    // reset distance to closest element for all particles
    for (var x = 0; x<objects.length; x++) {
 
        objects[x].closestDistance = maximumPossibleDistance;

    }

	// reset distance to closest element
    for (var x = 0; x<objects.length; x++) {
		
       	var particle = objects[x];
		
		particle.doActions();
        
        if (particle.active) {
		
            particle.updateAnimation();
            if (options.drawConnections) particle.testInteraction();
            if ( options.lifeTime ) particle.updateLifeTime();

            
        } else if ((particle.active === false) && (particle.isFading === false)) {
        
            particle.lifeTime = 100 //getRandomBetween(options.lifeTimeMin,options.lifeTimeMax);
            particle.positionX = particle.initialPositionX;
            particle.positionY = particle.initialPositionY;
            
            particle.calculateVector();
            particle.timer = 0;
            
            
           
            particle.fadeIn();
 
        }

    }
    
    // handle mouse 
    mouseElement.updateAnimation();

};


// ----------------------------------------------------
// Create canvas background //
//-----------------------------------------------------


/*

StackBoxBlur - a fast almost Box Blur For Canvas

Version: 	0.3
Author:		Mario Klingemann
Contact: 	mario@quasimondo.com
Website:	http://www.quasimondo.com/
Twitter:	@quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Copyright (c) 2010 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/


var mul_table = [ 1,171,205,293,57,373,79,137,241,27,391,357,41,19,283,265,497,469,443,421,25,191,365,349,335,161,155,149,9,278,269,261,505,245,475,231,449,437,213,415,405,395,193,377,369,361,353,345,169,331,325,319,313,307,301,37,145,285,281,69,271,267,263,259,509,501,493,243,479,118,465,459,113,446,55,435,429,423,209,413,51,403,199,393,97,3,379,375,371,367,363,359,355,351,347,43,85,337,333,165,327,323,5,317,157,311,77,305,303,75,297,294,73,289,287,71,141,279,277,275,68,135,67,133,33,262,260,129,511,507,503,499,495,491,61,121,481,477,237,235,467,232,115,457,227,451,7,445,221,439,218,433,215,427,425,211,419,417,207,411,409,203,202,401,399,396,197,49,389,387,385,383,95,189,47,187,93,185,23,183,91,181,45,179,89,177,11,175,87,173,345,343,341,339,337,21,167,83,331,329,327,163,81,323,321,319,159,79,315,313,39,155,309,307,153,305,303,151,75,299,149,37,295,147,73,291,145,289,287,143,285,71,141,281,35,279,139,69,275,137,273,17,271,135,269,267,133,265,33,263,131,261,130,259,129,257,1];
        
   
var shg_table = [0,9,10,11,9,12,10,11,12,9,13,13,10,9,13,13,14,14,14,14,10,13,14,14,14,13,13,13,9,14,14,14,15,14,15,14,15,15,14,15,15,15,14,15,15,15,15,15,14,15,15,15,15,15,15,12,14,15,15,13,15,15,15,15,16,16,16,15,16,14,16,16,14,16,13,16,16,16,15,16,13,16,15,16,14,9,16,16,16,16,16,16,16,16,16,13,14,16,16,15,16,16,10,16,15,16,14,16,16,14,16,16,14,16,16,14,15,16,16,16,14,15,14,15,13,16,16,15,17,17,17,17,17,17,14,15,17,17,16,16,17,16,15,17,16,17,11,17,16,17,16,17,16,17,17,16,17,17,16,17,17,16,16,17,17,17,16,14,17,17,17,17,15,16,14,16,15,16,13,16,15,16,14,16,15,16,12,16,15,16,17,17,17,17,17,13,16,15,17,17,17,16,15,17,17,17,16,15,17,17,14,16,17,17,16,17,17,16,15,17,16,14,17,16,15,17,16,17,17,16,17,15,16,17,14,17,16,15,17,16,17,13,17,16,17,17,16,17,14,17,16,17,16,17,16,17,9
];


function stackBoxBlurCanvasRGB( id, top_x, top_y, width, height, radius, iterations )
{
	if ( isNaN(radius) || radius < 1 ) return;
	radius |= 0;
	
	if ( isNaN(iterations) ) iterations = 1;
	iterations |= 0;
	if ( iterations > 3 ) iterations = 3;
	if ( iterations < 1 ) iterations = 1;
	
	var canvas  =  id ;
	var context = canvas.getContext("2d");
	var imageData;
	
	try {
	  try {
		imageData = context.getImageData( top_x, top_y, width, height );
	  } catch(e) {
	  
		// NOTE: this part is supposedly only needed if you want to work with local files
		// so it might be okay to remove the whole try/catch block and just use
		// imageData = context.getImageData( top_x, top_y, width, height );
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			imageData = context.getImageData( top_x, top_y, width, height );
		} catch(e) {
			alert("Cannot access local image");
			throw new Error("unable to access local image data: " + e);
			return;
		}
	  }
	} catch(e) {
	  alert("Cannot access image");
	  throw new Error("unable to access image data: " + e);
	}
			
	var pixels = imageData.data;
			
	var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum,
	r_out_sum, g_out_sum, b_out_sum,
	r_in_sum, g_in_sum, b_in_sum,
	pr, pg, pb, rbs;
			
	var div = radius + radius + 1;
	var w4 = width << 2;
	var widthMinus1  = width - 1;
	var heightMinus1 = height - 1;
	var radiusPlus1  = radius + 1;
	
	var stackStart = new BlurStack();
	var stack = stackStart;
	for ( i = 1; i < div; i++ )
	{
		stack = stack.next = new BlurStack();
		if ( i == radiusPlus1 ) var stackEnd = stack;
	}
	stack.next = stackStart;
	var stackIn = null;
	
	
	
	var mul_sum = mul_table[radius];
	var shg_sum = shg_table[radius];
	
	while ( iterations-- > 0 ) {
		yw = yi = 0;
		
		for ( y = height; --y >-1; )
		{
			r_sum = radiusPlus1 * ( pr = pixels[yi] );
			g_sum = radiusPlus1 * ( pg = pixels[yi+1] );
			b_sum = radiusPlus1 * ( pb = pixels[yi+2] );
			
			stack = stackStart;
			
			for( i = radiusPlus1; --i > -1; )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack = stack.next;
			}
			
			for( i = 1; i < radiusPlus1; i++ )
			{
				p = yi + (( widthMinus1 < i ? widthMinus1 : i ) << 2 );
				r_sum += ( stack.r = pixels[p++]);
				g_sum += ( stack.g = pixels[p++]);
				b_sum += ( stack.b = pixels[p]);
				
				stack = stack.next;
			}
			
			stackIn = stackStart;
			for ( x = 0; x < width; x++ )
			{
				pixels[yi++] = (r_sum * mul_sum) >>> shg_sum;
				pixels[yi++] = (g_sum * mul_sum) >>> shg_sum;
				pixels[yi++] = (b_sum * mul_sum) >>> shg_sum;
				yi++;
				
				p =  ( yw + ( ( p = x + radius + 1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;
				
				r_sum -= stackIn.r - ( stackIn.r = pixels[p++]);
				g_sum -= stackIn.g - ( stackIn.g = pixels[p++]);
				b_sum -= stackIn.b - ( stackIn.b = pixels[p]);
				
				stackIn = stackIn.next;
			}
			yw += width;
		}

		
		for ( x = 0; x < width; x++ )
		{
			yi = x << 2;
			
			r_sum = radiusPlus1 * ( pr = pixels[yi++]);
			g_sum = radiusPlus1 * ( pg = pixels[yi++]);
			b_sum = radiusPlus1 * ( pb = pixels[yi]);
			
			stack = stackStart;
			
			for( i = 0; i < radiusPlus1; i++ )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack = stack.next;
			}
			
			yp = width;
			
			for( i = 1; i <= radius; i++ )
			{
				yi = ( yp + x ) << 2;
				
				r_sum += ( stack.r = pixels[yi++]);
				g_sum += ( stack.g = pixels[yi++]);
				b_sum += ( stack.b = pixels[yi]);
				
				stack = stack.next;
			
				if ( i < heightMinus1 ) yp += width;
			}
			
			yi = x;
			stackIn = stackStart;
			for ( y = 0; y < height; y++ )
			{
				p = yi << 2;
				pixels[p]   = (r_sum * mul_sum) >>> shg_sum;
				pixels[p+1] = (g_sum * mul_sum) >>> shg_sum;
				pixels[p+2] = (b_sum * mul_sum) >>> shg_sum;
				
				p = ( x + (( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width )) << 2;
				
				r_sum -= stackIn.r - ( stackIn.r = pixels[p]);
				g_sum -= stackIn.g - ( stackIn.g = pixels[p+1]);
				b_sum -= stackIn.b - ( stackIn.b = pixels[p+2]);
				
				stackIn = stackIn.next;
				
				yi += width;
			}
		}
	}
	context.putImageData( imageData, top_x, top_y );
	
}

function BlurStack() {
	
	this.r = 0;
	this.g = 0;
	this.b = 0;
	this.a = 0;
	this.next = null;
}


var createBackground = function(type){
	

	if (type === "gradient") { 
	
		createBackgroundGradient();
	
	} else if (type === "image") {
	
		createBackgroundImage();
	
	} 

}


var createBackgroundGradient = function(){

	var canvasBg
	
	// if background doesen't exist create it
	if ( document.getElementById("particles_" + id + "_background") === null) {
	
		canvasBg = document.createElement("canvas");
		canvasBg.id = "particles_" + id + "_background";
		canvasBg.style.display = "block";
		canvasBg.style.position = "absolute";
		
		

		container.insertBefore(canvasBg, canvas);
		

	
	// otherwise grab id and create reference
	} else {
	
		canvasBg = document.getElementById("particles_" + id + "_background");
	
	}

	canvasBg.width = canvas.width ;
    canvasBg.height = canvas.height;
	
	var background = canvasBg.getContext("2d");
	
	// Clear current background
	background.clearRect(0, 0, canvasBg.width, canvasBg.height);
	
	// create solid color
	background.fillStyle = "rgb(" + options.backgroundSolid.r +"," + options.backgroundSolid.g + "," + options.backgroundSolid.b +")";
	background.fillRect(0, 0, canvasBg.width, canvasBg.height); 


	// Create gradients 
	
	for (var key in options.backgroundColors) {

		if(options.backgroundColors.hasOwnProperty(key)) {
	
			createRadialColor(canvasBg, options.backgroundColors[key])
		
		}

	}
	
	 stackBoxBlurCanvasRGB( canvasBg, 0, 0, canvasBg.width, canvasBg.height, 200, 2 )
	
	
	  
	
};


var createRadialColor = function(canvasBg, config){

	var background = canvasBg.getContext("2d");
	
	var radious = Math.floor(maximumPossibleDistance / 100 * config.radious)
	var positionX = Math.floor(canvasBg.width / 100 * config.positionX)
	var positionY = Math.floor(canvasBg.height / 100 * config.positionY)
	
		
	var color = background.createRadialGradient(positionX,positionY,0,positionX,positionY,radious);
	
	var colorValue = "rgba(" + config.r + "," + config.g + "," + config.b;
	
	color.addColorStop(0,colorValue + ",100)");
	color.addColorStop(1,colorValue + ",0)");
	
	// Fill with gradient
	background.fillStyle = color;
	background.fillRect(0, 0, canvasBg.width, canvasBg.height);
	
}


var createBackgroundImage = function(){


};

// ----------------------------------------------------
// FPS //
//-----------------------------------------------------
var lastCalledTime;
var fps;
var averageFps;
var averageFpsTemp = 0;
var averageFpsCounter = 0;


function requestStatistics() {

    if (!lastCalledTime) {

        lastCalledTime = Date.now();
        fps = 0;
        return;

    }
    
    

    var delta = (new Date().getTime() - lastCalledTime) / 1000;
    lastCalledTime = Date.now();
    fps = Math.floor(1 / delta);
    
    averageFpsTemp = averageFpsTemp + fps;
    averageFpsCounter++;
    
    if ( averageFpsCounter === 5) {
     
        
        averageFps = Math.floor(averageFpsTemp / 5) ;
        averageFpsCounter = 0;  
        averageFpsTemp = 0; 
    }
    
    if (!averageFps) {
        
        return;
    
    } else if (averageFps < 10) {
      /*  stopAnimation(); 
      averageFps = undefined; 
       $("#fpsError").fadeIn();*/
    
    }
    
    
    var activeParticles = objects.length
    
    ctx.fillStyle = "#fff";
    ctx.font = "11px Verdana";
    ctx.fillText("FPS: " + fps + " lines: " + lines + " Active particles: " + activeParticles + " Average FPS: " + averageFps , 10, canvas.height-20);
    lines = 0;
    
    
    
   
}

canvas.onmousemove = function(e){
   
    mousePositionX = e.clientX - container.offsetLeft + window.pageXOffset;
    mousePositionY = e.clientY - container.offsetTop + window.pageYOffset;
    

};


var clearCanvas = function() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);


};

var stopAnimation = function(){


  window.cancelAnimationFrame(window.particleEngine["animation"+id]);
  isRunning = false;

};



// ----------------------------------------------------
// Init! //
//-----------------------------------------------------

var loop = function() {

    clearCanvas();
    updateScene();

    
    window.particleEngine["animation"+id] = requestAnimationFrame(loop);
    isRunning = true;
    if (options.showStatistics) requestStatistics();

};


initAnimation();



} // end generate...

window.generateParticles = generateParticles;

return generateParticles

})(window);

