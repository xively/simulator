'use strict';

var devices = ['temp', 'humidity', 'no2', 'co', 'dust', 'filter', 'fan'];

var AirSoClean3000 = function(deviceId) {
  this.deviceId = deviceId;

  var previous = {};
  var deviceValues = {};
  devices.forEach(function(device) {
    previous[device] = [];
    deviceValues[device] = null;
  });

  this.previous = previous;
  this.deviceValues = deviceValues;
};

AirSoClean3000.prototype.set = function(device, value) {
  this.previous[device].push(value);
  this.deviceValues[device] = value;

  if (this.previous[device].length > 5) {
    this.previous[device].shift();
  }
};

module.exports = AirSoClean3000;