// ----------------------------------------------------
// Defaults //
//-----------------------------------------------------

var options = {

    particleType: "square", // square, text, circle
    particleText: "!",

    emitterShape: "M",
    emitterFontSize: 150,
    emitterType: "point", // random, point, text
    emitterPositionX: 50, // % position
    emitterPositionY: 50, // % position
    emitterPositionXpx: 0, // move px
    emitterPositionYpx: 0, // move px
    particlesNumber: 1,
    initialSize: 3,
    randomSize: true,
    minimumSize: 1,
    maximumSize: 3,
    moveLimit: 300,
    durationMin:50,
    durationMax: 200,

    lifeTimeMin: 10,
    lifeTimeMax : 10,

    //global forces
    globalForceX: 3,
    globalForceY: -1,

    // particles color

    particleColor: {red:255, green:255, blue:255, alpha:1},
    randomOpacity: true,
    particleMinimumOpacity: 0.1,
    particleMaximumOpacity: 0.9,

    // connections between particles
    drawConnections: false,
    connectionColor: {red:255, green:255, blue:255, alpha:1},

    // mouse connections
    mouseInteraction: false,
    mouseInteractionType: "gravity", // initial, gravity


    drawMouseConnections: false,
    mouseInteractionDistance: 300,
    mouseConnectionColor: {red:255, green:255, blue:255, alpha:1},

    showStatistics: true,
    background: "gradient", // null, gradient, image

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

}

