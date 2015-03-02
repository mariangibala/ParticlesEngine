

// ----------------------------------------------------
// Helper functions //
//-----------------------------------------------------

var getRandomBetween = function(a, b) {
   
    return Math.floor(Math.random() * ( b - a + 1)) + a;

};


var getRandomDecimalBetween = function(a, b) {
   
    var b = b*100;
    var a = a*100;
    
    var randomNumber = getRandomBetween(a, b);
    var finalNumber = randomNumber/100;
    
    return finalNumber;

};



var hitTest = function(object1, object2) {


    if ((object1.positionX < object2.positionX + object2.size) && (object1.positionX + object2.size > object2.positionX) &&
        (object1.positionY < object2.positionY + object2.size) && (object1.positionY > object2.positionY)) {

        return true;


    } else {

        return false;

    }


};

// Get distance between particles by using Pythagorean theorem

var getDistance = function(element1, element2) {


    var difX = Math.round(Math.abs(element1.positionX - element2.positionX));
    var difY = Math.round(Math.abs(element1.positionY - element2.positionY));

    return Math.round(Math.sqrt((difX * difX) + (difY * difY)));


};
