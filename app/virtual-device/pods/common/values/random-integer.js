'use strict';

// Generate a random integer within min and max (inclusive)
function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = randomInteger;
