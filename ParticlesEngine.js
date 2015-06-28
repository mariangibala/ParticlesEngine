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

  initParticleEngine = function (containerId) {

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
    var
      particleEngine = {},
      maximumPossibleDistance,
      lines = 0,
      objects = [],
      emitters = [];

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
// Init//
//-----------------------------------------------------
    var createGlobalParticlesObject = function () {
      // Handle different instances and global window.particleEngine /
      if (typeof window.particleEngine === "undefined") {
        window.particleEngine = particleEngine;
        particleEngine.resizeHandler = {};

      // if animation already exists - cancel animation and remove window listeners to delete connections for garbage collection
      } else if (typeof particleEngine["animation" + containerId] !== "undefined") {
        stopAnimation(particleEngine["animation" + containerId]);
        window.removeEventListener("resize", particleEngine.resizeHandler["animation" + containerId], false);
      }

      // create window.resize listener for current animation
      particleEngine.resizeHandler["animation" + containerId] = function () {
        stopAnimation(particleEngine["animation" + containerId]);
        initAnimation();
      };

      // new handler
      window.addEventListener("resize", particleEngine.resizeHandler["animation" + containerId], false);
    };

    var initAnimation = function(){
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      maximumPossibleDistance = Math.round(Math.sqrt((canvas.width * canvas.width) + (canvas.height * canvas.height)));

      objects.length = 0;
      emitters.length = 0;

      eventBus.emit("init");

      loop();
    };
// ----------------------------------------------------
// Background //
//-----------------------------------------------------

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
  return background;
};


// ----------------------------------------------------
// Basic functions //
//-----------------------------------------------------

var basic = {};
basic.init = function () {

  // returns random number
  basic.getRandomBetween = function (a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  };

  // returns decimal number
  basic.getRandomDecimalBetween = function (a, b) {
    b = b * 100;
    a = a * 100;

    var randomNumber = this.getRandomBetween(a, b);
    var finalNumber = randomNumber / 100;

    return finalNumber;
  };

  // Tests if an object is inside the area of another object and returns true or false
  basic.hitTest = function (object1, object2) {
    if ((object1.positionX < object2.positionX + object2.size) &&
      (object1.positionX + object2.size > object2.positionX) &&
      (object1.positionY < object2.positionY + object2.size) &&
      (object1.positionY > object2.positionY)) {
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

  return basic;
};

// ----------------------------------------------------
// Circle Particle //
//-----------------------------------------------------

var circleParticle = {};
circleParticle.init = function () {

  var CircleParticle = function () {};
  CircleParticle.prototype = new Particle();

  CircleParticle.prototype.getCenterX = function () {
    return this.positionX;
  };

  CircleParticle.prototype.getCenterY = function () {
    return this.positionY;
  };

  CircleParticle.prototype.updateAnimation = function () {
    // calculate new position (Vector animation)
    this.calculateNewPosition(this.vectorX, this.vectorY);

    // draw particle
    this.updateColor();
    ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.arc(this.positionX, this.positionY, this.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  };

  return CircleParticle;
};

// ----------------------------------------------------
// Emitter //
//-----------------------------------------------------
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

  var _getParticlesType = function(type){
    if (type === 'square'){
      return new SquareParticle();
    } else if (type === 'circle'){
      return new CircleParticle();
    } else if (type === 'text'){
      return new TextParticle();
    } else {
      // fallback if particles type is not defined
      return new SquareParticle();
    }
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

      particleConfig.positionX = Math.floor((Math.random() * canvas.width) + 1);
      particleConfig.positionY = Math.floor((Math.random() * canvas.height) + 1);

      var particle = _getParticlesType(particleConfig.particleType)
      particle.create(particleConfig, this.name);
    }
  };

  RandomEmitter.prototype = new Emitter();

  var PointEmitter = function (emitterConfig, particleConfig) {
    this.init(emitterConfig);

    particleConfig.positionX = emitterConfig.positionX;
    particleConfig.positionY = emitterConfig.positionY;

    for (var x = 0; x < this.particlesNumber; x++) {
      var particle = _getParticlesType(particleConfig.particleType)
      particle.create(particleConfig, this.name);
    }
  };

  PointEmitter.prototype = new Emitter();

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
  return emitter;
};

// ----------------------------------------------------
// Fading    //
//-----------------------------------------------------

var fading = {};
fading.init = function () {

  // helper function do not use without facade
  Particle.prototype.fadeTo = function (value) {
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
  Particle.prototype.fadeIn = function () {
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
  Particle.prototype.fadeOut = function () {
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

  return fading;
};


// ----------------------------------------------------
// Scene forces    //
//-----------------------------------------------------

var forces = {};
forces.init = function () {

  Particle.prototype.appendGlobalForces = function (forceX, forceY) {
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

  return forces;
};

// ----------------------------------------------------
// Statistics //
//-----------------------------------------------------

var statistics = {};
statistics.init = function () {

  var
    lastCalledTime,
    fps,
    averageFps,
    averageFpsTemp = 0,
    averageFpsCounter = 0;

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
  return statistics;
};

// ----------------------------------------------------
// Garbage collector //
//-----------------------------------------------------

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

  return garbageCollector;
};




// ----------------------------------------------------
// Mouse interactions
//-----------------------------------------------------

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

  return mouse;
};

// ----------------------------------------------------
// Default options //
//-----------------------------------------------------
var options = {
  //global forces
  globalForceX: 5,
  globalForceY: -1,

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

var particleDefaults = {
  particleType: "square", // square, text, circle
  particleText: "!",

  positionX: 0,
  positionY: 0,

  initialSize: 3,
  randomSize: true,
  minimumSize: 1,
  maximumSize: 3,
  moveLimit: 300,
  durationMin:50,
  durationMax: 200,

  lifeTimeMin: 10,
  lifeTimeMax : 10,

  // particles color
  red: 255,
  green: 255,
  blue: 255,
  alpha:1,
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
  mouseConnectionColor: {red:255, green:255, blue:255, alpha:1}
};

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
    } else {
      step = (currentPosition - newPosition) / duration;
      newPosition = currentPosition - step;
    }

    return newPosition;
  };

  var _generateLifeTime = function(min, max) {
    if ((typeof min !== "undefined") && (typeof max !== "undefined")){
      return basic.getRandomBetween(min, max);
    } else {
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

  Particle.prototype.destroy = function(){
    this.destroyIt = true;
    garbageCollector.increase();
  };

  Particle.prototype.calculateNewPosition = function (newX, newY) {
    this.positionX = _getNextPosition(newX, this.positionX, this.duration);
    this.positionY = _getNextPosition(newY, this.positionY, this.duration);

    // generate new vector
    if (this.timer === this.duration) {
      this.calculateVector();
      this.timer = 0;
    } else {
      this.timer++;
    }
  };

  Particle.prototype.updateColor = function () {
    this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.opacity + ")";
  };

  Particle.prototype.create = function(particleConfig, emitter){
    this.emitter = emitter;

    for (var x in particleDefaults) {
      if (particleConfig.hasOwnProperty(x)){
        this[x] = particleConfig[x];
      } else {
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
      this.opacity = basic.getRandomDecimalBetween(this.particleMinimumOpacity, this.particleMaximumOpacity);
    } else {
      this.opacity = this.particleColor.alpha;
    }

    this.initialOpacity = this.opacity;
  };

  Particle.prototype.initSize = function () {
    if (this.randomSize) {
      this.size = basic.getRandomBetween(this.minimumSize, this.maximumSize);
    } else {
      this.size = this.initialSize;
    }
  };

  Particle.prototype.calculateVector = function () {
    var
      distance,
      newDestination = {},
      particle = this;

    while ((typeof distance === "undefined") || (distance > this.moveLimit)) {
      newDestination =_getNewDestination(particle);
      distance = basic.getDistance(particle, newDestination);
    }

    this.vectorX = newDestination.positionX;
    this.vectorY = newDestination.positionY;
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

// ----------------------------------------------------
// Scene //
//-----------------------------------------------------

var scene = {};
scene.init = function () {

  var frame = 0;

  var handleConnections = function(){
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

  return scene;
};

// ----------------------------------------------------
// Square Particle //
//-----------------------------------------------------

var squareParticle = {};
squareParticle.init = function () {

  var SquareParticle = function () {};
  SquareParticle.prototype = new Particle();

  SquareParticle.prototype.getCenterX = function () {
    return this.positionX + (this.size * 0.5);
  };

  SquareParticle.prototype.getCenterY = function () {
    return this.positionY + (this.size * 0.5);
  };

  SquareParticle.prototype.updateAnimation = function () {
    // calculate new position (Vector animation)
    this.calculateNewPosition(this.vectorX, this.vectorY);

    // draw particle
    this.updateColor();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.positionX, this.positionY, this.size, this.size);
  };

  return SquareParticle;
};

// ----------------------------------------------------
// Text Particle //
//-----------------------------------------------------

var textParticle = {};
textParticle.init = function () {

  var TextParticle = function () {};
  TextParticle.prototype = new Particle();

  TextParticle.prototype.getCenterX = function () {
    return this.positionX + (this.size * 0.5);
  };

  TextParticle.prototype.getCenterY = function () {
    return this.positionY + (this.size * 0.5);
  };

  TextParticle.prototype.updateAnimation = function () {
    // calculate new position (Vector animation)
    this.calculateNewPosition(this.vectorX, this.vectorY);

    // draw particle
    this.updateColor();
    ctx.font = this.size + "px Verdana";
    ctx.fillText(this.particleText, this.positionX, this.positionY);
  };

  return TextParticle;
};

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
