
// ----------------------------------------------------
// Statistics module //
//-----------------------------------------------------

var statistics = (function(){

var statistics = {}
statistics.init = function(){

var lastCalledTime; 
var fps;
var averageFps;
var averageFpsTemp = 0;
var averageFpsCounter = 0;


var requestStatistics = function() {

    if (!lastCalledTime) {

        lastCalledTime = Date.now();
        fps = 0;
        return;

    }
    
    

    var delta = (new Date().getTime() - lastCalledTime) / 1000;
    lastCalledTime = Date.now();
    fps = Math.floor(1 / delta);
    
    averageFpsTemp = averageFpsTemp + fps;
    averageFpsCounter++;
    
    if ( averageFpsCounter === 5) {
     
        
        averageFps = Math.floor(averageFpsTemp / 5) ;
        averageFpsCounter = 0;  
        averageFpsTemp = 0; 
    }
    
    if (!averageFps) {
        
        return;
    
    } else if (averageFps < 10) {
      /*  stopAnimation(); 
      averageFps = undefined; 
       $("#fpsError").fadeIn();*/
    
    }
    
    
    var activeParticles = objects.length
    
    ctx.fillStyle = "#fff";
    ctx.font = "11px Verdana";
    ctx.fillText("FPS: " + fps + " lines: " + lines + " Active particles: " + activeParticles + " Average FPS: " + averageFps , 10, canvas.height-20);
    lines = 0;
    
    
    
   
}

// ----------------------------------------------------
// Subscribe request Statistics event //
//-----------------------------------------------------


eventBus.subscribe("requestStatistics", requestStatistics )

}

return statistics

}());
