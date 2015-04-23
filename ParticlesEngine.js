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




!(function (window) {


        generateParticles = function (id, userOptions) {

                "use strict"

                // ----------------------------------------------------
                // Use setTimeout if there is no support for requestAnimationFrame
                //-----------------------------------------------------


                var cancelAnimation = window.cancelAnimationFrame || window.clearTimeout;

                var requestAnimationFrame = window.requestAnimationFrame || function (callback) {

                    return setTimeout(callback, 1000 / 60)
                };


                // ----------------------------------------------------
                // Generate canvas element //
                //-----------------------------------------------------

                var container = document.getElementById(id);
                if (container === null) return console.error("ParticlesEngine Error - Container is Null");


                var canvas = document.createElement("canvas");
                canvas.id = "particles_" + id;
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

                var mousePositionX = 0;
                var mousePositionY = 0;
                var mouseCursor;
                var isRunning;

                var lines = 0;
                var objects = [];

                var emitterPositions = [];
                var modules = [];

                // ----------------------------------------------------
                // Sub/Pub pattern to emit events //
                //-----------------------------------------------------

                var eventBus = {}
                eventBus.events = {}

                eventBus.emit = function (eventName, data) {


                    if (!this.events[eventName] || this.events[eventName].length < 1) return;

                    this.events[eventName].forEach(function (listener) {

                        listener(data || {});

                    });


                };

                eventBus.subscribe = function (eventName, listener) {


                    if (!this.events[eventName]) this.events[eventName] = [];

                    this.events[eventName].push(listener)


                };


                // ----------------------------------------------------
                // Init function //
                //-----------------------------------------------------

                var initAnimation = function () {


                    // ----------------------------------------------------
                    // Handle different instances and global window.particleEngine //
                    //-----------------------------------------------------


                    if (typeof window.particleEngine === "undefined") {

                        window.particleEngine = {};
                        window.particleEngine.resizeHandler = {};


                    }
                    else if (typeof window.particleEngine["animation" + id] !== "undefined") {

                        // if animation already exists - cancel animation and remove window listeners to delete connections for garbage collection
                        cancelAnimation(window.particleEngine["animation" + id]);
                        window.removeEventListener("resize", window.particleEngine.resizeHandler["animation" + id], false)


                    }

                    // create window.resize listener for current animation
                    window.particleEngine.resizeHandler["animation" + id] = function () {
                            initAnimation()
                        } // new handler
                    window.addEventListener("resize", window.particleEngine.resizeHandler["animation" + id], false)


                    canvas.width = container.clientWidth;
                    canvas.height = container.clientHeight;





                    maximumPossibleDistance = Math.round(Math.sqrt((canvas.width * canvas.width) + (canvas.height * canvas.height)));

                    centerX = Math.floor(canvas.width / 2);
                    centerY = Math.floor(canvas.height / 2);

                    objects.length = 0;
                    emitterPositions.length = 0;

                    eventBus.emit("init")


                    emitter.createScene();
                    loop();

                };

// ----------------------------------------------------
// Background module //
//-----------------------------------------------------

var background = (function () {

    var background = {};

    background.init = function () {

        // ----------------------------------------------------
        // Select background type to create //
        //-----------------------------------------------------

        var selectBackgroundType = function (type) {


            if (type === "gradient") {

                createBackgroundGradient();

            }
            else if (type === "image") {

                createBackgroundImage();

            }

        }

        // ----------------------------------------------------
        // CSS3 Radial Gradient //
        //-----------------------------------------------------

        var createBackgroundGradient = function () {

            var finalValue = "";
            var fallbackColor;

            for (var property in options.backgroundColors) {

                if (typeof fallbackColor == "undefined") fallbackColor = options.backgroundColors[property].color;

                // loop only throught own propeties
                if (options.backgroundColors.hasOwnProperty(property)) {

                    // generate CSS code

                    finalValue += "radial-gradient(circle at " +

                        options.backgroundColors[property].positionX + "% " +
                        options.backgroundColors[property].positionY + "%, #" +
                        options.backgroundColors[property].color +

                        ", transparent 100%),"

                }

            }

            // remove last comma ","
            finalValue = finalValue.slice(0, -1)



            container.style.background = "#" + fallbackColor;
            container.style.backgroundImage = finalValue;


        }

        // ----------------------------------------------------
        // Image background //
        //-----------------------------------------------------


        var createBackgroundImage = function () {

            container.style.backgroundImage = "url(img/wallpaper.jpg)";
            container.style.backgroundPosition = "center center";
            container.style.backgroundSize = "cover";

        }


        // ----------------------------------------------------
        // Facade function //
        //-----------------------------------------------------


        var createBackground = function () {


            if (options.background !== null) selectBackgroundType(options.background);


        }


        // ----------------------------------------------------
        // Subscribe init event //
        //-----------------------------------------------------


        eventBus.subscribe("init", createBackground)


    }



    return background


}());

 // ----------------------------------------------------
 // Emitters //
 //-----------------------------------------------------

 var emitter = (function () {

     var emitter = {};
     emitter.init = function () {

         var createTextEmitter = function (config) {


             var positionX = (canvas.width / 100) * config.positionX - config.positionXpx
             var positionY = (canvas.height / 100) * config.positionY


             ctx.fillStyle = "#fff";
             ctx.font = config.emitterFontSize + "px Verdana";
             ctx.fillText(config.text, positionX, positionY);

             // scan all pixels and generate possible positions array

             var particleData = ctx.getImageData(0, 0, canvas.width, canvas.height)
             var data = particleData.data;


             var x = 0;
             var y = 0;

             for (var i = 0; i < data.length; i += 4) {

                 x++;

                 if (x == canvas.width) {

                     x = 0;
                     y++;

                 }

                 // if pixel isnt't empty (standard transparent) then push position into emitter 
                 if (data[i] === 255) {

                     emitterPositions.push([x, y])

                 }

             }

         };

         var createTextEmitterParticles = function (config) {



             for (var x = 0; x < config.particlesNumber; x++) {

                 // do not create particle if there is no avalaible emitter position
                 if (emitterPositions.length < 2) return;

                 var randomNumber = basic.getRandomBetween(1, emitterPositions.length - 1);
                 var position = emitterPositions[randomNumber];

                 var particle = new particles.Particle(position[0], position[1]);
                 particle.init();

                 emitterPositions.splice(randomNumber, 1);


             }


         };


         var createRandomEmitter = function (config) {

             for (var x = 0; x < config.particlesNumber; x++) {

                 var randomX = Math.floor((Math.random() * canvas.width) + 1);
                 var randomY = Math.floor((Math.random() * canvas.height) + 1);

                 var particle = new particles.Particle(randomX, randomY);
                 particle.init()

             }

         };


         var createPointEmitter = function (config) {

             for (var x = 0; x < config.particlesNumber; x++) {


                 var positionX = (canvas.width / 100) * config.positionX
                 var positionY = (canvas.height / 100) * config.positionY

                 var particle = new particles.Particle(positionX, positionY);
                 particle.init()

             }

         };


         var addEmitter = function (type, config) {

             if (type === "text") {

                 createTextEmitter(config)
                 createTextEmitterParticles(config)

             }
             else if (type === "point") {

                 createPointEmitter(config)


             }
             else if (type === "random") {


                 createRandomEmitter(config)

             }

         };


         emitter.createScene = function () {


             if (options.emitterType === "text") {

                 addEmitter("text", {

                     positionX: options.emitterPositionX,
                     positionY: options.emitterPositionY,
                     particlesNumber: options.particlesNumber,
                     text: options.emitterShape,
                     emitterFontSize: options.emitterFontSize,
                     positionXpx: options.emitterPositionXpx,


                 });

             }
             else if (options.emitterType === "point") {


                 addEmitter("point", {

                     positionX: options.emitterPositionX,
                     positionY: options.emitterPositionY,
                     particlesNumber: options.particlesNumber

                 });


             }
             else if (options.emitterType === "random") {


                 addEmitter("random", {

                     particlesNumber: options.particlesNumber

                 });

             }


         };



     }

     return emitter

 }());

// ----------------------------------------------------
// Fading    //
//-----------------------------------------------------

var fading = (function () {

    var fading = {}

    fading.init = function () {

        // helper function do not use without facade
        particles.Particle.prototype.fadeTo = function (value) {

            if (this.opacity < value) {


                this.opacity = this.opacity + 0.02;


                if (this.opacity > 1) this.opacity = 1;



            }
            else if (this.opacity > value) {


                this.opacity = this.opacity - 0.02;

            }


        };

        // Facade fadeIn
        particles.Particle.prototype.fadeIn = function () {



            this.active = true;

            if (this.actions.indexOf("fadeIn") == -1) {

                this.actions.push("fadeIn");

            }


            // Fade in to initial opacity
            this.fadeTo(this.initialOpacity);

            // remove fading action if opacty reach initial

            if ((this.initialOpacity - this.opacity) <= 0) this.actions.splice(this.actions.indexOf("fadeIn"), 1);





        };

        // Facade FadeOut
        particles.Particle.prototype.fadeOut = function () {

            this.isFading = true;

            if (this.actions.indexOf("fadeOut") == -1) {

                this.actions.push("fadeOut");

            }

            // 0.05 is safe value to prevent negative opacity 
            if (this.opacity < 0.05) {

                this.opacity = 0;


                // deactivate particle, remove from particles array
                this.isFading = false;
                this.active = false;
                this.actions.splice(this.actions.indexOf("fadeOut"), 1)


            }


            this.fadeTo(0);

        };

    }

    return fading

}());

// ----------------------------------------------------
// External forces    //
//-----------------------------------------------------

var forces = (function () {

    var forces = {}

    forces.init = function () {


        particles.Particle.prototype.appendGlobalForces = function (forceX, forceY) {


            this.positionX = this.positionX + forceX;

            if (this.positionX > canvas.width) this.positionX = canvas.width;
            if (this.positionX < 0) this.positionX = 0;


            this.positionY = this.positionY + forceY;

            if (this.positionY > canvas.height) this.positionY = canvas.height;
            if (this.positionY < 0) this.positionY = 0;


        }



    }

    return forces

}());

// ----------------------------------------------------
// Statistics module //
//-----------------------------------------------------

var statistics = (function () {

    var statistics = {}
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

            }
            else if (averageFps < 10) {
                /*  stopAnimation(); 
                averageFps = undefined; 
                 $("#fpsError").fadeIn();*/

            }


            var activeParticles = objects.length

            ctx.fillStyle = "#fff";
            ctx.font = "11px Verdana";
            ctx.fillText("FPS: " + fps + " lines: " + lines + " Active particles: " + activeParticles + " Average FPS: " + averageFps, 10, canvas.height - 20);
            lines = 0;




        }

        // ----------------------------------------------------
        // Subscribe request Statistics event //
        //-----------------------------------------------------


        eventBus.subscribe("requestStatistics", requestStatistics)

    }

    return statistics

}());

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


            }
            else {

                return false;

            }


        };

        // returns distance between objects, uses Pythagorean theorem to calculate value

        basic.getDistance = function (element1, element2) {

            var difX = Math.round(Math.abs(element1.positionX - element2.positionX));
            var difY = Math.round(Math.abs(element1.positionY - element2.positionY));

            return Math.round(Math.sqrt((difX * difX) + (difY * difY)));


        };

    }

    return basic

}())

// ----------------------------------------------------
// Mouse interaction constructor function //
//-----------------------------------------------------
var mouse = (function () {

    var mouse = {};
    mouse.init = function () {


        // ----------------------------------------------------
        // Mouse Object constructor function //
        //-----------------------------------------------------
        mouse.Interaction = function () {};


        mouse.Interaction.prototype.testInteraction = function () {

            if (options.mouseInteractionDistance === 0) return;

            var closestElements = [];
            var distanceToClosestElement = maximumPossibleDistance;

            for (var x = 0; x < objects.length; x++) {

                var testedObject = objects[x];
                var distance = basic.getDistance(this, testedObject);


                if ((distance < options.mouseInteractionDistance) && (testedObject !== this)) {


                    closestElements.push(objects[x]);

                }

            }


            for (var x = 0; x < closestElements.length; x++) {


                if (options.drawMouseConnections) {

                    var element = closestElements[x];
                    ctx.beginPath();
                    ctx.moveTo(this.positionX, this.positionY);
                    ctx.lineTo(element.positionX + element.size * 0.5, element.positionY + element.size * 0.5);
                    ctx.strokeStyle = "rgba(" + options.mouseConnectionRed + "," + options.mouseConnectionGreen + "," + options.mouseConnectionBlue + "," + options.mouseConnectionOpacity + ")";
                    ctx.stroke();
                    lines++;

                }

                if (options.mouseInteraction) {

                    if (options.mouseInteractionType == "gravity") {

                        closestElements[x].vectorX = this.positionX;
                        closestElements[x].vectorY = this.positionY;

                    }
                    else if (options.mouseInteractionType == "initial") {


                        closestElements[x].vectorX = closestElements[x].initialPositionX;
                        closestElements[x].vectorY = closestElements[x].initialPositionY;

                    }

                }


            }
        };



        mouse.Interaction.prototype.updateAnimation = function () {


            this.positionX = mousePositionX;
            this.positionY = mousePositionY;

            this.testInteraction();


        };


        // create mouse element
        var mouseCursor = new mouse.Interaction("ab");


        var refreshMouse = function () {

            mouseCursor.updateAnimation();

        };

        // subscribe refresh event
        eventBus.subscribe("refreshScene", refreshMouse)

    }

    return mouse

}());

// ----------------------------------------------------
// Defaults //
//-----------------------------------------------------

var options = {

    particleType: "circle", // square, text, circle
    particleText: "☆",

    emitterShape: "77",
    emitterFontSize: 150,
    emitterType: "random", // random, point, text
    emitterPositionX: 50,
    emitterPositionXpx: 200,
    emitterPositionY: 50,
    particlesNumber: 400,
    initialSize: 3,
    randomSize: true,
    minimumSize: 1,
    maximumSize: 3,
    moveLimit: 50,
    durationMin: 50,
    durationMax: 200,

    lifeTime: true,
    lifeTimeMin: 100,
    lifeTimeMax: 150,

    //global forces
    globalForceX: 0,
    globalForceY: 0,

    // particles color
    red: 255,
    green: 255,
    blue: 255,
    opacity: 1,
    randomOpacity: true,
    particleMinimumOpacity: 0.1,
    particleMaximumOpacity: 0.9,

    // connections between particles
    drawConnections: false,
    connectionRed: 255,
    connectionGreen: 255,
    connectionBlue: 255,
    connectionOpacity: 0.1,

    // mouse connections
    mouseInteraction: true,
    mouseInteractionType: "gravity", // initial, gravity


    drawMouseConnections: false,
    mouseInteractionDistance: 300,
    mouseConnectionRed: 255,
    mouseConnectionGreen: 255,
    mouseConnectionBlue: 255,
    mouseConnectionOpacity: 0.1,

    showStatistics: true,
    background: "gradient", // null, gradient, image
    backgroundImage: "img/wallpaper.jpg",
    backgroundMainColor: "255,255,255",


    // Use object with property names, to easy identify values in color picker


    backgroundColors: {


        "color1": {
            positionX: 25,
            positionY: 25,
            color: "68B9F2"
        },
        "color2": {
            positionX: 60,
            positionY: 60,
            color: "0000ff"
        }


    }

}

// overwrite default options

var extendOptions = function (options, userOptions) {

    for (var key in userOptions) {

        if (userOptions.hasOwnProperty(key))
            options[key] = userOptions[key];

    }

    return options;
}

extendOptions(options, userOptions)

// ----------------------------------------------------
// Mouse interaction constructor function //
//-----------------------------------------------------
var parallax = (function () {

    var parallax = {};
    parallax.init = function () {



        particles.Particle.prototype.appendParallax = function () {





        }


    }

    return parallax

}());

// ----------------------------------------------------
// Particle constructor function //
//-----------------------------------------------------
var particles = (function () {

    var particles = {};
    particles.init = function () {


        particles.Particle = function (positionX, positionY) {

            this.positionX = positionX;
            this.positionY = positionY;
            this.initialPositionX = positionX;
            this.initialPositionY = positionY;

        }



        particles.Particle.prototype.doActions = function () {

            for (var x = 0; x < this.actions.length; x++) {


                var action = this.actions[x];
                this[action]();


            }

        };



        particles.Particle.prototype.calculateNewPosition = function (newX, newY) {

            var step;
            var duration = this.duration;

            var animatePosition = function (newPosition, currentPosition) {

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

            this.positionX = animatePosition(newX, this.positionX);
            this.positionY = animatePosition(newY, this.positionY);



            // generate new vector

            if (this.timer == this.duration) {

                this.calculateVector();
                this.timer = 0;

            }
            else {

                this.timer++;

            }


        };

        particles.Particle.prototype.updateColor = function () {

            this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.opacity + ")";

        };

        particles.Particle.prototype.init = function () {

            this.initOpacity();
            this.initSize();


            this.red = options.red;
            this.green = options.green;
            this.blue = options.blue;

            this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.opacity + ")"

            this.duration = basic.getRandomBetween(options.durationMin, options.durationMax);
            this.limit = options.moveLimit;
            this.timer = 0;


            this.lifeTime = basic.getRandomBetween(options.lifeTimeMin, options.lifeTimeMax)

            this.actions = []; // container for temporary effects

            this.calculateVector();

            this.active = true;
            this.closestDistance = maximumPossibleDistance;

            objects.push(this);
            this.index = objects.indexOf(this);


        }

        particles.Particle.prototype.initOpacity = function () {

            if (options.randomOpacity) {

                this.opacity = basic.getRandomDecimalBetween(options.particleMinimumOpacity, options.particleMaximumOpacity);

            }
            else {

                this.opacity = options.opacity;

            }

            this.initialOpacity = this.opacity;

        };

        particles.Particle.prototype.initSize = function () {

            if (options.randomSize) {

                this.size = basic.getRandomBetween(options.minimumSize, options.maximumSize);

            }
            else {

                this.size = options.initialSize;

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

            if (options.particleType == "square") {

                centerX = this.positionX + (this.size * 0.5);

            }
            else if (options.particleType == "circle") {

                centerX = this.positionX;

            }

            return centerX

        };

        particles.Particle.prototype.getCenterY = function () {

            if (options.particleType == "square") {

                centerY = this.positionY + (this.size * 0.5);

            }
            else if (options.particleType == "circle") {

                centerY = this.positionY;

            }

            return centerY

        };




        // ----------------------------------------------------
        // Test interaction //
        //-----------------------------------------------------
        // Brute-force method to test interactions between particles
        // We are are starting loop from particle.index value to avoid double tests.

        particles.Particle.prototype.testInteraction = function () {

            for (var x = this.index + 1; x < objects.length; x++) {


                var testedObject = objects[x];

                var distance = basic.getDistance(this, testedObject);


                if (distance < this.closestDistance) {

                    this.closestDistance = distance;
                    this.closestElement = testedObject;

                }

                if (distance < testedObject.closestDistance) {

                    testedObject.closestDistance = distance;
                    testedObject.closestElement = this;

                }

            }

            if (this.closestElement) {

                ctx.beginPath();
                ctx.moveTo(this.getCenterX(), this.getCenterY());
                ctx.lineTo(this.closestElement.getCenterX(), this.closestElement.getCenterY());
                ctx.strokeStyle = "rgba(" + options.connectionRed + "," + options.connectionGreen + "," + options.connectionBlue + "," + options.connectionOpacity + ")";
                ctx.stroke();
                lines++;
            }

        };





        particles.Particle.prototype.updateLifeTime = function () {

            this.lifeTime--;

            if (this.lifeTime < 0) {

                this.fadeOut()


            }

        };


        particles.Particle.prototype.updateAnimation = function () {

            // calculate new position (Vector animation)
            this.calculateNewPosition(this.vectorX, this.vectorY);

            // append global forces
            this.appendGlobalForces(options.globalForceX, options.globalForceY)



            // draw particle
            this.updateColor();
            ctx.fillStyle = this.color;

            if (options.particleType == "square") {

                ctx.fillRect(this.positionX, this.positionY, this.size, this.size);

            }
            else if (options.particleType == "circle") {

                ctx.beginPath();
                ctx.arc(this.positionX, this.positionY, this.size, 0, 2 * Math.PI);
                ctx.fill()
                ctx.closePath();

            }
            else if (options.particleType == "text") {

                ctx.font = this.size + "px Verdana"
                ctx.fillText(options.particleText, this.positionX, this.positionY)
            }


        };





    }

    return particles

}());

// ----------------------------------------------------
// Mouse interaction constructor function //
//-----------------------------------------------------
var scene = (function () {

    var scene = {};
    scene.init = function () {


        scene.update = function () {


            // reset distance to closest element for all particles
            for (var x = 0; x < objects.length; x++) {

                objects[x].closestDistance = maximumPossibleDistance;

            }

            // reset distance to closest element
            for (var x = 0; x < objects.length; x++) {

                var particle = objects[x];

                particle.doActions();

                if (particle.active) {

                    particle.updateAnimation();

                    if (options.drawConnections) particle.testInteraction();
                    if (options.lifeTime) particle.updateLifeTime();


                }
                else if ((particle.active === false) && (particle.isFading === false)) {

                    particle.lifeTime = 100 //getRandomBetween(options.lifeTimeMin,options.lifeTimeMax);
                    particle.positionX = particle.initialPositionX;
                    particle.positionY = particle.initialPositionY;

                    particle.calculateVector();
                    particle.timer = 0;



                    particle.fadeIn();

                }

            }

            eventBus.emit("refreshScene")


        };


    }

    return scene

}());

// init modules

basic.init()

particles.init()
mouse.init()
emitter.init()

scene.init()

fading.init()
forces.init()
background.init()
statistics.init()




canvas.onmousemove = function (e) {

    mousePositionX = e.clientX - container.offsetLeft + window.pageXOffset;
    mousePositionY = e.clientY - container.offsetTop + window.pageYOffset;


};


var clearCanvas = function () {

    ctx.clearRect(0, 0, canvas.width, canvas.height);


};

var stopAnimation = function () {


    window.cancelAnimationFrame(window.particleEngine["animation" + id]);
    isRunning = false;

};



// ----------------------------------------------------
// Init! //
//-----------------------------------------------------

var loop = function () {

    clearCanvas();
    scene.update();


    window.particleEngine["animation" + id] = requestAnimationFrame(loop);
    isRunning = true;

    if (options.showStatistics) eventBus.emit("requestStatistics")

};


initAnimation();



} // end generate...

window.generateParticles = generateParticles;

return generateParticles

})(window);
