// ----------------------------------------------------
// Background module //
//-----------------------------------------------------

var background = (function(){

var background = {};
background.init = function(){

background.create = function(type){
    

    if (type === "gradient") { 
    
        createBackgroundGradient();
    
    } else if (type === "image") {
    
        createBackgroundImage();
    
    } 

}


// ----------------------------------------------------
// Create background //
//-----------------------------------------------------

var createBackgroundGradient = function(){

    var finalValue = "";
    var fallbackColor;
    
    for ( var property in options.backgroundColors) {
    
         if (typeof fallbackColor == "undefined" ) fallbackColor = options.backgroundColors[property].color;
         
         // loop only throught own propeties
         if (options.backgroundColors.hasOwnProperty(property)) {
            
            // generate CSS code
          
            finalValue += "radial-gradient(circle at " + 
            
                options.backgroundColors[property].positionX + "% " + 
                options.backgroundColors[property].positionY + "%, #" + 
                options.backgroundColors[property].color + 
                
                ", transparent 100%),"  
  
          }

    }
    
    // remove last comma ","
    finalValue = finalValue.slice(0,-1)
    
    
    
    container.style.background = "#" + fallbackColor;
    container.style.backgroundImage = finalValue;
    

}

var createBackgroundImage = function(){

   
   
    container.style.backgroundImage = "url(img/wallpaper.jpg)";
    container.style.backgroundPosition = "center center";
    container.style.backgroundSize = "cover";

    

}


var createBackgroundImage = function(){


};

}

return background

}());