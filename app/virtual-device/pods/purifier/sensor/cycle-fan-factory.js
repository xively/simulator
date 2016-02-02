'use strict';

// Cycles through the fan's speed. Used when clicking on the device.
var cycleFan = ['sensorStore', 'sensorProps',
  function(sensorStore, sensorProps) {
    return function() {
      var currentIndex = sensorStore.get('fan');

      // Move forward to the next index
      var newIndex = ++currentIndex;

      // If we're at the end of the array, then set our status
      // to be the initial status
      if (newIndex > sensorProps.fan.max) {
        newIndex = sensorProps.fan.min;
      }

      return newIndex;
    };
  }];

module.exports = cycleFan;
