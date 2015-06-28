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
