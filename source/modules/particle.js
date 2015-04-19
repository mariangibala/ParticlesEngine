
// ----------------------------------------------------
// Particle constructor function //
//-----------------------------------------------------
var particles = (function(){

var particles = {};
particles.init = function(){


particles.Particle = function (positionX, positionY) {

    this.positionX = positionX;
    this.positionY = positionY;
    this.initialPositionX = positionX;
    this.initialPositionY = positionY;
   
}



particles.Particle.prototype.doActions = function(){

    for (var x=0; x<this.actions.length; x++) {
    
    
        var action = this.actions[x];
        this[action]();
    
    
    }

};



particles.Particle.prototype.animateTo = function(newX, newY) {

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

particles.Particle.prototype.updateColor = function() {

    this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.opacity + ")";

};

particles.Particle.prototype.init = function(){

	this.initOpacity();
	this.initSize();
	
	
	this.red = options.red;
	this.green = options.green; 
	this.blue = options.blue;
	
	this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.opacity + ")"
	
	this.duration = basic.getRandomBetween(options.durationMin, options.durationMax);
    this.limit = options.moveLimit;
    this.timer = 0;

   
	this.lifeTime = basic.getRandomBetween(options.lifeTimeMin,options.lifeTimeMax)
  
	this.actions = []; // container for temporary effects
	
    this.calculateVector();
		
	this.active = true;
    this.closestDistance = maximumPossibleDistance;
	
	objects.push(this);
    this.index = objects.indexOf(this);


}

particles.Particle.prototype.initOpacity = function(){

	if ( options.randomOpacity ) {
	
		this.opacity = basic.getRandomDecimalBetween( options.particleMinimumOpacity, options.particleMaximumOpacity );
	
	} else {
	
		this.opacity = options.opacity;
	
	}
	
	this.initialOpacity = this.opacity;

};

particles.Particle.prototype.initSize = function(){

	if ( options.randomSize ) {
	
		this.size = basic.getRandomBetween( options.minimumSize, options.maximumSize );
	
	} else {
	
		this.size = options.initialSize;
	
	}

};




particles.Particle.prototype.calculateVector = function() {


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
		
		newPosition.positionX = basic.getRandomBetween(minPX, maxPX);
        newPosition.positionY = basic.getRandomBetween(minPY, maxPY);

        distance = basic.getDistance(particle, newPosition);

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

/*Particle.prototype.testInteraction = function() {

    for (var x = this.index+1; x < objects.length; x++) {

     
        var testedObject = objects[x];
     
        var distance = basic.getDistance(this, testedObject);


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

*/



particles.Particle.prototype.updateLifeTime = function() {
    
    this.lifeTime--;
	
	if ( this.lifeTime < 0 )  {
      
        this.fadeOut()
       

	}

};


particles.Particle.prototype.updateAnimation = function() {

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





}

return particles

}());
