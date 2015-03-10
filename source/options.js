
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

	backgroundColors: {

		"color1": {positionX:20,positionY:60,color:"9c1f8f"},
		"color2": {positionX:97,positionY:70,color:"000c91"},
		"color3": {positionX:50,positionY:50,color:"ed68ed"}

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