
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
