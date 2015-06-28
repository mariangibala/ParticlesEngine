// ----------------------------------------------------
// Basic functions //
//-----------------------------------------------------

var basic = {};
basic.init = function () {

  // returns random number
  basic.getRandomBetween = function (a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  };

  // returns decimal number
  basic.getRandomDecimalBetween = function (a, b) {
    b = b * 100;
    a = a * 100;

    var randomNumber = this.getRandomBetween(a, b);
    var finalNumber = randomNumber / 100;

    return finalNumber;
  };

  // Tests if an object is inside the area of another object and returns true or false
  basic.hitTest = function (object1, object2) {
    if ((object1.positionX < object2.positionX + object2.size) &&
      (object1.positionX + object2.size > object2.positionX) &&
      (object1.positionY < object2.positionY + object2.size) &&
      (object1.positionY > object2.positionY)) {
      return true;
    } else {
      return false;
    }
  };

  // returns distance between objects, uses Pythagorean theorem to calculate value
  basic.getDistance = function (element1, element2) {
    var difX = Math.round(Math.abs(element1.positionX - element2.positionX));
    var difY = Math.round(Math.abs(element1.positionY - element2.positionY));

    return Math.round(Math.sqrt((difX * difX) + (difY * difY)));
  };

  return basic;
};
