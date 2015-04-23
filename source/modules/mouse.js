// ----------------------------------------------------
// Mouse interaction constructor function //
//-----------------------------------------------------
var mouse = (function () {

    var mouse = {};
    mouse.init = function () {


        // ----------------------------------------------------
        // Create mouse interaction object //
        //-----------------------------------------------------
        mouse.Interaction = function () {};
        var mouseCursor = new mouse.Interaction();

        
        
        // Container for elements to interact 
       
        var interactionElements = []

        
        
      
        mouse.Interaction.prototype.grabElements = function () {
        
            interactionElements = []

            for (var x = 0; x < objects.length; x++) {
        
                var object = objects[x];
                var distanceToObject = basic.getDistance(this, object);
        
        
                if (distanceToObject < options.mouseInteractionDistance) {
        
                    interactionElements.push(objects[x])
                  
                }
        
            }
            
        };
           
           
        mouse.Interaction.prototype.interact = function () {
   
            for (var x = 0; x < interactionElements.length; x++) {
            
                var object = interactionElements[x];
               
                if (options.drawMouseConnections) {
                
                    drawLine(this, object);
                
                }

                if (options.mouseInteractionType == "gravity") {

                    object.vectorX = this.positionX;
                    object.vectorY = this.positionY;

                } else if (options.mouseInteractionType == "initial") {


                    object.vectorX = object.initialPositionX;
                    object.vectorY = object.initialPositionY;

                }

            }
        
        };
        

        var drawLine = function(elementA, elementB){
        
            
            var element = elementB
            ctx.beginPath();
            ctx.moveTo(elementA.positionX, elementA.positionY);
            ctx.lineTo(elementB.positionX + elementB.size * 0.5, elementB.positionY + elementB.size * 0.5);
            ctx.strokeStyle = "rgba(" + options.mouseConnectionRed + "," + options.mouseConnectionGreen + "," + options.mouseConnectionBlue + "," + options.mouseConnectionOpacity + ")";
            ctx.stroke();
            lines++;

        
        };

        mouse.Interaction.prototype.updateAnimation = function () {
                 
            this.positionX = mousePositionX;
            this.positionY = mousePositionY;

            this.grabElements();
            this.interact();


        };


        var refreshMouseInteraction = function () {
 
            mouseCursor.updateAnimation();

        };

        // subscribe refresh event 

        if ((options.mouseInteraction) && (options.mouseInteractionDistance > 0) ) {

            eventBus.subscribe("refreshScene", refreshMouseInteraction);
        
        }

    }

    return mouse

}());
