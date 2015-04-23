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
