
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