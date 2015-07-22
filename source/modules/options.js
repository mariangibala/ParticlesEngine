// ----------------------------------------------------
// Default options //
//-----------------------------------------------------
var options = {
  //global forces
  globalForceX: 5,
  globalForceY: -2,

  showStatistics: true,
  background: 'gradient', // null, gradient

  // mouse connections
  mouseInteraction: true,
  mouseInteractionType: "gravity", // initial, gravity

  drawMouseConnections: false,
  mouseInteractionDistance: 300,
  mouseConnectionColor: {
    red: 255,
    green: 255,
    blue: 255,
    alpha: 0.3
  },

  // Use object with property names, to easy identify values in color picker
  backgroundColors: {
    "color1": {
      positionX: 25,
      positionY: 25,
      color: "FF9900"
    },
    "color2": {
      positionX: 60,
      positionY: 60,
      color: "FFE066"
    }
  }
};

var particleDefaults = {
  type: "square", // square, text, circle
  particleText: "!",

  positionX: 0,
  positionY: 0,

  initialSize: 3,
  randomSize: true,
  minimumSize: 1,
  maximumSize: 3,
  moveLimit: 300,
  durationMin: 50,
  durationMax: 200,

  lifeTimeMin: 600,
  lifeTimeMax: 500,

  // particles color
  red: 255,
  green: 255,
  blue: 255,
  opacity: 1,
  randomOpacity: true,
  minimumOpacity: 0.1,
  maximumOpacity: 0.9,

  // connections between particles
  drawConnections: false ,
  connectionColor: {
    red: 255,
    green: 255,
    blue: 255,
    alpha: 1
  }
};
