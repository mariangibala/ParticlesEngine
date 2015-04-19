 // ----------------------------------------------------
// Emitters //
//-----------------------------------------------------

var emitter = (function(){
    
var emitter = {};
emitter.init = function(){    

var createTextEmitter = function(config){


    var positionX = (canvas.width/100)*config.positionX - config.positionXpx
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
		
		var randomNumber = basic.getRandomBetween(1,emitterPositions.length-1);
		var position = emitterPositions[randomNumber];

		var particle = new particles.Particle(position[0], position[1]);
		particle.init();
	
		emitterPositions.splice(randomNumber,1); 
	
	 
	 }


};


var createRandomEmitter = function(config){

	for (var x = 0; x < config.particlesNumber; x++) {

        var randomX = Math.floor((Math.random() * canvas.width) + 1);
        var randomY = Math.floor((Math.random() * canvas.height) + 1);

        var particle = new particles.Particle(randomX, randomY );
        particle.init()
		
	}

};


var createPointEmitter = function(config){

	for (var x = 0; x < config.particlesNumber; x++) {

        
        var positionX = (canvas.width/100)*config.positionX
        var positionY = (canvas.height/100)*config.positionY
        
        var particle = new particles.Particle(positionX, positionY );
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


emitter.createScene = function() {

    // create mouse particle
    mouseElement = new mouse.Interaction();
 	
	if (options.emitterType === "text") {
	
		addEmitter("text",{
		
			positionX:			options.emitterPositionX,
			positionY:			options.emitterPositionY,
			particlesNumber:	options.particlesNumber,
			text:				options.emitterShape,
            emitterFontSize:    options.emitterFontSize,
            positionXpx:        options.emitterPositionXpx,
		
		
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
 

emitter.updateScene = function() {

    
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

}

return emitter

}());