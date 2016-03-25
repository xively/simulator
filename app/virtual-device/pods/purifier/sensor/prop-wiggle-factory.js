'use strict';

// A provider that "wiggles" the values of each property through time to
// simulate changing data
var propWiggle = ['wiggle', 'sensorProps', 'sensorStore',
  function(wiggle, sensorProps, sensorStore) {
    // The rate at which we update the values
    var WIGGLE_INTERVAL = 10000;
    var poll;

    var wiggleProp = function(prop) {
      // The filter is managed by another service
      if (!sensorProps[prop].wiggle) {
        return;
      }
      var currentValue = sensorStore.get(prop);
      var newValue = wiggle(currentValue, 3);
      sensorStore.set(prop, newValue);
    };

    return {
      init: function() {
        this.start();
      },
      start: function(interval) {
        if (poll) {
          clearInterval(poll);
        }

        poll = setInterval(function() {
          var keys = Object.keys(sensorProps);
          keys.forEach(wiggleProp);
        }, interval || WIGGLE_INTERVAL);
      },
      startSimulation: function(interval) {
        this.start(interval);
      },
      stopSimulation: function() {
        this.start(WIGGLE_INTERVAL);
      }
    };
  }];

module.exports = propWiggle;
