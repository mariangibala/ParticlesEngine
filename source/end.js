// init modules
createGlobalParticlesObject();


var
  basic = basic.init(),
  garbageCollector = garbageCollector.init(),
  Particle = particle.init(),
  CircleParticle = circleParticle.init(),
  SquareParticle = squareParticle.init(),
  TextParticle = textParticle.init(),
  mouse = mouse.init(),
  emitter = emitter.init(),
  scene = scene.init(),
  fading = fading.init(),
  forces = forces.init(),
  background = background.init(),
  statistics = statistics.init();


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

window.initParticleEngine = initParticleEngine;

})(window);
