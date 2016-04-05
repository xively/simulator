'use strict';

// Ensure `num` is between `min` and `max`
var clamp = function(num, min, max) {
  if (typeof min !== 'undefined' && num < min) {
    return min;
  } else if (typeof max !== 'undefined' && num > max) {
    return max;
  }
  return num;
};

module.exports = clamp;
