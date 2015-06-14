// ----------------------------------------------------
// External forces    //
//-----------------------------------------------------

var forces = (function () {

  var forces = {}

  forces.init = function () {


    particles.Particle.prototype.appendGlobalForces = function (forceX, forceY) {


      this.positionX = this.positionX + forceX;

      if (this.positionX + this.size > canvas.width) this.positionX = canvas.width - this.size;
      if (this.positionX < 0) this.positionX = 0;


      this.positionY = this.positionY + forceY;

      if (this.positionY > canvas.height) this.positionY = canvas.height;
      if (this.positionY < 0) this.positionY = 0;

    }

  }

  return forces

}());
