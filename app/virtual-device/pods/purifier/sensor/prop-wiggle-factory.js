'use strict';

// A provider that "wiggles" the values of each property through time to
// simulate changing data
var propWiggle = ['wiggle', 'sensorProps', 'sensorStore',
  function(wiggle, sensorProps, sensorStore) {
    // The rate at which we update the values
    var WIGGLE_INTERVAL = 10000;
    var poll;
    var isEnabled = true;

    var wiggleProp = function(prop) {
      // The filter is managed by another service
      if (!sensorProps[prop].wiggle) { return; }
      var currentValue = sensorStore.get(prop);
      var newValue = wiggle(currentValue, 3);
      sensorStore.set(prop, newValue);
    };

    return {
      init: function() {
        if (typeof poll !== 'undefined') { return; }
        poll = setInterval(function() {
          if (isEnabled) {
            var keys = Object.keys(sensorProps);
            keys.forEach(wiggleProp);
          }
        }, WIGGLE_INTERVAL);
      },
      enable: function() {
        isEnabled = true;
      },
      disable: function() {
        isEnabled = false;
      }
    };
  }];

module.exports = propWiggle;
