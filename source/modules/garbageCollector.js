// ----------------------------------------------------
// Garbage collector   //
//-----------------------------------------------------

var garbageCollector = (function(){

  var garbageCollector = {};

  garbageCollector.init = function(){

    garbageCollector.collectGarbage = function(){

      garbageObjects = 0;

      for (var x = objects.length-1; x >= 0; x-- ){

        var particle = objects[x];
        if ((particle.destroyIt === true) && (!particle.active)) {

          objects.splice(x,1);
        }
      }
    };


    eventBus.subscribe('refreshScene', function(){
      if (garbageObjects > 100) garbageCollector.collectGarbage();
    });


  };

  return garbageCollector;

})();


