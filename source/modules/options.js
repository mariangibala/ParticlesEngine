
// ----------------------------------------------------
// Defaults //
//-----------------------------------------------------

var options = {

    particleType:"circle", // square, text, circle
    particleText:"☆",
   
	emitterShape:"77",
    emitterFontSize:150,
	emitterType:"point", // random, point, text
    emitterPositionX:50,
    emitterPositionXpx:200,
    emitterPositionY:50,
    particlesNumber: 400,
    initialSize: 3,
    randomSize: true,
    minimumSize:1,
    maximumSize:3,
    moveLimit: 25,
    durationMin: 50,
    durationMax: 200,
    
    lifeTime:true,
    lifeTimeMin:100,
    lifeTimeMax:150,
    
    //global forces
    globalForceX:5,
    globalForceY:2,
    
    // particles color
    red:255,
    green:255,
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
    mouseInteraction:true,
    mouseInteractionType:"gravity", // initial, gravity
	
	
    drawMouseConnections:false,
    mouseInteractionDistance:300,
    mouseConnectionRed:255,
    mouseConnectionGreen:255,
    mouseConnectionBlue:255,
    mouseConnectionOpacity:0.1,
    
    showStatistics: true,
	background:"gradient", // null, gradient, image
    backgroundImage:"img/wallpaper.jpg",
    backgroundMainColor: "255,255,255",
	
    
    // Use object with property names, to easy identify values in color picker

	
	backgroundColors: {


		"color1": {positionX:25,positionY:25,color:"68B9F2"},
		"color2": {positionX:60,positionY:60,color:"0000ff"}
	

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