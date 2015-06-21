/*********************************************************************
 Author: Marian Gibala
 Github: https://github.com/mariangibala/ParticlesEngine
 *********************************************************************/

/*

 The MIT License (MIT)

 Copyright (c) 2015 Marian Gibala

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */


(function (window) {

  generateParticles = function (containerId) {

    "use strict";

// ----------------------------------------------------
// Use setTimeout if there is no support for requestAnimationFrame
//-----------------------------------------------------

    var requestAnimationFrame = window.requestAnimationFrame || function (callback) {
        return setTimeout(callback, 1000 / 60);
      };

    var cancelAnimation = window.cancelAnimationFrame || window.clearTimeout;

    var stopAnimation = function () {
      cancelAnimation(window.particleEngine["animation" + containerId]);
    };

// ----------------------------------------------------
// Generate canvas element //
//-----------------------------------------------------

    var container = document.getElementById(containerId);

    if (container === null) {
      return console.error("ParticlesEngine Error - Container is Null");
    }

    var canvas = document.createElement("canvas");
    canvas.id = "particles_" + containerId;
    canvas.style.display = "block";
    canvas.style.position = "absolute";

    container.innerHTML = "";
    container.style.overflow = "hidden";
    container.appendChild(canvas);

    var ctx = canvas.getContext("2d");

// ----------------------------------------------------
// Define local variables //
//-----------------------------------------------------

    var maximumPossibleDistance;
    var centerX;
    var centerY;

    var lines = 0;
    var objects = [];

    var emitters = [];

// ----------------------------------------------------
// Sub/Pub pattern to emit events //
//-----------------------------------------------------

    var eventBus = {};
    eventBus.events = {};

    eventBus.emit = function (eventName, data) {

      if (!this.events[eventName] || this.events[eventName].length < 1) {
        return;
      }

      this.events[eventName].forEach(function (listener) {
        listener(data || {});
      });

    };

    eventBus.subscribe = function (eventName, listener) {
      if (!this.events[eventName]) {
        this.events[eventName] = [];
      }

      this.events[eventName].push(listener);
    };

// ----------------------------------------------------
// Init function //
//-----------------------------------------------------

    var createGlobalParticlesObject = function () {

      // Handle different instances and global window.particleEngine //
      if (typeof window.particleEngine === "undefined") {

        window.particleEngine = {};
        window.particleEngine.resizeHandler = {};

      } else if (typeof window.particleEngine["animation" + containerId] !== "undefined") {

        // if animation already exists - cancel animation and remove window listeners to delete connections for garbage collection
        stopAnimation(window.particleEngine["animation" + containerId]);
        window.removeEventListener("resize", window.particleEngine.resizeHandler["animation" + containerId], false);

      }

      // create window.resize listener for current animation
      window.particleEngine.resizeHandler["animation" + containerId] = function () {

        stopAnimation(window.particleEngine["animation" + containerId]);
        initAnimation();

      };

      // new handler
      window.addEventListener("resize", window.particleEngine.resizeHandler["animation" + containerId], false)

    };

    var initAnimation = function(){

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      maximumPossibleDistance = Math.round(Math.sqrt((canvas.width * canvas.width) + (canvas.height * canvas.height)));

      centerX = Math.floor(canvas.width / 2);
      centerY = Math.floor(canvas.height / 2);

      objects.length = 0;
      emitters.length = 0;

      eventBus.emit("init");

      loop();

    };


// ----------------------------------------------------
// Background module //
//-----------------------------------------------------

var background = (function () {

  var background = {};

  background.init = function () {

    // Select background type to create
    var selectBackgroundType = function (type) {

      if (type === "gradient") {

        createBackgroundGradient();

      }
    };

    // CSS3 Radial Gradient
    var createBackgroundGradient = function () {

      var finalValue = "";
      var fallbackColor;

      for (var property in options.backgroundColors) {

        if (typeof fallbackColor === "undefined") {
          fallbackColor = options.backgroundColors[property].color;
        }

        // loop only thorough own properties
        if (options.backgroundColors.hasOwnProperty(property)) {

          // generate CSS code
          finalValue += "radial-gradient(circle at " +
            options.backgroundColors[property].positionX + "% " +
            options.backgroundColors[property].positionY + "%, #" +
            options.backgroundColors[property].color +
            ", transparent 100%),";
        }
      }

      // remove last comma ","
      finalValue = finalValue.slice(0, -1);

      container.style.background = "#" + fallbackColor;
      container.style.backgroundImage = finalValue;

    };

    // Facade function //
    var createBackground = function () {

      if (options.background !== null) {
        selectBackgroundType(options.background);
      }
    };

    eventBus.subscribe("init", createBackground);

  };

  return background;

}());

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

      for (var x = 0; x < objects.length; x++){

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

        var
          positionX,
          positionY,
          positionXpx,
          positionYpx,
          positionXpercentage,
          positionYpercentage;

        // get pixel position
        positionXpx = emitterConfig.positionXpx || 0;
        positionYpx = emitterConfig.positionYpx || 0;

        // get % position
        if(emitterConfig.positionX) {
          positionXpercentage = (canvas.width / 100) * emitterConfig.positionX;
        } else {
          positionXpercentage = 0;
        }

        if(emitterConfig.positionY) {
          positionYpercentage = (canvas.height / 100) * emitterConfig.positionX;
        } else {
          positionYpercentage = 0;
        }

        positionX = positionXpercentage + positionXpx;
        positionY = positionYpercentage + positionYpx;

        var particle = new particles.Particle(positionX, positionY, this.name);
        particle.init(particleConfig);

      }
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

// ----------------------------------------------------
// Fading    //
//-----------------------------------------------------

var fading = (function () {

  var fading = {};

  fading.init = function () {

    // helper function do not use without facade
    particles.Particle.prototype.fadeTo = function (value) {

      if (this.opacity < value) {

        this.opacity = this.opacity + 0.01;

        if (this.opacity > 1) {
          this.opacity = 1;
        }

      } else if (this.opacity > value) {

        this.opacity = this.opacity - 0.01;
      }
    };

    // Facade fadeIn
    particles.Particle.prototype.fadeIn = function () {

      this.active = true;

      if (this.actions.indexOf("fadeIn") === -1) {

        this.actions.push("fadeIn");

      }

      // Fade in to initial opacity
      this.fadeTo(this.initialOpacity);

      // remove fading action if opacty reach initial
      if ((this.initialOpacity - this.opacity) <= 0) {
        this.actions.splice(this.actions.indexOf("fadeIn"), 1);
      }
    };

    // Facade FadeOut
    particles.Particle.prototype.fadeOut = function () {

      this.isFading = true;

      if (this.actions.indexOf("fadeOut") === -1) {

        this.actions.push("fadeOut");

      }

      // 0.05 is safe value to prevent negative opacity
      if (this.opacity < 0.05) {

        this.opacity = 0;

        // deactivate particle, remove from particles array
        this.isFading = false;
        this.active = false;
        this.actions.splice(this.actions.indexOf("fadeOut"), 1);
      }

      this.fadeTo(0);
    };

  };

  return fading;

}());

// ----------------------------------------------------
// External forces    //
//-----------------------------------------------------

var forces = (function () {

  var forces = {};

  forces.init = function () {

    particles.Particle.prototype.appendGlobalForces = function (forceX, forceY) {

      // handle X position
      this.positionX = this.positionX + forceX;

      if (this.positionX + this.size > canvas.width) {
        this.positionX = canvas.width - this.size;
      }

      if (this.positionX < 0) {
        this.positionX = 0;
      }

      // handle Y position
      this.positionY = this.positionY + forceY;

      if (this.positionY > canvas.height) {
        this.positionY = canvas.height;
      }

      if (this.positionY < 0) {
        this.positionY = 0;
      }

    };
  };

  return forces;

}());

// ----------------------------------------------------
// Statistics module //
//-----------------------------------------------------

var statistics = (function () {

  var statistics = {};

  statistics.init = function () {

    var lastCalledTime;
    var fps;
    var averageFps;
    var averageFpsTemp = 0;
    var averageFpsCounter = 0;


    var requestStatistics = function () {

      if (!lastCalledTime) {

        lastCalledTime = Date.now();
        fps = 0;
        return;

      }

      var delta = (new Date().getTime() - lastCalledTime) / 1000;
      lastCalledTime = Date.now();
      fps = Math.floor(1 / delta);

      averageFpsTemp = averageFpsTemp + fps;
      averageFpsCounter++;

      if (averageFpsCounter === 5) {

        averageFps = Math.floor(averageFpsTemp / 5);
        averageFpsCounter = 0;
        averageFpsTemp = 0;
      }

      if (!averageFps) {

        return;

      } else if (averageFps < 10) {
        /*  stopAnimation();
         averageFps = undefined;
         $("#fpsError").fadeIn();*/
      }

      ctx.fillStyle = "#fff";

      ctx.font = "10px Verdana";
      ctx.fillText("FPS: " + fps, 10, canvas.height - 70);
      ctx.fillText("Average FPS: " + averageFps, 10, canvas.height - 60);
      ctx.fillText("Active particles: " + objects.length, 10, canvas.height - 50);
      ctx.fillText("Active emitters: " + emitters.length, 10, canvas.height - 40);
      ctx.fillText("Connections between particles: " + lines, 10, canvas.height - 30);

      lines = 0;
    };

    // Subscribe request Statistics event //
    eventBus.subscribe("requestStatistics", requestStatistics);

  };

  return statistics;

}());

// ----------------------------------------------------
// Garbage collector   //
//-----------------------------------------------------

var garbageCollector = (function(){

  var garbageCollector = {};

  garbageCollector.init = function(){

    var garbageObjects = 0;

    garbageCollector.increase = function(){
      garbageObjects++;
    };

    garbageCollector.collectGarbage = function(){
      for (var x = objects.length-1; x >= 0; x-- ){
        var particle = objects[x];

        if ((particle.destroyIt === true) && (!particle.active)) {
          objects.splice(x,1);
        }
      }

      garbageObjects = 0;
    };

    eventBus.subscribe('refreshScene', function(){
      if (garbageObjects > 100) {
        garbageCollector.collectGarbage();
      }
    });
  };

  return garbageCollector;

})();



// ----------------------------------------------------
// Helper functions //
//-----------------------------------------------------

var basic = (function () {

  var basic = {};

  basic.init = function () {

    // returns random number
    basic.getRandomBetween = function (a, b) {

      return Math.floor(Math.random() * (b - a + 1)) + a;

    };

    // returns decimal number
    basic.getRandomDecimalBetween = function (a, b) {

      var b = b * 100;
      var a = a * 100;

      var randomNumber = this.getRandomBetween(a, b);
      var finalNumber = randomNumber / 100;

      return finalNumber;

    };

    // Tests if an object is inside the area of another object and returns true or false

    basic.hitTest = function (object1, object2) {

      if ((object1.positionX < object2.positionX + object2.size) && (object1.positionX + object2.size > object2.positionX) &&
        (object1.positionY < object2.positionY + object2.size) && (object1.positionY > object2.positionY)) {

        return true;

      } else {

        return false;

      }
    };

    // returns distance between objects, uses Pythagorean theorem to calculate value

    basic.getDistance = function (element1, element2) {

      var difX = Math.round(Math.abs(element1.positionX - element2.positionX));
      var difY = Math.round(Math.abs(element1.positionY - element2.positionY));

      return Math.round(Math.sqrt((difX * difX) + (difY * difY)));
    };

    basic.getPosition = function(x,y){

    };

  };

  return basic;

}());

// ----------------------------------------------------
// Mouse interaction constructor function //
//-----------------------------------------------------
var mouse = (function () {

  var mouse = {};

  mouse.init = function () {

    // Create mouse interaction object
    mouse.Interaction = function () {};

    var mouseCursor = new mouse.Interaction();

    // Container for elements to interact
    var interactionElements = [];

    mouse.Interaction.prototype.grabElements = function () {

      interactionElements = [];

      for (var x = 0; x < objects.length; x++) {

        var object = objects[x];
        var distanceToObject = basic.getDistance(this, object);

        if (distanceToObject < options.mouseInteractionDistance) {

          interactionElements.push(objects[x]);

        }
      }
    };


    mouse.Interaction.prototype.interact = function () {

      for (var x = 0; x < interactionElements.length; x++) {

        var object = interactionElements[x];

        if (options.drawMouseConnections) {

          drawLine(this, object);

        }

        if (options.mouseInteractionType === "gravity") {

          object.vectorX = this.positionX;
          object.vectorY = this.positionY;

        } else if (options.mouseInteractionType === "initial") {

          object.vectorX = object.initialPositionX;
          object.vectorY = object.initialPositionY;

        }
      }
    };


    var drawLine = function(elementA, elementB){

      ctx.beginPath();
      ctx.moveTo(elementA.positionX, elementA.positionY);
      ctx.lineTo(elementB.getCenterX(), elementB.getCenterY());
      ctx.strokeStyle = "rgba(" +
        options.mouseConnectionColor.red + "," +
        options.mouseConnectionColor.green + "," +
        options.mouseConnectionColor.blue + "," +
        options.mouseConnectionColor.alpha + ")";
      ctx.stroke();
    };

    mouse.Interaction.prototype.updateAnimation = function () {

      this.positionX = particleEngine.mousePositionX;
      this.positionY = particleEngine.mousePositionY;

      this.grabElements();
      this.interact();
    };


    var refreshMouseInteraction = function () {

      mouseCursor.updateAnimation();

    };

    // subscribe refresh event

    if ((options.mouseInteraction) && (options.mouseInteractionDistance > 0) ) {

      eventBus.subscribe("refreshScene", refreshMouseInteraction);

    }

  };

  return mouse;

}());

// ----------------------------------------------------
// Default options //
//-----------------------------------------------------

var options = {

  particleType: "square", // square, text, circle
  particleText: "!",

  emitterShape: "M",
  emitterFontSize: 150,
  emitterType: "point", // random, point, text
  emitterPositionX: 50, // % position
  emitterPositionY: 50, // % position
  emitterPositionXpx: 0, // move px
  emitterPositionYpx: 0, // move px
  particlesNumber: 1,
  initialSize: 3,
  randomSize: true,
  minimumSize: 1,
  maximumSize: 3,
  moveLimit: 300,
  durationMin:50,
  durationMax: 200,

  lifeTimeMin: 10,
  lifeTimeMax : 10,

  //global forces
  globalForceX: 5,
  globalForceY: -1,

  // particles color

  particleColor: {red:255, green:255, blue:255, alpha:1},
  randomOpacity: true,
  particleMinimumOpacity: 0.1,
  particleMaximumOpacity: 0.9,

  // connections between particles
  drawConnections: false,
  connectionColor: {red:255, green:255, blue:255, alpha:1},

  // mouse connections
  mouseInteraction: false,
  mouseInteractionType: "gravity", // initial, gravity


  drawMouseConnections: false,
  mouseInteractionDistance: 300,
  mouseConnectionColor: {red:255, green:255, blue:255, alpha:1},

  showStatistics: true,
  background: "gradient", // null, gradient, image

  // Use object with property names, to easy identify values in color picker

  backgroundColors: {


    "color1": {
      positionX: 25,
      positionY: 25,
      color: "FF9900"
    },
    "color2": {
      positionX: 60,
      positionY: 60,
      color: "FFE066"
    }


  }

};


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
      garbageCollector.increase();

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

      if (this.timer === this.duration) {

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

      this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.opacity + ")";

      this.duration = basic.getRandomBetween(particleConfig.durationMin, particleConfig.durationMax);
      this.limit = particleConfig.moveLimit;
      this.timer = 0;

      this.lifeTime = getLifeTime(particleConfig.lifeTimeMin, particleConfig.lifeTimeMax);

      this.actions = []; // container for temporary effects

      this.calculateVector();

      this.active = true;
      this.closestDistance = maximumPossibleDistance;

      objects.push(this);
      this.index = objects.indexOf(this);

    };

    var getLifeTime = function(min,max) {

      if ((typeof min !== "undefined") && (typeof max !== "undefined")){

        return basic.getRandomBetween(min, max);

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

        if (maxPX > canvas.width) {
          maxPX = canvas.width;
        }
        if (minPX < 0) {
          minPX = 0;
        }

        var minPY = particle.positionY - particle.limit;
        var maxPY = particle.positionY + particle.limit;

        if (maxPY > canvas.height) {
          maxPY = canvas.height;
        }
        if (minPY < 0) {
          minPY = 0;
        }

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

      if (this.particleConfig.particleType === "square") {

        centerX = this.positionX + (this.size * 0.5);

      } else if (this.particleConfig.particleType === "circle") {

        centerX = this.positionX;

      }

      return centerX;

    };

    particles.Particle.prototype.getCenterY = function () {

      if (this.particleConfig.particleType === "square") {

        centerY = this.positionY + (this.size * 0.5);

      } else if (this.particleConfig.particleType === "circle") {

        centerY = this.positionY;

      }

      return centerY;

    };


    // Find closest element
    // Brute-force method to test interactions between particles
    // loop starts from particle.index value to avoid double tests.

    particles.Particle.prototype.testInteraction = function () {

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

    };

    particles.Particle.prototype.updateLifeTime = function () {

      if (this.lifeTime) {
        this.lifeTime--;
      }

      if (this.lifeTime === 0) {
        this.fadeOut();
      }

    };


    particles.Particle.prototype.updateAnimation = function () {

      // calculate new position (Vector animation)
      this.calculateNewPosition(this.vectorX, this.vectorY);

      // draw particle
      this.updateColor();
      ctx.fillStyle = this.color;

      if (this.particleConfig.particleType === "square") {

        ctx.fillRect(this.positionX, this.positionY, this.size, this.size);

      } else if (this.particleConfig.particleType === "circle") {

        ctx.beginPath();
        ctx.arc(this.positionX, this.positionY, this.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

      } else if (this.particleConfig.particleType === "text") {

        ctx.font = this.size + "px Verdana";
        ctx.fillText(options.particleText, this.positionX, this.positionY);
      }

    };
  };

  return particles;

}());

var scene = (function () {

  var scene = {};
  scene.init = function () {

    var frame = 0;

    scene.update = function () {

      frame++;

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

      for (var x = 0; x < objects.length; x++) {

        var particle = objects[x];

        particle.doActions();

        // append global forces
        particle.appendGlobalForces(options.globalForceX, options.globalForceY);

        if (particle.active) {

          particle.updateAnimation();
          particle.updateLifeTime();


        } else if ((!particle.destroyIt) && (!particle.active) && (!particle.isFading)) {

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

  };

  return scene;

}());

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
