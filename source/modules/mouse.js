
// ----------------------------------------------------
// Mouse interaction constructor function //
//-----------------------------------------------------
var mouse = (function(){

var mouse = {};
mouse.init = function(){


// ----------------------------------------------------
// Mouse Object constructor function //
//-----------------------------------------------------
mouse.Interaction = function () {};


mouse.Interaction.prototype.testInteraction = function() {  

    if (options.mouseInteractionDistance === 0) return;
        
    var closestElements = [];
    var distanceToClosestElement = maximumPossibleDistance;

    for (var x = 0; x < objects.length; x++) {

        var testedObject = objects[x];
        var distance = basic.getDistance(this, testedObject);


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



mouse.Interaction.prototype.updateAnimation = function() {
  
    
    this.positionX = mousePositionX;
    this.positionY = mousePositionY;

    this.testInteraction();
    

};


// create mouse element
var mouseCursor = new mouse.Interaction("ab");


var refreshMouse = function(){

    mouseCursor.updateAnimation();

};

// subscribe refresh event
eventBus.subscribe("refreshScene", refreshMouse)

}

return mouse

}());
