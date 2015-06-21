// ----------------------------------------------------
// Emitters //
//-----------------------------------------------------

var emitter = (function () {

  var emitter = {};

  emitter.init = function () {

    var Emitter = function () {};

    Emitter.prototype.init = function (emitterConfig) {

      this.name = "emitter" + basic.getRandomBetween(1, 1000);
      this.lifeTime = emitterConfig.lifeTime || false;

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

      for (var x=0; x<objects.length; x++){

        var particle = objects[x];

        if (particle.emitter === this.name) {

          particle.destroy();

        }
      }

      var index = emitters.indexOf(this);
      emitters.splice(index,1);

    };

    var TextEmitter = function (config) {

      this.init();

      this.emitterPositions = [];

      var positionX = (canvas.width / 100) * config.positionX + config.positionXpx;
      var positionY = (canvas.height / 100) * config.positionY + config.positionYpx;


      ctx.fillStyle = "rgba(254,255,255,1)";
      ctx.font = config.emitterFontSize + "px Verdana";
      ctx.fillText(config.text, positionX, positionY);

      // scan all pixels and generate possible positions array

      var particleData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var data = particleData.data;

      var x = 0;
      var y = 0;

      for (var i = 0; i < data.length; i += 4) {

        x++;

        if (x === canvas.width) {

          x = 0;
          y++;

        }

        // if pixel isn't empty (standard transparent) then push position into emitter
        if (data[i] === 254) {

          this.emitterPositions.push([x, y]);

        }
      }

      this.createTextEmitterParticles(config);

    };

    TextEmitter.prototype = Emitter.prototype;

    TextEmitter.prototype.createTextEmitterParticles = function (config) {

      for (var x = 0; x < config.particlesNumber; x++) {

        // do not create particle if there is no available emitter position
        if (this.emitterPositions.length < 2) {
          return;
        }

        var randomNumber = basic.getRandomBetween(1, this.emitterPositions.length - 1);
        var position = this.emitterPositions[randomNumber];

        var particle = new particles.Particle(position[0], position[1], this.name);
        particle.init();

        this.emitterPositions.splice(randomNumber, 1);

      }
    };

    var RandomEmitter = function (emitterConfig, particleConfig) {

      this.init(emitterConfig);

      for (var x = 0; x < emitterConfig.particlesNumber; x++) {

        var randomX = Math.floor((Math.random() * canvas.width) + 1);
        var randomY = Math.floor((Math.random() * canvas.height) + 1);

        var particle = new particles.Particle(randomX, randomY, this.name);
        particle.init(particleConfig);

      }

    };

    RandomEmitter.prototype = Emitter.prototype;

    var PointEmitter = function (emitterConfig, particleConfig) {

      this.init(emitterConfig);

      for (var x = 0; x < emitterConfig.particlesNumber; x++) {

        var positionX = (canvas.width / 100) * emitterConfig.positionX + emitterConfig.positionXpx;
        var positionY = (canvas.height / 100) * emitterConfig.positionY + emitterConfig.positionYpx;

        var particle = new particles.Particle(positionX, positionY, this.name);
        particle.init(particleConfig);

      }

      this.prototype = Emitter.prototype;

    };

    PointEmitter.prototype = Emitter.prototype;

    var addEmitter = function (type, emitterConfig, particleConfig ) {

      var emitter;

      if (type === "text") {

        emitter = new TextEmitter(emitterConfig, particleConfig);

      } else if (type === "point") {

        emitter = new PointEmitter(emitterConfig, particleConfig);

      } else if (type === "random") {

        emitter = new RandomEmitter(emitterConfig, particleConfig);

      }

      emitters.push(emitter);

    };

    window.particleEngine.addEmitter = addEmitter;

  };

  return emitter;

}());
