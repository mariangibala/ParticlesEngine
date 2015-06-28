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
