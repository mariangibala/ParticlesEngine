// ----------------------------------------------------
// Particle //
//-----------------------------------------------------

var particle = {};
particle.init = function () {

  // local functions
  var _getNextPosition = function (newPosition, currentPosition, duration) {
    var step;

    if (newPosition > currentPosition) {
      step = (newPosition - currentPosition) / duration;
      newPosition = currentPosition + step;
    }
    else {
      step = (currentPosition - newPosition) / duration;
      newPosition = currentPosition - step;
    }

    return newPosition;
  };

  var _generateLifeTime = function (min, max) {
    if ((typeof min !== "undefined") && (typeof max !== "undefined")) {
      return basic.getRandomBetween(min, max);
    }
    else {
      return false;
    }
  };


  var _getNewDestination = function (particle) {
    var newDestination = {};

    // limit X coordinates to look for (distance limit)
    var minPX = particle.positionX - particle.moveLimit;
    var maxPX = particle.positionX + particle.moveLimit;

    if (maxPX > canvas.width) {
      maxPX = canvas.width;
    }

    if (minPX < 0) {
      minPX = 0;
    }
    // limit Y coordinates to look for (distance limit)
    var minPY = particle.positionY - particle.moveLimit;
    var maxPY = particle.positionY + particle.moveLimit;

    if (maxPY > canvas.height) {
      maxPY = canvas.height;
    }

    if (minPY < 0) {
      minPY = 0;
    }

    newDestination.positionX = basic.getRandomBetween(minPX, maxPX);
    newDestination.positionY = basic.getRandomBetween(minPY, maxPY);

    return newDestination;
  };

  // Particle
  var Particle = function () {};

  Particle.prototype.doActions = function () {
    for (var x = 0; x < this.actions.length; x++) {
      var action = this.actions[x];
      this[action]();
    }
  };

  Particle.prototype.destroy = function () {
    this.destroyIt = true;
  };

  Particle.prototype.calculateNewPosition = function (newX, newY) {
    this.positionX = _getNextPosition(newX, this.positionX, this.duration);
    this.positionY = _getNextPosition(newY, this.positionY, this.duration);

    // generate new vector
    if (this.timer === this.duration) {
      this.calculateVector();
      this.timer = 0;
    }
    else {
      this.timer++;
    }
  };

  Particle.prototype.updateColor = function () {
    this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.opacity + ")";
  };

  Particle.prototype.create = function (particleConfig, emitter) {
    this.emitter = emitter;

    for (var x in particleDefaults) {
      if (particleConfig.hasOwnProperty(x)) {
        this[x] = particleConfig[x];
      }
      else {
        this[x] = particleDefaults[x];
      }
    }

    this.init();
  };

  Particle.prototype.init = function () {

    this.initOpacity();
    this.initSize();
    this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.opacity + ")";
    this.duration = basic.getRandomBetween(this.durationMin, this.durationMax);
    this.timer = 0;
    this.lifeTime = _generateLifeTime(this.lifeTimeMin, this.lifeTimeMax);
    this.actions = []; // container for particle temporary effects
    this.calculateVector();
    this.active = true;
    this.closestDistance = maximumPossibleDistance;

    objects.push(this);
    this.index = objects.indexOf(this);
  };

  Particle.prototype.initOpacity = function () {
    if (this.randomOpacity) {
      this.opacity = basic.getRandomDecimalBetween(this.minimumOpacity, this.maximumOpacity);
    }

    this.initialOpacity = this.opacity;
  };

  Particle.prototype.initSize = function () {
    if (this.randomSize) {
      this.size = basic.getRandomBetween(this.minimumSize, this.maximumSize);
    }
    else {
      this.size = this.initialSize;
    }
  };

  Particle.prototype.calculateVector = function () {
    var
      distance,
      newDestination = {},
      particle = this;

    while ((typeof distance === "undefined") || (distance > this.moveLimit)) {
      newDestination = _getNewDestination(particle);
      distance = basic.getDistance(particle, newDestination);
    }

    this.vectorX = newDestination.positionX;
    this.vectorY = newDestination.positionY;
  };

  Particle.prototype.updateAnimation = function () {
    // calculate new position (Vector animation)
    this.calculateNewPosition(this.vectorX, this.vectorY);

    // draw particle
    this.updateColor();
    this.draw();
  };

  // Find closest element
  // Brute-force method to test interactions between particles
  // loop starts from particle.index value to avoid double tests.
  Particle.prototype.testInteraction = function () {
    for (var x = this.index + 1; x < objects.length; x++) {
      if (!this.active) {
        return;
      }

      var testedObject = objects[x];
      var distance = basic.getDistance(this, testedObject);

      // find the closest element
      if ((distance < this.closestDistance) && (testedObject.active === true)) {
        this.closestDistance = distance;
        this.closestElement = testedObject;
      }

      if (distance < testedObject.closestDistance) {
        testedObject.closestDistance = distance;
        testedObject.closestElement = this;
      }
    }
  };

  Particle.prototype.drawLine = function () {
    ctx.beginPath();
    ctx.moveTo(this.getCenterX(), this.getCenterY());
    ctx.lineTo(this.closestElement.getCenterX(), this.closestElement.getCenterY());
    ctx.strokeStyle = "rgba(" +
      options.connectionColor.red + "," +
      options.connectionColor.green + "," +
      options.connectionColor.blue + "," +
      options.connectionColor.alpha + ")";
    ctx.stroke();
    lines++;
  };

  Particle.prototype.updateLifeTime = function () {
    if (this.lifeTime) {
      this.lifeTime--;
    }

    if (this.lifeTime === 0) {
      this.fadeOut();
    }
  };

  return Particle;
};
