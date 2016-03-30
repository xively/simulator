'use strict';

var AirSoClean3000 = function(deviceId) {
  this.deviceId = deviceId;

  var previous = {};
  var deviceValues = {};

  this.previous = previous;
  this.deviceValues = deviceValues;
};

AirSoClean3000.prototype.set = function(device, value) {
  if (!this.previous[device]) {
    this.previous[device] = [];
  }
  this.previous[device].push(value);
  this.deviceValues[device] = value;

  if (this.previous[device].length > 5) {
    this.previous[device].shift();
  }
};

module.exports = AirSoClean3000;
