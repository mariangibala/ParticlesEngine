// Background module //
var background = (function () {

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
  };

  return background;
}());