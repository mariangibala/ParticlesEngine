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
