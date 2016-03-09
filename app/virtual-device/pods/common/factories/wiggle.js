'use strict';

var wiggle = ['randomInteger', function(randomInteger) {
  // Returns true or false `percentChance` of the time
  function chance(percentChance) {
    percentChance *= 100;
    var randomNum = randomInteger(0, percentChance);
    return randomNum <= percentChance;
  }

  // Wiggle `num` by `max`. Only happens (approximately)
  // `changeChance` of the time.
  return function(num, max, changeChance) {
    changeChance = changeChance ? changeChance : 0.5;
    // Determine if we should even change the value or not
    if (!chance(changeChance)) {
      return false;
    }
    var wiggleAmount = randomInteger(-max, max);
    return num + wiggleAmount;
  };
}];

module.exports = wiggle;
