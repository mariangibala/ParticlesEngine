// ----------------------------------------------------
// Statistics //
//-----------------------------------------------------

var statistics = {};
statistics.init = function () {

  var
    lastCalledTime,
    fps,
    averageFps,
    averageFpsTemp = 0,
    averageFpsCounter = 0;

  var requestStatistics = function () {
    if (!lastCalledTime) {
      lastCalledTime = Date.now();
      fps = 0;
      return;
    }

    var delta = (new Date().getTime() - lastCalledTime) / 1000;
    lastCalledTime = Date.now();
    fps = Math.floor(1 / delta);

    averageFpsTemp = averageFpsTemp + fps;
    averageFpsCounter++;

    if (averageFpsCounter === 5) {
      averageFps = Math.floor(averageFpsTemp / 5);
      averageFpsCounter = 0;
      averageFpsTemp = 0;
    }

    if (!averageFps) {
      return;
    }
    else if (averageFps < 10) {
      /*  stopAnimation();
       averageFps = undefined;
       $("#fpsError").fadeIn();*/
    }

    ctx.fillStyle = "#fff";
    ctx.font = "10px Verdana";
    ctx.fillText("FPS: " + fps, 10, canvas.height - 70);
    ctx.fillText("Average FPS: " + averageFps, 10, canvas.height - 60);
    ctx.fillText("Active particles: " + objects.length, 10, canvas.height - 50);
    ctx.fillText("Active emitters: " + emitters.length, 10, canvas.height - 40);
    ctx.fillText("Connections between particles: " + lines, 10, canvas.height - 30);

    lines = 0;
  };

  // Subscribe request Statistics event //
  eventBus.subscribe("requestStatistics", requestStatistics);
  return statistics;
};
