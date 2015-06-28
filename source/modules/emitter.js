// ----------------------------------------------------
// Emitter //
//-----------------------------------------------------
var emitter = (function () {

  var emitter = {};
  emitter.init = function () {

    var Emitter = function () {};

    var defaults = {
      positionX: 0,
      positionY: 0,
      positionXpx: 0,
      positionYpx: 0,
      particlesNumber: 20,
      lifeTime: 1
    };

    Emitter.prototype.init = function (emitterConfig) {
      this.name = "emitter" + emitters.length;

      for (var x in defaults) {
        if (emitterConfig.hasOwnProperty(x)){
          this[x] = emitterConfig[x];
        } else {
          this[x] = defaults[x];
        }
      }
    };

    Emitter.prototype.update = function () {
      if (this.lifeTime) {
        this.lifeTime--;
      }

      if (this.lifeTime <= 0) {
        this.destroy();
      }
    };

    Emitter.prototype.destroy = function () {
      for (var x = 0; x < objects.length; x++){
        var particle = objects[x];

        if (particle.emitter === this.name) {
          particle.destroy();
        }
      }

      var index = emitters.indexOf(this);
      emitters.splice(index, 1);
    };

    var RandomEmitter = function (emitterConfig, particleConfig) {
      this.init(emitterConfig);

      for (var x = 0; x < this.particlesNumber; x++) {
        var randomX = Math.floor((Math.random() * canvas.width) + 1);
        var randomY = Math.floor((Math.random() * canvas.height) + 1);

        var particle = new particles.Particle(randomX, randomY, this.name);
        particle.init(particleConfig);
      }
    };

    RandomEmitter.prototype = Emitter.prototype;

    var PointEmitter = function (emitterConfig, particleConfig) {
      this.init(emitterConfig);

      var
        positionX,
        positionY,
        positionXpercentage,
        positionYpercentage;

      // get % position
      if (this.positionX) {
        positionXpercentage = (canvas.width / 100) * this.positionX;
      } else {
        positionXpercentage = 0;
      }

      if (this.positionY) {
        positionYpercentage = (canvas.height / 100) * this.positionX;
      } else {
        positionYpercentage = 0;
      }

      positionX = positionXpercentage + this.positionXpx;
      positionY = positionYpercentage + this.positionYpx;

      for (var x = 0; x < this.particlesNumber; x++) {
        var particle = new particles.Particle(positionX, positionY, this.name);

        particle.init(particleConfig);
      }
    };

    PointEmitter.prototype = Emitter.prototype;

    var addEmitter = function (type, emitterConfig, particleConfig ) {
      var emitter;

      if (type === "point") {
        emitter = new PointEmitter(emitterConfig, particleConfig);
      } else if (type === "random") {
        emitter = new RandomEmitter(emitterConfig, particleConfig);
      }

      emitters.push(emitter);
    };

    particleEngine.addEmitter = addEmitter;
  };

  return emitter;
}());
