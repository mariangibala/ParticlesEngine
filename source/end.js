
// init modules

basic.init()
background.init()
particles.init()
mouse.init()
emitter.init()

fading.init()
forces.init()
statistics.init()




canvas.onmousemove = function(e){
   
    mousePositionX = e.clientX - container.offsetLeft + window.pageXOffset;
    mousePositionY = e.clientY - container.offsetTop + window.pageYOffset;
    

};


var clearCanvas = function() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);


};

var stopAnimation = function(){


  window.cancelAnimationFrame(window.particleEngine["animation"+id]);
  isRunning = false;

};



// ----------------------------------------------------
// Init! //
//-----------------------------------------------------

var loop = function() {

    clearCanvas();
    emitter.updateScene();

    
    window.particleEngine["animation"+id] = requestAnimationFrame(loop);
    isRunning = true;
    if (options.showStatistics) statistics.request();

};


initAnimation();



} // end generate...

window.generateParticles = generateParticles;

return generateParticles

})(window);

