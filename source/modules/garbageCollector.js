// Garbage collector
var garbageCollector = (function(){

  var garbageCollector = {};

  garbageCollector.init = function(){

    var garbageObjects = 0;

    garbageCollector.increase = function(){
      garbageObjects++;
    };

    garbageCollector.collectGarbage = function(){
      for (var x = objects.length-1; x >= 0; x-- ){
        var particle = objects[x];

        if ((particle.destroyIt === true) && (!particle.active)) {
          objects.splice(x,1);
        }
      }

      garbageObjects = 0;
    };

    eventBus.subscribe('refreshScene', function(){
      if (garbageObjects > 100) {
        garbageCollector.collectGarbage();
      }
    });
  };

  return garbageCollector;
})();
