// init modules
createGlobalParticlesObject();
basic.init();
garbageCollector.init();
particles.init();
mouse.init();
emitter.init();

scene.init();

fading.init();
forces.init();
background.init();
statistics.init();

canvas.onmousemove = function (e) {

  particleEngine.mousePositionX = e.clientX - container.offsetLeft + window.pageXOffset;
  particleEngine.mousePositionY = e.clientY - container.offsetTop + window.pageYOffset;

};

var clearCanvas = function () {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

};

var loop = function () {

  clearCanvas();
  scene.update();

  window.particleEngine["animation" + containerId] = requestAnimationFrame(loop);

  if (options.showStatistics) {
    eventBus.emit("requestStatistics");
  }
};

initAnimation();

} // end generate...

window.generateParticles = generateParticles;

return generateParticles

})(window);
