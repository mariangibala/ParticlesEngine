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

  SquareParticle.prototype.draw = function () {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.positionX, this.positionY, this.size, this.size);
  };

  return SquareParticle;
};
