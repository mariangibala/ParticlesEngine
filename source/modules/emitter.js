// ----------------------------------------------------
// Emitter //
//-----------------------------------------------------

var emitter = {};
emitter.init = function () {

  var Emitter = function () {};

  var defaults = {
    positionX: 0,
    positionY: 0,
    particlesNumber: 20,
    lifeTime: 1
  };

  var _getParticlesType = function (type) {
    if (type === 'square') {
      return new SquareParticle();
    }
    else if (type === 'circle') {
      return new CircleParticle();
    }
    else if (type === 'text') {
      return new TextParticle();
    }
    else {
      // fallback if particles type is not defined
      return new SquareParticle();
    }
  };

  Emitter.prototype.init = function (emitterConfig) {
    this.name = "emitter" + emitters.length;

    for (var x in defaults) {
      if (emitterConfig.hasOwnProperty(x)) {
        this[x] = emitterConfig[x];
      }
      else {
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
    for (var x = 0; x < objects.length; x++) {
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
      particleConfig.positionX = Math.floor((Math.random() * canvas.width) + 1);
      particleConfig.positionY = Math.floor((Math.random() * canvas.height) + 1);

      var particle = _getParticlesType(particleConfig.type);
      particle.create(particleConfig, this.name);
    }
  };

  RandomEmitter.prototype = new Emitter();

  var PointEmitter = function (emitterConfig, particleConfig) {
    this.init(emitterConfig);

    particleConfig.positionX = emitterConfig.positionX;
    particleConfig.positionY = emitterConfig.positionY;

    for (var x = 0; x < this.particlesNumber; x++) {
      var particle = _getParticlesType(particleConfig.type);
      particle.create(particleConfig, this.name);
    }
  };

  PointEmitter.prototype = new Emitter();

  var addEmitter = function (type, emitterConfig, particleConfig) {
    var emitter;

    if (type === "point") {
      emitter = new PointEmitter(emitterConfig, particleConfig);
    }
    else if (type === "random") {
      emitter = new RandomEmitter(emitterConfig, particleConfig);
    }

    emitters.push(emitter);
  };

  particleEngine.addEmitter = addEmitter;
  return emitter;
};
