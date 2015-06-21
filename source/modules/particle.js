// ----------------------------------------------------
// Particle constructor function //
//-----------------------------------------------------
var particles = (function () {

  var particles = {};

  particles.init = function () {

    particles.Particle = function (positionX, positionY, emitter) {

      this.positionX = positionX;
      this.positionY = positionY;
      this.initialPositionX = positionX;
      this.initialPositionY = positionY;
      this.emitter = emitter;

    };

    particles.Particle.prototype.doActions = function () {

      for (var x = 0; x < this.actions.length; x++) {

        var action = this.actions[x];
        this[action]();
      }
    };


    particles.Particle.prototype.destroy = function(){

      this.destroyIt = true;
      garbageObjects++

    };


    particles.Particle.prototype.calculateNewPosition = function (newX, newY) {

      var step;
      var duration = this.duration;

      var animatePosition = function (newPosition, currentPosition) {

        if (newPosition > currentPosition) {

          step = (newPosition - currentPosition) / duration;
          newPosition = currentPosition + step;
        } else {

          step = (currentPosition - newPosition) / duration;
          newPosition = currentPosition - step;
        }

        return newPosition;

      };

      this.positionX = animatePosition(newX, this.positionX);
      this.positionY = animatePosition(newY, this.positionY);

      // generate new vector

      if (this.timer == this.duration) {

        this.calculateVector();
        this.timer = 0;

      } else {

        this.timer++;

      }
    };

    particles.Particle.prototype.updateColor = function () {

      this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.opacity + ")";

    };

    particles.Particle.prototype.init = function (particleConfig) {

      this.particleConfig = particleConfig;

      this.initOpacity();
      this.initSize();

      this.red = particleConfig.particleColor.red;
      this.green = particleConfig.particleColor.green;
      this.blue = particleConfig.particleColor.blue;

      this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.opacity + ")"

      this.duration = basic.getRandomBetween(particleConfig.durationMin, particleConfig.durationMax);
      this.limit = particleConfig.moveLimit;
      this.timer = 0;

      this.lifeTime = getLifeTime(particleConfig.lifeTimeMin, particleConfig.lifeTimeMax)

      this.actions = []; // container for temporary effects

      this.calculateVector();

      this.active = true;
      this.closestDistance = maximumPossibleDistance;

      objects.push(this);
      this.index = objects.indexOf(this);

    };

    var getLifeTime = function(min,max) {

      if ((typeof min !== "undefined") && (typeof max !== "undefined")){

        return basic.getRandomBetween(min, max)

      } else {

        return false;
      }

    };


    particles.Particle.prototype.initOpacity = function () {

      if (this.particleConfig.randomOpacity) {

        this.opacity = basic.getRandomDecimalBetween(this.particleConfig.particleMinimumOpacity, this.particleConfig.particleMaximumOpacity);

      } else {

        this.opacity = this.particleConfig.particleColor.alpha;

      }

      this.initialOpacity = this.opacity;

    };

    particles.Particle.prototype.initSize = function () {

      if (this.particleConfig.randomSize) {

        this.size = basic.getRandomBetween(this.particleConfig.minimumSize, this.particleConfig.maximumSize);

      } else {

        this.size = this.particleConfig.initialSize;

      }

    };

    particles.Particle.prototype.calculateVector = function () {

      var distance;
      var newPosition = {};
      var particle = this;

      var getCoordinates = function () {

        // limit coordinates to look for (distance limit)

        var minPX = particle.positionX - particle.limit;
        var maxPX = particle.positionX + particle.limit;

        if (maxPX > canvas.width) maxPX = canvas.width;
        if (minPX < 0) minPX = 0;

        var minPY = particle.positionY - particle.limit;
        var maxPY = particle.positionY + particle.limit

        if (maxPY > canvas.height) maxPY = canvas.height;
        if (minPY < 0) minPY = 0;

        newPosition.positionX = basic.getRandomBetween(minPX, maxPX);
        newPosition.positionY = basic.getRandomBetween(minPY, maxPY);

        distance = basic.getDistance(particle, newPosition);

      };

      while ((typeof distance === "undefined") || (distance > this.limit)) {

        getCoordinates();

      }

      this.vectorX = newPosition.positionX;
      this.vectorY = newPosition.positionY;


    };

    particles.Particle.prototype.getCenterX = function () {

      if (this.particleConfig.particleType == "square") {

        centerX = this.positionX + (this.size * 0.5);

      } else if (this.particleConfig.particleType == "circle") {

        centerX = this.positionX;

      }

      return centerX

    };

    particles.Particle.prototype.getCenterY = function () {

      if (this.particleConfig.particleType == "square") {

        centerY = this.positionY + (this.size * 0.5);

      } else if (this.particleConfig.particleType == "circle") {

        centerY = this.positionY;

      }

      return centerY

    };


    // ----------------------------------------------------
    // Find closest element //
    //-----------------------------------------------------
    // Brute-force method to test interactions between particles
    // loop starts from particle.index value to avoid double tests.

    particles.Particle.prototype.testInteraction = function () {

      for (var x = this.index + 1; x < objects.length; x++) {

        if (!this.active ) return;
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

    particles.Particle.prototype.drawLine = function () {

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

    }

    particles.Particle.prototype.updateLifeTime = function () {

      if (this.lifeTime) {
        this.lifeTime--;
      }

      if (this.lifeTime === 0) {
        this.fadeOut()
      }

    };


    particles.Particle.prototype.updateAnimation = function () {

      // calculate new position (Vector animation)
      this.calculateNewPosition(this.vectorX, this.vectorY);

      // draw particle
      this.updateColor();
      ctx.fillStyle = this.color;

      if (this.particleConfig.particleType == "square") {

        ctx.fillRect(this.positionX, this.positionY, this.size, this.size);

      } else if (this.particleConfig.particleType == "circle") {

        ctx.beginPath();
        ctx.arc(this.positionX, this.positionY, this.size, 0, 2 * Math.PI);
        ctx.fill()
        ctx.closePath();

      } else if (this.particleConfig.particleType == "text") {

        ctx.font = this.size + "px Verdana"
        ctx.fillText(options.particleText, this.positionX, this.positionY)
      }

    };
  }

  return particles

}());
