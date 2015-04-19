
// ----------------------------------------------------
// Defaults //
//-----------------------------------------------------

var options = {

    particleType:"square", // square, text
    particleText:"☆",
   
	emitterShape:"CodePen",
    emitterFontSize:150,
	emitterType:"text", // random, point, text
    emitterPositionX:50,
    emitterPositionXpx:300,
    emitterPositionY:50,
    particlesNumber: 4000,
    initialSize: 3,
    randomSize: true,
    minimumSize:2,
    maximumSize:4,
    moveLimit: 10,
    durationMin: 50,
    durationMax: 200,
    
    lifeTime:true,
    lifeTimeMin:100,
    lifeTimeMax:100,
    
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

	backgroundSolid: {r:0,g:0,b:0},
	backgroundColors: {


		"color1": {positionX:50,positionY:50,color:"000000"},
		"color2": {positionX:97,positionY:70,color:"f1f1f1"}
	

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