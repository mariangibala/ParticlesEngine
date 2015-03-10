// ----------------------------------------------------
// Create canvas background //
//-----------------------------------------------------
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

	canvasBg.width = canvas.width;
    canvasBg.height = canvas.height;
	
	var background = canvasBg.getContext("2d");
	
	// Clear current background
	background.clearRect(0, 0, canvasBg.width, canvasBg.height);
	
	
	// Create new background
	var grd = background.createRadialGradient(500,500,5,90,60,900);
	grd.addColorStop(0,"red");
	grd.addColorStop(1,"#000");
	
	// Fill with gradient
	background.fillStyle = grd;
	background.fillRect(0, 0, canvasBg.width, canvasBg.height);


};

var createBackgroundImage = function(){


};