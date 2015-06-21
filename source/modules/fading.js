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
