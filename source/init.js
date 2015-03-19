
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
