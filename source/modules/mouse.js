// ----------------------------------------------------
// Mouse interactions
//-----------------------------------------------------

var mouse = {};
mouse.init = function () {

  var Interaction = function () {};

  var mouseInteraction = new Interaction();

  // Container for elements to interact
  var interactionElements = [];

  Interaction.prototype.grabElements = function () {
    interactionElements = [];

    for (var x = 0; x < objects.length; x++) {
      var object = objects[x];



      var distanceToObject = basic.getDistance(this, object);

      if (distanceToObject < options.mouseInteractionDistance) {
        interactionElements.push(objects[x]);
      }
    }
  };

  Interaction.prototype.interact = function () {
    for (var x = 0; x < interactionElements.length; x++) {
      var object = interactionElements[x];

      if (options.drawMouseConnections) {
        drawLine(this, object);
      }

      if (options.mouseInteractionType === "gravity") {
        object.vectorX = this.positionX;
        object.vectorY = this.positionY;
      }
      else if (options.mouseInteractionType === "initial") {
        object.vectorX = object.initialPositionX;
        object.vectorY = object.initialPositionY;
      }
    }
  };

  var drawLine = function (elementA, elementB) {
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

  Interaction.prototype.update = function () {
    this.positionX = particleEngine.mousePositionX;
    this.positionY = particleEngine.mousePositionY;
    this.grabElements();
    this.interact();
  };

  var refreshMouseInteraction = function () {
    mouseInteraction.update();
  };

  // subscribe refresh event
  if ((options.mouseInteraction) && (options.mouseInteractionDistance > 0)) {
    eventBus.subscribe("refreshScene", refreshMouseInteraction);
  }

  return Interaction;
};
