// ----------------------------------------------------
// Scene //
//-----------------------------------------------------

var scene = {};
scene.init = function () {

  var frame = 0;

  var handleConnections = function () {
    // Test interactions between particles every 3 frames for better performance
    // todo - implement test 1/4 interactions per frame (Xxxx -> xXxx -> xxXx -> xxxX)

    if ((options.drawConnections) && (frame === 3)) {
      frame = 0;

      for (var x = 0; x < objects.length; x++) {
        var particle = objects[x];
        particle.closestDistance = maximumPossibleDistance;
        particle.closestElement = null;
      }

      for (var x = 0; x < objects.length; x++) {
        var particle = objects[x];
        particle.testInteraction();
      }
    }

    if (options.drawConnections) {
      for (var x = 0; x < objects.length; x++) {
        var particle = objects[x];

        if (particle.closestElement) {
          particle.drawLine();
        }
      }
    }
  };

  scene.update = function () {
    frame++;
    handleConnections();

    for (var x = 0; x < objects.length; x++) {
      var particle = objects[x];

      particle.doActions();

      // append global forces
      particle.appendGlobalForces(options.globalForceX, options.globalForceY);

      if (particle.active) {
        particle.updateAnimation();
        particle.updateLifeTime();
      }
      else if ((!particle.destroyIt) && (!particle.active) && (!particle.isFading)) {
        particle.lifeTime = 100; //getRandomBetween(options.lifeTimeMin,options.lifeTimeMax);
        particle.positionX = particle.initialPositionX;
        particle.positionY = particle.initialPositionY;

        particle.calculateVector();
        particle.timer = 0;

        particle.fadeIn();
      }
    }

    for (var x = 0; x < emitters.length; x++) {
      emitters[x].update();
    }

    eventBus.emit("refreshScene");
  };

  return scene;
};
