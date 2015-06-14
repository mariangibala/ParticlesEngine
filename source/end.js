// init modules

createGlobalParticlesObject()
basic.init()
garbageCollector.init()
particles.init()
mouse.init()
emitter.init()

scene.init()

fading.init()
forces.init()
background.init()
statistics.init()




canvas.onmousemove = function (e) {

  mousePositionX = e.clientX - container.offsetLeft + window.pageXOffset;
  mousePositionY = e.clientY - container.offsetTop + window.pageYOffset;

  particleEngine.mousePositionX = mousePositionX;
  particleEngine.mousePositionY = mousePositionY;


};


var clearCanvas = function () {

  ctx.clearRect(0, 0, canvas.width, canvas.height);


};

var stopAnimation = function () {


  window.cancelAnimationFrame(window.particleEngine["animation" + containerId]);
  isRunning = false;

};

window.getP = function(){console.log(objects)}

// ----------------------------------------------------
// Init! //
//-----------------------------------------------------

var loop = function () {

  clearCanvas();
  scene.update();


  window.particleEngine["animation" + containerId] = requestAnimationFrame(loop);
  isRunning = true;

  if (options.showStatistics) eventBus.emit("requestStatistics")

};


initAnimation();



} // end generate...

window.generateParticles = generateParticles;

return generateParticles

})(window);
